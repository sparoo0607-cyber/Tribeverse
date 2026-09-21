-- ============================================================
-- TRIBEVERSE V1 — MIGRATION 5: Host role + live Event Flow runner
-- Run this ONCE in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dercuiqpzljgjhfpaxfk/sql
--
-- Adds a third account role ('host') for the person who runs the
-- live Event Flow (Inauguration → Tribe Briefs → Playground → ... →
-- Reveal) from a single synced screen, distinct from 'admin' (game
-- control desk) and 'student' (participant dashboard). Also adds the
-- column that tracks which step of the flow is currently active, so
-- every device following along (and a host who refreshes) sees the
-- same step. Idempotent — safe to re-run.
-- ============================================================

-- 1. Allow 'host' as a profile role
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('student', 'admin', 'host'));

-- 2. Track the live Event Flow position on the event row
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS current_step INT NOT NULL DEFAULT 0;

-- 3. Hosts can advance the flow (events.current_step) and go-live /
-- complete stages (activities.status) exactly like admins can.
DROP POLICY IF EXISTS "events_admin_write" ON public.events;
CREATE POLICY "events_admin_write" ON public.events FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'host'))
);

DROP POLICY IF EXISTS "activities_admin_write" ON public.activities;
CREATE POLICY "activities_admin_write" ON public.activities FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'host'))
);
