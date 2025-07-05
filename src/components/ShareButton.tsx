
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

  const handleShare = async () => {
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
      
      // Doğru zaman damgası oluştur
      const now = new Date().toISOString();
      console.log('Oluşturulan zaman damgası:', now);
      
      const { data, error } = await supabase
        .from('community_posts')
        .insert([
          {
            mood: mood,
            message: message.trim(),
            user_ip: 'anonymous',
            created_at: now // ISO 8601 formatında zaman damgası ekle
          }
        ])
        .select();

      if (error) {
        console.error('Paylaşım hatası:', error);
        
        if (error.code === '23505' && error.message.includes('one_post_per_ip_per_day')) {
          toast({
            title: "Günlük Limit",
            description: "Günde sadece 1 mesaj paylaşabilirsiniz. Yarın tekrar deneyin! 😊",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Hata",
            description: "Paylaşım yapılırken bir hata oluştu.",
            variant: "destructive",
          });
        }
        return;
      }

      console.log('Paylaşım başarılı:', data);
      
      toast({
        title: "Başarılı! 🌟",
        description: "Paylaşımınız toplulukla paylaşıldı! Yarın yeni bir paylaşım yapabilirsiniz.",
      });

      // onShareSuccess callback'ini çağır
      if (onShareSuccess) {
        console.log('onShareSuccess callback çağrılıyor');
        onShareSuccess();
      }
    } catch (error) {
      console.error('Beklenmeyen hata:', error);
      toast({
        title: "Hata",
        description: "Beklenmeyen bir hata oluştu.",
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
