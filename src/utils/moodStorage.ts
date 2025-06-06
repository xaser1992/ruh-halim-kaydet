interface MoodEntry {
  date: string;
  mood: string;
  note?: string;
  images?: string[];
  timestamp: string;
}

interface MoodDraft {
  date: string;
  mood?: string;
  note?: string;
  images?: string[];
}

const STORAGE_KEY = 'ruh-halim-entries';
const DRAFT_STORAGE_KEY = 'ruh-halim-drafts';

// Gelişmiş resim sıkıştırma fonksiyonu
const compressImage = (base64: string, maxSizeKB: number = 300): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Boyutu azalt
      const maxWidth = 800;
      const maxHeight = 600;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = height * (maxWidth / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = width * (maxHeight / height);
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Resmi çiz
      ctx!.drawImage(img, 0, 0, width, height);
      
      // Kaliteyi ayarla
      let quality = 0.8;
      let compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      
      // Boyut kontrolü ve kalite ayarı
      while (compressedBase64.length > maxSizeKB * 1024 * 1.37 && quality > 0.1) {
        quality -= 0.1;
        compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      }
      
      resolve(compressedBase64);
    };
    img.src = base64;
  });
};

export const saveMoodEntry = async (entry: MoodEntry): Promise<void> => {
  try {
    console.log('Saving mood entry:', entry);
    
    // Resimleri sıkıştır
    if (entry.images && entry.images.length > 0) {
      console.log('Compressing images...');
      const compressedImages = [];
      for (const img of entry.images) {
        try {
          const compressed = await compressImage(img, 250);
          compressedImages.push(compressed);
          console.log('Image compressed successfully');
        } catch (error) {
          console.error('Error compressing image:', error);
          // Sıkıştırma başarısız olursa orijinali kullan ama kırp
          const fallback = img.length > 100000 ? img.substring(0, 100000) : img;
          compressedImages.push(fallback);
        }
      }
      entry.images = compressedImages;
      console.log('All images processed, count:', entry.images.length);
    }
    
    const existingEntries = getAllMoodEntries();
    const updatedEntries = existingEntries.filter(e => e.date !== entry.date);
    updatedEntries.push(entry);
    
    const dataToStore = JSON.stringify(updatedEntries);
    console.log('Data size to store (KB):', Math.round(dataToStore.length / 1024));
    
    // localStorage limitini kontrol et
    try {
      localStorage.setItem(STORAGE_KEY, dataToStore);
      console.log('Successfully saved to localStorage');
    } catch (storageError: any) {
      console.error('localStorage error:', storageError);
      
      // Eğer localStorage dolu ise, eski kayıtları temizle
      if (storageError.name === 'QuotaExceededError') {
        console.log('Storage quota exceeded, cleaning old entries...');
        
        // Önce resim sayısını azalt
        const entriesWithLessImages = updatedEntries.map(e => ({
          ...e,
          images: e.images ? e.images.slice(0, 2) : []
        }));
        
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(entriesWithLessImages));
          console.log('Reduced images per entry to 2');
        } catch {
          // Hala çok büyükse son 5 kayıt
          const recentEntries = entriesWithLessImages.slice(-5);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(recentEntries));
          console.log('Kept only recent 5 entries');
        }
      } else {
        throw storageError;
      }
    }
    
    // Kayıt işlemini doğrula
    const verification = getMoodEntry(entry.date);
    if (!verification) {
      throw new Error('Entry was not saved properly');
    }
    console.log('Entry saved and verified successfully');
    
  } catch (error) {
    console.error('Error saving mood entry:', error);
    throw error;
  }
};

export const getMoodEntry = (date: string): MoodEntry | null => {
  try {
    const entries = getAllMoodEntries();
    const found = entries.find(entry => entry.date === date) || null;
    console.log(`Getting entry for ${date}:`, found);
    return found;
  } catch (error) {
    console.error('Error getting mood entry:', error);
    return null;
  }
};

export const getAllMoodEntries = (): MoodEntry[] => {
  try {
    const entries = localStorage.getItem(STORAGE_KEY);
    const parsed = entries ? JSON.parse(entries) : [];
    console.log('All entries loaded:', parsed.length);
    return parsed;
  } catch (error) {
    console.error('Error getting all mood entries:', error);
    return [];
  }
};

export const deleteMoodEntry = (date: string): void => {
  try {
    const entries = getAllMoodEntries();
    const filteredEntries = entries.filter(entry => entry.date !== date);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEntries));
    console.log(`Deleted entry for ${date}`);
  } catch (error) {
    console.error('Error deleting mood entry:', error);
  }
};

export const saveDraft = (draft: MoodDraft): void => {
  try {
    const existingDrafts = getAllDrafts();
    const updatedDrafts = existingDrafts.filter(d => d.date !== draft.date);
    updatedDrafts.push(draft);
    
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(updatedDrafts));
  } catch (error) {
    console.error('Error saving draft:', error);
  }
};

export const getDraft = (date: string): MoodDraft | null => {
  try {
    const drafts = getAllDrafts();
    return drafts.find(draft => draft.date === date) || null;
  } catch (error) {
    console.error('Error getting draft:', error);
    return null;
  }
};

export const getAllDrafts = (): MoodDraft[] => {
  try {
    const drafts = localStorage.getItem(DRAFT_STORAGE_KEY);
    return drafts ? JSON.parse(drafts) : [];
  } catch (error) {
    console.error('Error getting all drafts:', error);
    return [];
  }
};

export const clearDraft = (date: string): void => {
  try {
    const drafts = getAllDrafts();
    const filteredDrafts = drafts.filter(draft => draft.date !== date);
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(filteredDrafts));
  } catch (error) {
    console.error('Error clearing draft:', error);
  }
};
