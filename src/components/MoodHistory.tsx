import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { getAllMoodEntries, deleteMoodEntry } from "@/utils/moodStorage";
import { Calendar, Trash2, Image as ImageIcon, ChevronDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MoodHistoryProps {
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru';
  theme: 'light' | 'dark';
}

const moodEmojis: Record<string, string> = {
  "very-bad": "😢",
  "bad": "😞",
  "neutral": "😐",
  "good": "😊",
  "great": "😄"
};

const moodLabels = {
  tr: {
    "very-bad": "Çok Kötü",
    "bad": "Kötü",
    "neutral": "Orta",
    "good": "İyi",
    "great": "Harika"
  },
  en: {
    "very-bad": "Very Bad",
    "bad": "Bad",
    "neutral": "Neutral",
    "good": "Good",
    "great": "Great"
  },
  de: {
    "very-bad": "Sehr schlecht",
    "bad": "Schlecht",
    "neutral": "Neutral",
    "good": "Gut",
    "great": "Großartig"
  },
  fr: {
    "very-bad": "Très mauvais",
    "bad": "Mauvais",
    "neutral": "Neutre",
    "good": "Bon",
    "great": "Génial"
  },
  es: {
    "very-bad": "Muy malo",
    "bad": "Malo",
    "neutral": "Neutral",
    "good": "Bueno",
    "great": "Genial"
  },
  it: {
    "very-bad": "Molto male",
    "bad": "Male",
    "neutral": "Neutro",
    "good": "Buono",
    "great": "Fantastico"
  },
  ru: {
    "very-bad": "Очень плохо",
    "bad": "Плохо",
    "neutral": "Нейтрально",
    "good": "Хорошо",
    "great": "Отлично"
  }
};

export const MoodHistory = ({ language, theme }: MoodHistoryProps) => {
  const [entries, setEntries] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());

  const translations = {
    tr: {
      title: "Geçmiş Kayıtlar",
      noEntries: "Henüz kayıt yok",
      noEntriesDesc: "Ruh halinizi kaydetmeye başlayın!",
      delete: "Sil",
      deleteConfirm: "Kayıt silindi!",
      deleteQuestion: "Bu kayıt silinsin mi?",
      deleteDescription: "Bu işlem geri alınamaz.",
      cancel: "İptal",
      confirmDelete: "Sil",
      photos: "Fotoğraflar",
      showDetails: "Detayları göster",
      hideDetails: "Detayları gizle"
    },
    en: {
      title: "Past Entries",
      noEntries: "No entries yet",
      noEntriesDesc: "Start recording your mood!",
      delete: "Delete",
      deleteConfirm: "Entry deleted!",
      deleteQuestion: "Delete this entry?",
      deleteDescription: "This action cannot be undone.",
      cancel: "Cancel",
      confirmDelete: "Delete",
      photos: "Photos",
      showDetails: "Show details",
      hideDetails: "Hide details"
    },
    de: {
      title: "Vergangene Einträge",
      noEntries: "Noch keine Einträge",
      noEntriesDesc: "Beginne deine Stimmung aufzuzeichnen!",
      delete: "Löschen",
      deleteConfirm: "Eintrag gelöscht!",
      deleteQuestion: "Diesen Eintrag löschen?",
      deleteDescription: "Diese Aktion kann nicht rückgängig gemacht werden.",
      cancel: "Abbrechen",
      confirmDelete: "Löschen",
      photos: "Fotos",
      showDetails: "Details anzeigen",
      hideDetails: "Details verbergen"
    },
    fr: {
      title: "Entrées Passées",
      noEntries: "Aucune entrée pour le moment",
      noEntriesDesc: "Commencez à enregistrer votre humeur!",
      delete: "Supprimer",
      deleteConfirm: "Entrée supprimée!",
      deleteQuestion: "Supprimer cette entrée?",
      deleteDescription: "Cette action ne peut pas être annulée.",
      cancel: "Annuler",
      confirmDelete: "Supprimer",
      photos: "Photos",
      showDetails: "Afficher les détails",
      hideDetails: "Masquer les détails"
    },
    es: {
      title: "Entradas Pasadas",
      noEntries: "Aún no hay entradas",
      noEntriesDesc: "¡Comienza a registrar tu estado de ánimo!",
      delete: "Eliminar",
      deleteConfirm: "¡Entrada eliminada!",
      deleteQuestion: "¿Eliminar esta entrada?",
      deleteDescription: "Esta acción no se puede deshacer.",
      cancel: "Cancelar",
      confirmDelete: "Eliminar",
      photos: "Fotos",
      showDetails: "Mostrar detalles",
      hideDetails: "Ocultar detalles"
    },
    it: {
      title: "Voci Passate",
      noEntries: "Nessuna voce ancora",
      noEntriesDesc: "Inizia a registrare il tuo umore!",
      delete: "Elimina",
      deleteConfirm: "Voce eliminata!",
      deleteQuestion: "Eliminare questa voce?",
      deleteDescription: "Questa azione non può essere annullata.",
      cancel: "Annulla",
      confirmDelete: "Elimina",
      photos: "Foto",
      showDetails: "Mostra dettagli",
      hideDetails: "Nascondi dettagli"
    },
    ru: {
      title: "Прошлые Записи",
      noEntries: "Пока нет записей",
      noEntriesDesc: "Начните записывать своё настроение!",
      delete: "Удалить",
      deleteConfirm: "Запись удалена!",
      deleteQuestion: "Удалить эту запись?",
      deleteDescription: "Это действие нельзя отменить.",
      cancel: "Отмена",
      confirmDelete: "Удалить",
      photos: "Фотографии",
      showDetails: "Показать детали",
      hideDetails: "Скрыть детали"
    }
  };

  const t = translations[language];

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    const allEntries = getAllMoodEntries();
    // Sort by date (newest first)
    const sortedEntries = allEntries.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    setEntries(sortedEntries);
  };

  const handleDelete = (date: string) => {
    deleteMoodEntry(date);
    loadEntries();
    
    toast({
      title: t.deleteConfirm,
      duration: 1500,
    });
  };

  const toggleExpanded = (entryDate: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryDate)) {
      newExpanded.delete(entryDate);
    } else {
      newExpanded.add(entryDate);
    }
    setExpandedEntries(newExpanded);
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

  if (entries.length === 0) {
    return (
      <Card className={`p-8 backdrop-blur-sm border-0 shadow-lg text-center transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-800/80 text-white' 
          : 'bg-white/80'
      }`}>
        <Calendar className={`w-12 h-12 mx-auto mb-4 transition-colors duration-300 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
        }`} />
        <h3 className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
        }`}>{t.noEntries}</h3>
        <p className={`transition-colors duration-300 ${
          theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>{t.noEntriesDesc}</p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <h2 className={`text-xl font-semibold text-center mb-6 transition-colors duration-300 ${
          theme === 'dark' ? 'text-white' : 'text-gray-800'
        }`}>
          {t.title}
        </h2>
        
        {entries.map((entry, index) => {
          const hasDetails = entry.note || (entry.images && entry.images.length > 0);
          const isExpanded = expandedEntries.has(entry.date);
          
          return (
            <Card key={index} className={`backdrop-blur-sm border-0 shadow-lg transition-colors duration-300 ${
              theme === 'dark' 
                ? 'bg-gray-800/80' 
                : 'bg-white/80'
            }`}>
              <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(entry.date)}>
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                        theme === 'dark' 
                          ? 'bg-gradient-to-br from-purple-700 to-pink-700' 
                          : 'bg-gradient-to-br from-purple-100 to-pink-100'
                      }`}>
                        <span className="text-xl">{moodEmojis[entry.mood]}</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`font-medium transition-colors duration-300 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-800'
                        }`}>
                          {moodLabels[language as keyof typeof moodLabels][entry.mood as keyof typeof moodLabels.tr]}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm transition-colors duration-300 ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {new Date(entry.timestamp).toLocaleDateString(
                              getLocaleString(language),
                              { month: 'short', day: 'numeric' }
                            )}
                          </span>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 h-8 w-8 transition-colors duration-300"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className={`transition-colors duration-300 ${
                              theme === 'dark' 
                                ? 'bg-gray-800 border-gray-600 text-white' 
                                : 'bg-white'
                            }`}>
                              <AlertDialogHeader>
                                <AlertDialogTitle className={theme === 'dark' ? 'text-white' : ''}>{t.deleteQuestion}</AlertDialogTitle>
                                <AlertDialogDescription className={theme === 'dark' ? 'text-gray-300' : ''}>
                                  {t.deleteDescription}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className={theme === 'dark' ? 'bg-gray-700 text-white border-gray-600 hover:bg-gray-600' : ''}>{t.cancel}</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDelete(entry.date)}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  {t.confirmDelete}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      
                      <p className={`text-sm mb-1 transition-colors duration-300 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {new Date(entry.timestamp).toLocaleDateString(
                          getLocaleString(language),
                          { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
                        )}
                      </p>

                      {hasDetails && (
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`text-xs p-1 h-auto mt-2 transition-colors duration-300 ${
                              theme === 'dark' 
                                ? 'text-purple-300 hover:text-purple-200 hover:bg-purple-900/20' 
                                : 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
                            }`}
                          >
                            <ChevronDown className={`w-3 h-3 mr-1 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            }`} />
                            {isExpanded ? t.hideDetails : t.showDetails}
                          </Button>
                        </CollapsibleTrigger>
                      )}
                    </div>
                  </div>
                </div>

                {hasDetails && (
                  <CollapsibleContent>
                    <div className="px-4 pb-4 pt-0">
                      {entry.note && (
                        <p className={`text-sm p-3 rounded-lg mb-3 transition-colors duration-300 ${
                          theme === 'dark' 
                            ? 'text-gray-200 bg-gray-700/50' 
                            : 'text-gray-700 bg-gray-50'
                        }`}>
                          {entry.note}
                        </p>
                      )}

                      {entry.images && entry.images.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <ImageIcon className={`w-4 h-4 ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`} />
                            <span className={`text-xs font-medium ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {t.photos}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {entry.images.map((image: string, imgIndex: number) => (
                              <img
                                key={imgIndex}
                                src={image}
                                alt={`Entry photo ${imgIndex + 1}`}
                                className="w-full h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => setSelectedImage(image)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                )}
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-full max-h-full">
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-2 right-2"
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
