-- 1. profiles tablosunu güncelle (city ekle)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;

-- 2. Auth kullanıcısı oluşturulunca profiles'a ekle (trigger)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_profile();

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  base_username TEXT;
  unique_username TEXT;
  suffix INT := 1;
BEGIN
  -- E-posta adresinin @ öncesini al
  base_username := split_part(NEW.email, '@', 1);
  unique_username := base_username;

  -- Eğer aynı kullanıcı adı zaten varsa sonuna rakam ekle
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = unique_username) LOOP
    unique_username := base_username || suffix::TEXT;
    suffix := suffix + 1;
  END LOOP;

  -- Profil oluştur
  INSERT INTO public.profiles (id, email, username, theme, language, created_at, updated_at)
  VALUES (NEW.id, NEW.email, unique_username, 'light', 'tr', NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger oluştur
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_profile();

-- 3. Username değiştirme fonksiyonu
CREATE OR REPLACE FUNCTION public.can_change_username(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  last_change TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT last_username_change INTO last_change
  FROM public.profiles
  WHERE id = user_id;

  IF last_change IS NULL THEN
    RETURN TRUE;
  END IF;

  RETURN (NOW() - last_change) > INTERVAL '30 days';
END;
$$;

-- 4. Username güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION public.update_username(user_id UUID, new_username TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  can_update BOOLEAN;
BEGIN
  can_update := public.can_change_username(user_id);
  
  IF NOT can_update THEN
    RETURN json_build_object('success', FALSE, 'error', 'Kullanıcı adını en fazla ayda bir değiştirebilirsiniz');
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = new_username AND id != user_id) THEN
    RETURN json_build_object('success', FALSE, 'error', 'Bu kullanıcı adı zaten kullanılıyor');
  END IF;

  UPDATE public.profiles
  SET username = new_username,
      last_username_change = NOW(),
      updated_at = NOW()
  WHERE id = user_id;

  RETURN json_build_object('success', TRUE);
END;
$$;

-- 5. Storage politikalarını güncelle (mood-images bucket)
DROP POLICY IF EXISTS "Users can upload their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view mood images" ON storage.objects;

CREATE POLICY "Users can upload their own images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'mood-images' AND
  (storage.foldername(name))[1] = auth.uid()::TEXT
);

CREATE POLICY "Users can delete their own images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'mood-images' AND
  (storage.foldername(name))[1] = auth.uid()::TEXT
);

CREATE POLICY "Anyone can view mood images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'mood-images');

-- 6. RLS politikalarını kontrol et (profiles)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);