-- Migration 12: remove teams entirely
-- Run AFTER migration 11.

-- 1. The ability round now lives on the participant, not on a team membership.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS assigned_round INT;

UPDATE public.profiles p
SET assigned_round = tm.assigned_round
FROM public.team_members tm
WHERE tm.user_id = p.id AND p.assigned_round IS NULL;

UPDATE public.profiles
SET assigned_round = 1 + floor(random() * 5)::INT
WHERE role = 'student' AND assigned_round IS NULL;

-- 2. Signup trigger: create the profile and a random ability round, no team.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT := COALESCE(NEW.raw_user_meta_data->>'role', 'student');
BEGIN
  INSERT INTO public.profiles (id, full_name, role, assigned_round)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    v_role,
    CASE WHEN v_role = 'student' THEN 1 + floor(random() * 5)::INT ELSE NULL END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 3. Remove every seeded team. team_members rows cascade with them.
DELETE FROM public.teams;
