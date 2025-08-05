import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, FileText, Archive } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getAllMoodEntries, saveMoodEntry } from '@/utils/moodStorage';
import JSZip from 'jszip';

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
      exportJson: "JSON Yedekle",
      exportZip: "ZIP Yedekle", 
      importData: "Veri Geri Yükle",
      exportSuccess: "Yedekleme başarılı",
      importSuccess: "Geri yükleme başarılı",
      importError: "Geçersiz dosya formatı",
      noData: "Yedeklenecek veri bulunamadı"
    },
    en: {
      title: "Local Backup",
      description: "Backup or restore your mood data to/from your device",
      exportJson: "Export JSON",
      exportZip: "Export ZIP",
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
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `ruh_halim_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(link.href);

      toast({
        title: t.exportSuccess,
        description: `${moodEntries.length} kayıt yedeklendi`
      });
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
        toast({
          title: t.noData,
          variant: "destructive"
        });
        return;
      }

      const zip = new JSZip();
      
      // Ana veri dosyası
      const backupData = {
        version: '2.0',
        exportDate: new Date().toISOString(),
        appName: 'Ruh Halim',
        dataType: 'mood_entries',
        totalEntries: moodEntries.length,
        data: moodEntries
      };
      
      zip.file('mood_data.json', JSON.stringify(backupData, null, 2));
      
      // README dosyası
      const readme = `Ruh Halim Yedekleme Dosyası
Oluşturulma Tarihi: ${new Date().toLocaleString('tr-TR')}
Toplam Kayıt: ${moodEntries.length}

Bu ZIP dosyası içerisinde mood_data.json dosyası bulunmaktadır.
Geri yüklemek için uygulamada "Veri Geri Yükle" butonunu kullanın.`;
      
      zip.file('README.txt', readme);

      const content = await zip.generateAsync({ type: 'blob' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `ruh_halim_backup_${new Date().toISOString().split('T')[0]}.zip`;
      link.click();
      
      URL.revokeObjectURL(link.href);

      toast({
        title: t.exportSuccess,
        description: `${moodEntries.length} kayıt ZIP olarak yedeklendi`
      });
    } catch (error) {
      console.error('ZIP export error:', error);
      toast({
        title: "ZIP yedekleme hatası",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    
    try {
      let backupData: any;
      
      if (file.name.endsWith('.zip')) {
        // ZIP dosyası işleme
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(file);
        const jsonFile = zipContent.file('mood_data.json');
        
        if (!jsonFile) {
          throw new Error('ZIP içinde mood_data.json bulunamadı');
        }
        
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

      // Mevcut verilerle karşılaştırma
      const existingEntries = getAllMoodEntries();
      const importEntries = backupData.data;
      
      // Kullanıcıya sor: Üzerine yaz mı yoksa birleştir mi?
      const shouldOverwrite = confirm(
        `Mevcut cihazda ${existingEntries.length} kayıt var.\n` +
        `Yedek dosyasında ${importEntries.length} kayıt bulundu.\n\n` +
        `"Tamam" = Mevcut verilerin üzerine yaz\n` +
        `"İptal" = Birleştir (yeni tarihleri ekle)`
      );

      if (shouldOverwrite) {
        // Tüm localStorage'ı temizle ve yedek verisini yükle
        localStorage.removeItem('moodEntries');
        for (const entry of importEntries) {
          await saveMoodEntry(entry);
        }
        
        toast({
          title: t.importSuccess,
          description: `${importEntries.length} kayıt geri yüklendi (üzerine yazıldı)`
        });
      } else {
        // Sadece yeni tarihli kayıtları ekle
        const existingDates = new Set(existingEntries.map(e => e.date));
        const newEntries = importEntries.filter((e: any) => !existingDates.has(e.date));
        
        for (const entry of newEntries) {
          await saveMoodEntry(entry);
        }
        
        toast({
          title: t.importSuccess,
          description: `${newEntries.length} yeni kayıt eklendi`
        });
      }
      
      // Sayfayı yenile
      window.location.reload();
      
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: t.importError,
        description: "Dosya formatı desteklenmiyor",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
            onClick={exportAsJSON}
            disabled={isExporting}
            className="flex-1 gap-2"
            variant="outline"
          >
            <FileText className="h-4 w-4" />
            {t.exportJson}
          </Button>
          
          <Button
            onClick={exportAsZIP}
            disabled={isExporting}
            className="flex-1 gap-2"
            variant="outline"
          >
            <Archive className="h-4 w-4" />
            {t.exportZip}
          </Button>
        </div>
        
        <Button
          onClick={() => fileInputRef.current?.click()}
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