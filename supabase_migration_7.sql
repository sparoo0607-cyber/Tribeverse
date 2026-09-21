-- ============================================================
-- TRIBEVERSE V1 — MIGRATION 7: Fix wall_posts.author_name
-- Run this ONCE in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dercuiqpzljgjhfpaxfk/sql
--
-- Your live wall_posts table is missing the author_name column that
-- supabase_schema.sql expects (it errors with "column wall_posts.
-- author_name does not exist" — confirmed live via the Event Flow
-- Wall moderation panel). This adds it back. Idempotent — safe to
-- re-run.
-- ============================================================

ALTER TABLE public.wall_posts
  ADD COLUMN IF NOT EXISTS author_name TEXT NOT NULL DEFAULT 'Participant';
