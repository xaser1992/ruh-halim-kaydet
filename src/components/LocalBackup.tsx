import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Archive } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getAllMoodEntries, saveMoodEntry } from '@/utils/moodStorage';
import JSZip from 'jszip';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { FilePicker } from '@capawesome/capacitor-file-picker';

const isNative = () => Capacitor.isNativePlatform();

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const saveTextToDownloadsNative = async (filename: string, text: string) => {
  await Filesystem.writeFile({
    path: `Download/${filename}`,
    data: btoa(unescape(encodeURIComponent(text))),
    directory: Directory.ExternalStorage,
    recursive: true
  });
};

const saveBlobToDownloadsNative = async (filename: string, blob: Blob) => {
  const base64 = await blobToBase64(blob);
  await Filesystem.writeFile({
    path: `Download/${filename}`,
    data: base64,
    directory: Directory.ExternalStorage,
    recursive: true
  });
};
interface LocalBackupProps {
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru';
  theme: 'light' | 'dark' | 'feminine';
}

export const LocalBackup = ({ language, theme }: LocalBackupProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const texts = {
    tr: {
      title: "Yerel Yedekleme",
      description: "Günlük verilerinizi cihazınıza yedekleyin veya geri yükleyin",
      backup: "Yedekle",
      importData: "Veri Geri Yükle",
      exportSuccess: "Yedekleme başarılı",
      importSuccess: "Geri yükleme başarılı",
      importError: "Geçersiz dosya formatı",
      noData: "Yedeklenecek veri bulunamadı"
    },
    en: {
      title: "Local Backup",
      description: "Backup or restore your mood data to/from your device",
      backup: "Backup",
      importData: "Import Data", 
      exportSuccess: "Export successful",
      importSuccess: "Import successful",
      importError: "Invalid file format",
      noData: "No data to backup"
    }
  };

  const t = texts[language] || texts.tr;

  const exportAsJSON = async () => {
    setIsExporting(true);
    try {
      const moodEntries = getAllMoodEntries();
      
      if (moodEntries.length === 0) {
        toast({
          title: t.noData,
          variant: "destructive"
        });
        return;
      }

      const backupData = {
        version: '2.0',
        exportDate: new Date().toISOString(),
        appName: 'Ruh Halim',
        dataType: 'mood_entries',
        totalEntries: moodEntries.length,
        data: moodEntries
      };

      const dataStr = JSON.stringify(backupData, null, 2);

      const filename = `ruh_halim_backup_${new Date().toISOString().split('T')[0]}.json`;
      if (isNative()) {
        await saveTextToDownloadsNative(filename, dataStr);
        toast({ title: t.exportSuccess, description: `Downloads klasörüne kaydedildi` });
      } else {
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
        toast({ title: t.exportSuccess, description: `${moodEntries.length} kayıt yedeklendi` });
      }
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Yedekleme hatası",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsZIP = async () => {
    setIsExporting(true);
    try {
      const moodEntries = getAllMoodEntries();
      
      if (moodEntries.length === 0) {
        toast({ title: t.noData, variant: "destructive" });
        return;
      }

      const zip = new JSZip();
      const imagesFolder = zip.folder('images');

      // JSON için entries'i kopyala ve image'leri dosya adına çevir
      const entriesForJson = moodEntries.map((entry) => {
        const images = (entry.images || []).map((img, idx) => {
          if (!img.startsWith('data:')) return img; // zaten dosya adıysa
          const match = img.match(/^data:(image\/(\w+));base64,(.*)$/);
          const extRaw = match?.[2] || 'png';
          const ext = extRaw === 'jpeg' ? 'jpg' : extRaw;
          const base64 = match?.[3] || '';
          const safeDate = entry.date.replace(/[^0-9A-Za-z_-]/g, '_');
          const filename = `${safeDate}_${idx}.${ext}`;
          imagesFolder?.file(filename, base64, { base64: true });
          return `images/${filename}`;
        });
        return { ...entry, images };
      });

      const backupData = {
        version: '2.0',
        exportDate: new Date().toISOString(),
        appName: 'Ruh Halim',
        dataType: 'mood_entries',
        totalEntries: moodEntries.length,
        data: entriesForJson
      };

      zip.file('mood_data.json', JSON.stringify(backupData, null, 2));
      const readme = `Ruh Halim Yedekleme Dosyası\nOluşturulma Tarihi: ${new Date().toLocaleString('tr-TR')}\nToplam Kayıt: ${moodEntries.length}\n\nTüm fotoğraflar images/ klasöründedir.`;
      zip.file('README.txt', readme);

      const blob = await zip.generateAsync({ type: 'blob' });
      const filename = `ruh_halim_backup_${new Date().toISOString().split('T')[0]}.zip`;

      if (isNative()) {
        await saveBlobToDownloadsNative(filename, blob);
        toast({ title: t.exportSuccess, description: `Downloads klasörüne kaydedildi` });
      } else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
        toast({ title: t.exportSuccess, description: `${moodEntries.length} kayıt ZIP olarak yedeklendi` });
      }
    } catch (error) {
      console.error('ZIP export error:', error);
      toast({ title: "ZIP yedekleme hatası", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleNativeImport = async () => {
    try {
      setIsImporting(true);
      const result = await FilePicker.pickFiles({ types: ['application/zip','application/json'], multiple: false, readData: true } as any);
      const file: any = (result as any).files?.[0];
      if (!file) return;

      let backupData: any;
      let zipContent: JSZip | null = null;

      const readBase64 = async (): Promise<string> => {
        // @ts-ignore
        if (file.data) return file.data as string;
        // @ts-ignore
        if (file.path) {
          // @ts-ignore
          const read = await Filesystem.readFile({ path: file.path as string });
          return read.data;
        }
        throw new Error('Seçilen dosya okunamadı');
      };

      const base64 = await readBase64();
      const toBlob = (b64: string, mime: string) => {
        const byteChars = atob(b64);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
          byteNumbers[i] = byteChars.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], { type: mime });
      };

      // @ts-ignore
      if (file.mimeType?.includes('zip') || file.name?.toLowerCase().endsWith('.zip')) {
        const blob = toBlob(base64, 'application/zip');
        const zip = new JSZip();
        zipContent = await zip.loadAsync(blob);
        const jsonFile = zipContent.file('mood_data.json');
        if (!jsonFile) throw new Error('ZIP içinde mood_data.json bulunamadı');
        const jsonContent = await jsonFile.async('string');
        backupData = JSON.parse(jsonContent);
      } else {
        const jsonText = decodeURIComponent(escape(atob(base64)));
        backupData = JSON.parse(jsonText);
      }

      if (!backupData.data || !Array.isArray(backupData.data)) {
        throw new Error('Geçersiz veri formatı');
      }

      if (zipContent) {
        for (const entry of backupData.data) {
          if (Array.isArray(entry.images)) {
            const newImages: string[] = [];
            for (const imgRef of entry.images) {
              if (typeof imgRef === 'string' && !imgRef.startsWith('data:')) {
                const fileInZip = zipContent.file(imgRef.startsWith('images/') ? imgRef : `images/${imgRef}`);
                if (fileInZip) {
                  const imgBase64 = await fileInZip.async('base64');
                  const ext = (imgRef.split('.').pop() || 'png').toLowerCase();
                  const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
                  newImages.push(`data:${mime};base64,${imgBase64}`);
                }
              } else if (typeof imgRef === 'string' && imgRef.startsWith('data:')) {
                newImages.push(imgRef);
              }
            }
            entry.images = newImages;
          }
        }
      }

      const existingEntries = getAllMoodEntries();
      const importEntries = backupData.data;

      const shouldOverwrite = confirm(
        `Mevcut cihazda ${existingEntries.length} kayıt var.\n` +
        `Yedek dosyasında ${importEntries.length} kayıt bulundu.\n\n` +
        `"Tamam" = Mevcut verilerin üzerine yaz\n` +
        `"İptal" = Birleştir (yeni tarihleri ekle)`
      );

      if (shouldOverwrite) {
        localStorage.removeItem('moodEntries');
        for (const entry of importEntries) {
          await saveMoodEntry(entry);
        }
        toast({ title: t.importSuccess, description: `${importEntries.length} kayıt geri yüklendi (üzerine yazıldı)` });
      } else {
        const existingDates = new Set(existingEntries.map(e => e.date));
        const newEntries = importEntries.filter((e: any) => !existingDates.has(e.date));
        for (const entry of newEntries) {
          await saveMoodEntry(entry);
        }
        toast({ title: t.importSuccess, description: `${newEntries.length} yeni kayıt eklendi` });
      }

      window.location.reload();

    } catch (error) {
      console.error('Native import error:', error);
      toast({ title: t.importError, description: "Dosya seçilemedi", variant: "destructive" });
    } finally {
      setIsImporting(false);
    }
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    try {
      let backupData: any;
      let zipContent: JSZip | null = null;
      
      if (file.name.endsWith('.zip')) {
        // ZIP dosyası işleme
        const zip = new JSZip();
        zipContent = await zip.loadAsync(file);
        const jsonFile = zipContent.file('mood_data.json');
        if (!jsonFile) throw new Error('ZIP içinde mood_data.json bulunamadı');
        const jsonContent = await jsonFile.async('string');
        backupData = JSON.parse(jsonContent);
      } else {
        // JSON dosyası işleme
        const text = await file.text();
        backupData = JSON.parse(text);
      }

      if (!backupData.data || !Array.isArray(backupData.data)) {
        throw new Error('Geçersiz veri formatı');
      }

      // ZIP ise, görüntü dosyalarını data URL'e çevir
      if (zipContent) {
        for (const entry of backupData.data) {
          if (Array.isArray(entry.images)) {
            const newImages: string[] = [];
            for (const imgRef of entry.images) {
              if (typeof imgRef === 'string' && !imgRef.startsWith('data:')) {
                // images/ klasörü içindeki dosya
                const fileInZip = zipContent.file(imgRef.startsWith('images/') ? imgRef : `images/${imgRef}`);
                if (fileInZip) {
                  const base64 = await fileInZip.async('base64');
                  const ext = (imgRef.split('.').pop() || 'png').toLowerCase();
                  const mime = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
                  newImages.push(`data:${mime};base64,${base64}`);
                }
              } else if (typeof imgRef === 'string' && imgRef.startsWith('data:')) {
                newImages.push(imgRef);
              }
            }
            entry.images = newImages;
          }
        }
      }

      // Mevcut verilerle karşılaştırma
      const existingEntries = getAllMoodEntries();
      const importEntries = backupData.data;
      
      const shouldOverwrite = confirm(
        `Mevcut cihazda ${existingEntries.length} kayıt var.\n` +
        `Yedek dosyasında ${importEntries.length} kayıt bulundu.\n\n` +
        `"Tamam" = Mevcut verilerin üzerine yaz\n` +
        `"İptal" = Birleştir (yeni tarihleri ekle)`
      );

      if (shouldOverwrite) {
        localStorage.removeItem('moodEntries');
        for (const entry of importEntries) {
          await saveMoodEntry(entry);
        }
        toast({ title: t.importSuccess, description: `${importEntries.length} kayıt geri yüklendi (üzerine yazıldı)` });
      } else {
        const existingDates = new Set(existingEntries.map(e => e.date));
        const newEntries = importEntries.filter((e: any) => !existingDates.has(e.date));
        for (const entry of newEntries) {
          await saveMoodEntry(entry);
        }
        toast({ title: t.importSuccess, description: `${newEntries.length} yeni kayıt eklendi` });
      }
      
      window.location.reload();
      
    } catch (error) {
      console.error('Import error:', error);
      toast({ title: t.importError, description: "Dosya formatı desteklenmiyor", variant: "destructive" });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const themeClasses = {
    light: 'bg-white border-gray-200',
    dark: 'bg-gray-800 border-gray-700',
    feminine: 'bg-pink-50 border-pink-200'
  };

  return (
    <Card className={`w-full max-w-md mx-auto ${themeClasses[theme]}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Archive className="h-5 w-5" />
          {t.title}
        </CardTitle>
        <CardDescription>
          {t.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            onClick={exportAsZIP}
            disabled={isExporting}
            className="w-full gap-2"
            variant="outline"
          >
            <Archive className="h-4 w-4" />
            {t.backup || 'Yedekle'}
          </Button>
        </div>
        
        <Button
          onClick={() => isNative() ? handleNativeImport() : fileInputRef.current?.click()}
          disabled={isImporting}
          className="w-full gap-2"
        >
          <Upload className="h-4 w-4" />
          {t.importData}
        </Button>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.zip"
          onChange={importData}
          className="hidden"
        />
      </CardContent>
    </Card>
  );
};