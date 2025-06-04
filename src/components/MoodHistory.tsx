import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { getAllMoodEntries } from "@/utils/moodStorage";

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

interface MoodHistoryProps {
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru';
  theme: 'light' | 'dark' | 'feminine';
}

export const MoodHistory = ({ language, theme }: MoodHistoryProps) => {
  const [entries, setEntries] = useState<any[]>([]);
  const [expandedEntries, setExpandedEntries] = useState<string[]>([]);

  const translations = {
    tr: {
      title: "Ruh Hali Geçmişi",
      subtitle: "Kaydedilen tüm ruh halleriniz",
      noEntries: "Henüz bir ruh hali kaydetmediniz.",
    },
    en: {
      title: "Mood History",
      subtitle: "All your saved moods",
      noEntries: "You haven't saved a mood yet.",
    },
    de: {
      title: "Stimmungsverlauf",
      subtitle: "Alle deine gespeicherten Stimmungen",
      noEntries: "Du hast noch keine Stimmung gespeichert.",
    },
    fr: {
      title: "Historique d'humeur",
      subtitle: "Toutes vos humeurs enregistrées",
      noEntries: "Vous n'avez pas encore enregistré d'humeur.",
    },
    es: {
      title: "Historial de ánimo",
      subtitle: "Todos tus estados de ánimo guardados",
      noEntries: "Aún no has guardado un estado de ánimo.",
    },
    it: {
      title: "Cronologia dell'umore",
      subtitle: "Tutti i tuoi stati d'animo salvati",
      noEntries: "Non hai ancora salvato uno stato d'animo.",
    },
    ru: {
      title: "История настроения",
      subtitle: "Все ваши сохраненные настроения",
      noEntries: "Вы еще не сохранили настроение.",
    }
  };

  const t = translations[language];

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const locale = getLocaleString(language);
    
    const dateStr = date.toLocaleDateString(locale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const timeStr = date.toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    return { dateStr, timeStr };
  };

  useEffect(() => {
    const allEntries = getAllMoodEntries();
    // Sort entries by timestamp in descending order (newest first)
    const sortedEntries = Object.values(allEntries).sort((a: any, b: any) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    setEntries(sortedEntries);
  }, []);

  const toggleEntry = (date: string) => {
    if (expandedEntries.includes(date)) {
      setExpandedEntries(expandedEntries.filter(d => d !== date));
    } else {
      setExpandedEntries([...expandedEntries, date]);
    }
  };

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

  return (
    <Card className={`p-4 backdrop-blur-sm border-0 shadow-lg transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gray-800/80 text-white' 
        : theme === 'feminine'
        ? 'bg-pink-50/80'
        : 'bg-white/80'
    }`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="text-center">
          <h2 className={`text-lg font-semibold transition-colors duration-300 ${
            theme === 'dark' ? 'text-white' : theme === 'feminine' ? 'text-pink-800' : 'text-gray-800'
          }`}>
            {t.title}
          </h2>
          <p className={`text-sm transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-300' : theme === 'feminine' ? 'text-pink-600' : 'text-gray-600'
          }`}>
            {t.subtitle}
          </p>
        </div>

        {/* Mood Entries */}
        <div className="space-y-3">
          {entries.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl mb-2 block">📝</span>
              <p className={`transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-400' : theme === 'feminine' ? 'text-pink-500' : 'text-gray-500'
              }`}>
                {t.noEntries}
              </p>
            </div>
          ) : (
            entries.map((entry) => {
              const moodOption = moodOptions.find(mood => mood.id === entry.mood);
              const isExpanded = expandedEntries.includes(entry.date);
              const { dateStr, timeStr } = formatDateTime(entry.timestamp);
              
              return (
                <Card 
                  key={entry.date} 
                  className={`p-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
                    theme === 'dark' 
                      ? 'bg-gray-700/50 hover:bg-gray-700/70' 
                      : theme === 'feminine'
                      ? 'bg-pink-25/50 hover:bg-pink-50/70 border-pink-200'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => toggleEntry(entry.date)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${moodOption?.colors.bg} ${
                        theme === 'dark' ? moodOption?.colors.darkBg : ''
                      }`}>
                        <span className="text-lg">{moodOption?.emoji}</span>
                      </div>
                      <div>
                        <p className={`font-medium transition-colors duration-300 ${
                          theme === 'dark' ? 'text-white' : theme === 'feminine' ? 'text-pink-800' : 'text-gray-800'
                        }`}>
                          {getMoodLabel(moodOption!)}
                        </p>
                        <p className={`text-xs transition-colors duration-300 ${
                          theme === 'dark' ? 'text-gray-400' : theme === 'feminine' ? 'text-pink-600' : 'text-gray-600'
                        }`}>
                          {dateStr}
                        </p>
                        <p className={`text-xs transition-colors duration-300 ${
                          theme === 'dark' ? 'text-gray-500' : theme === 'feminine' ? 'text-pink-500' : 'text-gray-500'
                        }`}>
                          {timeStr}
                        </p>
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    } ${
                      theme === 'dark' ? 'text-gray-400' : theme === 'feminine' ? 'text-pink-600' : 'text-gray-600'
                    }`} />
                  </div>
                  
                  {isExpanded && (entry.note || entry.images?.length > 0) && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      {entry.note && (
                        <div className="mb-3">
                          <p className={`text-sm whitespace-pre-wrap transition-colors duration-300 ${
                            theme === 'dark' ? 'text-gray-300' : theme === 'feminine' ? 'text-pink-700' : 'text-gray-700'
                          }`}>
                            {entry.note}
                          </p>
                        </div>
                      )}
                      {entry.images && entry.images.length > 0 && (
                        <div className="grid grid-cols-3 gap-2">
                          {entry.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`${entry.date} - ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
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
