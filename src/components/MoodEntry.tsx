
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { saveMoodEntry, getMoodEntry, saveDraft, getDraft, clearDraft } from "@/utils/moodStorage";
import { ImageUpload } from "@/components/ImageUpload";
import { MoodSelector } from "@/components/MoodSelector";
import { moodOptions } from "@/utils/moodData";
import { translations } from "@/utils/translations";
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Camera as CameraIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMoodEntries } from "@/hooks/useMoodEntries";

interface MoodEntryProps {
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru';
  theme: 'light' | 'dark' | 'feminine';
  onEntryUpdate?: () => void;
}

export const MoodEntry = ({ language, theme, onEntryUpdate }: MoodEntryProps) => {
  const { user } = useAuth();
  const { saveEntry, getEntry } = useMoodEntries();
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [note, setNote] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [todayEntry, setTodayEntry] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const t = translations[language];

  const loadTodayData = async () => {
    const today = new Date().toDateString();
    
    let entry = null;
    if (user) {
      // Giriş yapmış kullanıcı için Supabase'den yükle
      entry = await getEntry(today);
      console.log('Getting entry for', today, ':', entry);
    } else {
      // Giriş yapmamış kullanıcı için localStorage'dan yükle
      entry = getMoodEntry(today);
    }
    
    const draft = getDraft(today);
    
    console.log('Loading today entry:', entry);
    console.log('Loading draft:', draft);
    
    setTodayEntry(entry);
    
    if (entry) {
      setSelectedMood(entry.mood || "");
      setNote(entry.note || "");
      setImages(entry.images || []);
    } else if (draft) {
      setSelectedMood(draft.mood || "");
      setNote(draft.note || "");
      setImages(draft.images || []);
    } else {
      setSelectedMood("");
      setNote("");
      setImages([]);
    }
  };

  const setupDailyNotifications = async () => {
    try {
      await LocalNotifications.requestPermissions();
      
      // Her gün için 2 rastgele saat belirleme (9-12 ve 16-20 arası)
      const morningHour = Math.floor(Math.random() * 4) + 9; // 9-12
      const eveningHour = Math.floor(Math.random() * 5) + 16; // 16-20
      const morningMinute = Math.floor(Math.random() * 60);
      const eveningMinute = Math.floor(Math.random() * 60);

      // Sabah bildirimi
      const morningTime = new Date();
      morningTime.setHours(morningHour, morningMinute, 0, 0);
      if (morningTime <= new Date()) {
        morningTime.setDate(morningTime.getDate() + 1);
      }

      // Akşam bildirimi
      const eveningTime = new Date();
      eveningTime.setHours(eveningHour, eveningMinute, 0, 0);
      if (eveningTime <= new Date()) {
        eveningTime.setDate(eveningTime.getDate() + 1);
      }

      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Ruh Halim",
            body: "Bugünkü ruh halinizi kaydetmeyi unutmayın!",
            id: 1,
            schedule: { at: morningTime },
            sound: 'default',
            attachments: undefined,
            actionTypeId: "",
            extra: null
          },
          {
            title: "Ruh Halim", 
            body: "Gününüzü nasıl geçirdiğinizi not etmek ister misiniz?",
            id: 2,
            schedule: { at: eveningTime },
            sound: 'default',
            attachments: undefined,
            actionTypeId: "",
            extra: null
          }
        ]
      });

      console.log('Daily notifications scheduled for:', {
        morning: morningTime.toLocaleTimeString(),
        evening: eveningTime.toLocaleTimeString()
      });
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  useEffect(() => {
    loadTodayData();
    setupDailyNotifications();
  }, []);

  const takePhoto = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });

      if (image.dataUrl) {
        setImages(prev => [...prev, image.dataUrl!]);
        toast({
          title: "Fotoğraf eklendi",
          description: "Kameradan çekilen fotoğraf başarıyla eklendi."
        });
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: "Kamera Hatası",
        description: "Fotoğraf çekilirken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };

  const saveDraftData = () => {
    const today = new Date().toDateString();
    if (!todayEntry && (selectedMood || note.trim() || images.length > 0)) {
      const draft = {
        date: today,
        mood: selectedMood,
        note: note.trim(),
        images: images
      };
      console.log('Saving draft:', draft);
      saveDraft(draft);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveDraftData();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [selectedMood, note, images, todayEntry]);

  const handleSave = async () => {
    if (!selectedMood || isSaving) return;

    setIsSaving(true);
    const today = new Date().toDateString();
    const entry = {
      date: today,
      mood: selectedMood,
      note: note.trim(),
      images: images,
      timestamp: new Date().toISOString()
    };

    console.log('Saving entry with images count:', images.length);
    
    try {
      if (user) {
        // Giriş yapmış kullanıcı için Supabase'e kaydet
        await saveEntry(entry);
        console.log('✅ Entry saved to Supabase successfully');
      } else {
        // Giriş yapmamış kullanıcı için localStorage'a kaydet
        await saveMoodEntry(entry);
      }
      
      setTodayEntry(entry);
      clearDraft(today);
      
      if (onEntryUpdate) {
        console.log('Calling onEntryUpdate after successful save');
        setTimeout(() => {
          onEntryUpdate();
        }, 100);
      }
      
      toast({
        title: t.saved,
        description: new Date().toLocaleDateString(getLocaleString(language), {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
      });
    } catch (error) {
      console.error('❌ Error saving entry:', error);
      toast({
        title: "Hata",
        description: "Kayıt işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getSelectedMoodColors = () => {
    const selectedMoodOption = moodOptions.find(mood => mood.id === selectedMood);
    return selectedMoodOption?.colors || {
      bg: "bg-purple-100",
      hover: "hover:bg-purple-200", 
      gradient: "from-purple-200 to-pink-200",
      darkBg: "dark:bg-purple-900/30",
      darkHover: "dark:hover:bg-purple-800/40",
      darkGradient: "dark:from-purple-800 dark:to-purple-900"
    };
  };

  const hasChanges = todayEntry && (
    selectedMood !== todayEntry.mood ||
    note !== (todayEntry.note || "") ||
    JSON.stringify(images) !== JSON.stringify(todayEntry.images || [])
  );

  const hasContent = selectedMood || note.trim() || images.length > 0;
  const shouldShowSaveButton = hasContent && !todayEntry;
  const shouldShowUpdateButton = hasChanges;

  return (
    <Card className={`p-4 backdrop-blur-sm border-0 shadow-lg transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gray-800/80 text-white' 
        : theme === 'feminine'
        ? 'bg-pink-50/80'
        : 'bg-white/80'
    }`}>
      <div className="space-y-4">
        {/* Today's Date */}
        <div className="text-center">
          <p className={`text-base font-medium mb-1 transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-200' : theme === 'feminine' ? 'text-pink-700' : 'text-gray-700'
          }`}>
            {new Date().toLocaleDateString(getLocaleString(language), {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
          {todayEntry && (
            <p className={`text-xs px-2 py-1 rounded-full inline-block transition-colors duration-300 ${
              theme === 'dark' 
                ? 'text-purple-300 bg-purple-900/50' 
                : theme === 'feminine'
                ? 'text-pink-600 bg-pink-100'
                : 'text-purple-600 bg-purple-50'
            }`}>
              {t.alreadyExists}
            </p>
          )}
        </div>

        {/* Question */}
        <div className="text-center">
          <h2 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
            theme === 'dark' ? 'text-white' : theme === 'feminine' ? 'text-pink-800' : 'text-gray-800'
          }`}>
            {t.question}
          </h2>
        </div>

        <MoodSelector
          selectedMood={selectedMood}
          onMoodSelect={setSelectedMood}
          language={language}
          theme={theme}
        />

        {/* Note Input */}
        <div className="space-y-1">
          <label className={`text-sm font-medium transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-200' : theme === 'feminine' ? 'text-pink-700' : 'text-gray-700'
          }`}>
            {t.noteLabel}
          </label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t.notePlaceholder}
            className={`min-h-[80px] rounded-xl transition-colors duration-300 ${
              theme === 'dark' 
                ? 'bg-gray-700/70 border-purple-600 focus:border-purple-400 text-white placeholder:text-gray-400' 
                : theme === 'feminine'
                ? 'bg-pink-25/70 border-pink-300 focus:border-pink-400 text-pink-800 placeholder:text-pink-400'
                : 'bg-white/70 border-purple-200 focus:border-purple-400'
            }`}
            maxLength={10000}
          />
          <p className={`text-xs text-right transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-400' : theme === 'feminine' ? 'text-pink-500' : 'text-gray-500'
          }`}>
            {note.length}/10000
          </p>
        </div>

        {/* Photo Upload */}
        <div className="space-y-1">
          <label className={`text-sm font-medium transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-200' : theme === 'feminine' ? 'text-pink-700' : 'text-gray-700'
          }`}>
            {t.photosLabel}
          </label>
          
          {/* Camera button */}
          <div className="mb-2">
            <Button
              onClick={takePhoto}
              variant="outline"
              size="sm"
              className={`w-full transition-colors duration-300 ${
                theme === 'dark' 
                  ? 'bg-gray-700/70 border-purple-600 text-white hover:bg-gray-600/70' 
                  : theme === 'feminine'
                  ? 'bg-pink-50/70 border-pink-300 text-pink-800 hover:bg-pink-100/70'
                  : 'bg-white/70 border-purple-200 hover:bg-white/90'
              }`}
            >
              <CameraIcon className="w-4 h-4 mr-2" />
              Kamera
            </Button>
          </div>

          <ImageUpload
            images={images}
            onImagesChange={setImages}
            language={language}
            theme={theme}
            maxImages={5}
          />
        </div>

        {/* Save/Update Button */}
        {(shouldShowSaveButton || shouldShowUpdateButton) && (
          <Button
            onClick={handleSave}
            disabled={!selectedMood || isSaving}
            className={`w-full text-white py-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 ${
              selectedMood 
                ? `bg-gradient-to-r ${getSelectedMoodColors().gradient} ${theme === 'dark' ? getSelectedMoodColors().darkGradient : ''} hover:shadow-lg`
                : `bg-gradient-to-r ${
                  theme === 'dark' 
                    ? 'from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600'
                    : theme === 'feminine'
                    ? 'from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500'
                    : 'from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500'
                }`
            }`}
          >
            {isSaving ? "Kaydediliyor..." : (shouldShowUpdateButton ? t.update : t.save)}
          </Button>
        )}
      </div>
    </Card>
  );
};

const getLocaleString = (language: string) => {
  const localeMap: Record<string, string> = {
    'tr': 'tr-TR',
    'en': 'en-US',
    'de': 'de-DE',
    'fr': 'fr-FR',
    'es': 'es-ES',
    'it': 'it-IT',
    'ru': 'ru-RU'
  };
  return localeMap[language] || 'en-US';
};
