import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, Trash2 } from "lucide-react";
import { getAllMoodEntries, deleteMoodEntry } from "@/utils/moodStorage";
import { toast } from "@/hooks/use-toast";
import { moodOptions } from "@/utils/moodData";

interface MoodHistoryProps {
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru';
  theme: 'light' | 'dark' | 'feminine';
  refreshTrigger?: number;
}

export const MoodHistory = ({ language, theme, refreshTrigger }: MoodHistoryProps) => {
  const [entries, setEntries] = useState<any[]>([]);
  const [expandedEntries, setExpandedEntries] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const translations = {
    tr: {
      title: "Ruh Hali Geçmişi",
      subtitle: "Kaydedilen tüm ruh halleriniz",
      noEntries: "Henüz bir ruh hali kaydetmediniz.",
      delete: "Sil",
      deleteConfirm: "Bu kaydı silmek istediğinizden emin misiniz?",
      deleted: "Kayıt silindi"
    },
    en: {
      title: "Mood History",
      subtitle: "All your saved moods",
      noEntries: "You haven't saved a mood yet.",
      delete: "Delete",
      deleteConfirm: "Are you sure you want to delete this entry?",
      deleted: "Entry deleted"
    },
    de: {
      title: "Stimmungsverlauf",
      subtitle: "Alle deine gespeicherten Stimmungen",
      noEntries: "Du hast noch keine Stimmung gespeichert.",
      delete: "Löschen",
      deleteConfirm: "Bist du sicher, dass du diesen Eintrag löschen möchtest?",
      deleted: "Eintrag gelöscht"
    },
    fr: {
      title: "Historique d'humeur",
      subtitle: "Toutes vos humeurs enregistrées",
      noEntries: "Vous n'avez pas encore enregistré d'humeur.",
      delete: "Supprimer",
      deleteConfirm: "Êtes-vous sûr de vouloir supprimer cette entrée ?",
      deleted: "Entrée supprimée"
    },
    es: {
      title: "Historial de ánimo",
      subtitle: "Todos tus estados de ánimo guardados",
      noEntries: "Aún no has guardado un estado de ánimo.",
      delete: "Eliminar",
      deleteConfirm: "¿Estás seguro de que quieres eliminar esta entrada?",
      deleted: "Entrada eliminada"
    },
    it: {
      title: "Cronologia dell'umore",
      subtitle: "Tutti i tuoi stati d'animo salvati",
      noEntries: "Non hai ancora salvato uno stato d'animo.",
      delete: "Elimina",
      deleteConfirm: "Sei sicuro di voler eliminare questa voce?",
      deleted: "Voce eliminata"
    },
    ru: {
      title: "История настроения",
      subtitle: "Все ваши сохраненные настроения",
      noEntries: "Вы еще не сохранили настроение.",
      delete: "Удалить",
      deleteConfirm: "Вы уверены, что хотите удалить эту запись?",
      deleted: "Запись удалена"
    }
  };

  const t = translations[language];

  const loadEntries = () => {
    const allEntries = getAllMoodEntries();
    console.log('MoodHistory - Loading entries:', allEntries);
    const sortedEntries = allEntries.sort((a: any, b: any) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    setEntries(sortedEntries);
  };

  useEffect(() => {
    console.log('MoodHistory - Initial load');
    loadEntries();
  }, []);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      console.log('MoodHistory - Refresh triggered:', refreshTrigger);
      loadEntries();
    }
  }, [refreshTrigger]);

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

  const toggleEntry = (date: string) => {
    if (expandedEntries.includes(date)) {
      setExpandedEntries(expandedEntries.filter(d => d !== date));
    } else {
      setExpandedEntries([...expandedEntries, date]);
    }
  };

  const handleDelete = (entryDate: string) => {
    if (confirm(t.deleteConfirm)) {
      deleteMoodEntry(entryDate);
      loadEntries();
      toast({
        title: t.deleted,
      });
    }
  };

  const getMoodLabel = (mood: any) => {
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
    <>
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
                    className={`p-3 transition-all duration-200 hover:shadow-md ${
                      theme === 'dark' 
                        ? 'bg-gray-700/50 hover:bg-gray-700/70' 
                        : theme === 'feminine'
                        ? 'bg-pink-25/50 hover:bg-pink-50/70 border-pink-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex items-center gap-3 cursor-pointer flex-1"
                        onClick={() => toggleEntry(entry.date)}
                      >
                        <div className={`p-2 rounded-xl ${moodOption?.colors.bg} ${
                          theme === 'dark' ? moodOption?.colors.darkBg : ''
                        }`}>
                          <span className="text-lg">{moodOption?.emoji}</span>
                        </div>
                        <div className="flex-1">
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
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(entry.date)}
                          className={`h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 ${
                            theme === 'dark' ? 'hover:bg-red-900/30 hover:text-red-400' : ''
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <ChevronDown 
                          className={`w-4 h-4 transition-transform duration-200 cursor-pointer ${
                            isExpanded ? 'rotate-180' : ''
                          } ${
                            theme === 'dark' ? 'text-gray-400' : theme === 'feminine' ? 'text-pink-600' : 'text-gray-600'
                          }`} 
                          onClick={() => toggleEntry(entry.date)}
                        />
                      </div>
                    </div>
                    
                    {isExpanded && (entry.note || entry.images?.length > 0) && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                        {entry.note && (
                          <div className="mb-3">
                            <p className={`text-sm break-words whitespace-pre-wrap transition-colors duration-300 ${
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
                                className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => setSelectedImage(image)}
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

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedImage}
              alt="Expanded view"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </>
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
