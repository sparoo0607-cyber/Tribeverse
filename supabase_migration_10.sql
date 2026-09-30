-- ============================================================
-- TRIBEVERSE V1 — MIGRATION 10: Official 9-Segment Itinerary
-- Run this ONCE in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/dercuiqpzljgjhfpaxfk/sql
--
-- Synchronizes the activities table with the official itinerary:
-- 1. Inauguration (9:30 – 10:00 AM)
-- 2. ST Brief (10:00 – 10:30 AM)
-- 3. Talent Hunt (10:30 – 11:00 AM)
-- 4. Tribe Playground (11:00 AM – 12:00 PM)
-- 5. Lunch Break (12:00 – 1:00 PM)
-- 6. Tribe Playground Continuous (1:00 – 2:00 PM)
-- 7. Tribe Jam (2:00 – 3:00 PM)
-- 8. Tribeverse Reveal (3:00 – 3:20 PM)
-- 9. Tribe Wall (3:20 – 3:30 PM)
-- ============================================================

INSERT INTO public.activities (name, slug, description, icon, order_index, scheduled_start, scheduled_end, status, max_rounds) VALUES
('Inauguration', 'inauguration', 'Official opening of TRIBEVERSE and welcome to the participants.', '🎬', 1, '09:30', '10:00', 'live', 1),
('ST Brief', 'briefs', 'Introduction to Student Tribe, its community and student opportunities.', '📖', 2, '10:00', '10:30', 'live', 1),
('Talent Hunt', 'talent-hunt', 'Open platform for students to showcase their talents and creative skills.', '🌟', 3, '10:30', '11:00', 'live', 1),
('Tribe Playground', 'playground', 'Interactive team activities focused on participation, creativity and quick thinking.', '🎮', 4, '11:00', '12:00', 'live', 5),
('Lunch Break', 'lunch', 'Break for lunch, relaxation and informal interaction among participants.', '🍔', 5, '12:00', '13:00', 'live', 1),
('Tribe Playground Continuous', 'playground-continuous', 'Continuation of Playground activities and completion of remaining participation.', '🏆', 6, '13:00', '14:00', 'live', 1),
('Tribe Jam', 'jam', 'Open music and performance session featuring students and participants.', '🎸', 7, '14:00', '15:00', 'live', 1),
('Tribeverse Reveal', 'reveal', 'Closing reveal connecting the day''s experiences with the TRIBEVERSE identity.', '✨', 8, '15:00', '15:20', 'live', 1),
('The Tribe Wall', 'wall', 'Participants share a goal, thought or aspiration as a collective closing activity.', '🧱', 9, '15:20', '15:30', 'live', 1)
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name, 
  description = EXCLUDED.description, 
  order_index = EXCLUDED.order_index,
  scheduled_start = EXCLUDED.scheduled_start,
  scheduled_end = EXCLUDED.scheduled_end;
