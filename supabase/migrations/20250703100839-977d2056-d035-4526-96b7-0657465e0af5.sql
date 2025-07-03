
-- Add a date field to track when posts were created (date only, not timestamp)
ALTER TABLE public.community_posts 
ADD COLUMN post_date DATE DEFAULT CURRENT_DATE;

-- Update existing posts to have today's date
UPDATE public.community_posts 
SET post_date = CURRENT_DATE 
WHERE post_date IS NULL;

-- Make post_date not nullable
ALTER TABLE public.community_posts 
ALTER COLUMN post_date SET NOT NULL;

-- Create a unique constraint to allow only one post per IP per day
ALTER TABLE public.community_posts 
ADD CONSTRAINT one_post_per_ip_per_day 
UNIQUE (user_ip, post_date);
