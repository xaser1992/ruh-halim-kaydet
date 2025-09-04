import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { turkishCities } from '@/utils/cityData';
import { useUsername } from '@/hooks/useUsername';
import { useCity } from '@/hooks/useCity';

interface UserSetupProps {
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru';
  theme: 'light' | 'dark' | 'feminine';
  onComplete: () => void;
}

export const UserSetup = ({ language, theme, onComplete }: UserSetupProps) => {
  const { username, updateUsername, hasUsername } = useUsername();
  const { city, updateCity, hasCity } = useCity();
  const [tempUsername, setTempUsername] = useState(username || '');
  const [tempCity, setTempCity] = useState(city || '');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');

    if (!tempUsername.trim()) {
      setError('Kullanıcı adı gereklidir');
      return;
    }

    if (tempUsername.trim().length < 3) {
      setError('Kullanıcı adı en az 3 karakter olmalıdır');
      return;
    }

    if (!tempCity) {
      setError('İl seçimi gereklidir');
      return;
    }

    updateUsername(tempUsername.trim());
    updateCity(tempCity);
    onComplete();
  };

  if (hasUsername && hasCity) {
    onComplete();
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className={`w-full max-w-md p-6 transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-gray-800 text-white border-gray-700' 
          : theme === 'feminine'
          ? 'bg-pink-50 border-pink-200'
          : 'bg-white border-gray-200'
      }`}>
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <h2 className={`text-2xl font-bold transition-colors duration-300 ${
              theme === 'dark' ? 'text-white' : theme === 'feminine' ? 'text-pink-800' : 'text-gray-800'
            }`}>
              Hoş Geldiniz! 👋
            </h2>
            <p className={`text-sm transition-colors duration-300 ${
              theme === 'dark' ? 'text-gray-300' : theme === 'feminine' ? 'text-pink-600' : 'text-gray-600'
            }`}>
              Ruh halinizi kaydetmek için kullanıcı adınızı ve bulunduğunuz ili seçin
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-200' : theme === 'feminine' ? 'text-pink-700' : 'text-gray-700'
              }`}>
                Kullanıcı Adı *
              </label>
              <Input
                value={tempUsername}
                onChange={(e) => setTempUsername(e.target.value)}
                placeholder="Kullanıcı adınızı girin"
                className={`transition-colors duration-300 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : theme === 'feminine'
                    ? 'bg-pink-50 border-pink-200 placeholder-pink-400'
                    : 'bg-white border-gray-300 placeholder-gray-400'
                }`}
                maxLength={20}
              />
              <p className={`text-xs mt-1 transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-400' : theme === 'feminine' ? 'text-pink-500' : 'text-gray-500'
              }`}>
                En az 3 karakter olmalıdır
              </p>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-200' : theme === 'feminine' ? 'text-pink-700' : 'text-gray-700'
              }`}>
                Bulunduğunuz İl *
              </label>
              <Select value={tempCity} onValueChange={setTempCity}>
                <SelectTrigger className={`transition-colors duration-300 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : theme === 'feminine'
                    ? 'bg-pink-50 border-pink-200'
                    : 'bg-white border-gray-300'
                }`}>
                  <SelectValue placeholder="İl seçiniz" />
                </SelectTrigger>
                <SelectContent className={`${
                  theme === 'dark' 
                    ? 'bg-gray-800 border-gray-700' 
                    : theme === 'feminine'
                    ? 'bg-pink-50 border-pink-200'
                    : 'bg-white border-gray-200'
                }`}>
                  {turkishCities.map((cityName) => (
                    <SelectItem key={cityName} value={cityName} className={`${
                      theme === 'dark' 
                        ? 'text-white hover:bg-gray-700' 
                        : theme === 'feminine'
                        ? 'text-pink-800 hover:bg-pink-100'
                        : 'text-gray-800 hover:bg-gray-100'
                    }`}>
                      {cityName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <Button
              onClick={handleSubmit}
              className={`w-full text-white font-medium transition-all duration-200 ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600'
                  : theme === 'feminine'
                  ? 'bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500'
                  : 'bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500'
              }`}
            >
              Başla 🎯
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};