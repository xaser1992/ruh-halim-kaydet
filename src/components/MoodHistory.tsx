import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { getAllMoodEntries, deleteMoodEntry } from "@/utils/moodStorage";
import { Calendar, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MoodHistoryProps {
  language: 'tr' | 'en';
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
  }
};

export const MoodHistory = ({ language, theme }: MoodHistoryProps) => {
  const [entries, setEntries] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
      photos: "Fotoğraflar"
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
      photos: "Photos"
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
        
        {entries.map((entry, index) => (
          <Card key={index} className={`p-4 backdrop-blur-sm border-0 shadow-lg transition-colors duration-300 ${
            theme === 'dark' 
              ? 'bg-gray-800/80' 
              : 'bg-white/80'
          }`}>
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
                    {moodLabels[language][entry.mood as keyof typeof moodLabels.tr]}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm transition-colors duration-300 ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {new Date(entry.timestamp).toLocaleDateString(
                        language === 'tr' ? 'tr-TR' : 'en-US',
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
                    language === 'tr' ? 'tr-TR' : 'en-US',
                    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
                  )}
                </p>
                
                {entry.note && (
                  <p className={`text-sm p-3 rounded-lg mt-2 transition-colors duration-300 ${
                    theme === 'dark' 
                      ? 'text-gray-200 bg-gray-700/50' 
                      : 'text-gray-700 bg-gray-50'
                  }`}>
                    {entry.note}
                  </p>
                )}

                {entry.images && entry.images.length > 0 && (
                  <div className="mt-3">
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
            </div>
          </Card>
        ))}
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
