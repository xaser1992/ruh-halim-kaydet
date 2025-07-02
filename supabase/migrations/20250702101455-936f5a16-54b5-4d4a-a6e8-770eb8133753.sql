
-- Add mood column to community_posts table for storing the mood/emoji with each post
ALTER TABLE public.community_posts 
ADD COLUMN mood TEXT;

-- Add basic RLS policies for community posts
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read community posts (for anonymous sharing)
CREATE POLICY "Anyone can view community posts" 
  ON public.community_posts 
  FOR SELECT 
  USING (true);

-- Allow anyone to insert community posts (for anonymous sharing)
CREATE POLICY "Anyone can create community posts" 
  ON public.community_posts 
  FOR INSERT 
  WITH CHECK (true);
