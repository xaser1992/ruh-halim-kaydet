import React, { useState, useEffect } from "react";
import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Share } from "lucide-react";
import { translations } from "@/utils/translations";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ShareButton } from "./ShareButton";
import { UsernameSelector } from "./UsernameSelector";
import { useUsername } from "@/hooks/useUsername";
import { moodOptions } from "@/utils/moodData";

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

const Community = ({ language, theme, onShare }: CommunityProps) => {
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
      // Network bağlantısını kontrol et
      if (Capacitor.isNativePlatform()) {
        const status = await Network.getStatus();
        
        if (!status.connected) {
          setTimeout(() => {
            toast({
              title: "Bağlantı Hatası",
              description: "İnternet bağlantınızı kontrol edin.",
              variant: "destructive",
            });
          }, 100);
          return;
        }
      }
      
      // Posts'ları çek
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (postsError) {
        setTimeout(() => {
          toast({
            title: "Bağlantı Hatası",
            description: "Paylaşımlar yüklenemiyor.",
            variant: "destructive",
          });
        }, 100);
        return;
      }

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        return;
      }

      // Tüm post ID'lerini topla
      const postIds = postsData.map(p => p.id);
      const userIP = 'user_' + (username || 'anonymous');

      // Tek sorguda tüm beğenileri al
      const { data: allLikes, error: likesError } = await supabase
        .from('community_likes')
        .select('post_id, user_ip')
        .in('post_id', postIds);

      if (likesError) {
        console.error('Beğeniler yüklenemedi:', likesError);
      }

      // Beğenileri post ID'ye göre grupla
      const likesMap: Record<string, { count: number; userLiked: boolean }> = {};
      
      postIds.forEach(id => {
        likesMap[id] = { count: 0, userLiked: false };
      });

      allLikes?.forEach(like => {
        if (likesMap[like.post_id]) {
          likesMap[like.post_id].count++;
          if (like.user_ip === userIP) {
            likesMap[like.post_id].userLiked = true;
          }
        }
      });

      // Posts'lara beğeni bilgilerini ekle
      const postsWithLikes = postsData.map(post => ({
        ...post,
        likes_count: likesMap[post.id]?.count || 0,
        user_liked: likesMap[post.id]?.userLiked || false
      }));

      setPosts(postsWithLikes);
    } catch (error) {
      console.error('fetchPosts hatası:', error);
      setTimeout(() => {
        toast({
          title: "Hata",
          description: "Paylaşımlar yüklenirken bir hata oluştu.",
          variant: "destructive",
        });
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [language]);

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
        
        // State'i güncelle
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, likes_count: (post.likes_count || 0) - 1, user_liked: false }
            : post
        ));
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
        
        // State'i güncelle
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, likes_count: (post.likes_count || 0) + 1, user_liked: true }
            : post
        ));
      }
    } catch (error) {
      console.error('toggleLike hatası:', error);
    }
  };

  // Paylaşım başarı callback'i
  const handleShareSuccess = () => {
    fetchPosts();
    setShareMode(false);
    setShareData({ mood: '', message: '' });
  };

  const getMoodEmoji = (mood: string) => {
    const foundMood = moodOptions.find(m => m.id === mood);
    return foundMood ? foundMood.emoji : "😊";
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
      
      // Parse the timestamp properly - handle both ISO string and database format
      let postDate: Date;
      
      if (timestamp.includes('T')) {
        // ISO format with timezone
        postDate = new Date(timestamp);
      } else if (timestamp.includes(' ')) {
        // Database format without timezone (assume UTC)
        postDate = new Date(timestamp + (timestamp.includes('Z') ? '' : 'Z'));
      } else {
        postDate = new Date(timestamp);
      }
      
      // If the date is invalid, try to parse it differently
      if (isNaN(postDate.getTime())) {
        // Try to parse as MySQL datetime format
        const mysqlFormat = timestamp.replace(' ', 'T') + 'Z';
        postDate = new Date(mysqlFormat);
        
        if (isNaN(postDate.getTime())) {
          console.warn('Could not parse timestamp:', timestamp);
          return "Bilinmiyor";
        }
      }
      
      const now = new Date();
      const diffInMs = now.getTime() - postDate.getTime();
      const diffInSeconds = Math.floor(diffInMs / 1000);
      const diffInMinutes = Math.floor(diffInSeconds / 60);
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInSeconds < 30) return "Az önce";
      if (diffInSeconds < 60) return `${diffInSeconds} saniye önce`;
      if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
      if (diffInHours < 24) return `${diffInHours} saat önce`;
      if (diffInDays === 1) return "Dün";
      if (diffInDays < 7) return `${diffInDays} gün önce`;

      return postDate.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Error formatting timestamp:', timestamp, error);
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
                  {moodOptions.map((mood) => (
                    <option key={mood.id} value={mood.id}>
                      {mood.emoji} {mood.labelTr}
                    </option>
                  ))}
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

export default React.memo(Community);
export { type CommunityProps };
