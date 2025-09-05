-- Create mood_stats table for city mood statistics
CREATE TABLE public.mood_stats (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  city TEXT NOT NULL,
  mood TEXT NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.mood_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for mood_stats
CREATE POLICY "Allow anyone to read mood data" 
ON public.mood_stats 
FOR SELECT 
USING (true);

CREATE POLICY "Allow anyone to insert mood data" 
ON public.mood_stats 
FOR INSERT 
WITH CHECK (true);