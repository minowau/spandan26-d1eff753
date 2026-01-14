-- Settings table for global configuration (countdown date, etc.)
CREATE TABLE public.settings (
  id TEXT PRIMARY KEY DEFAULT 'global',
  fest_start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT '2026-01-22T09:00:00+05:30',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Public read/write policies for settings
CREATE POLICY "Allow public read on settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Allow public update on settings" ON public.settings FOR UPDATE USING (true);
CREATE POLICY "Allow public insert on settings" ON public.settings FOR INSERT WITH CHECK (true);

-- Insert default settings
INSERT INTO public.settings (id, fest_start_date) VALUES ('global', '2026-01-22T09:00:00+05:30');

-- Add new columns to matches table
ALTER TABLE public.matches 
  ADD COLUMN IF NOT EXISTS team_a TEXT,
  ADD COLUMN IF NOT EXISTS team_b TEXT,
  ADD COLUMN IF NOT EXISTS match_type TEXT DEFAULT 'group' CHECK (match_type IN ('group', 'eliminator', 'semifinal', 'final')),
  ADD COLUMN IF NOT EXISTS group_name TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'running', 'completed')),
  ADD COLUMN IF NOT EXISTS live_stream_url TEXT;

-- Add new columns to teams table
ALTER TABLE public.teams
  ADD COLUMN IF NOT EXISTS draws INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS net_run_rate DECIMAL(6,3) DEFAULT 0.000,
  ADD COLUMN IF NOT EXISTS goal_difference INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS point_difference INTEGER DEFAULT 0;

-- Add scoring_rules column to sports table for configurable points
ALTER TABLE public.sports
  ADD COLUMN IF NOT EXISTS win_points INTEGER DEFAULT 2,
  ADD COLUMN IF NOT EXISTS draw_points INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS loss_points INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS uses_nrr BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS uses_gd BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS uses_pd BOOLEAN DEFAULT false;

-- Update existing sports with proper scoring rules
UPDATE public.sports SET uses_nrr = true WHERE id = 'cricket';
UPDATE public.sports SET uses_gd = true WHERE id IN ('football', 'volleyball');
UPDATE public.sports SET uses_pd = true WHERE id IN ('basketball', 'throwball');

-- Chat messages table for discussion forums
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sport_id TEXT NOT NULL REFERENCES public.sports(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  username TEXT NOT NULL DEFAULT 'Anonymous',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Public read/write policies for chat_messages
CREATE POLICY "Allow public read on chat_messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert on chat_messages" ON public.chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete on chat_messages" ON public.chat_messages FOR DELETE USING (true);

-- Enable realtime for chat_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Update function for settings timestamp
CREATE OR REPLACE FUNCTION public.update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_settings_timestamp
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_settings_updated_at();