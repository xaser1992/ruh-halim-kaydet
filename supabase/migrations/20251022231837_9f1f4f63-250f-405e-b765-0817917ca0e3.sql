-- Username unique constraint (eğer yoksa)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_username_key'
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_username_key UNIQUE (username);
  END IF;
END $$;

-- Stats tablosuna günlük tek kayıt constraint'i
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'stats_user_date_unique'
  ) THEN
    ALTER TABLE public.stats ADD CONSTRAINT stats_user_date_unique UNIQUE (user_id, created_date);
  END IF;
END $$;

-- Users tablosuna RLS ekle
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users RLS politikaları
CREATE POLICY "Users can view their own data"
ON public.users
FOR SELECT
USING (true); -- Herkes kendi user_id'sini bilmeli

CREATE POLICY "Anyone can insert users (for registration)"
ON public.users
FOR INSERT
WITH CHECK (true);

-- Stats tablosuna RLS ekle
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;

-- Stats RLS politikaları
CREATE POLICY "Users can view their own stats"
ON public.stats
FOR SELECT
USING (auth.uid()::text = user_id::text OR user_id IS NULL);

CREATE POLICY "Users can insert their own stats"
ON public.stats
FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text OR user_id IS NULL);

CREATE POLICY "Users can update their own stats"
ON public.stats
FOR UPDATE
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own stats"
ON public.stats
FOR DELETE
USING (auth.uid()::text = user_id::text);

-- Şifre hashleme için basit bir fonksiyon (demo amaçlı - production'da daha güvenli yöntem kullanılmalı)
CREATE OR REPLACE FUNCTION public.hash_password(password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN encode(digest(password || 'ruh-halim-salt', 'sha256'), 'hex');
END;
$$;