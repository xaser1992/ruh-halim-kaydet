import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoodSelector } from '@/components/MoodSelector';
import { MoodEntry } from '@/components/MoodEntry';
import MoodHistory from '@/components/MoodHistory';
import Community from '@/components/Community';
import CityStats from '@/pages/CityStats';
import LocalBackup from '@/components/LocalBackup';
import { UserSetup } from '@/components/UserSetup';
import { UserInfo } from '@/components/UserInfo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { Settings, LogOut } from 'lucide-react';
import { useMoodEntries } from '@/hooks/useMoodEntries';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCity } from '@/hooks/useCity';
import { translations } from '@/utils/translations';

const Index = () => {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem('last-tab');
    return savedTab || 'mood'; // Fallback
  });
  const { entries, saveEntry } = useMoodEntries();
  const { user, loading: authLoading, logout } = useAuth();
  const { profile, loading: profileLoading, updateTheme, updateLanguage, updateCity } = useUserProfile(user?.id || null);
  const { city } = useCity();
  const [showSetup, setShowSetup] = useState(false);
  
  // Cache translations with fallback
  const t = useMemo(() => translations[profile.language] || translations['tr'], [profile.language]);

  // Giriş kontrolü
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && !profile.city) {
      setShowSetup(true);
    } else {
      setShowSetup(false);
    }
  }, [user, profile.city]);

  // Şehir yüklenene kadar loading göster
  const cityLoadingState = useCity();
  if (authLoading || profileLoading || cityLoadingState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const handleMoodSelect = (mood: string) => {
    if (!profile.city) {
      setShowSetup(true);
      return;
    }
    setSelectedMood(mood);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const handleMoodSave = (note: string, images: string[], moodId: string) => {
    saveEntry({
      mood: moodId,
      note,
      images,
      timestamp: new Date().toISOString(),
      date: new Date().toDateString(),
      user_id: user?.id || ''
    });
    setSelectedMood('');
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem('last-tab', value);
  };

  if (showSetup) {
    return <UserSetup userId={user?.id} onComplete={() => setShowSetup(false)} theme={profile.theme} language={profile.language} />;
  }

  return (
    <div className={`min-h-screen ${
      profile.theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900'
        : profile.theme === 'feminine'
        ? 'bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100'
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-foreground">
              {t.appName}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <UserInfo theme={profile.theme} username={user?.username || ''} />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-50 bg-card border-border shadow-lg w-48">
                <DropdownMenuLabel>{t.themes}</DropdownMenuLabel>
                <DropdownMenuItem 
                  onClick={async () => await updateTheme('light')}
                  className={`focus:bg-accent focus:text-accent-foreground cursor-pointer ${profile.theme === 'light' ? 'bg-accent' : ''}`}
                >
                  ☀️ Açık Tema
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={async () => await updateTheme('dark')}
                  className={`focus:bg-accent focus:text-accent-foreground cursor-pointer ${profile.theme === 'dark' ? 'bg-accent' : ''}`}
                >
                  🌙 Koyu Tema
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={async () => await updateTheme('feminine')}
                  className={`focus:bg-accent focus:text-accent-foreground cursor-pointer ${profile.theme === 'feminine' ? 'bg-accent' : ''}`}
                >
                  🌸 Pembik
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel>{t.languages}</DropdownMenuLabel>
                <DropdownMenuItem 
                  onClick={async () => await updateLanguage('tr')}
                  className={`focus:bg-accent focus:text-accent-foreground cursor-pointer ${profile.language === 'tr' ? 'bg-accent' : ''}`}
                >
                  🇹🇷 Türkçe
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={async () => await updateLanguage('en')}
                  className={`focus:bg-accent focus:text-accent-foreground cursor-pointer ${profile.language === 'en' ? 'bg-accent' : ''}`}
                >
                  🇺🇸 English
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={async () => await updateLanguage('de')}
                  className={`focus:bg-accent focus:text-accent-foreground cursor-pointer ${profile.language === 'de' ? 'bg-accent' : ''}`}
                >
                  🇩🇪 Deutsch
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={async () => await updateLanguage('fr')}
                  className={`focus:bg-accent focus:text-accent-foreground cursor-pointer ${profile.language === 'fr' ? 'bg-accent' : ''}`}
                >
                  🇫🇷 Français
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={async () => await updateLanguage('es')}
                  className={`focus:bg-accent focus:text-accent-foreground cursor-pointer ${profile.language === 'es' ? 'bg-accent' : ''}`}
                >
                  🇪🇸 Español
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={async () => await updateLanguage('it')}
                  className={`focus:bg-accent focus:text-accent-foreground cursor-pointer ${profile.language === 'it' ? 'bg-accent' : ''}`}
                >
                  🇮🇹 Italiano
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={async () => await updateLanguage('ru')}
                  className={`focus:bg-accent focus:text-accent-foreground cursor-pointer ${profile.language === 'ru' ? 'bg-accent' : ''}`}
                >
                  🇷🇺 Русский
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem asChild>
                  <a 
                    href="/privacy" 
                    className="focus:bg-accent focus:text-accent-foreground cursor-pointer"
                  >
                    {t.privacy}
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a 
                    href="/terms" 
                    className="focus:bg-accent focus:text-accent-foreground cursor-pointer"
                  >
                    {t.terms}
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a 
                    href="/license" 
                    className="focus:bg-accent focus:text-accent-foreground cursor-pointer"
                  >
                    {t.license}
                  </a>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="focus:bg-accent focus:text-accent-foreground cursor-pointer text-destructive"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {t.logout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger 
              value="mood" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {t.mood}
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {t.history}
            </TabsTrigger>
            <TabsTrigger 
              value="community" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {t.community}
            </TabsTrigger>
            <TabsTrigger 
              value="stats" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {t.statistics}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mood" className="space-y-6">
            <MoodSelector 
              selectedMood={selectedMood}
              onMoodSelect={handleMoodSelect} 
              theme={profile.theme} 
              language={profile.language}
            />
            
            <MoodEntry 
              mood={selectedMood} 
              onSave={handleMoodSave} 
              theme={profile.theme}
              username={user?.username || ''}
              city={profile.city || city || ''}
              userId={user?.id || ''}
            />
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-6">
              <MoodHistory 
                theme={profile.theme}
                language={profile.language}
              />
              <LocalBackup theme={profile.theme} language={profile.language} />
            </div>
          </TabsContent>

          <TabsContent value="community">
            <Community theme={profile.theme} language={profile.language} />
          </TabsContent>

          <TabsContent value="stats">
            <CityStats theme={profile.theme} language={profile.language} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;