-- ============================================================
-- TRIBEVERSE V1 — MIGRATION 2: Real cross-device sync
-- Run this ONCE in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dercuiqpzljgjhfpaxfk/sql
--
-- Why this is needed: the Data REST API (used by the app's browser
-- client) cannot create policies, triggers, or columns — only the
-- SQL Editor (or a direct Postgres connection) can. This script is
-- idempotent — safe to run more than once.
-- ============================================================

-- 1. Columns for admin-curated stage results (winner + revealed answers)
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS winner_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS winner_points INT,
  ADD COLUMN IF NOT EXISTS revealed_answers JSONB,
  ADD COLUMN IF NOT EXISTS custom_note TEXT;

-- 2. Broadcasts table (flash alert banner), persisted so late joiners see the latest one
CREATE TABLE IF NOT EXISTS public.broadcasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'live', 'winner', 'alert')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'broadcasts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.broadcasts;
  END IF;
END $$;

-- 3. Row Level Security policies
-- (schema.sql's original policies were never actually applied to this
-- project — every table currently returns zero rows to non-service-role
-- clients. These replace/define the real ones.)

-- profiles: anyone signed in can read (team rosters, leaderboard names);
-- a user can only insert/update their own row.
DROP POLICY IF EXISTS "Allow Public Profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated, anon USING (true);
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- teams: public read; only admins can update scores
DROP POLICY IF EXISTS "Allow Public Read Teams" ON public.teams;
DROP POLICY IF EXISTS "Allow Public Update Teams" ON public.teams;
DROP POLICY IF EXISTS "teams_select" ON public.teams;
CREATE POLICY "teams_select" ON public.teams FOR SELECT TO authenticated, anon USING (true);
DROP POLICY IF EXISTS "teams_admin_write" ON public.teams;
CREATE POLICY "teams_admin_write" ON public.teams FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- team_members: public read (rosters/assignment lookups)
DROP POLICY IF EXISTS "team_members_select" ON public.team_members;
CREATE POLICY "team_members_select" ON public.team_members FOR SELECT TO authenticated, anon USING (true);

-- events: public read; only admins update event/global status
DROP POLICY IF EXISTS "Allow Public Read Events" ON public.events;
DROP POLICY IF EXISTS "Allow Public Manage Events" ON public.events;
DROP POLICY IF EXISTS "events_select" ON public.events;
CREATE POLICY "events_select" ON public.events FOR SELECT TO authenticated, anon USING (true);
DROP POLICY IF EXISTS "events_admin_write" ON public.events;
CREATE POLICY "events_admin_write" ON public.events FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- activities: public read (stage status/results); only admins update
DROP POLICY IF EXISTS "Allow Public Read Activities" ON public.activities;
DROP POLICY IF EXISTS "Allow Public Manage Activities" ON public.activities;
DROP POLICY IF EXISTS "activities_select" ON public.activities;
CREATE POLICY "activities_select" ON public.activities FOR SELECT TO authenticated, anon USING (true);
DROP POLICY IF EXISTS "activities_admin_write" ON public.activities;
CREATE POLICY "activities_admin_write" ON public.activities FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- rounds: public read; only admins update
DROP POLICY IF EXISTS "Allow Public Read Rounds" ON public.rounds;
DROP POLICY IF EXISTS "Allow Public Manage Rounds" ON public.rounds;
DROP POLICY IF EXISTS "rounds_select" ON public.rounds;
CREATE POLICY "rounds_select" ON public.rounds FOR SELECT TO authenticated, anon USING (true);
DROP POLICY IF EXISTS "rounds_admin_write" ON public.rounds;
CREATE POLICY "rounds_admin_write" ON public.rounds FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- questions: public read
DROP POLICY IF EXISTS "Allow Public Read Questions" ON public.questions;
DROP POLICY IF EXISTS "questions_select" ON public.questions;
CREATE POLICY "questions_select" ON public.questions FOR SELECT TO authenticated, anon USING (true);

-- player_attempts: a user can insert their own attempts; admins/authenticated can read for scoring
DROP POLICY IF EXISTS "Allow Public Attempts" ON public.player_attempts;
DROP POLICY IF EXISTS "player_attempts_select" ON public.player_attempts;
CREATE POLICY "player_attempts_select" ON public.player_attempts FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "player_attempts_insert_own" ON public.player_attempts;
CREATE POLICY "player_attempts_insert_own" ON public.player_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- wall_posts: public read of approved posts (+ your own pending ones); own insert; admin moderates
DROP POLICY IF EXISTS "Allow Public Manage Wall" ON public.wall_posts;
DROP POLICY IF EXISTS "wall_posts_select" ON public.wall_posts;
CREATE POLICY "wall_posts_select" ON public.wall_posts FOR SELECT TO authenticated, anon USING (status = 'approved' OR user_id = auth.uid());
DROP POLICY IF EXISTS "wall_posts_insert_own" ON public.wall_posts;
CREATE POLICY "wall_posts_insert_own" ON public.wall_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "wall_posts_admin_update" ON public.wall_posts;
CREATE POLICY "wall_posts_admin_update" ON public.wall_posts FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);
DROP POLICY IF EXISTS "wall_posts_admin_delete" ON public.wall_posts;
CREATE POLICY "wall_posts_admin_delete" ON public.wall_posts FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- song_requests: public read; any authenticated participant can add/vote (low-stakes fun feature)
DROP POLICY IF EXISTS "Allow Public Manage Songs" ON public.song_requests;
DROP POLICY IF EXISTS "song_requests_select" ON public.song_requests;
CREATE POLICY "song_requests_select" ON public.song_requests FOR SELECT TO authenticated, anon USING (true);
DROP POLICY IF EXISTS "song_requests_write" ON public.song_requests;
CREATE POLICY "song_requests_write" ON public.song_requests FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- broadcasts: public read; only admins can push new alerts
DROP POLICY IF EXISTS "broadcasts_select" ON public.broadcasts;
CREATE POLICY "broadcasts_select" ON public.broadcasts FOR SELECT TO authenticated, anon USING (true);
DROP POLICY IF EXISTS "broadcasts_admin_insert" ON public.broadcasts;
CREATE POLICY "broadcasts_admin_insert" ON public.broadcasts FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- 4. Auto team + round assignment on signup
-- On every new auth.users row: create the profile, then (for students)
-- assign them to whichever of the 20 teams currently has the fewest
-- members, plus a random ability round 1-5, exactly as documented.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_team_id UUID;
  v_round INT;
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;

  IF COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'student' THEN
    SELECT t.id INTO v_team_id
    FROM public.teams t
    LEFT JOIN public.team_members tm ON tm.team_id = t.id
    GROUP BY t.id, t.team_number
    ORDER BY COUNT(tm.id) ASC, t.team_number ASC
    LIMIT 1;

    v_round := 1 + floor(random() * 5)::INT;

    IF v_team_id IS NOT NULL THEN
      INSERT INTO public.team_members (team_id, user_id, assigned_round)
      VALUES (v_team_id, NEW.id, v_round)
      ON CONFLICT (user_id) DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
