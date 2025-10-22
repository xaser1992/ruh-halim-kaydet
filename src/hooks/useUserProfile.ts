import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  theme: 'light' | 'dark' | 'feminine';
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru';
  city: string;
}

export const useUserProfile = (userId: string | null) => {
  const [profile, setProfile] = useState<UserProfile>({
    theme: 'light',
    language: 'tr',
    city: ''
  });
  const [loading, setLoading] = useState(true);

  // Profili yükle
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        // Ayarları çek
        const { data: settings, error: settingsError } = await supabase
          .from('user_settings')
          .select('theme, language')
          .eq('user_id', userId)
          .maybeSingle();

        if (settingsError) throw settingsError;

        // Şehir bilgisini localStorage'dan al (şimdilik)
        const savedCity = localStorage.getItem('userCity') || '';

        const newProfile = {
          theme: (settings?.theme as 'light' | 'dark' | 'feminine') || 'light',
          language: (settings?.language as 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru') || 'tr',
          city: savedCity
        };

        setProfile(newProfile);

        // Tema uygula
        requestAnimationFrame(() => {
          if (newProfile.theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        });

      } catch (error) {
        console.error('Profil yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  // Tema güncelle
  const updateTheme = async (newTheme: 'light' | 'dark' | 'feminine') => {
    if (!userId) return;

    try {
      await supabase
        .from('user_settings')
        .update({ theme: newTheme })
        .eq('user_id', userId);

      setProfile(prev => ({ ...prev, theme: newTheme }));

      // Tema uygula
      requestAnimationFrame(() => {
        if (newTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      });
    } catch (error) {
      console.error('Tema güncellenirken hata:', error);
    }
  };

  // Dil güncelle
  const updateLanguage = async (newLanguage: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru') => {
    if (!userId) return;

    try {
      await supabase
        .from('user_settings')
        .update({ language: newLanguage })
        .eq('user_id', userId);

      setProfile(prev => ({ ...prev, language: newLanguage }));
    } catch (error) {
      console.error('Dil güncellenirken hata:', error);
    }
  };

  // Şehir güncelle
  const updateCity = async (newCity: string) => {
    // Şehir bilgisini localStorage'a kaydet
    localStorage.setItem('userCity', newCity);
    setProfile(prev => ({ ...prev, city: newCity }));
  };

  return {
    profile,
    loading,
    updateTheme,
    updateLanguage,
    updateCity
  };
};
