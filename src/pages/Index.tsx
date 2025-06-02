
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoodEntry } from "@/components/MoodEntry";
import { MoodHistory } from "@/components/MoodHistory";
import { Lock, Globe, ChevronDown } from "lucide-react";

const Index = () => {
  const [language, setLanguage] = useState<'tr' | 'en'>('tr');

  const translations = {
    tr: {
      appName: "Ruh Halim",
      entry: "Giriş",
      history: "Geçmiş",
      privacy: "Verileriniz cihazınızda güvenle saklanır"
    },
    en: {
      appName: "My Mood",
      entry: "Entry",
      history: "History",
      privacy: "Your data is securely stored on your device"
    }
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-indigo-100">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-200 to-pink-200 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-2xl">😊</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{t.appName}</h1>
          
          {/* Language Selector */}
          <div className="flex justify-center mb-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white/70 backdrop-blur-sm border-purple-200">
                  <Globe className="w-4 h-4 mr-2" />
                  {language === 'tr' ? 'TR' : 'EN'}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white border-purple-200 z-50">
                <DropdownMenuItem onClick={() => setLanguage('tr')} className="cursor-pointer">
                  TR
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('en')} className="cursor-pointer">
                  EN
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="entry" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/70 backdrop-blur-sm rounded-xl p-1 mb-6">
            <TabsTrigger 
              value="entry" 
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              {t.entry}
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              {t.history}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="entry" className="mt-0">
            <MoodEntry language={language} />
          </TabsContent>
          
          <TabsContent value="history" className="mt-0">
            <MoodHistory language={language} />
          </TabsContent>
        </Tabs>

        {/* Privacy Notice */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-600 text-sm">
            <Lock size={16} />
            <span>{t.privacy}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
