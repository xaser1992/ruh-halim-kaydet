import React, { useState, useEffect, useCallback } from "react";
import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Share, X } from "lucide-react";
import { translations } from "@/utils/translations";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ShareButton } from "./ShareButton";
import { UsernameSelector } from "./UsernameSelector";
import { useUsername } from "@/hooks/useUsername";
import { moodOptions } from "@/utils/moodData";
import { motion, AnimatePresence } from "framer-motion";

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

  const fetchPosts = useCallback(async () => {
    try {
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

      const postIds = postsData.map(p => p.id);
      const userIP = 'user_' + (username || 'anonymous');

      const { data: allLikes, error: likesError } = await supabase
        .from('community_likes')
        .select('post_id, user_ip')
        .in('post_id', postIds);

      if (likesError) {
        console.error('Beğeniler yüklenemedi:', likesError);
      }

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
  }, [username, toast]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const toggleLike = async (postId: string, currentlyLiked: boolean) => {
    if (!hasUsername) {
      setShowUsernameSelector(true);
      return;
    }

    try {
      const userIP = 'user_' + username;
      
      if (currentlyLiked) {
        const { error } = await supabase
          .from('community_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_ip', userIP);

        if (error) {
          console.error('Beğeni kaldırma hatası:', error);
          return;
        }
        
        setPosts(posts.map(post => 
          post.id === postId 
            ? { ...post, likes_count: (post.likes_count || 0) - 1, user_liked: false }
            : post
        ));
      } else {
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
      
      let postDate: Date;
      
      if (timestamp.includes('T')) {
        postDate = new Date(timestamp);
      } else {
        const isoFormat = timestamp.replace(' ', 'T') + 'Z';
        postDate = new Date(isoFormat);
      }
      
      if (isNaN(postDate.getTime())) {
        console.warn('Could not parse timestamp:', timestamp);
        return "Bilinmiyor";
      }
      
      const now = new Date();
      const diffInMs = now.getTime() - postDate.getTime();
      
      if (diffInMs < 0) {
        return "Az önce";
      }
      
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-sm text-muted-foreground">
          Yükleniyor...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {showUsernameSelector && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <UsernameSelector
              language={language}
              theme={theme}
              onUsernameSelected={handleUsernameSelected}
              currentUsername={username || undefined}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {shareMode && hasUsername && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="p-4 bg-card border-border shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-card-foreground">
                    Toplulukla Paylaş
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShareMode(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-muted-foreground">
                      Ruh Halin
                    </label>
                    <Select value={shareData.mood} onValueChange={(value) => setShareData({ ...shareData, mood: value })}>
                      <SelectTrigger className="w-full bg-background border-border">
                        <SelectValue placeholder="Seç..." />
                      </SelectTrigger>
                      <SelectContent>
                        {moodOptions.map((mood) => (
                          <SelectItem key={mood.id} value={mood.id}>
                            {mood.emoji} {mood.labelTr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1 text-muted-foreground">
                      Mesajın
                    </label>
                    <Textarea
                      value={shareData.message}
                      onChange={(e) => setShareData({ ...shareData, message: e.target.value })}
                      placeholder="Nasıl hissediyorsun?"
                      rows={3}
                      className="bg-background border-border"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button
                    onClick={() => setShareMode(false)}
                    variant="ghost"
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
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Topluluk Paylaşımları ({posts.length})
          </h3>
          
          <Button
            onClick={handleShareClick}
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Share className="w-4 h-4" />
            {hasUsername ? 'Paylaş' : 'Kullanıcı Adı Seç'}
          </Button>
        </div>
        
        {loading ? (
          <Card className="p-4 bg-card border-border">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Paylaşımlar yükleniyor...
              </p>
            </div>
          </Card>
        ) : posts.length === 0 ? (
          <Card className="p-4 bg-card border-border">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Henüz paylaşım yok. İlk paylaşımı siz yapın! 🌟
              </p>
            </div>
          </Card>
        ) : (
          <motion.div className="space-y-3">
            <AnimatePresence>
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-4 bg-card border-border hover:shadow-lg transition-shadow">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getMoodEmoji(post.mood)}</span>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-card-foreground">
                              {post.display_name || 'Anonim'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(post.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm leading-relaxed text-card-foreground">
                        {post.message}
                      </p>
                      
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleLike(post.id, post.user_liked || false)}
                          className="flex items-center gap-1"
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              post.user_liked ? 'fill-destructive text-destructive' : 'text-muted-foreground'
                            }`}
                          />
                          <span className="text-sm text-muted-foreground">
                            {post.likes_count || 0}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Community;
