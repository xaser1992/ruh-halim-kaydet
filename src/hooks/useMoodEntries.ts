
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { saveMoodEntry, getMoodEntry, getAllMoodEntries, deleteMoodEntry } from '@/utils/moodStorage';

interface MoodEntry {
  date: string;
  mood: string;
  note?: string;
  images?: string[];
  timestamp: string;
}

export const useMoodEntries = (refreshTrigger?: number) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Kayıtları yükle
  const loadEntries = async () => {
    if (!user) {
      // Giriş yapmamış kullanıcı için localStorage'dan yükle
      const localEntries = getAllMoodEntries();
      setEntries(localEntries);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Mood entries yükleme hatası:', error);
        return;
      }

      const formattedEntries = data.map(entry => ({
        date: entry.date,
        mood: entry.mood,
        note: entry.note || undefined,
        images: entry.images || undefined,
        timestamp: entry.timestamp
      }));

      setEntries(formattedEntries);
    } catch (error) {
      console.error('Mood entries yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // Kayıt ekle/güncelle
  const saveEntry = async (entry: MoodEntry) => {
    if (!user) {
      // Giriş yapmamış kullanıcı için localStorage'a kaydet
      await saveMoodEntry(entry);
      loadEntries();
      return;
    }

    try {
      const { error } = await supabase
        .from('mood_entries')
        .upsert({
          user_id: user.id,
          date: entry.date,
          mood: entry.mood,
          note: entry.note,
          images: entry.images,
          timestamp: entry.timestamp
        });

      if (error) {
        console.error('Mood entry kaydetme hatası:', error);
        throw error;
      }

      loadEntries();
    } catch (error) {
      console.error('Mood entry kaydetme hatası:', error);
      throw error;
    }
  };

  // Kayıt sil
  const deleteEntry = async (date: string) => {
    if (!user) {
      // Giriş yapmamış kullanıcı için localStorage'dan sil
      deleteMoodEntry(date);
      loadEntries();
      return;
    }

    try {
      const { error } = await supabase
        .from('mood_entries')
        .delete()
        .eq('user_id', user.id)
        .eq('date', date);

      if (error) {
        console.error('Mood entry silme hatası:', error);
        throw error;
      }

      loadEntries();
    } catch (error) {
      console.error('Mood entry silme hatası:', error);
      throw error;
    }
  };

  // Tek kayıt getir
  const getEntry = async (date: string): Promise<MoodEntry | null> => {
    if (!user) {
      return getMoodEntry(date);
    }

    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Mood entry getirme hatası:', error);
        return null;
      }

      if (!data) return null;

      return {
        date: data.date,
        mood: data.mood,
        note: data.note || undefined,
        images: data.images || undefined,
        timestamp: data.timestamp
      };
    } catch (error) {
      console.error('Mood entry getirme hatası:', error);
      return null;
    }
  };

  useEffect(() => {
    loadEntries();
  }, [user, refreshTrigger]);

  return {
    entries,
    loading,
    saveEntry,
    deleteEntry,
    getEntry,
    refreshEntries: loadEntries
  };
};
