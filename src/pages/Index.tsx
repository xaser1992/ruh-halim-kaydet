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
    <div className={`min-h-screen transition-all duration-500 ${
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
            <h1 className={`text-3xl font-bold transition-colors duration-300 ${
              settings.theme === 'dark' ? 'text-white' : settings.theme === 'feminine' ? 'text-pink-800' : 'text-gray-800'
            }`}>
              {translations[settings.language].appName}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <UserInfo theme={settings.theme} />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className={`transition-colors duration-300 ${
                  settings.theme === 'dark' 
                    ? 'border-gray-700 text-gray-300 hover:bg-gray-800' 
                    : settings.theme === 'feminine'
                    ? 'border-pink-200 text-pink-600 hover:bg-pink-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`transition-colors duration-300 ${
                settings.theme === 'dark' 
                  ? 'bg-gray-800 border-gray-700' 
                  : settings.theme === 'feminine'
                  ? 'bg-pink-50 border-pink-200'
                  : 'bg-white'
              }`}>
                <DropdownMenuItem 
                  className={`transition-colors duration-300 ${
                    settings.theme === 'dark' ? 'hover:bg-gray-700 text-gray-200' 
                    : settings.theme === 'feminine' ? 'hover:bg-pink-100 text-pink-800'
                    : 'hover:bg-gray-100'
                  }`}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger className="w-full text-left">
                      {translations[settings.language].changeTheme}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" className={`transition-colors duration-300 ${
                      settings.theme === 'dark' 
                        ? 'bg-gray-800 border-gray-700' 
                        : settings.theme === 'feminine'
                        ? 'bg-pink-50 border-pink-200'
                        : 'bg-white'
                    }`}>
                      <DropdownMenuItem 
                        onClick={() => updateSettings({ theme: 'light' })}
                        className={`transition-colors duration-300 ${
                          settings.theme === 'dark' ? 'hover:bg-gray-700 text-gray-200' 
                          : settings.theme === 'feminine' ? 'hover:bg-pink-100 text-pink-800'
                          : 'hover:bg-gray-100'
                        } ${settings.theme === 'light' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                      >
                        ☀️ Açık Tema
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => updateSettings({ theme: 'dark' })}
                        className={`transition-colors duration-300 ${
                          settings.theme === 'dark' ? 'hover:bg-gray-700 text-gray-200' 
                          : settings.theme === 'feminine' ? 'hover:bg-pink-100 text-pink-800'
                          : 'hover:bg-gray-100'
                        } ${settings.theme === 'dark' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                      >
                        🌙 Koyu Tema
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => updateSettings({ theme: 'feminine' })}
                        className={`transition-colors duration-300 ${
                          settings.theme === 'dark' ? 'hover:bg-gray-700 text-gray-200' 
                          : settings.theme === 'feminine' ? 'hover:bg-pink-100 text-pink-800'
                          : 'hover:bg-gray-100'
                        } ${settings.theme === 'feminine' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                      >
                        🌸 Kadınsı Tema
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={`transition-colors duration-300 ${
                    settings.theme === 'dark' ? 'hover:bg-gray-700 text-gray-200' 
                    : settings.theme === 'feminine' ? 'hover:bg-pink-100 text-pink-800'
                    : 'hover:bg-gray-100'
                  }`}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger className="w-full text-left">
                      {translations[settings.language].changeLanguage}
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" className={`transition-colors duration-300 ${
                      settings.theme === 'dark' 
                        ? 'bg-gray-800 border-gray-700' 
                        : settings.theme === 'feminine'
                        ? 'bg-pink-50 border-pink-200'
                        : 'bg-white'
                    }`}>
                      <DropdownMenuItem 
                        onClick={() => updateSettings({ language: 'tr' })}
                        className={`transition-colors duration-300 ${
                          settings.theme === 'dark' ? 'hover:bg-gray-700 text-gray-200' 
                          : settings.theme === 'feminine' ? 'hover:bg-pink-100 text-pink-800'
                          : 'hover:bg-gray-100'
                        } ${settings.language === 'tr' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                      >
                        🇹🇷 Türkçe
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => updateSettings({ language: 'en' })}
                        className={`transition-colors duration-300 ${
                          settings.theme === 'dark' ? 'hover:bg-gray-700 text-gray-200' 
                          : settings.theme === 'feminine' ? 'hover:bg-pink-100 text-pink-800'
                          : 'hover:bg-gray-100'
                        } ${settings.language === 'en' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                      >
                        🇺🇸 English
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => updateSettings({ language: 'de' })}
                        className={`transition-colors duration-300 ${
                          settings.theme === 'dark' ? 'hover:bg-gray-700 text-gray-200' 
                          : settings.theme === 'feminine' ? 'hover:bg-pink-100 text-pink-800'
                          : 'hover:bg-gray-100'
                        } ${settings.language === 'de' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                      >
                        🇩🇪 Deutsch
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => updateSettings({ language: 'fr' })}
                        className={`transition-colors duration-300 ${
                          settings.theme === 'dark' ? 'hover:bg-gray-700 text-gray-200' 
                          : settings.theme === 'feminine' ? 'hover:bg-pink-100 text-pink-800'
                          : 'hover:bg-gray-100'
                        } ${settings.language === 'fr' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                      >
                        🇫🇷 Français
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => updateSettings({ language: 'es' })}
                        className={`transition-colors duration-300 ${
                          settings.theme === 'dark' ? 'hover:bg-gray-700 text-gray-200' 
                          : settings.theme === 'feminine' ? 'hover:bg-pink-100 text-pink-800'
                          : 'hover:bg-gray-100'
                        } ${settings.language === 'es' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                      >
                        🇪🇸 Español
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => updateSettings({ language: 'it' })}
                        className={`transition-colors duration-300 ${
                          settings.theme === 'dark' ? 'hover:bg-gray-700 text-gray-200' 
                          : settings.theme === 'feminine' ? 'hover:bg-pink-100 text-pink-800'
                          : 'hover:bg-gray-100'
                        } ${settings.language === 'it' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                      >
                        🇮🇹 Italiano
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => updateSettings({ language: 'ru' })}
                        className={`transition-colors duration-300 ${
                          settings.theme === 'dark' ? 'hover:bg-gray-700 text-gray-200' 
                          : settings.theme === 'feminine' ? 'hover:bg-pink-100 text-pink-800'
                          : 'hover:bg-gray-100'
                        } ${settings.language === 'ru' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                      >
                        🇷🇺 Русский
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a 
                    href="/privacy" 
                    className={`transition-colors duration-300 ${
                      settings.theme === 'dark' ? 'hover:bg-gray-700 text-gray-200' 
                      : settings.theme === 'feminine' ? 'hover:bg-pink-100 text-pink-800'
                      : 'hover:bg-gray-100'
                    }`}
                  >
                    {translations[settings.language].privacy}
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a 
                    href="/terms" 
                    className={`transition-colors duration-300 ${
                      settings.theme === 'dark' ? 'hover:bg-gray-700 text-gray-200' 
                      : settings.theme === 'feminine' ? 'hover:bg-pink-100 text-pink-800'
                      : 'hover:bg-gray-100'
                    }`}
                  >
                    {translations[settings.language].terms}
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a 
                    href="/license" 
                    className={`transition-colors duration-300 ${
                      settings.theme === 'dark' ? 'hover:bg-gray-700 text-gray-200' 
                      : settings.theme === 'feminine' ? 'hover:bg-pink-100 text-pink-800'
                      : 'hover:bg-gray-100'
                    }`}
                  >
                    {translations[settings.language].license}
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs defaultValue="mood" className="w-full">
          <TabsList className={`grid w-full grid-cols-4 transition-colors duration-300 ${
            settings.theme === 'dark' 
              ? 'bg-gray-800/50' 
              : settings.theme === 'feminine'
              ? 'bg-pink-100/50'
              : 'bg-white/50'
          }`}>
            <TabsTrigger 
              value="mood" 
              className={`transition-colors duration-300 ${
                settings.theme === 'dark' 
                  ? 'data-[state=active]:bg-purple-700 data-[state=active]:text-white' 
                  : settings.theme === 'feminine'
                  ? 'data-[state=active]:bg-pink-500 data-[state=active]:text-white'
                  : 'data-[state=active]:bg-purple-600 data-[state=active]:text-white'
              }`}
            >
              {translations[settings.language].mood}
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className={`transition-colors duration-300 ${
                settings.theme === 'dark' 
                  ? 'data-[state=active]:bg-purple-700 data-[state=active]:text-white' 
                  : settings.theme === 'feminine'
                  ? 'data-[state=active]:bg-pink-500 data-[state=active]:text-white'
                  : 'data-[state=active]:bg-purple-600 data-[state=active]:text-white'
              }`}
            >
              {translations[settings.language].history}
            </TabsTrigger>
            <TabsTrigger 
              value="community" 
              className={`transition-colors duration-300 ${
                settings.theme === 'dark' 
                  ? 'data-[state=active]:bg-purple-700 data-[state=active]:text-white' 
                  : settings.theme === 'feminine'
                  ? 'data-[state=active]:bg-pink-500 data-[state=active]:text-white'
                  : 'data-[state=active]:bg-purple-600 data-[state=active]:text-white'
              }`}
            >
              {translations[settings.language].community}
            </TabsTrigger>
            <TabsTrigger 
              value="stats" 
              className={`transition-colors duration-300 ${
                settings.theme === 'dark' 
                  ? 'data-[state=active]:bg-purple-700 data-[state=active]:text-white' 
                  : settings.theme === 'feminine'
                  ? 'data-[state=active]:bg-pink-500 data-[state=active]:text-white'
                  : 'data-[state=active]:bg-purple-600 data-[state=active]:text-white'
              }`}
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