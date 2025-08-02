import { useState, useCallback } from 'react';
import { Network } from '@capacitor/network';
import { googleDriveService } from '@/services/googleDriveService';
import { getAllMoodEntries, saveMoodEntry } from '@/utils/moodStorage';
import { toast } from '@/hooks/use-toast';

interface SyncStatus {
  isOnline: boolean;
  lastSyncDate: Date | null;
  isSyncing: boolean;
  pendingSync: boolean;
}

export const useMoodSync = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    lastSyncDate: null,
    isSyncing: false,
    pendingSync: false
  });

  // Network durumu kontrol et
  const checkNetworkStatus = useCallback(async () => {
    const status = await Network.getStatus();
    setSyncStatus(prev => ({ ...prev, isOnline: status.connected }));
    return status.connected;
  }, []);

  // Son senkronizasyon tarihini yükle
  const loadLastSyncDate = useCallback(async () => {
    try {
      const lastSync = await googleDriveService.getLastSyncDate();
      setSyncStatus(prev => ({ ...prev, lastSyncDate: lastSync }));
    } catch (error) {
      console.error('Last sync date loading failed:', error);
    }
  }, []);

  // Google Drive'a yükle
  const uploadToGoogleDrive = useCallback(async (): Promise<boolean> => {
    setSyncStatus(prev => ({ ...prev, isSyncing: true }));
    
    try {
      const result = await googleDriveService.uploadMoodData();
      
      if (result.success) {
        setSyncStatus(prev => ({ 
          ...prev, 
          lastSyncDate: new Date(),
          pendingSync: false
        }));
        
        toast({
          title: "Senkronizasyon Başarılı",
          description: "Günlük verileriniz Google Drive'a yüklendi."
        });
        
        return true;
      } else {
        toast({
          title: "Senkronizasyon Hatası",
          description: result.error || "Bilinmeyen hata",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Senkronizasyon Hatası", 
        description: "Google Drive'a yükleme başarısız",
        variant: "destructive"
      });
      return false;
    } finally {
      setSyncStatus(prev => ({ ...prev, isSyncing: false }));
    }
  }, []);

  // Google Drive'dan indir ve geri yükle
  const downloadFromGoogleDrive = useCallback(async (): Promise<boolean> => {
    setSyncStatus(prev => ({ ...prev, isSyncing: true }));
    
    try {
      const result = await googleDriveService.downloadMoodData();
      
      if (result.success && result.data) {
        // Mevcut verilerle conflict kontrolü
        const localEntries = getAllMoodEntries();
        const cloudEntries = result.data.data || [];
        
        // Kullanıcıya sor: Üzerine yaz mı yoksa birleştir mi?
        const shouldOverwrite = confirm(
          `Yerel cihazınızda ${localEntries.length} kayıt var.\n` +
          `Google Drive'da ${cloudEntries.length} kayıt bulundu.\n\n` +
          `"Tamam" = Bulut verisiyle değiştir\n` +
          `"İptal" = Birleştir`
        );
        
        if (shouldOverwrite) {
          // Tüm local storage'ı temizle ve cloud verisini yükle
          localStorage.removeItem('moodEntries');
          for (const entry of cloudEntries) {
            await saveMoodEntry(entry);
          }
        } else {
          // Sadece yeni olan entries'i ekle
          const existingDates = new Set(localEntries.map(e => e.date));
          const newEntries = cloudEntries.filter(e => !existingDates.has(e.date));
          
          for (const entry of newEntries) {
            await saveMoodEntry(entry);
          }
        }
        
        setSyncStatus(prev => ({ 
          ...prev, 
          lastSyncDate: new Date()
        }));
        
        toast({
          title: "Geri Yükleme Başarılı",
          description: `${shouldOverwrite ? cloudEntries.length : cloudEntries.filter(e => !getAllMoodEntries().map(local => local.date).includes(e.date)).length} kayıt geri yüklendi.`
        });
        
        return true;
      } else {
        toast({
          title: "Geri Yükleme Hatası",
          description: result.error || "Google Drive'da yedek bulunamadı",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Geri Yükleme Hatası",
        description: "Google Drive'dan indirme başarısız",
        variant: "destructive"
      });
      return false;
    } finally {
      setSyncStatus(prev => ({ ...prev, isSyncing: false }));
    }
  }, []);

  // Otomatik senkronizasyon (app başlangıcında)
  const autoSync = useCallback(async () => {
    const isOnline = await checkNetworkStatus();
    if (!isOnline) return;

    try {
      await loadLastSyncDate();
      
      // Eğer 7 günden eski senkronizasyon varsa otomatik senkronize et
      const lastSync = await googleDriveService.getLastSyncDate();
      const daysSinceLastSync = lastSync 
        ? (Date.now() - lastSync.getTime()) / (1000 * 60 * 60 * 24)
        : Infinity;
      
      if (daysSinceLastSync > 7) {
        setSyncStatus(prev => ({ ...prev, pendingSync: true }));
      }
    } catch (error) {
      console.error('Auto sync check failed:', error);
    }
  }, [checkNetworkStatus, loadLastSyncDate]);

  return {
    syncStatus,
    uploadToGoogleDrive,
    downloadFromGoogleDrive,
    autoSync,
    checkNetworkStatus,
    loadLastSyncDate
  };
};