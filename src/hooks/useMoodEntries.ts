import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface MoodEntry {
  id?: string;
  date: string;
  mood: string;
  note?: string;
  images?: string[];
  timestamp: string;
  user_id?: string;
}

export const useMoodEntries = (refreshTrigger?: number) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Kayıtları yükle
  const loadEntries = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Kayıtlar yüklenirken hata:', error);
        setEntries([]);
      } else {
        setEntries(data || []);
      }
    } catch (error) {
      console.error('Kayıtlar yüklenirken beklenmeyen hata:', error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  // Kayıt ekle/güncelle
  const saveEntry = async (entry: MoodEntry) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('mood_entries')
        .insert({
          user_id: user.id,
          date: entry.date,
          mood: entry.mood,
          note: entry.note,
          images: entry.images,
          timestamp: entry.timestamp
        });

      if (error) {
        console.error('Kayıt eklenirken hata:', error);
        throw error;
      }

      await loadEntries();
    } catch (error) {
      console.error('Kayıt eklenirken beklenmeyen hata:', error);
      throw error;
    }
  };

  // Kayıt sil
  const deleteEntry = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('mood_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Kayıt silinirken hata:', error);
        throw error;
      }

      await loadEntries();
    } catch (error) {
      console.error('Kayıt silinirken beklenmeyen hata:', error);
      throw error;
    }
  };

  // Tek kayıt getir
  const getEntry = async (date: string): Promise<MoodEntry | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', date)
        .maybeSingle();

      if (error) {
        console.error('Kayıt getirilirken hata:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Kayıt getirilirken beklenmeyen hata:', error);
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
