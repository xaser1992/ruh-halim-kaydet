-- Username unique constraint ekle
ALTER TABLE public.users ADD CONSTRAINT users_username_unique UNIQUE (username);

-- user_settings tablosuna city kolonu ekle
ALTER TABLE public.user_settings ADD COLUMN city text;