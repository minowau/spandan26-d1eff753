-- Add reply_to column to chat_messages for threading
ALTER TABLE public.chat_messages 
ADD COLUMN reply_to UUID REFERENCES public.chat_messages(id) ON DELETE SET NULL;

-- Create match_votes table for team predictions
CREATE TABLE public.match_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  team_voted TEXT NOT NULL,
  user_identifier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(match_id, user_identifier)
);

-- Enable RLS
ALTER TABLE public.match_votes ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Allow public read on match_votes"
ON public.match_votes
FOR SELECT
USING (true);

-- Allow public insert
CREATE POLICY "Allow public insert on match_votes"
ON public.match_votes
FOR INSERT
WITH CHECK (true);

-- Allow public update (to change vote)
CREATE POLICY "Allow public update on match_votes"
ON public.match_votes
FOR UPDATE
USING (true);

-- Enable realtime for votes
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_votes;