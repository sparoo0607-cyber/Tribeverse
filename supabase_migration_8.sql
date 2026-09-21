-- ============================================================
-- TRIBEVERSE V1 — MIGRATION 8: Admins can see pending Wall posts
-- Run this ONCE in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dercuiqpzljgjhfpaxfk/sql
--
-- Migration 2's wall_posts_select policy only allowed a viewer to see
-- approved posts or their own — admins had UPDATE/DELETE rights but no
-- SELECT bypass, so the moderation panel showed "Pending Submissions
-- (0)" even when students had real posts awaiting approval. Confirmed
-- live: a valid admin access token queried against wall_posts returned
-- zero rows for another user's pending post. Idempotent — safe to
-- re-run.
-- ============================================================

DROP POLICY IF EXISTS "wall_posts_select" ON public.wall_posts;
CREATE POLICY "wall_posts_select" ON public.wall_posts FOR SELECT TO authenticated, anon USING (
  status = 'approved'
  OR user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);
