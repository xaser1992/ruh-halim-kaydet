import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Share } from "lucide-react";
import { translations } from "@/utils/translations";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ShareButton } from "./ShareButton";

interface CommunityProps {
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru';
  theme: 'light' | 'dark' | 'feminine';
  onShare?: (mood: string, message: string) => void;
}

interface CommunityPost {
  id: string;
  mood: string;
  message: string;
  created_at: string;
  user_ip: string;
  post_date: string;
}

export const Community = ({ language, theme, onShare }: CommunityProps) => {
  const t = translations[language];
  const { toast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareMode, setShareMode] = useState(false);
  const [shareData, setShareData] = useState({ mood: '', message: '' });

  // Paylaşımları yükle
  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('id, mood, message, created_at, user_ip, post_date')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching posts:', error);
        toast({
          title: "Hata",
          description: "Paylaşımlar yüklenirken bir hata oluştu.",
          variant: "destructive",
        });
        return;
      }

      setPosts(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleShare = async (mood: string, message: string) => {
    try {
      const { error } = await supabase
        .from('community_posts')
        .insert([
          {
            mood: mood,
            message: message,
            user_ip: 'anonymous',
            post_date: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
          }
        ]);

      if (error) {
        console.error('Error sharing post:', error);
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

      toast({
        title: "Başarılı",
        description: "Paylaşımınız toplulukla paylaşıldı! 🌟",
      });

      // Paylaşımları yenile
      fetchPosts();
      setShareMode(false);
      setShareData({ mood: '', message: '' });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Hata",
        description: "Beklenmeyen bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const getMoodEmoji = (mood: string) => {
    const moodEmojis: Record<string, string> = {
      "very-bad": "😢",
      bad: "😞",
      neutral: "😐",
      good: "😊",
      great: "😄",
      happy: "😊",
      sad: "😢",
      angry: "😠",
      excited: "🤩",
      calm: "😌",
      anxious: "😰",
      love: "😍",
      tired: "😴"
    };
    return moodEmojis[mood] || "😊";
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - postTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Şimdi";
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} gün önce`;
  };

  return (
    <div className="space-y-4">
      {/* Paylaşım Formu */}
      {shareMode && (
        <Card className={`p-4 backdrop-blur-sm border-0 shadow-lg transition-colors duration-300 ${
          theme === 'dark' 
            ? 'bg-gray-800/80 text-white' 
            : theme === 'feminine'
            ? 'bg-pink-50/80'
            : 'bg-white/80'
        }`}>
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold transition-colors duration-300 ${
              theme === 'dark' ? 'text-white' : theme === 'feminine' ? 'text-pink-800' : 'text-gray-800'
            }`}>
              Toplulukla Paylaş
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                  theme === 'dark' ? 'text-gray-300' : theme === 'feminine' ? 'text-pink-700' : 'text-gray-700'
                }`}>
                  Ruh Halin
                </label>
                <select
                  value={shareData.mood}
                  onChange={(e) => setShareData({ ...shareData, mood: e.target.value })}
                  className={`w-full p-2 rounded-lg border transition-colors duration-300 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : theme === 'feminine'
                      ? 'bg-pink-50 border-pink-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <option value="">Seç...</option>
                  <option value="great">😄 Harika</option>
                  <option value="good">😊 İyi</option>
                  <option value="neutral">😐 Normal</option>
                  <option value="bad">😞 Kötü</option>
                  <option value="very-bad">😢 Çok Kötü</option>
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-1 transition-colors duration-300 ${
                  theme === 'dark' ? 'text-gray-300' : theme === 'feminine' ? 'text-pink-700' : 'text-gray-700'
                }`}>
                  Mesajın
                </label>
                <textarea
                  value={shareData.message}
                  onChange={(e) => setShareData({ ...shareData, message: e.target.value })}
                  placeholder="Nasıl hissediyorsun? (Günde sadece 1 mesaj paylaşabilirsin)"
                  rows={3}
                  className={`w-full p-2 rounded-lg border transition-colors duration-300 ${
                    theme === 'dark' 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : theme === 'feminine'
                      ? 'bg-pink-50 border-pink-200 placeholder-pink-400'
                      : 'bg-white border-gray-200 placeholder-gray-400'
                  }`}
                />
              </div>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => setShareMode(false)}
                variant="ghost"
                className={`transition-colors duration-300 ${
                  theme === 'dark' 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                    : theme === 'feminine'
                    ? 'text-pink-600 hover:text-pink-700 hover:bg-pink-100'
                    : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                İptal
              </Button>
              <ShareButton
                mood={shareData.mood}
                message={shareData.message}
                theme={theme}
                onShareSuccess={() => {
                  fetchPosts();
                  setShareMode(false);
                  setShareData({ mood: '', message: '' });
                }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Topluluk Gönderileri */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-semibold transition-colors duration-300 ${
            theme === 'dark' ? 'text-white' : theme === 'feminine' ? 'text-pink-800' : 'text-gray-800'
          }`}>
            Topluluk Paylaşımları
          </h3>
          
          {!shareMode && (
            <Button
              onClick={() => setShareMode(true)}
              className={`flex items-center gap-2 text-white font-medium transition-all duration-200 ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600'
                  : theme === 'feminine'
                  ? 'bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500'
                  : 'bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500'
              }`}
            >
              <Share className="w-4 h-4" />
              Paylaş
            </Button>
          )}
        </div>
        
        {loading ? (
          <Card className={`p-4 backdrop-blur-sm border-0 shadow-lg transition-colors duration-300 ${
            theme === 'dark' 
              ? 'bg-gray-800/80 text-white' 
              : theme === 'feminine'
              ? 'bg-pink-50/80'
              : 'bg-white/80'
          }`}>
            <div className="text-center">
              <p className={`text-sm transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-400' : theme === 'feminine' ? 'text-pink-500' : 'text-gray-500'
              }`}>
                Paylaşımlar yükleniyor...
              </p>
            </div>
          </Card>
        ) : posts.length === 0 ? (
          <Card className={`p-4 backdrop-blur-sm border-0 shadow-lg transition-colors duration-300 ${
            theme === 'dark' 
              ? 'bg-gray-800/80 text-white' 
              : theme === 'feminine'
              ? 'bg-pink-50/80'
              : 'bg-white/80'
          }`}>
            <div className="text-center">
              <p className={`text-sm transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-400' : theme === 'feminine' ? 'text-pink-500' : 'text-gray-500'
              }`}>
                Henüz paylaşım yok. İlk paylaşımı siz yapın! 🌟
              </p>
            </div>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className={`p-4 backdrop-blur-sm border-0 shadow-lg transition-colors duration-300 ${
              theme === 'dark' 
                ? 'bg-gray-800/80 text-white' 
                : theme === 'feminine'
                ? 'bg-pink-50/80'
                : 'bg-white/80'
            }`}>
              <div className="space-y-3">
                {/* Ruh Hali */}
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getMoodEmoji(post.mood)}</span>
                  <span className={`text-sm transition-colors duration-300 ${
                    theme === 'dark' ? 'text-gray-400' : theme === 'feminine' ? 'text-pink-500' : 'text-gray-500'
                  }`}>
                    {formatTimeAgo(post.created_at)}
                  </span>
                </div>
                
                {/* Mesaj */}
                <p className={`text-sm leading-relaxed transition-colors duration-300 ${
                  theme === 'dark' ? 'text-gray-200' : theme === 'feminine' ? 'text-pink-700' : 'text-gray-700'
                }`}>
                  {post.message}
                </p>
                
                {/* Beğeni Butonu */}
                <div className="flex items-center justify-between pt-2 border-t border-opacity-20">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center gap-2 transition-colors duration-300 ${
                      theme === 'dark' 
                        ? 'text-gray-300 hover:text-pink-400 hover:bg-gray-700/50' 
                        : theme === 'feminine'
                        ? 'text-pink-600 hover:text-pink-700 hover:bg-pink-100/50'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                    }`}
                    disabled
                  >
                    <Heart className="w-4 h-4" />
                    <span>0 Beğeni</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export { type CommunityProps };
