-- Fix security warnings: Add search_path to functions
CREATE OR REPLACE FUNCTION public.can_change_username(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.update_username(user_id UUID, new_username TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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