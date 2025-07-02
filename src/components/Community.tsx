
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle } from "lucide-react";
import { translations } from "@/utils/translations";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CommunityProps {
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru';
  theme: 'light' | 'dark' | 'feminine';
}

interface CommunityPost {
  id: string;
  mood: string;
  message: string;
  created_at: string;
  user_ip: string;
}

export const Community = ({ language, theme }: CommunityProps) => {
  const t = translations[language];
  const { toast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Paylaşımları yükle
  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('community_posts')
        .select('*')
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
      {/* Paylaş Butonu */}
      <Card className={`p-4 backdrop-blur-sm border-0 shadow-lg transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-800/80 text-white' 
          : theme === 'feminine'
          ? 'bg-pink-50/80'
          : 'bg-white/80'
      }`}>
        <div className="text-center">
          <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
            theme === 'dark' ? 'text-white' : theme === 'feminine' ? 'text-pink-800' : 'text-gray-800'
          }`}>
            Topluluğa Paylaş
          </h3>
          <p className={`text-sm mb-4 transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-300' : theme === 'feminine' ? 'text-pink-600' : 'text-gray-600'
          }`}>
            Bugünkü kayıtınızı anonim olarak paylaşın
          </p>
          <Button
            className={`w-full text-white py-2 rounded-xl font-medium transition-all duration-200 ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600'
                : theme === 'feminine'
                ? 'bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500'
                : 'bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500'
            }`}
            disabled
          >
            Yakında Aktif Olacak
          </Button>
        </div>
      </Card>

      {/* Topluluk Gönderileri */}
      <div className="space-y-3">
        <h3 className={`text-lg font-semibold transition-colors duration-300 ${
          theme === 'dark' ? 'text-white' : theme === 'feminine' ? 'text-pink-800' : 'text-gray-800'
        }`}>
          Topluluk Paylaşımları
        </h3>
        
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
                
                {/* Reaksiyon Butonu */}
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
                    Beğen
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center gap-2 transition-colors duration-300 ${
                      theme === 'dark' 
                        ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-700/50' 
                        : theme === 'feminine'
                        ? 'text-pink-600 hover:text-pink-700 hover:bg-pink-100/50'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                    disabled
                  >
                    <MessageCircle className="w-4 h-4" />
                    Destek Ver
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
      
      {/* API Bekleme Mesajı */}
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
            💡 Paylaşım ve etkileşim özellikleri yakında aktif olacak
          </p>
        </div>
      </Card>
    </div>
  );
};
