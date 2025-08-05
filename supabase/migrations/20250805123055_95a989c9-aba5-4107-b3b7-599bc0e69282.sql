-- Add display_name to community_posts table
ALTER TABLE public.community_posts 
ADD COLUMN display_name text;

-- Add user_id to community_posts table for authenticated users
ALTER TABLE public.community_posts 
ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Update community_posts RLS policies to allow both authenticated and anonymous posts
DROP POLICY IF EXISTS "Anyone can create community posts" ON public.community_posts;
DROP POLICY IF EXISTS "Anyone can view community posts" ON public.community_posts;

CREATE POLICY "Anyone can create community posts" 
ON public.community_posts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view community posts" 
ON public.community_posts 
FOR SELECT 
USING (true);

-- Allow authenticated users to update their own posts
CREATE POLICY "Users can update their own posts" 
ON public.community_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow authenticated users to delete their own posts
CREATE POLICY "Users can delete their own posts" 
ON public.community_posts 
FOR DELETE 
USING (auth.uid() = user_id);