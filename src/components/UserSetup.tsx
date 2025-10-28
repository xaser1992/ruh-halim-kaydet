import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserSetupProps {
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru';
  theme: 'light' | 'dark' | 'feminine';
  onComplete: () => void;
}

export const UserSetup = ({ language, theme, onComplete }: UserSetupProps) => {
  const { user } = useAuth();
  const { profile, updateUsername, updateCity } = useUserProfile();
  const [tempUsername, setTempUsername] = useState('');
  const [tempCity, setTempCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(true);
  const [error, setError] = useState('');

  // Get user location on mount
  useEffect(() => {
    const getLocation = async () => {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });

        const { latitude, longitude } = position.coords;
        
        // Reverse geocoding to get city
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
        );
        const data = await response.json();
        
        const city = data.address?.['ISO3166-2-lvl4']?.split('-')[1] || 
                     data.address?.state || 
                     data.address?.province || 
                     data.address?.city || 
                     '';
        
        setTempCity(city);
      } catch (error) {
        console.error('Location error:', error);
        toast.error('Konum alınamadı. Lütfen manuel olarak şehir girin.');
      } finally {
        setGettingLocation(false);
      }
    };

    getLocation();
  }, []);

  // Check if setup is already complete
  useEffect(() => {
    if (profile.username && profile.city) {
      onComplete();
    }
  }, [profile.username, profile.city, onComplete]);

  const handleSubmit = async () => {
    setError('');

    if (!tempUsername.trim()) {
      setError('Kullanıcı adı gereklidir');
      return;
    }

    if (tempUsername.trim().length < 3) {
      setError('Kullanıcı adı en az 3 karakter olmalıdır');
      return;
    }

    if (!tempCity.trim()) {
      setError('Şehir gereklidir');
      return;
    }

    if (!user) {
      setError('Kullanıcı bulunamadı');
      return;
    }

    setLoading(true);

    try {
      // Update username using RPC function
      const result = await updateUsername(tempUsername.trim());
      
      if (result && !result.success) {
        setError(result.error || 'Kullanıcı adı güncellenemedi');
        setLoading(false);
        return;
      }

      // Update city
      await updateCity(tempCity.trim());

      toast.success('Profil başarıyla oluşturuldu!');
      onComplete();
    } catch (error: any) {
      console.error('Setup error:', error);
      setError(error.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Loading state while getting location
  if (gettingLocation) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <Card className={`w-full max-w-md p-6 transition-colors duration-300 ${
          theme === 'dark' 
            ? 'bg-gray-800 text-white border-gray-700' 
            : theme === 'feminine'
            ? 'bg-pink-50 border-pink-200'
            : 'bg-white border-gray-200'
        }`}>
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className={`transition-colors duration-300 ${
              theme === 'dark' ? 'text-gray-300' : theme === 'feminine' ? 'text-pink-600' : 'text-gray-600'
            }`}>
              Konumunuz alınıyor...
            </p>
          </div>
        </Card>
      </div>
    );
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
              Ruh halinizi kaydetmek için profilinizi tamamlayın
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
                disabled={loading}
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
                Şehir *
              </label>
              <Input
                value={tempCity}
                onChange={(e) => setTempCity(e.target.value)}
                placeholder="Şehrinizi girin"
                className={`transition-colors duration-300 ${
                  theme === 'dark' 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : theme === 'feminine'
                    ? 'bg-pink-50 border-pink-200 placeholder-pink-400'
                    : 'bg-white border-gray-300 placeholder-gray-400'
                }`}
                maxLength={50}
                disabled={loading}
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <Button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full text-white font-medium transition-all duration-200 ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600'
                  : theme === 'feminine'
                  ? 'bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500'
                  : 'bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500'
              }`}
            >
              {loading ? 'Kaydediliyor...' : 'Başla 🎯'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};