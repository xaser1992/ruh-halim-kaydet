
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from './ImageUpload';
import { ShareButton } from './ShareButton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MoodEntryProps {
  mood: string;
  onSave: (note: string, images: string[], moodId: string) => void;
  theme: 'light' | 'dark' | 'feminine';
  username: string;
  city: string;
  userId: string;
}

export const MoodEntry = ({ mood, onSave, theme, username, city, userId }: MoodEntryProps) => {
  const [note, setNote] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [shareWithCommunity, setShareWithCommunity] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!mood || !username || !city || !userId) return;
    
    // Bugün için istatistik kontrolü
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD formatı
    
    try {
      // Kullanıcının bugün için bir istatistik olup olmadığını kontrol et
      const { data: existingStat } = await supabase
        .from('stats')
        .select('id')
        .eq('user_id', userId)
        .eq('created_date', today)
        .maybeSingle();

      if (existingStat) {
        toast({
          title: "Uyarı",
          description: "Bugün zaten bir istatistik girdiniz. Günde sadece bir istatistik ekleyebilirsiniz.",
          variant: "destructive",
        });
        return;
      }

      // Stats tablosuna kaydet
      await supabase
        .from('stats')
        .insert({
          user_id: userId,
          mood,
          note: note || null,
          created_date: today
        });
    } catch (error: any) {
      console.error('Error saving stats:', error);
      
      // Unique constraint hatası kontrolü
      if (error?.code === '23505') {
        toast({
          title: "Uyarı",
          description: "Bugün zaten bir istatistik girdiniz. Günde sadece bir istatistik ekleyebilirsiniz.",
          variant: "destructive",
        });
        return;
      }
    }
    
    onSave(note, images, mood);
    
    // Şehir istatistikleri için veri kaydet
    try {
      await supabase
        .from('mood_stats' as any)
        .insert({
          city,
          mood
        });
    } catch (error) {
      console.error('Error saving city stats:', error);
    }
    
    // Topluluk paylaşımı için veri kaydet
    if (shareWithCommunity) {
      try {
        await supabase
          .from('community_posts')
          .insert({
            mood,
            message: note || null,
            user_ip: 'anonymous',
            display_name: username,
            created_at: new Date().toISOString().slice(0, 19)
          });
        
        toast({
          title: "Başarılı!",
          description: "Ruh haliniz kaydedildi ve topluluk ile paylaşıldı!",
        });
      } catch (error) {
        console.error('Error sharing with community:', error);
        toast({
          title: "Kaydedildi!",
          description: "Ruh haliniz kaydedildi ancak toplulukla paylaşılırken hata oluştu.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Kaydedildi!",
        description: "Ruh haliniz başarıyla kaydedildi!",
      });
    }
    
    // Reset form
    setNote('');
    setImages([]);
    setShareWithCommunity(false);
  };

  return (
    <div className={`backdrop-blur-sm rounded-xl p-6 transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gray-800/80 text-white' 
        : theme === 'feminine'
        ? 'bg-pink-50/80'
        : 'bg-white/80'
    }`}>
      <div className="space-y-4">
        {/* Note Input */}
        <div>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Bu ruh haliyle ilgili notlarınızı yazabilirsiniz... (isteğe bağlı)"
            className={`min-h-[100px] transition-colors duration-300 ${
              theme === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white' 
                : theme === 'feminine'
                ? 'bg-pink-50 border-pink-200 text-pink-800'
                : 'bg-white border-gray-200'
            }`}
          />
        </div>

        {/* Image Upload */}
        <ImageUpload 
          images={images} 
          onImagesChange={setImages} 
          theme={theme} 
          language="tr" 
        />

        {/* Share with Community */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="shareWithCommunity"
            checked={shareWithCommunity}
            onChange={(e) => setShareWithCommunity(e.target.checked)}
            className="rounded"
          />
          <label 
            htmlFor="shareWithCommunity" 
            className={`text-sm transition-colors duration-300 ${
              theme === 'dark' ? 'text-gray-300' : theme === 'feminine' ? 'text-pink-600' : 'text-gray-600'
            }`}
          >
            Topluluk ile paylaş (anonim)
          </label>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={!mood}
          className={`w-full py-3 font-medium transition-colors duration-300 ${
            theme === 'dark' 
              ? 'bg-purple-700 hover:bg-purple-600 text-white' 
              : theme === 'feminine'
              ? 'bg-pink-500 hover:bg-pink-600 text-white'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
          } disabled:opacity-50`}
        >
          Kaydet
        </Button>
      </div>
    </div>
  );
};
