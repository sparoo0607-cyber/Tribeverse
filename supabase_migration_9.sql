-- ============================================================
-- TRIBEVERSE V1 — MIGRATION 9: Registration Fields & Tag Issuance
-- Run this ONCE in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dercuiqpzljgjhfpaxfk/sql
--
-- Adds branch, section, phone, tag_issued, and tag_issued_at
-- to the profiles table for seamless registration and admin
-- physical ID tag / wristband tracking.
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS branch TEXT,
  ADD COLUMN IF NOT EXISTS section TEXT,
  ADD COLUMN IF NOT EXISTS tag_issued BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS tag_issued_at TIMESTAMPTZ;

-- Index student_id and phone for instant QR / check-in lookup
CREATE INDEX IF NOT EXISTS idx_profiles_student_id ON public.profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_tag_issued ON public.profiles(tag_issued);

-- Policy to allow admins to update any profile's tag status
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
CREATE POLICY "profiles_admin_update" ON public.profiles FOR UPDATE TO authenticated USING (
  auth.uid() = id
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
) WITH CHECK (
  auth.uid() = id
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);
