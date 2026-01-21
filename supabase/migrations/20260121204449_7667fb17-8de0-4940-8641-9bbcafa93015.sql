-- Create chat_reactions table for message reactions
CREATE TABLE public.chat_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  user_identifier TEXT NOT NULL DEFAULT 'anonymous',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(message_id, emoji, user_identifier)
);

-- Enable RLS
ALTER TABLE public.chat_reactions ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Allow public read on chat_reactions"
ON public.chat_reactions
FOR SELECT
USING (true);

-- Allow public insert
CREATE POLICY "Allow public insert on chat_reactions"
ON public.chat_reactions
FOR INSERT
WITH CHECK (true);

-- Allow public delete (for toggle off)
CREATE POLICY "Allow public delete on chat_reactions"
ON public.chat_reactions
FOR DELETE
USING (true);

-- Enable realtime for reactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_reactions;