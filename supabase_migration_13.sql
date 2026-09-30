-- Migration 13: roll number column and registration integrity
-- Run after migrations 11 and 12.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS roll_number TEXT;

-- One registration per roll number (case-insensitive). Blank values are ignored.
CREATE UNIQUE INDEX IF NOT EXISTS profiles_roll_number_key
  ON public.profiles (upper(roll_number))
  WHERE roll_number IS NOT NULL AND roll_number <> '';

-- Pass IDs are scanned at the gate, so they must be unique too.
CREATE UNIQUE INDEX IF NOT EXISTS profiles_student_id_key
  ON public.profiles (student_id)
  WHERE student_id IS NOT NULL;

-- Stop anyone choosing their own role at signup: every new login starts as a
-- student. Admin and host roles are set by staff (for example with
-- scripts/create-test-users.mjs, which writes the role on the profile row).
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, assigned_round)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'student',
    1 + floor(random() * 5)::INT
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
