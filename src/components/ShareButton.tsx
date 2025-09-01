
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface ShareButtonProps {
  mood: string;
  message: string;
  theme: 'light' | 'dark' | 'feminine';
  disabled?: boolean;
  onShareSuccess?: () => void;
}

export const ShareButton = ({ 
  mood, 
  message, 
  theme, 
  disabled = false,
  onShareSuccess 
}: ShareButtonProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleShare = async () => {
    if (!user) {
      toast({
        title: "Uyarı",
        description: "Paylaşım yapmak için Google ile giriş yapın.",
        variant: "destructive",
      });
      return;
    }

    if (!mood || !message.trim()) {
      toast({
        title: "Uyarı",
        description: "Paylaşmak için ruh halinizi ve mesajınızı yazın.",
        variant: "destructive",
      });
      return;
    }

    setIsSharing(true);
    
    try {
      console.log('Paylaşım başlıyor:', { mood, message: message.trim() });
      
      // ISO 8601 formatında zaman damgası oluştur
      const now = new Date().toISOString();
      console.log('Oluşturulan zaman damgası:', now);
      
      // Eğer kullanıcı giriş yapmışsa profil bilgisini al
      let displayName = 'Anonim';
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        displayName = profileData?.full_name || user.email?.split('@')[0] || 'Kullanıcı';
      }

      const { data, error } = await supabase
        .from('community_posts')
        .insert([
          {
            mood: mood,
            message: message.trim(),
            user_ip: user ? 'authenticated' : 'anonymous',
            user_id: user?.id || null,
            display_name: displayName,
            created_at: now
          }
        ])
        .select();

      if (error) {
        console.error('Supabase paylaşım hatası:', error);
        toast({
          title: "Paylaşım Başarısız",
          description: `Paylaşım yapılırken hata oluştu: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      // Data kontrolü - başarılı insert sonrası data olmalı
      if (!data || data.length === 0) {
        console.error('Paylaşım başarısız: Veri döndürülmedi');
        toast({
          title: "Paylaşım Başarısız",
          description: "Paylaşım kaydedilemedi. Lütfen tekrar deneyin.",
          variant: "destructive",
        });
        return;
      }

      console.log('Paylaşım başarıyla tamamlandı:', data);
      
      toast({
        title: "Başarılı! 🌟",
        description: "Paylaşımınız toplulukla paylaşıldı!",
      });

      // onShareSuccess callback'ini çağır
      if (onShareSuccess) {
        console.log('onShareSuccess callback çağrılıyor');
        onShareSuccess();
      }
    } catch (error) {
      console.error('Beklenmeyen paylaşım hatası:', error);
      toast({
        title: "Paylaşım Başarısız",
        description: "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Button
      onClick={handleShare}
      disabled={disabled || isSharing || !mood || !message.trim()}
      className={`flex items-center gap-2 text-white font-medium transition-all duration-200 ${
        theme === 'dark' 
          ? 'bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600'
          : theme === 'feminine'
          ? 'bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500'
          : 'bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500'
      }`}
    >
      <Share className="w-4 h-4" />
      {isSharing ? 'Paylaşılıyor...' : 'Toplulukla Paylaş'}
    </Button>
  );
};
