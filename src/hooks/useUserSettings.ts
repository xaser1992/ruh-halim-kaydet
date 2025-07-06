
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserSettings {
  theme: 'light' | 'dark' | 'feminine';
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru';
}

export const useUserSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({ theme: 'light', language: 'tr' });
  const [loading, setLoading] = useState(true);

  // Ayarları yükle
  const loadSettings = async () => {
    if (!user) {
      // Giriş yapmamış kullanıcı için localStorage'dan yükle
      const savedTheme = localStorage.getItem('ruh-halim-theme') as 'light' | 'dark' | 'feminine' || 'light';
      const savedLanguage = localStorage.getItem('ruh-halim-language') as 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru' || 'tr';
      setSettings({ theme: savedTheme, language: savedLanguage });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('theme, language')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Settings yükleme hatası:', error);
        return;
      }

      if (data) {
        setSettings({
          theme: data.theme as 'light' | 'dark' | 'feminine',
          language: data.language as 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru'
        });
      }
    } catch (error) {
      console.error('Settings yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ayarları kaydet
  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    if (!user) {
      // Giriş yapmamış kullanıcı için localStorage'a kaydet
      if (newSettings.theme) localStorage.setItem('ruh-halim-theme', newSettings.theme);
      if (newSettings.language) localStorage.setItem('ruh-halim-language', newSettings.language);
      return;
    }

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...updatedSettings
        });

      if (error) {
        console.error('Settings kaydetme hatası:', error);
      }
    } catch (error) {
      console.error('Settings kaydetme hatası:', error);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [user]);

  return {
    settings,
    updateSettings,
    loading
  };
};
