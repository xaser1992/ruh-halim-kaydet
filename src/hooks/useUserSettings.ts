import { useState, useEffect } from 'react';

interface UserSettings {
  theme: 'light' | 'dark' | 'feminine';
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru';
}

export const useUserSettings = () => {
  const [settings, setSettings] = useState<UserSettings>({ theme: 'light', language: 'tr' });
  const [loading, setLoading] = useState(true);

  // Ayarları yükle
  const loadSettings = () => {
    // localStorage'dan yükle
    const savedTheme = localStorage.getItem('ruh-halim-theme') as 'light' | 'dark' | 'feminine' || 'light';
    const savedLanguage = localStorage.getItem('ruh-halim-language') as 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru' || 'tr';
    
    // Dark mode class'ını requestAnimationFrame içinde uygula
    requestAnimationFrame(() => {
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
    
    setSettings({ theme: savedTheme, language: savedLanguage });
    setLoading(false);
  };

  // Ayarları kaydet
  const updateSettings = (newSettings: Partial<UserSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    
    // localStorage'a kaydet
    if (newSettings.theme) {
      localStorage.setItem('ruh-halim-theme', newSettings.theme);
      // Dark mode class'ını requestAnimationFrame içinde uygula
      requestAnimationFrame(() => {
        if (newSettings.theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      });
    }
    if (newSettings.language) {
      localStorage.setItem('ruh-halim-language', newSettings.language);
    }
    
    // State'i güncelle
    setSettings(updatedSettings);
  };

  useEffect(() => {
    let mounted = true;
    
    if (mounted) {
      loadSettings();
    }
    
    return () => {
      mounted = false;
    };
  }, []);

  return {
    settings,
    updateSettings,
    loading
  };
};
