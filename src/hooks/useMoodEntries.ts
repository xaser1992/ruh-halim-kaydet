
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { saveMoodEntry, getMoodEntry, getAllMoodEntries, deleteMoodEntry } from '@/utils/moodStorage';

interface MoodEntry {
  date: string;
  mood: string;
  note?: string;
  images?: string[];
  timestamp: string;
}

export const useMoodEntries = (refreshTrigger?: number) => {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Kayıtları yükle
  const loadEntries = async () => {
    // localStorage'dan yükle
    const localEntries = getAllMoodEntries();
    setEntries(localEntries);
    setLoading(false);
  };

  // Kayıt ekle/güncelle
  const saveEntry = async (entry: MoodEntry) => {
    // localStorage'a kaydet
    await saveMoodEntry(entry);
    loadEntries();
  };

  // Kayıt sil
  const deleteEntry = async (date: string) => {
    // localStorage'dan sil
    deleteMoodEntry(date);
    loadEntries();
  };

  // Tek kayıt getir
  const getEntry = async (date: string): Promise<MoodEntry | null> => {
    return getMoodEntry(date);
  };

  useEffect(() => {
    loadEntries();
  }, [refreshTrigger]);

  return {
    entries,
    loading,
    saveEntry,
    deleteEntry,
    getEntry,
    refreshEntries: loadEntries
  };
};
