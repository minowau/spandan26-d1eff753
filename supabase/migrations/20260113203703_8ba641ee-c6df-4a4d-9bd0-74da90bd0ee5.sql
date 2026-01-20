-- Sports table
CREATE TABLE public.sports (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('team', 'individual', 'minor')),
  icon TEXT NOT NULL DEFAULT '🏆',
  description TEXT,
  live_stream_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Groups table (for team sports points tables)
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id TEXT REFERENCES public.sports(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams table (within groups)
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  matches_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches/Schedule table
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id TEXT REFERENCES public.sports(id) ON DELETE CASCADE NOT NULL,
  match_name TEXT NOT NULL,
  match_date TEXT NOT NULL CHECK (match_date IN ('22', '23', '24', '25')),
  match_time TEXT NOT NULL,
  venue TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS but allow all operations (no auth for now)
ALTER TABLE public.sports DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches DISABLE ROW LEVEL SECURITY;



-- Insert initial sports data
INSERT INTO public.sports (id, name, category, icon, description, live_stream_url) VALUES
  ('cricket', 'Cricket', 'team', '🏏', 'The gentleman''s game with intense inter-department rivalry', 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
  ('volleyball', 'Volleyball', 'team', '🏐', 'High-flying action at the net', 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
  ('football', 'Football', 'team', '⚽', 'The beautiful game unites all departments', 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
  ('throwball', 'Throwball', 'team', '🤾', 'Fast-paced throwing action', 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
  ('basketball', 'Basketball', 'team', '🏀', 'Slam dunks and three-pointers', 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
  ('badminton', 'Badminton', 'individual', '🏸', 'Swift racket action on the court', 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
  ('chess', 'Chess', 'individual', '♟️', 'Battle of minds on 64 squares', 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
  ('table-tennis', 'Table Tennis', 'individual', '🏓', 'Lightning-fast rallies', 'https://www.youtube.com/embed/dQw4w9WgXcQ'),
  ('gully-cricket', 'Gully Cricket', 'minor', '🏏', 'Street-style cricket fun', NULL),
  ('pentathlon', 'Pentathlon', 'minor', '🏃', 'Five events, one champion', NULL),
  ('tug-of-war', 'Tug of War', 'minor', '🪢', 'Ultimate test of team strength', NULL),
  ('carrom', 'Carrom', 'minor', '🎯', 'Precision and strategy on the board', NULL);

-- Insert sample groups for cricket
INSERT INTO public.groups (id, sport_id, name) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'cricket', 'Group A'),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'cricket', 'Group B');

-- Insert sample teams
INSERT INTO public.teams (group_id, name, matches_played, wins, losses, points) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Computer Science', 2, 2, 0, 4),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Electronics', 2, 1, 1, 2),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Mechanical', 2, 0, 2, 0),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Civil', 2, 2, 0, 4),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Chemical', 2, 1, 1, 2),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Electrical', 2, 0, 2, 0);

-- Insert sample matches
INSERT INTO public.matches (sport_id, match_name, match_date, match_time, venue) VALUES
  ('cricket', 'CS vs Electronics', '22', '9:00 AM', 'Main Ground'),
  ('football', 'MBA vs BBA', '22', '10:30 AM', 'Football Field'),
  ('badminton', 'Quarter Finals', '22', '2:00 PM', 'Indoor Stadium'),
  ('chess', 'Round 1', '22', '3:00 PM', 'Library Hall'),
  ('gully-cricket', 'Prelims', '22', '4:00 PM', 'Back Ground'),
  ('volleyball', 'IT vs Physics', '23', '9:00 AM', 'Volleyball Court'),
  ('cricket', 'Mechanical vs Electronics', '23', '10:00 AM', 'Main Ground'),
  ('table-tennis', 'Semi Finals', '23', '2:00 PM', 'TT Room'),
  ('throwball', 'Arts vs Science', '23', '3:30 PM', 'Court 2'),
  ('tug-of-war', 'Preliminary Round', '23', '5:00 PM', 'Open Ground'),
  ('basketball', 'Engineering vs Management', '24', '9:00 AM', 'Basketball Court'),
  ('football', 'Semi Final 1', '24', '10:30 AM', 'Football Field'),
  ('badminton', 'Semi Finals', '24', '2:00 PM', 'Indoor Stadium'),
  ('chess', 'Semi Finals', '24', '3:00 PM', 'Library Hall'),
  ('pentathlon', 'All Events', '24', '4:00 PM', 'Athletic Track'),
  ('carrom', 'Finals', '24', '5:00 PM', 'Common Room'),
  ('cricket', 'GRAND FINAL', '25', '9:00 AM', 'Main Ground'),
  ('football', 'GRAND FINAL', '25', '11:00 AM', 'Football Field'),
  ('basketball', 'GRAND FINAL', '25', '2:00 PM', 'Basketball Court'),
  ('badminton', 'GRAND FINAL', '25', '3:30 PM', 'Indoor Stadium'),
  ('table-tennis', 'GRAND FINAL', '25', '4:30 PM', 'TT Room'),
  ('tug-of-war', 'GRAND FINAL', '25', '5:30 PM', 'Open Ground');