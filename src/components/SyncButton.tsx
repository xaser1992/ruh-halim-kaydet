import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMoodSync } from '@/hooks/useMoodSync';
import { 
  Cloud, 
  CloudUpload, 
  CloudDownload, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  Calendar
} from 'lucide-react';

interface SyncButtonProps {
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru';
  theme: 'light' | 'dark' | 'feminine';
}

export const SyncButton = ({ language, theme }: SyncButtonProps) => {
  const { 
    syncStatus, 
    uploadToGoogleDrive, 
    downloadFromGoogleDrive,
    checkNetworkStatus 
  } = useMoodSync();
  
  const [showSyncOptions, setShowSyncOptions] = useState(false);

  const handleUpload = async () => {
    const isOnline = await checkNetworkStatus();
    if (!isOnline) {
      alert('İnternet bağlantısı gerekli');
      return;
    }
    
    await uploadToGoogleDrive();
    setShowSyncOptions(false);
  };

  const handleDownload = async () => {
    const isOnline = await checkNetworkStatus();
    if (!isOnline) {
      alert('İnternet bağlantısı gerekli');
      return;
    }
    
    await downloadFromGoogleDrive();
    setShowSyncOptions(false);
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Hiç senkronize edilmedi';
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <Card className={`p-4 transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gray-800/80 text-white' 
        : theme === 'feminine'
        ? 'bg-pink-50/80'
        : 'bg-white/80'
    }`}>
      {/* Ana Sync Butonu */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Cloud className={`w-5 h-5 ${
            theme === 'dark' ? 'text-purple-400' : 
            theme === 'feminine' ? 'text-pink-500' : 'text-purple-500'
          }`} />
          <span className={`font-medium ${
            theme === 'dark' ? 'text-white' : 
            theme === 'feminine' ? 'text-pink-800' : 'text-gray-800'
          }`}>
            Bulut Senkronizasyonu
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {syncStatus.isOnline ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          
          {syncStatus.pendingSync && (
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          )}
        </div>
      </div>

      {/* Son Senkronizasyon Bilgisi */}
      <div className={`text-xs mb-3 flex items-center space-x-1 ${
        theme === 'dark' ? 'text-gray-400' : 
        theme === 'feminine' ? 'text-pink-600' : 'text-gray-600'
      }`}>
        <Calendar className="w-3 h-3" />
        <span>Son senkronizasyon: {formatLastSync(syncStatus.lastSyncDate)}</span>
      </div>

      {/* Sync Seçenekleri */}
      {!showSyncOptions ? (
        <Button
          onClick={() => setShowSyncOptions(true)}
          className={`w-full ${
            theme === 'dark' 
              ? 'bg-purple-600 hover:bg-purple-700' 
              : theme === 'feminine'
              ? 'bg-pink-500 hover:bg-pink-600'
              : 'bg-purple-500 hover:bg-purple-600'
          } text-white`}
          disabled={syncStatus.isSyncing}
        >
          {syncStatus.isSyncing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Senkronize Ediliyor...
            </>
          ) : (
            <>
              <Cloud className="w-4 h-4 mr-2" />
              Senkronize Et
            </>
          )}
        </Button>
      ) : (
        <div className="space-y-2">
          {/* Google Drive'a Yükle */}
          <Button
            onClick={handleUpload}
            variant="outline"
            className={`w-full ${
              theme === 'dark' 
                ? 'border-purple-500 text-purple-400 hover:bg-purple-900/30' 
                : theme === 'feminine'
                ? 'border-pink-300 text-pink-600 hover:bg-pink-50'
                : 'border-purple-300 text-purple-600 hover:bg-purple-50'
            }`}
            disabled={syncStatus.isSyncing || !syncStatus.isOnline}
          >
            <CloudUpload className="w-4 h-4 mr-2" />
            Google Drive'a Yükle
          </Button>

          {/* Google Drive'dan İndir */}
          <Button
            onClick={handleDownload}
            variant="outline"
            className={`w-full ${
              theme === 'dark' 
                ? 'border-green-500 text-green-400 hover:bg-green-900/30' 
                : theme === 'feminine'
                ? 'border-green-300 text-green-600 hover:bg-green-50'
                : 'border-green-300 text-green-600 hover:bg-green-50'
            }`}
            disabled={syncStatus.isSyncing || !syncStatus.isOnline}
          >
            <CloudDownload className="w-4 h-4 mr-2" />
            Google Drive'dan Geri Yükle
          </Button>

          {/* İptal */}
          <Button
            onClick={() => setShowSyncOptions(false)}
            variant="ghost"
            className={`w-full ${
              theme === 'dark' 
                ? 'text-gray-400 hover:bg-gray-700' 
                : theme === 'feminine'
                ? 'text-pink-500 hover:bg-pink-50'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            İptal
          </Button>
        </div>
      )}

      {/* Uyarı mesajları */}
      {!syncStatus.isOnline && (
        <div className={`mt-2 text-xs p-2 rounded ${
          theme === 'dark' 
            ? 'bg-red-900/30 text-red-400' 
            : 'bg-red-50 text-red-600'
        }`}>
          ⚠️ İnternet bağlantısı yok. Senkronizasyon offline olduğunda otomatik yapılacak.
        </div>
      )}

      {syncStatus.pendingSync && syncStatus.isOnline && (
        <div className={`mt-2 text-xs p-2 rounded ${
          theme === 'dark' 
            ? 'bg-orange-900/30 text-orange-400' 
            : 'bg-orange-50 text-orange-600'
        }`}>
          📅 Uzun süredir senkronize edilmedi. Yedeklemeniz önerilir.
        </div>
      )}
    </Card>
  );
};