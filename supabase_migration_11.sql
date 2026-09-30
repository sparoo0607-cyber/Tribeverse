-- Migration 11: individual scoring (no fixed teams)
-- Scores now live on profiles. The old teams / team_members tables stay only
-- as internal "Detective circles" and round assignment; nothing shows them.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_score INT NOT NULL DEFAULT 0;

ALTER TABLE public.rounds
  ADD COLUMN IF NOT EXISTS winner_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.activities
  ADD COLUMN IF NOT EXISTS winner_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Atomic point award for one participant.
CREATE OR REPLACE FUNCTION public.add_user_points(p_user_id UUID, p_points INT)
RETURNS VOID LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.profiles SET total_score = GREATEST(0, total_score + p_points) WHERE id = p_user_id;
$$;

GRANT EXECUTE ON FUNCTION public.add_user_points(UUID, INT) TO authenticated, anon;
