import { useState, useEffect } from 'react';
import { MoodSelector } from '@/components/MoodSelector';
import { MoodEntry } from '@/components/MoodEntry';
import { MoodHistory } from '@/components/MoodHistory';
import { Community } from '@/components/Community';
import { CityStats } from '@/pages/CityStats';
import { LocalBackup } from '@/components/LocalBackup';
import { UserSetup } from '@/components/UserSetup';
import { UserInfo } from '@/components/UserInfo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Settings, Download } from 'lucide-react';
import { useMoodEntries } from '@/hooks/useMoodEntries';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useUsername } from '@/hooks/useUsername';
import { useCity } from '@/hooks/useCity';
import { translations } from '@/utils/translations';

const Index = () => {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const { entries, saveEntry } = useMoodEntries();
  const { settings, updateSettings } = useUserSettings();
  const { username } = useUsername();
  const { city } = useCity();
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    if (!username || !city) {
      setShowSetup(true);
    } else {
      setShowSetup(false);
    }
  }, [username, city]);

  const handleMoodSelect = (mood: string) => {
    if (!username || !city) {
      setShowSetup(true);
      return;
    }
    setSelectedMood(mood);
  };

  const handleMoodSave = (note: string, images: string[], moodId: string) => {
    saveEntry({
      mood: moodId,
      note,
      images,
      timestamp: new Date().toISOString(),
      date: new Date().toDateString()
    });
    setSelectedMood('');
  };

  if (showSetup) {
    return <UserSetup onComplete={() => setShowSetup(false)} theme={settings.theme} language={settings.language} />;
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      settings.theme === 'dark' ? 'dark' : ''
    } ${
      settings.theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900'
        : settings.theme === 'feminine'
        ? 'bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100'
        : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
    }`}>
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-foreground">
              {translations[settings.language].appName}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <UserInfo theme={settings.theme} />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="z-50 bg-card border-border shadow-lg">
                <DropdownMenuItem className="focus:bg-accent focus:text-accent-foreground cursor-pointer">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="w-full text-left">
                      {translations[settings.language].changeTheme}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" className="z-50 bg-card border-border shadow-lg">
                      <DropdownMenuItem 
                        onClick={() => updateSettings({ theme: 'light' })}
                        className={`focus:bg-accent focus:text-accent-foreground cursor-pointer ${settings.theme === 'light' ? 'bg-accent' : ''}`}
                      >
                        ☀️ Açık Tema
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => updateSettings({ theme: 'dark' })}
                        className={`focus:bg-accent focus:text-accent-foreground cursor-pointer ${settings.theme === 'dark' ? 'bg-accent' : ''}`}
                      >
                        🌙 Koyu Tema
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => updateSettings({ theme: 'feminine' })}
                        className={`focus:bg-accent focus:text-accent-foreground cursor-pointer ${settings.theme === 'feminine' ? 'bg-accent' : ''}`}
                      >
                        🌸 Kadınsı Tema
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </DropdownMenuItem>
                <DropdownMenuItem className="focus:bg-accent focus:text-accent-foreground cursor-pointer">
                  <DropdownMenu>
                    <DropdownMenuTrigger className="w-full text-left">
                      {translations[settings.language].changeLanguage}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" className="z-50 bg-card border-border shadow-lg">
                      <DropdownMenuItem 
                        onClick={() => updateSettings({ language: 'tr' })}
                        className={`focus:bg-accent focus:text-accent-foreground cursor-pointer ${settings.language === 'tr' ? 'bg-accent' : ''}`}
                      >
                        🇹🇷 Türkçe
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => updateSettings({ language: 'en' })}
                        className={`focus:bg-accent focus:text-accent-foreground cursor-pointer ${settings.language === 'en' ? 'bg-accent' : ''}`}
                      >
                        🇺🇸 English
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => updateSettings({ language: 'de' })}
                        className={`focus:bg-accent focus:text-accent-foreground cursor-pointer ${settings.language === 'de' ? 'bg-accent' : ''}`}
                      >
                        🇩🇪 Deutsch
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => updateSettings({ language: 'fr' })}
                        className={`focus:bg-accent focus:text-accent-foreground cursor-pointer ${settings.language === 'fr' ? 'bg-accent' : ''}`}
                      >
                        🇫🇷 Français
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => updateSettings({ language: 'es' })}
                        className={`focus:bg-accent focus:text-accent-foreground cursor-pointer ${settings.language === 'es' ? 'bg-accent' : ''}`}
                      >
                        🇪🇸 Español
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => updateSettings({ language: 'it' })}
                        className={`focus:bg-accent focus:text-accent-foreground cursor-pointer ${settings.language === 'it' ? 'bg-accent' : ''}`}
                      >
                        🇮🇹 Italiano
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => updateSettings({ language: 'ru' })}
                        className={`focus:bg-accent focus:text-accent-foreground cursor-pointer ${settings.language === 'ru' ? 'bg-accent' : ''}`}
                      >
                        🇷🇺 Русский
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a 
                    href="/privacy" 
                    className="focus:bg-accent focus:text-accent-foreground cursor-pointer"
                  >
                    {translations[settings.language].privacy}
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a 
                    href="/terms" 
                    className="focus:bg-accent focus:text-accent-foreground cursor-pointer"
                  >
                    {translations[settings.language].terms}
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a 
                    href="/license" 
                    className="focus:bg-accent focus:text-accent-foreground cursor-pointer"
                  >
                    {translations[settings.language].license}
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs defaultValue="mood" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger 
              value="mood" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {translations[settings.language].mood}
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {translations[settings.language].history}
            </TabsTrigger>
            <TabsTrigger 
              value="community" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {translations[settings.language].community}
            </TabsTrigger>
            <TabsTrigger 
              value="stats" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              İstatistikler
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mood" className="space-y-6">
            <MoodSelector 
              selectedMood={selectedMood}
              onMoodSelect={handleMoodSelect} 
              theme={settings.theme} 
              language={settings.language}
            />
            
            <MoodEntry 
              mood={selectedMood} 
              onSave={handleMoodSave} 
              theme={settings.theme}
              username={username!}
              city={city!}
            />
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-6">
              <MoodHistory 
                theme={settings.theme}
                language={settings.language}
              />
              <LocalBackup theme={settings.theme} language={settings.language} />
            </div>
          </TabsContent>

          <TabsContent value="community">
            <Community theme={settings.theme} language={settings.language} />
          </TabsContent>

          <TabsContent value="stats">
            <CityStats theme={settings.theme} language={settings.language} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;