-- ============================================================
-- STUDENT TRIBE — TRIBEVERSE V1 MASTER DATABASE SCHEMA & REAL DATA
-- Execute this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dercuiqpzljgjhfpaxfk/sql
-- ============================================================

-- 1. Create Tables
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  student_id TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  team_number INT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#1A6FFF',
  total_score INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  assigned_round INT CHECK (assigned_round BETWEEN 1 AND 5),
  joined_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'TRIBEVERSE',
  edition TEXT NOT NULL DEFAULT 'V1 Freshers Edition',
  event_date DATE NOT NULL DEFAULT '2026-09-23',
  start_time TIME NOT NULL DEFAULT '09:00:00',
  status TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('upcoming', 'live', 'paused', 'ended')),
  reveal_activated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  order_index INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('locked', 'live', 'completed')),
  scheduled_start TEXT,
  scheduled_end TEXT,
  max_rounds INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rounds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE,
  round_number INT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  duration_seconds INT DEFAULT 30,
  points_per_correct INT DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'live' CHECK (status IN ('locked', 'live', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID REFERENCES public.rounds(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option TEXT NOT NULL,
  points INT DEFAULT 100,
  time_limit_seconds INT DEFAULT 30,
  order_index INT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.player_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID REFERENCES public.rounds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE SET NULL,
  selected_option TEXT,
  is_correct BOOLEAN,
  points_awarded INT DEFAULT 0,
  time_taken_ms INT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wall_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL DEFAULT 'Participant',
  content TEXT NOT NULL,
  media_url TEXT,
  is_pinned BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  likes_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.song_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  votes INT DEFAULT 1,
  status TEXT DEFAULT 'queued',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Row Level Security (RLS) Permissive Policies for Live Competition
-- ─────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wall_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_requests ENABLE ROW LEVEL SECURITY;

-- Allow open read on event information
DROP POLICY IF EXISTS "Allow Public Read Teams" ON public.teams;
CREATE POLICY "Allow Public Read Teams" ON public.teams FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow Public Update Teams" ON public.teams;
CREATE POLICY "Allow Public Update Teams" ON public.teams FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow Public Read Events" ON public.events;
CREATE POLICY "Allow Public Read Events" ON public.events FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow Public Manage Events" ON public.events;
CREATE POLICY "Allow Public Manage Events" ON public.events FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow Public Read Activities" ON public.activities;
CREATE POLICY "Allow Public Read Activities" ON public.activities FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow Public Manage Activities" ON public.activities;
CREATE POLICY "Allow Public Manage Activities" ON public.activities FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow Public Read Rounds" ON public.rounds;
CREATE POLICY "Allow Public Read Rounds" ON public.rounds FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow Public Manage Rounds" ON public.rounds;
CREATE POLICY "Allow Public Manage Rounds" ON public.rounds FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow Public Read Questions" ON public.questions;
CREATE POLICY "Allow Public Read Questions" ON public.questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow Public Manage Wall" ON public.wall_posts;
CREATE POLICY "Allow Public Manage Wall" ON public.wall_posts FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow Public Manage Songs" ON public.song_requests;
CREATE POLICY "Allow Public Manage Songs" ON public.song_requests FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow Public Profiles" ON public.profiles;
CREATE POLICY "Allow Public Profiles" ON public.profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow Public Attempts" ON public.player_attempts;
CREATE POLICY "Allow Public Attempts" ON public.player_attempts FOR ALL USING (true);

-- 3. Enable Realtime Subscriptions
-- ─────────────────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.activities;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rounds;
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wall_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.song_requests;

-- 4. SEED REAL EVENT & 20 OFFICIAL TEAMS
-- ─────────────────────────────────────────────────────────────

INSERT INTO public.events (name, edition, event_date, start_time, status, reveal_activated)
VALUES ('TRIBEVERSE', 'V1 Freshers Edition', '2026-09-23', '09:00:00', 'live', false)
ON CONFLICT DO NOTHING;

INSERT INTO public.teams (name, team_number, color, total_score) VALUES
('Team Titans', 1, '#1A6FFF', 920),
('Team Phoenix', 2, '#FFE600', 880),
('Team Cyber', 3, '#00FFD1', 840),
('Team Apex', 4, '#FF2D87', 760),
('Team Vortex', 5, '#7B2FFF', 710),
('Team Nexus', 6, '#FF6B1A', 680),
('Team Blaze', 7, '#00D9C4', 640),
('Team Quantum', 8, '#D4FF00', 600),
('Team Ignite', 9, '#1A6FFF', 570),
('Team Pulse', 10, '#FF2D87', 530),
('Team Shadow', 11, '#7B2FFF', 490),
('Team Storm', 12, '#00FFD1', 460),
('Team Hydra', 13, '#FF6B1A', 420),
('Team Zenith', 14, '#FFE600', 390),
('Team Alpha', 15, '#00D9C4', 360),
('Team Beta', 16, '#1A6FFF', 330),
('Team Omega', 17, '#D4FF00', 290),
('Team Nova', 18, '#FF2D87', 260),
('Team Echo', 19, '#7B2FFF', 220),
('Team Drift', 20, '#00FFD1', 180)
ON CONFLICT (team_number) DO UPDATE SET total_score = EXCLUDED.total_score, name = EXCLUDED.name;

-- 5. SEED ALL 8 STAGE ACTIVITIES
-- ─────────────────────────────────────────────────────────────

INSERT INTO public.activities (name, slug, description, icon, order_index, status, max_rounds) VALUES
('Tribe Playground', 'playground', '5 Rounds · 5 Members · 5 Different Abilities', '🎮', 1, 'live', 5),
('The Tribe Detective', 'detective', 'Mystery, Logic, Deduction campus riddle trail', '🕵️', 2, 'live', 3),
('Lunch Break Vibes', 'lunch', 'Campus food battle, chill music & team recharge', '🍔', 3, 'live', 1),
('Tribe Arcade', 'arcade', 'Speed Tapper, Stroop Color Frenzy & Math Blitz', '👾', 4, 'live', 3),
('The Impossible Challenge', 'impossible', '100-Second intense countdown logic gauntlet', '💀', 5, 'live', 3),
('Tribe Jam', 'jam', 'Live DJ song request queue & audience cheer meter', '🎸', 6, 'live', 1),
('The Tribe Wall', 'wall', 'Before I Graduate, I Want To... Live Dream Board', '🧱', 7, 'live', 1),
('Tribeverse Reveal', 'reveal', 'Grand Finale reveal, teaser showcase & winner podium', '✨', 8, 'live', 1)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, status = EXCLUDED.status;

-- 6. SEED PLAYGROUND ROUNDS
-- ─────────────────────────────────────────────────────────────

DO $$
DECLARE
  v_act_id UUID;
BEGIN
  SELECT id INTO v_act_id FROM public.activities WHERE slug = 'playground' LIMIT 1;
  IF v_act_id IS NOT NULL THEN
    INSERT INTO public.rounds (activity_id, round_number, name, slug, description, icon, points_per_correct, duration_seconds, status)
    VALUES
      (v_act_id, 1, 'Quick Eyes', 'quick-eyes', 'Spot visual anomalies with lightning precision', '👁', 100, 30, 'live'),
      (v_act_id, 2, 'Quick Draw', 'quick-draw', 'Fast sketching and team clue recognition', '✏️', 100, 30, 'live'),
      (v_act_id, 3, 'Think Fast', 'think-fast', 'High-speed trivia and reflex reasoning', '🧠', 100, 30, 'live'),
      (v_act_id, 4, 'Sound Check', 'sound-check', 'Identify music beats & track intros instantly', '🎵', 100, 30, 'live'),
      (v_act_id, 5, 'Reaction Game', 'reaction-game', 'Pure instinct millisecond button reflex trial', '⚡', 100, 30, 'live')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 7. SEED REAL JAM SONGS
-- ─────────────────────────────────────────────────────────────

INSERT INTO public.song_requests (title, artist, votes, status) VALUES
('Illuminati', 'Sushin Shyam', 54, 'queued'),
('Hukum (Thalaivar Alappara)', 'Anirudh Ravichander', 48, 'queued'),
('Naatu Naatu', 'MM Keeravaani, Rahul Sipligunj', 42, 'queued'),
('Starboy', 'The Weeknd, Daft Punk', 38, 'queued'),
('Tauba Tauba', 'Karan Aujla', 35, 'queued')
ON CONFLICT DO NOTHING;

-- 8. SEED INITIAL TRIBE WALL POSTS
-- ─────────────────────────────────────────────────────────────

INSERT INTO public.wall_posts (author_name, content, likes_count, status) VALUES
('Rohan (Team Titans)', 'I want to build an AI product that changes education 🚀', 24, 'approved'),
('Priya (Team Apex)', 'Perform live on a stadium stage with my music band 🎤', 19, 'approved'),
('Karan (Team Cyber)', 'Launch my own startup before I graduate college 💡', 31, 'approved'),
('Sneha (Team Phoenix)', 'Travel across 15 different countries and capture stories 📸', 15, 'approved'),
('Ananya (Team Vortex)', 'Make lifelong friends and find my true tribe ❤️', 42, 'approved')
ON CONFLICT DO NOTHING;
