-- ============================================================
-- TRIBEVERSE V1 — MIGRATION 4: Quick Eyes game engine
-- Run this ONCE in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dercuiqpzljgjhfpaxfk/sql
--
-- Adds the per-round phase state machine (idle -> visual -> timer
-- -> question -> closed -> revealed) that the Admin Panel / Student
-- Panel / Event Display for Quick Eyes all read and write, plus an
-- image column for the "challenge image" and realtime replication
-- for questions + player_attempts (needed for the live answer feed
-- and instant cross-device phase sync). Idempotent — safe to re-run.
-- ============================================================

ALTER TABLE public.rounds
  ADD COLUMN IF NOT EXISTS phase TEXT NOT NULL DEFAULT 'idle'
    CHECK (phase IN ('idle', 'visual', 'timer', 'question', 'closed', 'revealed')),
  ADD COLUMN IF NOT EXISTS current_question_id UUID REFERENCES public.questions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS phase_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS winner_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS image_url TEXT;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['questions', 'player_attempts']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

-- Admins need to clear old attempts when (re)starting a round
DROP POLICY IF EXISTS "player_attempts_admin_delete" ON public.player_attempts;
CREATE POLICY "player_attempts_admin_delete" ON public.player_attempts FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);
