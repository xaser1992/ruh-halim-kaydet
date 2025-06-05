
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

interface MoodEntryProps {
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru';
  theme: 'light' | 'dark' | 'feminine';
  onEntryUpdate?: () => void;
}

export const MoodEntry = ({ language, theme, onEntryUpdate }: MoodEntryProps) => {
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [note, setNote] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [todayEntry, setTodayEntry] = useState<any>(null);

  const t = translations[language];

  useEffect(() => {
    const today = new Date().toDateString();
    const entry = getMoodEntry(today);
    const draft = getDraft(today);
    
    setTodayEntry(entry);
    
    if (entry) {
      // If there's an entry, clear the form to show it's saved
      setSelectedMood("");
      setNote("");
      setImages([]);
    } else if (draft) {
      setSelectedMood(draft.mood || "");
      setNote(draft.note || "");
      setImages(draft.images || []);
    } else {
      setSelectedMood("");
      setNote("");
      setImages([]);
    }
  }, []);

  const saveDraftData = () => {
    const today = new Date().toDateString();
    if (!todayEntry && (selectedMood || note.trim() || images.length > 0)) {
      const draft = {
        date: today,
        mood: selectedMood,
        note: note.trim(),
        images: images
      };
      saveDraft(draft);
    }
  };

  useEffect(() => {
    saveDraftData();
  }, [selectedMood, note, images, todayEntry]);

  const handleSave = () => {
    if (!selectedMood) return;

    const today = new Date().toDateString();
    const entry = {
      date: today,
      mood: selectedMood,
      note: note.trim(),
      images: images,
      timestamp: new Date().toISOString()
    };

    console.log('Saving entry:', entry);
    saveMoodEntry(entry);
    setTodayEntry(entry);
    
    // Clear the form after saving
    setSelectedMood("");
    setNote("");
    setImages([]);
    
    clearDraft(today);
    
    // Update the parent component if callback provided
    if (onEntryUpdate) {
      onEntryUpdate();
    }
    
    toast({
      title: t.saved,
      description: new Date().toLocaleDateString(getLocaleString(language), {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
    });
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

  // Check if there's content to show save button
  const hasContent = selectedMood || note.trim() || images.length > 0;
  const shouldShowButton = hasContent;

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
          <ImageUpload
            images={images}
            onImagesChange={setImages}
            language={language}
            theme={theme}
            maxImages={5}
          />
        </div>

        {/* Save Button */}
        {shouldShowButton && (
          <Button
            onClick={handleSave}
            disabled={!selectedMood}
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
            {todayEntry ? t.update : t.save}
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
