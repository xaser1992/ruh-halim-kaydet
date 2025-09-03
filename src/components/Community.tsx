
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Share } from "lucide-react";
import { translations } from "@/utils/translations";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ShareButton } from "./ShareButton";
import { UsernameSelector } from "./UsernameSelector";
import { useUsername } from "@/hooks/useUsername";

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
  display_name?: string;
  user_id?: string;
  likes_count?: number;
  user_liked?: boolean;
}

export const Community = ({ language, theme, onShare }: CommunityProps) => {
  const t = translations[language];
  const { toast } = useToast();
  const { username, updateUsername, hasUsername, loading: usernameLoading } = useUsername();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareMode, setShareMode] = useState(false);
  const [shareData, setShareData] = useState({ mood: '', message: '' });
  const [showUsernameSelector, setShowUsernameSelector] = useState(false);

  // Paylaşımları ve beğenileri yükle
  const fetchPosts = async () => {
    try {
      console.log('Paylaşımlar yükleniyor...');
      
      // Network bağlantısını kontrol et
      const { Capacitor } = await import('@capacitor/core');
      const { Network } = await import('@capacitor/network');
      
      if (Capacitor.isNativePlatform()) {
        const status = await Network.getStatus();
        console.log('Network status:', status);
        
        if (!status.connected) {
          console.log('Network bağlantısı yok');
          toast({
            title: "Bağlantı Hatası",
            description: "İnternet bağlantınızı kontrol edin.",
            variant: "destructive",
          });
          return;
        }
      }
      
      // Basit ve güvenilir posts yükleme
      console.log('Community posts yükleniyor...');
      
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (postsError) {
        console.error('Posts yükleme hatası:', postsError);
        console.error('Error details:', JSON.stringify(postsError, null, 2));
        
        toast({
          title: "Bağlantı Hatası",
          description: "Paylaşımlar yüklenemiyor. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.",
          variant: "destructive",
        });
        return;
      }

      console.log('Yüklenen posts verisi:', postsData);

      if (!postsData || postsData.length === 0) {
        console.log('Hiç post bulunamadı');
        setPosts([]);
        return;
      }

      // Her post için beğeni sayısını hesapla
      const postsWithLikes = await Promise.all(
        postsData.map(async (post) => {
          // Beğeni sayısını al
          const { count } = await supabase
            .from('community_likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', post.id);

          // Kullanıcının bu postu beğenip beğenmediğini kontrol et (IP bazlı)
          const userIP = 'user_' + (username || 'anonymous');
          const { data: userLike } = await supabase
            .from('community_likes')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_ip', userIP)
            .single();

          return {
            ...post,
            likes_count: count || 0,
            user_liked: !!userLike
          };
        })
      );

      console.log('Beğenilerle birlikte posts:', postsWithLikes);
      setPosts(postsWithLikes);
    } catch (error) {
      console.error('fetchPosts hatası:', error);
      toast({
        title: "Hata",
        description: "Paylaşımlar yüklenirken beklenmeyen bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Beğeni toggle fonksiyonu
  const toggleLike = async (postId: string, currentlyLiked: boolean) => {
    if (!hasUsername) {
      setShowUsernameSelector(true);
      return;
    }

    try {
      const userIP = 'user_' + username;
      
      if (currentlyLiked) {
        // Beğeniyi kaldır
        const { error } = await supabase
          .from('community_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_ip', userIP);

        if (error) {
          console.error('Beğeni kaldırma hatası:', error);
          return;
        }
      } else {
        // Beğeni ekle
        const { error } = await supabase
          .from('community_likes')
          .insert({
            post_id: postId,
            user_ip: userIP
          });

        if (error) {
          console.error('Beğeni ekleme hatası:', error);
          return;
        }
      }

      // Posts listesini yenile
      fetchPosts();
    } catch (error) {
      console.error('toggleLike hatası:', error);
    }
  };

  // Paylaşım başarı callback'i
  const handleShareSuccess = () => {
    console.log('Paylaşım başarılı callback çağrıldı');
    fetchPosts();
    setShareMode(false);
    setShareData({ mood: '', message: '' });
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

  const handleUsernameSelected = (selectedUsername: string) => {
    updateUsername(selectedUsername);
    setShowUsernameSelector(false);
  };

  const handleShareClick = () => {
    if (!hasUsername) {
      setShowUsernameSelector(true);
      return;
    }
    setShareMode(true);
  };

  const formatTimeAgo = (timestamp: string) => {
    try {
      if (!timestamp) return "Az önce";

      console.log("Orijinal timestamp:", timestamp);
      
      // Güvenli UTC parse (Z eksikse ekle)
      const rawTimestamp = timestamp.endsWith('Z') ? timestamp : `${timestamp}Z`;
      const utcDate = new Date(rawTimestamp);
      
      console.log("UTC Date:", utcDate);
      console.log("UTC millis:", utcDate.getTime());

      const turkeyOffsetMs = 3 * 60 * 60 * 1000; // 3 saat fark
      const turkeyDate = new Date(utcDate.getTime() + turkeyOffsetMs);

      const now = new Date();
      const nowInTurkey = new Date(now.getTime() + turkeyOffsetMs);

      const diffInMs = nowInTurkey.getTime() - turkeyDate.getTime();
      const diffInSeconds = Math.floor(diffInMs / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInSeconds < 60) return "Az önce";
      if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
      if (diffInHours < 24) return `${diffInHours} saat önce`;
      if (diffInDays === 1) return "Dün";
      if (diffInDays < 7) return `${diffInDays} gün önce`;

      return turkeyDate.toLocaleString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Bilinmiyor";
    }
  };

  if (usernameLoading) {
    return (
      <div className="text-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className={`text-sm ${
          theme === 'dark' ? 'text-gray-400' : theme === 'feminine' ? 'text-pink-500' : 'text-gray-500'
        }`}>
          Yükleniyor...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Username Selector */}
      {showUsernameSelector && (
        <UsernameSelector
          language={language}
          theme={theme}
          onUsernameSelected={handleUsernameSelected}
          currentUsername={username || undefined}
        />
      )}

      {/* Paylaşım Formu */}
      {shareMode && hasUsername && (
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
                    placeholder="Nasıl hissediyorsun?"
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
                username={username!}
                onShareSuccess={handleShareSuccess}
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
            Topluluk Paylaşımları ({posts.length})
          </h3>
          
          <Button
            onClick={handleShareClick}
            className={`flex items-center gap-2 text-white font-medium transition-all duration-200 ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600'
                : theme === 'feminine'
                ? 'bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500'
                : 'bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500'
            }`}
          >
            <Share className="w-4 h-4" />
            {hasUsername ? 'Paylaş' : 'Kullanıcı Adı Seç'}
          </Button>
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
                {/* Kullanıcı Bilgisi ve Ruh Hali */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getMoodEmoji(post.mood)}</span>
                    <div className="flex flex-col">
                      <span className={`text-sm font-medium transition-colors duration-300 ${
                        theme === 'dark' ? 'text-gray-200' : theme === 'feminine' ? 'text-pink-700' : 'text-gray-700'
                      }`}>
                        {post.display_name || 'Anonim'}
                      </span>
                      <span className={`text-xs transition-colors duration-300 ${
                        theme === 'dark' ? 'text-gray-400' : theme === 'feminine' ? 'text-pink-500' : 'text-gray-500'
                      }`}>
                        {formatTimeAgo(post.created_at)}
                      </span>
                    </div>
                  </div>
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
                    onClick={() => toggleLike(post.id, post.user_liked || false)}
                    className={`flex items-center gap-2 transition-colors duration-300 ${
                      post.user_liked
                        ? theme === 'dark' 
                          ? 'text-pink-400 hover:text-pink-300 hover:bg-gray-700/50' 
                          : theme === 'feminine'
                          ? 'text-pink-600 hover:text-pink-700 hover:bg-pink-100/50'
                          : 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
                        : theme === 'dark' 
                          ? 'text-gray-300 hover:text-pink-400 hover:bg-gray-700/50' 
                          : theme === 'feminine'
                          ? 'text-pink-400 hover:text-pink-600 hover:bg-pink-100/50'
                          : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.user_liked ? 'fill-current' : ''}`} />
                    <span>{post.likes_count || 0} Beğeni</span>
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
