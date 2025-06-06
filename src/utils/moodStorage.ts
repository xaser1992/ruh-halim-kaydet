
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

// Resim boyutunu kontrol et ve gerekirse sıkıştır
const compressImage = (base64: string, maxSizeKB: number = 500): string => {
  const sizeInKB = (base64.length * 3) / 4 / 1024; // Base64 boyutunu tahmin et
  
  if (sizeInKB <= maxSizeKB) {
    return base64;
  }
  
  // Basit sıkıştırma - eğer çok büyükse kırp
  const compressionRatio = maxSizeKB / sizeInKB;
  const targetLength = Math.floor(base64.length * compressionRatio);
  
  return base64.substring(0, targetLength);
};

export const saveMoodEntry = (entry: MoodEntry): void => {
  try {
    console.log('Saving mood entry:', entry);
    
    // Resimleri sıkıştır
    if (entry.images && entry.images.length > 0) {
      entry.images = entry.images.map(img => compressImage(img, 400));
      console.log('Compressed images, new count:', entry.images.length);
    }
    
    const existingEntries = getAllMoodEntries();
    const updatedEntries = existingEntries.filter(e => e.date !== entry.date);
    updatedEntries.push(entry);
    
    const dataToStore = JSON.stringify(updatedEntries);
    console.log('Data size to store (KB):', dataToStore.length / 1024);
    
    // localStorage limitini kontrol et
    try {
      localStorage.setItem(STORAGE_KEY, dataToStore);
      console.log('Successfully saved to localStorage');
    } catch (storageError) {
      console.error('localStorage error:', storageError);
      
      // Eğer localStorage dolu ise, eski kayıtları temizle
      if (storageError.name === 'QuotaExceededError') {
        console.log('Storage quota exceeded, cleaning old entries...');
        const recentEntries = updatedEntries.slice(-10); // Son 10 kayıt
        localStorage.setItem(STORAGE_KEY, JSON.stringify(recentEntries));
        console.log('Cleaned storage, kept recent 10 entries');
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

// Taslak kaydetme fonksiyonları
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
