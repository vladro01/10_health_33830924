-- insert_test_data.sql

USE health;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE login_audit;
TRUNCATE TABLE quest_logs;
TRUNCATE TABLE quest_exercises;
TRUNCATE TABLE exercises;
TRUNCATE TABLE quests;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Default user: gold / smiths
INSERT INTO users (username, password_hash)
VALUES (
  'gold',
  '$2b$10$LRIUWELLLu4WNfIs52eEQe/wNtSbkGuhhfQxnFAVXdrkTSfK0eDpG'
);

-- Exercises (gym + cardio)
INSERT INTO exercises (name, muscle_group) VALUES
  ('Plank', 'Core'),
  ('Dead Bug', 'Core'),
  ('Hanging Knee Tuck', 'Core'),
  ('Reverse Crunch', 'Core'),
  ('Barbell Bench Press', 'Chest'),
  ('Push-ups', 'Chest'),
  ('Cable Triceps Pushdown', 'Triceps'),
  ('Lat Pulldown', 'Back'),
  ('Seated Row', 'Back'),
  ('Dumbbell Bicep Curl', 'Biceps'),
  ('Back Squat', 'Legs'),
  ('Walking Lunge', 'Legs'),
  ('Romanian Deadlift', 'Legs'),
  ('Standing Calf Raise', 'Calves'),
  ('Jogging', 'Cardio'),
  ('Brisk Walking', 'Cardio'),
  ('Cycling (Stationary Bike)', 'Cardio');

-- Quests
INSERT INTO quests (name, description, difficulty, is_outdoor, target_minutes)
VALUES
  ('Abs of Steel',
   'Core-focused quest: plank, dead bug, hanging knee tucks and reverse crunches.',
   'medium', 0, 20),
  ('Push Day - Chest & Triceps',
   'Upper-body strength workout focused on chest and triceps.',
   'medium', 0, 55),
  ('Pull Day - Back & Biceps',
   'Pulling movements to strengthen back and biceps.',
   'medium', 0, 60),
  ('Leg Day - Squats & Lunges',
   'Lower-body strength session for quads, hamstrings and glutes.',
   'hard', 0, 60),
  ('Medium Jogging Quest',
   'Outdoor jogging quest, ideal for steady-state cardio.',
   'medium', 1, 30),
  ('Active Recovery Walk',
   'Easy outdoor walk to keep moving on lighter days.',
   'easy', 1, 25),
  ('Cycle with the Wind',
   'Stamina and speed-focused cycling workout.',
   'hard', 1, 60);

-- Link quests to exercises

-- Abs of Steel (id 1)
INSERT INTO quest_exercises (quest_id, exercise_id, target_sets, target_reps) VALUES
  (1, 1, 3, 45),   -- Plank (seconds)
  (1, 2, 3, 12),   -- Dead Bug
  (1, 3, 3, 10),   -- Hanging Knee Tuck
  (1, 4, 3, 15);   -- Reverse Crunch

-- Push Day (id 2)
INSERT INTO quest_exercises (quest_id, exercise_id, target_sets, target_reps) VALUES
  (2, 5, 4, 8),    -- Barbell Bench Press
  (2, 6, 3, 15),   -- Push-ups
  (2, 7, 3, 12);   -- Cable Triceps Pushdown

-- Pull Day (id 3)
INSERT INTO quest_exercises (quest_id, exercise_id, target_sets, target_reps) VALUES
  (3, 8, 4, 8),    -- Lat Pulldown
  (3, 9, 3, 10),   -- Seated Row
  (3,10, 3, 12);   -- Dumbbell Curl

-- Leg Day (id 4)
INSERT INTO quest_exercises (quest_id, exercise_id, target_sets, target_reps) VALUES
  (4,11, 4, 8),    -- Back Squat
  (4,12, 3, 12),   -- Walking Lunge (per leg)
  (4,13, 3, 10),   -- Romanian Deadlift
  (4,14, 3, 15);   -- Calf Raise

-- Medium Jogging Quest (id 5)
INSERT INTO quest_exercises (quest_id, exercise_id, target_sets, target_reps) VALUES
  (5,15, 1, 1);    -- Jogging session

-- Active Recovery Walk (id 6)
INSERT INTO quest_exercises (quest_id, exercise_id, target_sets, target_reps) VALUES
  (6,16, 1, 1);    -- Brisk walking

-- Cycle with the Wind (id 7)
INSERT INTO quest_exercises (quest_id, exercise_id, target_sets, target_reps) VALUES
  (7,17, 1, 1);    -- Cycling session