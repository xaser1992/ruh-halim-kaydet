
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoodEntry } from "@/components/MoodEntry";
import { MoodHistory } from "@/components/MoodHistory";
import { Lock, Globe, ChevronDown, Sun, Moon } from "lucide-react";

const Index = () => {
  const [language, setLanguage] = useState<'tr' | 'en'>('tr');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const translations = {
    tr: {
      appName: "Ruh Halim",
      entry: "Giriş",
      history: "Geçmiş",
      privacy: "Verileriniz cihazınızda güvenle saklanır",
      light: "Açık",
      dark: "Karanlık"
    },
    en: {
      appName: "My Mood",
      entry: "Entry",
      history: "History",
      privacy: "Your data is securely stored on your device",
      light: "Light",
      dark: "Dark"
    }
  };

  const t = translations[language];

  useEffect(() => {
    // Load saved preferences on mount
    const savedLanguage = localStorage.getItem('ruh-halim-language') as 'tr' | 'en';
    const savedTheme = localStorage.getItem('ruh-halim-theme') as 'light' | 'dark';
    
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
    
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleLanguageChange = (newLanguage: 'tr' | 'en') => {
    setLanguage(newLanguage);
    localStorage.setItem('ruh-halim-language', newLanguage);
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('ruh-halim-theme', newTheme);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-gray-800' 
        : 'bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100'
    }`}>
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transition-colors duration-300 ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-purple-700 to-pink-700' 
              : 'bg-gradient-to-br from-purple-200 to-pink-200'
          }`}>
            <span className="text-2xl">😊</span>
          </div>
          <h1 className={`text-2xl font-bold mb-4 transition-colors duration-300 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>{t.appName}</h1>
          
          {/* Language Selector */}
          <div className="flex justify-center gap-3 mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className={`backdrop-blur-sm transition-colors duration-300 ${
                  theme === 'dark' 
                    ? 'bg-gray-800/70 border-purple-600 text-white hover:bg-gray-700/70' 
                    : 'bg-white/70 border-purple-200 hover:bg-white/90'
                }`}>
                  <Globe className="w-4 h-4 mr-2" />
                  {language === 'tr' ? 'TR' : 'EN'}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className={`border-purple-200 z-50 transition-colors duration-300 ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-purple-600' 
                  : 'bg-white border-purple-200'
              }`}>
                <DropdownMenuItem onClick={() => handleLanguageChange('tr')} className={`cursor-pointer transition-colors duration-300 ${
                  theme === 'dark' 
                    ? 'text-white hover:bg-gray-700' 
                    : 'text-gray-900 hover:bg-gray-100'
                }`}>
                  TR
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLanguageChange('en')} className={`cursor-pointer transition-colors duration-300 ${
                  theme === 'dark' 
                    ? 'text-white hover:bg-gray-700' 
                    : 'text-gray-900 hover:bg-gray-100'
                }`}>
                  EN
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className={`backdrop-blur-sm transition-colors duration-300 ${
                  theme === 'dark' 
                    ? 'bg-gray-800/70 border-purple-600 text-white hover:bg-gray-700/70' 
                    : 'bg-white/70 border-purple-200 hover:bg-white/90'
                }`}>
                  {theme === 'dark' ? <Moon className="w-4 h-4 mr-2" /> : <Sun className="w-4 h-4 mr-2" />}
                  {theme === 'dark' ? t.dark : t.light}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className={`border-purple-200 z-50 transition-colors duration-300 ${
                theme === 'dark' 
                  ? 'bg-gray-800 border-purple-600' 
                  : 'bg-white border-purple-200'
              }`}>
                <DropdownMenuItem onClick={() => handleThemeChange('light')} className={`cursor-pointer transition-colors duration-300 ${
                  theme === 'dark' 
                    ? 'text-white hover:bg-gray-700' 
                    : 'text-gray-900 hover:bg-gray-100'
                }`}>
                  <Sun className="w-4 h-4 mr-2" />
                  {t.light}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleThemeChange('dark')} className={`cursor-pointer transition-colors duration-300 ${
                  theme === 'dark' 
                    ? 'text-white hover:bg-gray-700' 
                    : 'text-gray-900 hover:bg-gray-100'
                }`}>
                  <Moon className="w-4 h-4 mr-2" />
                  {t.dark}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="entry" className="w-full">
          <TabsList className={`grid w-full grid-cols-2 backdrop-blur-sm rounded-xl p-1 mb-6 transition-colors duration-300 ${
            theme === 'dark' 
              ? 'bg-gray-800/70' 
              : 'bg-white/70'
          }`}>
            <TabsTrigger 
              value="entry" 
              className={`rounded-lg transition-colors duration-300 ${
                theme === 'dark'
                  ? 'data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300'
                  : 'data-[state=active]:bg-white data-[state=active]:shadow-sm'
              }`}
            >
              {t.entry}
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className={`rounded-lg transition-colors duration-300 ${
                theme === 'dark'
                  ? 'data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300'
                  : 'data-[state=active]:bg-white data-[state=active]:shadow-sm'
              }`}
            >
              {t.history}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="entry" className="mt-0">
            <MoodEntry language={language} theme={theme} />
          </TabsContent>
          
          <TabsContent value="history" className="mt-0">
            <MoodHistory language={language} theme={theme} />
          </TabsContent>
        </Tabs>

        {/* Privacy Notice */}
        <div className="mt-8 text-center">
          <div className={`flex items-center justify-center gap-2 text-sm transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <Lock size={16} />
            <span>{t.privacy}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
