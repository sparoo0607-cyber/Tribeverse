-- Migration 14: Campus Ambassador applications
-- Run after migration 13.
-- RLS is enabled with NO policies on purpose: the table is only reachable
-- through the service-role API routes (/api/ambassador/apply for the public
-- form, /api/admin/ambassadors for the admin desk).

CREATE TABLE IF NOT EXISTS public.ambassador_applications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     TEXT NOT NULL,
  roll_number   TEXT NOT NULL,
  section       TEXT NOT NULL,
  department    TEXT NOT NULL,
  year          TEXT NOT NULL,
  phone         TEXT NOT NULL,
  email         TEXT NOT NULL,
  skills        TEXT[] NOT NULL DEFAULT '{}',
  experience    TEXT,
  motivation    TEXT NOT NULL,
  instagram     TEXT,
  linkedin      TEXT,
  extra         TEXT,
  status        TEXT NOT NULL DEFAULT 'NEW'
                CHECK (status IN ('NEW', 'SHORTLISTED', 'SELECTED', 'REJECTED')),
  admin_notes   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ambassador_applications ENABLE ROW LEVEL SECURITY;

-- One application per roll number.
CREATE UNIQUE INDEX IF NOT EXISTS ambassador_applications_roll_key
  ON public.ambassador_applications (upper(roll_number));

CREATE INDEX IF NOT EXISTS ambassador_applications_status_idx
  ON public.ambassador_applications (status, created_at DESC);

-- Safe to re-run: adds section if the table was created before it existed.
ALTER TABLE public.ambassador_applications
  ADD COLUMN IF NOT EXISTS section TEXT NOT NULL DEFAULT 'Other';
