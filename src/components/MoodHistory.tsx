
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAllMoodEntries, deleteMoodEntry } from "@/utils/moodStorage";
import { Calendar, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MoodHistoryProps {
  language: 'tr' | 'en';
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

export const MoodHistory = ({ language }: MoodHistoryProps) => {
  const [entries, setEntries] = useState<any[]>([]);

  const translations = {
    tr: {
      title: "Geçmiş Kayıtlar",
      noEntries: "Henüz kayıt yok",
      noEntriesDesc: "Ruh halinizi kaydetmeye başlayın!",
      delete: "Sil",
      deleteConfirm: "Kayıt silindi!",
      deleteDesc: "Bu işlem geri alınamaz"
    },
    en: {
      title: "Past Entries",
      noEntries: "No entries yet",
      noEntriesDesc: "Start recording your mood!",
      delete: "Delete",
      deleteConfirm: "Entry deleted!",
      deleteDesc: "This action cannot be undone"
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
    loadEntries(); // Reload entries after deletion
    toast({
      title: t.deleteConfirm,
      description: t.deleteDesc,
    });
  };

  if (entries.length === 0) {
    return (
      <Card className="p-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg text-center">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{t.noEntries}</h3>
        <p className="text-gray-500">{t.noEntriesDesc}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 text-center mb-6">
        {t.title}
      </h2>
      
      {entries.map((entry, index) => (
        <Card key={index} className="p-4 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">{moodEmojis[entry.mood]}</span>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-800">
                  {moodLabels[language][entry.mood as keyof typeof moodLabels.tr]}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {new Date(entry.timestamp).toLocaleDateString(
                      language === 'tr' ? 'tr-TR' : 'en-US',
                      { month: 'short', day: 'numeric' }
                    )}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(entry.date)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-1">
                {new Date(entry.timestamp).toLocaleDateString(
                  language === 'tr' ? 'tr-TR' : 'en-US',
                  { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
                )}
              </p>
              
              {entry.note && (
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg mt-2">
                  {entry.note}
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
