-- ============================================================
-- TRIBEVERSE V1 — MIGRATION 3: Enable realtime replication
-- Run this ONCE in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dercuiqpzljgjhfpaxfk/sql
--
-- Why: RLS policies control *who can read/write*; the realtime
-- publication controls *which tables push live change events* over
-- websockets. These tables were never added to it, so admin actions
-- (Go Live, award points, etc.) write successfully but never push to
-- other devices until this runs. Idempotent — safe to re-run.
-- ============================================================

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['teams', 'activities', 'rounds', 'events', 'wall_posts', 'song_requests', 'broadcasts']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;
