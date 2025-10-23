import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { User, MapPin, Edit } from 'lucide-react';
import { useUsername } from '@/hooks/useUsername';
import { useCity } from '@/hooks/useCity';

interface UserInfoProps {
  theme: 'light' | 'dark' | 'feminine';
  username: string;
}

export const UserInfo = ({ theme, username }: UserInfoProps) => {
  const { updateUsername } = useUsername();
  const { city } = useCity();
  const [isOpen, setIsOpen] = useState(false);
  const [tempUsername, setTempUsername] = useState(username || '');
  const [error, setError] = useState('');

  const handleSave = () => {
    setError('');

    if (!tempUsername.trim()) {
      setError('Kullanıcı adı gereklidir');
      return;
    }

    if (tempUsername.trim().length < 3) {
      setError('Kullanıcı adı en az 3 karakter olmalıdır');
      return;
    }

    updateUsername(tempUsername.trim());
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempUsername(username || '');
    setError('');
    setIsOpen(false);
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gray-800/50 border border-gray-700' 
        : theme === 'feminine'
        ? 'bg-pink-50/50 border border-pink-200'
        : 'bg-white/50 border border-gray-200'
    }`}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <User className={`w-4 h-4 transition-colors duration-300 ${
            theme === 'dark' ? 'text-purple-400' : theme === 'feminine' ? 'text-pink-500' : 'text-purple-500'
          }`} />
          <span className={`text-sm font-medium truncate transition-colors duration-300 ${
            theme === 'dark' ? 'text-white' : theme === 'feminine' ? 'text-pink-800' : 'text-gray-800'
          }`}>
            {username}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className={`w-4 h-4 transition-colors duration-300 ${
            theme === 'dark' ? 'text-blue-400' : theme === 'feminine' ? 'text-pink-400' : 'text-blue-500'
          }`} />
          <span className={`text-sm truncate transition-colors duration-300 ${
            theme === 'dark' ? 'text-gray-300' : theme === 'feminine' ? 'text-pink-600' : 'text-gray-600'
          }`}>
            {city}
          </span>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`p-2 transition-colors duration-300 ${
              theme === 'dark' 
                ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                : theme === 'feminine'
                ? 'text-pink-500 hover:text-pink-700 hover:bg-pink-100'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Edit className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className={`transition-colors duration-300 ${
          theme === 'dark' 
            ? 'bg-gray-800 text-white border-gray-700' 
            : theme === 'feminine'
            ? 'bg-pink-50 border-pink-200'
            : 'bg-white border-gray-200'
        }`}>
          <DialogHeader>
            <DialogTitle className={`transition-colors duration-300 ${
              theme === 'dark' ? 'text-white' : theme === 'feminine' ? 'text-pink-800' : 'text-gray-800'
            }`}>
              Bilgilerini Düzenle
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className={`block text-sm font-medium mb-2 transition-colors duration-300 ${
                theme === 'dark' ? 'text-gray-200' : theme === 'feminine' ? 'text-pink-700' : 'text-gray-700'
              }`}>
                Kullanıcı Adı
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
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleCancel}
                variant="outline"
                className={`flex-1 transition-colors duration-300 ${
                  theme === 'dark' 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : theme === 'feminine'
                    ? 'border-pink-300 text-pink-600 hover:bg-pink-50'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                İptal
              </Button>
              <Button
                onClick={handleSave}
                className={`flex-1 text-white font-medium transition-all duration-200 ${
                  theme === 'dark' 
                    ? 'bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600'
                    : theme === 'feminine'
                    ? 'bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500'
                    : 'bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500'
                }`}
              >
                Kaydet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};