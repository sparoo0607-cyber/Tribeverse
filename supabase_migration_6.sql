-- ============================================================
-- TRIBEVERSE V1 — MIGRATION 6: Tribe Detective (secret-role guessing)
-- Run this ONCE in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dercuiqpzljgjhfpaxfk/sql
--
-- Builds the real Detective stage: 5 rounds (Professions, Characters,
-- Superpowers, Campus Roles, Wild Card). Admin manually assigns each
-- participant a secret role per round; teammates try to guess each
-- other's roles while guessing is open; correct guesses score points
-- for the team once the controller reveals. Idempotent — safe to re-run.
-- ============================================================

-- 1. Widen the shared round phase machine so Detective's phases coexist
-- with Quick Eyes's phases on the same `rounds` table.
ALTER TABLE public.rounds DROP CONSTRAINT IF EXISTS rounds_phase_check;
ALTER TABLE public.rounds ADD CONSTRAINT rounds_phase_check
  CHECK (phase IN ('idle', 'visual', 'timer', 'question', 'closed', 'revealed', 'scenario', 'guessing_open', 'guessing_closed'));

-- 2. Role pool per round (admin-editable list of roles for that round,
-- e.g. ["Chef","Doctor","Pilot", ...]).
ALTER TABLE public.rounds
  ADD COLUMN IF NOT EXISTS role_pool JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS scenario_text TEXT;

-- 3. Secret role assignments — one row per (round, participant).
-- Only the participant themself (or an admin) can ever read their own
-- secret role; teammates must guess it, not read it.
CREATE TABLE IF NOT EXISTS public.detective_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID REFERENCES public.rounds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  secret_role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (round_id, user_id)
);
ALTER TABLE public.detective_assignments ENABLE ROW LEVEL SECURITY;

-- A participant can always read their own secret role. Everyone else's
-- role for that round only becomes readable once the controller flips
-- the round to 'revealed' — that's the whole point of the guessing game.
DROP POLICY IF EXISTS "detective_assignments_select_own" ON public.detective_assignments;
CREATE POLICY "detective_assignments_select_own" ON public.detective_assignments FOR SELECT TO authenticated USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  OR EXISTS (SELECT 1 FROM public.rounds r WHERE r.id = detective_assignments.round_id AND r.phase = 'revealed')
);
DROP POLICY IF EXISTS "detective_assignments_admin_write" ON public.detective_assignments;
CREATE POLICY "detective_assignments_admin_write" ON public.detective_assignments FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- 4. Guesses — one teammate guessing another teammate's role for a round.
CREATE TABLE IF NOT EXISTS public.detective_guesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID REFERENCES public.rounds(id) ON DELETE CASCADE,
  guesser_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  guessed_role TEXT NOT NULL,
  is_correct BOOLEAN,
  points_awarded INT DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (round_id, guesser_user_id, target_user_id)
);
ALTER TABLE public.detective_guesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "detective_guesses_select_own" ON public.detective_guesses;
CREATE POLICY "detective_guesses_select_own" ON public.detective_guesses FOR SELECT TO authenticated USING (
  guesser_user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);
DROP POLICY IF EXISTS "detective_guesses_insert_own" ON public.detective_guesses;
CREATE POLICY "detective_guesses_insert_own" ON public.detective_guesses FOR INSERT TO authenticated WITH CHECK (
  guesser_user_id = auth.uid()
);
DROP POLICY IF EXISTS "detective_guesses_update_own" ON public.detective_guesses;
CREATE POLICY "detective_guesses_update_own" ON public.detective_guesses FOR UPDATE TO authenticated USING (
  guesser_user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);
DROP POLICY IF EXISTS "detective_guesses_admin_delete" ON public.detective_guesses;
CREATE POLICY "detective_guesses_admin_delete" ON public.detective_guesses FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- 5. Realtime replication for the new tables + the widened rounds table.
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['detective_assignments', 'detective_guesses']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

-- 6. The original schema never gave `rounds` a real uniqueness
-- constraint, so the playground-rounds seed's "ON CONFLICT DO NOTHING"
-- silently matches nothing and would duplicate rows on re-run. Add one
-- here (scoped to activity+slug) so this migration's seed step below is
-- actually idempotent.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'rounds_activity_slug_unique'
  ) THEN
    ALTER TABLE public.rounds ADD CONSTRAINT rounds_activity_slug_unique UNIQUE (activity_id, slug);
  END IF;
END $$;

-- 7. Seed the 5 Detective rounds with placeholder role pools (swap the
-- role_pool + scenario_text for each round before the event via the
-- Event Control → Detective panel).
DO $$
DECLARE
  v_act_id UUID;
BEGIN
  SELECT id INTO v_act_id FROM public.activities WHERE slug = 'detective' LIMIT 1;
  IF v_act_id IS NOT NULL THEN
    INSERT INTO public.rounds (activity_id, round_number, name, slug, description, icon, points_per_correct, duration_seconds, status, role_pool, scenario_text)
    VALUES
      (v_act_id, 1, 'Professions', 'professions', 'Guess the secret profession each of your teammates was assigned.', '🧑‍⚕️', 100, 0, 'locked',
        '["Chef","Doctor","Pilot","Teacher","Firefighter","Astronaut","Musician","Lawyer","Athlete","Photographer"]'::jsonb,
        'Every member of your team was secretly given a profession before today. Watch how they''ve acted, then guess who got what.'),
      (v_act_id, 2, 'Characters', 'characters', 'Guess the fictional character each teammate was secretly assigned.', '🎭', 100, 0, 'locked',
        '["Sherlock Holmes","Iron Man","Harry Potter","Wednesday Addams","Spider-Man","Elsa","Batman","Hermione Granger","Jack Sparrow","Shrek"]'::jsonb,
        'Somewhere in your team, a fictional character is hiding in plain sight. Who is playing who?'),
      (v_act_id, 3, 'Superpowers', 'superpowers', 'Guess the secret superpower each teammate was assigned.', '🦸', 100, 0, 'locked',
        '["Invisibility","Super Strength","Mind Reading","Time Travel","Flight","Teleportation","Super Speed","Shape-Shifting","Fire Control","X-Ray Vision"]'::jsonb,
        'Every teammate has a secret power today. Figure out who can do what.'),
      (v_act_id, 4, 'Campus Roles', 'campus-roles', 'Guess the secret campus role each teammate was assigned.', '🎓', 100, 0, 'locked',
        '["Class Topper","Backbencher","Canteen Regular","Library Ghost","Fest Organizer","Late Comer","Group Project Carrier","Sports Captain","Meme Page Admin","Attendance Saver"]'::jsonb,
        'Everyone has a campus personality. Which one did each teammate get assigned?'),
      (v_act_id, 5, 'Wild Card', 'wild-card', 'Guess the secret wild card identity each teammate was assigned.', '🃏', 150, 0, 'locked',
        '["The Mastermind","The Wildcard","The Peacemaker","The Chaos Agent","The Strategist","The Comic Relief","The Loyal One","The Dark Horse"]'::jsonb,
        'Final round — the wildest roles are saved for last. Trust your instincts.')
    ON CONFLICT (activity_id, slug) DO UPDATE SET
      role_pool = EXCLUDED.role_pool,
      scenario_text = EXCLUDED.scenario_text,
      name = EXCLUDED.name,
      description = EXCLUDED.description;
  END IF;
END $$;
