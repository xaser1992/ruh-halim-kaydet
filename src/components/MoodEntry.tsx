import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { saveMoodEntry, getMoodEntry, saveDraft, getDraft, clearDraft } from "@/utils/moodStorage";
import { ImageUpload } from "@/components/ImageUpload";

interface MoodOption {
  id: string;
  emoji: string;
  labelTr: string;
  labelEn: string;
  labelDe: string;
  labelFr: string;
  labelEs: string;
  labelIt: string;
  labelRu: string;
  colors: {
    bg: string;
    hover: string;
    gradient: string;
    darkBg: string;
    darkHover: string;
    darkGradient: string;
  };
}

const moodOptions: MoodOption[] = [
  { 
    id: "very-bad", 
    emoji: "😢", 
    labelTr: "Çok Kötü", 
    labelEn: "Very Bad",
    labelDe: "Sehr schlecht",
    labelFr: "Très mauvais",
    labelEs: "Muy malo",
    labelIt: "Molto male",
    labelRu: "Очень плохо",
    colors: {
      bg: "bg-red-100",
      hover: "hover:bg-red-200",
      gradient: "from-red-200 to-red-300",
      darkBg: "dark:bg-red-900/30",
      darkHover: "dark:hover:bg-red-800/40",
      darkGradient: "dark:from-red-800 dark:to-red-900"
    }
  },
  { 
    id: "bad", 
    emoji: "😞", 
    labelTr: "Kötü", 
    labelEn: "Bad",
    labelDe: "Schlecht",
    labelFr: "Mauvais",
    labelEs: "Malo",
    labelIt: "Male",
    labelRu: "Плохо",
    colors: {
      bg: "bg-orange-100",
      hover: "hover:bg-orange-200",
      gradient: "from-orange-200 to-orange-300",
      darkBg: "dark:bg-orange-900/30",
      darkHover: "dark:hover:bg-orange-800/40",
      darkGradient: "dark:from-orange-800 dark:to-orange-900"
    }
  },
  { 
    id: "neutral", 
    emoji: "😐", 
    labelTr: "Orta", 
    labelEn: "Neutral",
    labelDe: "Neutral",
    labelFr: "Neutre",
    labelEs: "Neutral",
    labelIt: "Neutro",
    labelRu: "Нейтрально",
    colors: {
      bg: "bg-yellow-100",
      hover: "hover:bg-yellow-200",
      gradient: "from-yellow-200 to-yellow-300",
      darkBg: "dark:bg-yellow-900/30",
      darkHover: "dark:hover:bg-yellow-800/40",
      darkGradient: "dark:from-yellow-800 dark:to-yellow-900"
    }
  },
  { 
    id: "good", 
    emoji: "😊", 
    labelTr: "İyi", 
    labelEn: "Good",
    labelDe: "Gut",
    labelFr: "Bon",
    labelEs: "Bueno",
    labelIt: "Buono",
    labelRu: "Хорошо",
    colors: {
      bg: "bg-green-100",
      hover: "hover:bg-green-200",
      gradient: "from-green-200 to-green-300",
      darkBg: "dark:bg-green-900/30",
      darkHover: "dark:hover:bg-green-800/40",
      darkGradient: "dark:from-green-800 dark:to-green-900"
    }
  },
  { 
    id: "great", 
    emoji: "😄", 
    labelTr: "Harika", 
    labelEn: "Great",
    labelDe: "Großartig",
    labelFr: "Génial",
    labelEs: "Genial",
    labelIt: "Fantastico",
    labelRu: "Отлично",
    colors: {
      bg: "bg-emerald-100",
      hover: "hover:bg-emerald-200",
      gradient: "from-emerald-200 to-emerald-300",
      darkBg: "dark:bg-emerald-900/30",
      darkHover: "dark:hover:bg-emerald-800/40",
      darkGradient: "dark:from-emerald-800 dark:to-emerald-900"
    }
  }
];

interface MoodEntryProps {
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru';
  theme: 'light' | 'dark';
}

export const MoodEntry = ({ language, theme }: MoodEntryProps) => {
  const [selectedMood, setSelectedMood] = useState<string>("");
  const [note, setNote] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [todayEntry, setTodayEntry] = useState<any>(null);

  const translations = {
    tr: {
      question: "Bugün nasıl hissediyorsun?",
      noteLabel: "Not (İsteğe bağlı)",
      notePlaceholder: "Bugün için notlarınızı yazın...",
      photosLabel: "Fotoğraflar (İsteğe bağlı)",
      save: "Kaydet",
      update: "Güncelle",
      alreadyExists: "Bu gün için zaten bir kayıt var",
      saved: "Ruh haliniz kaydedildi!",
      updated: "Kayıt güncellendi!"
    },
    en: {
      question: "How are you feeling today?",
      noteLabel: "Note (Optional)",
      notePlaceholder: "Write your notes for today...",
      photosLabel: "Photos (Optional)",
      save: "Save",
      update: "Update",
      alreadyExists: "There is already an entry for today",
      saved: "Your mood has been saved!",
      updated: "Entry updated!"
    },
    de: {
      question: "Wie fühlst du dich heute?",
      noteLabel: "Notiz (Optional)",
      notePlaceholder: "Schreibe deine Notizen für heute...",
      photosLabel: "Fotos (Optional)",
      save: "Speichern",
      update: "Aktualisieren",
      alreadyExists: "Für heute gibt es bereits einen Eintrag",
      saved: "Deine Stimmung wurde gespeichert!",
      updated: "Eintrag aktualisiert!"
    },
    fr: {
      question: "Comment te sens-tu aujourd'hui?",
      noteLabel: "Note (Optionnel)",
      notePlaceholder: "Écris tes notes pour aujourd'hui...",
      photosLabel: "Photos (Optionnel)",
      save: "Enregistrer",
      update: "Mettre à jour",
      alreadyExists: "Il y a déjà une entrée pour aujourd'hui",
      saved: "Votre humeur a été enregistrée!",
      updated: "Entrée mise à jour!"
    },
    es: {
      question: "¿Cómo te sientes hoy?",
      noteLabel: "Nota (Opcional)",
      notePlaceholder: "Escribe tus notas para hoy...",
      photosLabel: "Fotos (Opcional)",
      save: "Guardar",
      update: "Actualizar",
      alreadyExists: "Ya existe una entrada para hoy",
      saved: "¡Tu estado de ánimo ha sido guardado!",
      updated: "¡Entrada actualizada!"
    },
    it: {
      question: "Come ti senti oggi?",
      noteLabel: "Nota (Opzionale)",
      notePlaceholder: "Scrivi le tue note per oggi...",
      photosLabel: "Foto (Opzionale)",
      save: "Salva",
      update: "Aggiorna",
      alreadyExists: "Esiste già una voce per oggi",
      saved: "Il tuo umore è stato salvato!",
      updated: "Voce aggiornata!"
    },
    ru: {
      question: "Как ты себя чувствуешь сегодня?",
      noteLabel: "Заметка (Необязательно)",
      notePlaceholder: "Напиши свои заметки на сегодня...",
      photosLabel: "Фотографии (Необязательно)",
      save: "Сохранить",
      update: "Обновить",
      alreadyExists: "На сегодня уже есть запись",
      saved: "Ваше настроение сохранено!",
      updated: "Запись обновлена!"
    }
  };

  const t = translations[language];

  useEffect(() => {
    const today = new Date().toDateString();
    const entry = getMoodEntry(today);
    const draft = getDraft(today);
    
    setTodayEntry(entry);
    
    if (entry) {
      setSelectedMood(entry.mood);
      // Eğer taslak varsa taslaktan yükle, yoksa boş bırak
      if (draft) {
        setNote(draft.note || "");
        setImages(draft.images || []);
      } else {
        setNote("");
        setImages([]);
      }
    } else {
      // Kayıt yoksa, taslak varsa taslaktan yükle
      if (draft) {
        setSelectedMood(draft.mood || "");
        setNote(draft.note || "");
        setImages(draft.images || []);
      } else {
        setSelectedMood("");
        setNote("");
        setImages([]);
      }
    }
  }, []);

  // Taslak kaydetme fonksiyonu
  const saveDraftData = () => {
    const today = new Date().toDateString();
    const draft = {
      date: today,
      mood: selectedMood,
      note: note.trim(),
      images: images
    };
    saveDraft(draft);
  };

  // Her değişiklikte taslak kaydet
  useEffect(() => {
    if (selectedMood || note.trim() || images.length > 0) {
      saveDraftData();
    }
  }, [selectedMood, note, images]);

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

    saveMoodEntry(entry);
    setTodayEntry(entry);
    
    // Kaydetme işleminden sonra taslağı temizle
    clearDraft(today);
    
    // Kaydetme işleminden sonra not ve images alanlarını temizle
    setNote("");
    setImages([]);
    
    toast({
      title: todayEntry ? t.updated : t.saved,
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

  const selectedColors = getSelectedMoodColors();

  const getMoodLabel = (mood: MoodOption) => {
    switch (language) {
      case 'tr': return mood.labelTr;
      case 'en': return mood.labelEn;
      case 'de': return mood.labelDe;
      case 'fr': return mood.labelFr;
      case 'es': return mood.labelEs;
      case 'it': return mood.labelIt;
      case 'ru': return mood.labelRu;
      default: return mood.labelEn;
    }
  };

  return (
    <Card className={`p-4 backdrop-blur-sm border-0 shadow-lg transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gray-800/80 text-white' 
        : 'bg-white/80'
    }`}>
      <div className="space-y-4">
        {/* Today's Date */}
        <div className="text-center">
          <p className={`text-base font-medium mb-1 transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
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
                : 'text-purple-600 bg-purple-50'
            }`}>
              {t.alreadyExists}
            </p>
          )}
        </div>

        {/* Question */}
        <div className="text-center">
          <h2 className={`text-lg font-semibold mb-4 transition-colors duration-300 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            {t.question}
          </h2>
        </div>

        {/* Mood Selection */}
        <div className="grid grid-cols-5 gap-2">
          {moodOptions.map((mood) => (
            <button
              key={mood.id}
              onClick={() => setSelectedMood(mood.id)}
              className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${
                selectedMood === mood.id
                  ? `bg-gradient-to-br ${mood.colors.gradient} ${theme === 'dark' ? mood.colors.darkGradient : ''} shadow-lg scale-105`
                  : `${mood.colors.bg} ${mood.colors.hover} ${theme === 'dark' ? `${mood.colors.darkBg} ${mood.colors.darkHover}` : ''} hover:scale-105`
              }`}
            >
              <span className="text-xl mb-1">{mood.emoji}</span>
              <span className={`text-xs text-center font-medium transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}>
                {getMoodLabel(mood)}
              </span>
            </button>
          ))}
        </div>

        {/* Note Input */}
        <div className="space-y-1">
          <label className={`text-sm font-medium transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
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
                : 'bg-white/70 border-purple-200 focus:border-purple-400'
            }`}
            maxLength={10000}
          />
          <p className={`text-xs text-right transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {note.length}/10000
          </p>
        </div>

        {/* Photo Upload */}
        <div className="space-y-1">
          <label className={`text-sm font-medium transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
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
        <Button
          onClick={handleSave}
          disabled={!selectedMood}
          className={`w-full text-white py-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 ${
            selectedMood 
              ? `bg-gradient-to-r ${selectedColors.gradient} ${theme === 'dark' ? selectedColors.darkGradient : ''} hover:shadow-lg`
              : `bg-gradient-to-r ${theme === 'dark' ? 'from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600' : 'from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500'}`
          }`}
        >
          {(todayEntry && (note.trim() || images.length > 0)) ? t.update : t.save}
        </Button>
      </div>
    </Card>
  );
};

// Helper function to get locale string
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
