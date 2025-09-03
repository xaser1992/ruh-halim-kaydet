import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { User, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UsernameSelectorProps {
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru';
  theme: 'light' | 'dark' | 'feminine';
  onUsernameSelected: (username: string) => void;
  currentUsername?: string;
  showAsSettings?: boolean;
}

export const UsernameSelector = ({ 
  language, 
  theme, 
  onUsernameSelected, 
  currentUsername,
  showAsSettings = false 
}: UsernameSelectorProps) => {
  const [username, setUsername] = useState(currentUsername || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const texts = {
    tr: {
      title: showAsSettings ? 'Kullanıcı Adını Değiştir' : 'Kullanıcı Adı Seç',
      description: showAsSettings 
        ? 'Toplulukta görünen adınızı değiştirebilirsiniz.'
        : 'Toplulukta paylaşım yapabilmek için bir kullanıcı adı seçin.',
      usernameLabel: 'Kullanıcı Adı',
      placeholder: 'Kullanıcı adınızı girin',
      selectButton: showAsSettings ? 'Güncelle' : 'Devam Et',
      cancelButton: 'İptal',
      minLengthError: 'Kullanıcı adı en az 3 karakter olmalıdır',
      emptyError: 'Kullanıcı adı boş bırakılamaz',
      duplicateError: 'Bu kullanıcı adı zaten kullanılıyor',
      successMessage: showAsSettings ? 'Kullanıcı adı güncellendi' : 'Kullanıcı adı seçildi'
    },
    en: {
      title: showAsSettings ? 'Change Username' : 'Select Username',
      description: showAsSettings 
        ? 'You can change your display name in the community.'
        : 'Choose a username to share posts in the community.',
      usernameLabel: 'Username',
      placeholder: 'Enter your username',
      selectButton: showAsSettings ? 'Update' : 'Continue',
      cancelButton: 'Cancel',
      minLengthError: 'Username must be at least 3 characters',
      emptyError: 'Username cannot be empty',
      duplicateError: 'This username is already taken',
      successMessage: showAsSettings ? 'Username updated' : 'Username selected'
    }
  };

  const t = texts[language] || texts.tr;

  const checkUsernameAvailability = async (usernameToCheck: string): Promise<boolean> => {
    if (usernameToCheck === currentUsername) return true; // Same username is allowed
    
    const { data, error } = await supabase
      .from('community_posts')
      .select('display_name')
      .eq('display_name', usernameToCheck)
      .limit(1);

    if (error) {
      console.error('Username check error:', error);
      return false;
    }

    return !data || data.length === 0;
  };

  const handleSubmit = async () => {
    setError('');
    
    if (!username.trim()) {
      setError(t.emptyError);
      return;
    }

    if (username.trim().length < 3) {
      setError(t.minLengthError);
      return;
    }

    setIsLoading(true);

    try {
      const isAvailable = await checkUsernameAvailability(username.trim());
      
      if (!isAvailable) {
        setError(t.duplicateError);
        setIsLoading(false);
        return;
      }

      // Store username in localStorage
      localStorage.setItem('selected_username', username.trim());
      
      toast({
        title: t.successMessage,
        description: `Kullanıcı adınız: ${username.trim()}`
      });

      onUsernameSelected(username.trim());
    } catch (error) {
      console.error('Username selection error:', error);
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (showAsSettings) {
      setUsername(currentUsername || '');
      setError('');
    }
  };

  const themeClasses = {
    light: 'bg-white/90 border-purple-200',
    dark: 'bg-gray-800/90 border-purple-600 text-white',
    feminine: 'bg-pink-50/90 border-pink-200'
  };

  const inputClasses = {
    light: 'bg-white border-gray-200',
    dark: 'bg-gray-700 border-gray-600 text-white',
    feminine: 'bg-pink-50 border-pink-200'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className={`w-full max-w-md backdrop-blur-sm shadow-xl ${themeClasses[theme]}`}>
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${
            theme === 'dark' ? 'text-white' : theme === 'feminine' ? 'text-pink-800' : 'text-gray-800'
          }`}>
            <User className="h-5 w-5" />
            {t.title}
          </CardTitle>
          <CardDescription className={`${
            theme === 'dark' ? 'text-gray-300' : theme === 'feminine' ? 'text-pink-600' : 'text-gray-600'
          }`}>
            {t.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className={`${
              theme === 'dark' ? 'text-gray-200' : theme === 'feminine' ? 'text-pink-700' : 'text-gray-700'
            }`}>
              {t.usernameLabel}
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              placeholder={t.placeholder}
              className={`${inputClasses[theme]} ${error ? 'border-red-500' : ''}`}
              maxLength={20}
            />
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !username.trim()}
              className={`flex-1 ${
                theme === 'dark' 
                  ? 'bg-purple-600 hover:bg-purple-700' 
                  : theme === 'feminine'
                  ? 'bg-pink-500 hover:bg-pink-600'
                  : 'bg-purple-500 hover:bg-purple-600'
              } text-white`}
            >
              {isLoading ? 'Kontrol ediliyor...' : t.selectButton}
            </Button>
            
            {showAsSettings && (
              <Button
                onClick={handleCancel}
                variant="outline"
                className={`flex-1 ${
                  theme === 'dark' 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : theme === 'feminine'
                    ? 'border-pink-300 text-pink-700 hover:bg-pink-50'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {t.cancelButton}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};