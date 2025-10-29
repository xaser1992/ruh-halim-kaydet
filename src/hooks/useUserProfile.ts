import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserProfile {
  id?: string;
  username?: string;
  email?: string;
  theme: 'light' | 'dark' | 'feminine';
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru';
  city?: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    theme: 'light',
    language: 'tr',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        // localStorage'dan tema ve dil yükle
        const savedTheme = localStorage.getItem('userTheme') as 'light' | 'dark' | 'feminine' || 'light';
        const savedLanguage = localStorage.getItem('userLanguage') as 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru' || 'tr';
        
        setProfile({
          theme: savedTheme,
          language: savedLanguage,
        });

        document.documentElement.classList.remove('light', 'dark', 'feminine');
        document.documentElement.classList.add(savedTheme);
        setLoading(false);
        return;
      }

      try {
        // Supabase profiles tablosundan kullanıcı profilini çek
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('id, username, email, theme, language, city')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Profil yüklenirken hata:', error);
          setLoading(false);
          return;
        }

        if (profileData) {
          const newProfile = {
            id: profileData.id,
            username: profileData.username || undefined,
            email: profileData.email || undefined,
            theme: (profileData.theme as 'light' | 'dark' | 'feminine') || 'light',
            language: (profileData.language as 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru') || 'tr',
            city: profileData.city || undefined
          };

          setProfile(newProfile);

          // localStorage ile senkronize et
          localStorage.setItem('userTheme', newProfile.theme);
          localStorage.setItem('userLanguage', newProfile.language);
          if (newProfile.city) {
            localStorage.setItem('userCity', newProfile.city);
          }

          // Temayı uygula
          document.documentElement.classList.remove('light', 'dark', 'feminine');
          document.documentElement.classList.add(newProfile.theme);
        }
      } catch (error) {
        console.error('Profil yüklenirken beklenmeyen hata:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const updateTheme = async (newTheme: 'light' | 'dark' | 'feminine') => {
    // localStorage'a hemen kaydet
    localStorage.setItem('userTheme', newTheme);
    setProfile(prev => ({ ...prev, theme: newTheme }));
    document.documentElement.classList.remove('light', 'dark', 'feminine');
    document.documentElement.classList.add(newTheme);

    // Supabase'e kaydet (arka planda)
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ theme: newTheme, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) {
        console.error('Tema güncellenirken hata:', error);
      }
    } catch (error) {
      console.error('Tema güncellenirken beklenmeyen hata:', error);
    }
  };

  const updateLanguage = async (newLanguage: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru') => {
    // localStorage'a hemen kaydet
    localStorage.setItem('userLanguage', newLanguage);
    setProfile(prev => ({ ...prev, language: newLanguage }));

    // Supabase'e kaydet (arka planda)
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ language: newLanguage, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) {
        console.error('Dil güncellenirken hata:', error);
      }
    } catch (error) {
      console.error('Dil güncellenirken beklenmeyen hata:', error);
    }
  };

  const updateCity = async (newCity: string) => {
    // localStorage'a hemen kaydet
    localStorage.setItem('userCity', newCity);
    setProfile(prev => ({ ...prev, city: newCity }));

    // Supabase'e kaydet (arka planda)
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ city: newCity, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) {
        console.error('Şehir güncellenirken hata:', error);
      }
    } catch (error) {
      console.error('Şehir güncellenirken beklenmeyen hata:', error);
    }
  };

  const updateUsername = async (newUsername: string) => {
    if (!user) return { success: false, error: 'Kullanıcı girişi gerekli' };

    try {
      const { data, error } = await supabase.rpc('update_username', {
        user_id: user.id,
        new_username: newUsername
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string };
      
      if (result.success) {
        setProfile(prev => ({ ...prev, username: newUsername }));
      }

      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    profile,
    loading,
    updateTheme,
    updateLanguage,
    updateCity,
    updateUsername
  };
};