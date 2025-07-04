
-- Beğeniler için tablo oluştur
CREATE TABLE public.community_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_ip TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_ip) -- Aynı IP'den aynı posta sadece bir beğeni
);

-- RLS politikalarını etkinleştir
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;

-- Herkes beğenileri görebilir
CREATE POLICY "Anyone can view community likes" 
  ON public.community_likes 
  FOR SELECT 
  USING (true);

-- Herkes beğeni ekleyebilir
CREATE POLICY "Anyone can create community likes" 
  ON public.community_likes 
  FOR INSERT 
  WITH CHECK (true);

-- Herkes kendi beğenisini silebilir (beğeniyi geri çekme)
CREATE POLICY "Anyone can delete their own likes" 
  ON public.community_likes 
  FOR DELETE 
  USING (true);

-- Realtime için tabloyu ekle
ALTER TABLE public.community_likes REPLICA IDENTITY FULL;
