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

export const saveMoodEntry = (entry: MoodEntry): void => {
  try {
    const existingEntries = getAllMoodEntries();
    const updatedEntries = existingEntries.filter(e => e.date !== entry.date);
    updatedEntries.push(entry);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
  } catch (error) {
    console.error('Error saving mood entry:', error);
  }
};

export const getMoodEntry = (date: string): MoodEntry | null => {
  try {
    const entries = getAllMoodEntries();
    return entries.find(entry => entry.date === date) || null;
  } catch (error) {
    console.error('Error getting mood entry:', error);
    return null;
  }
};

export const getAllMoodEntries = (): MoodEntry[] => {
  try {
    const entries = localStorage.getItem(STORAGE_KEY);
    return entries ? JSON.parse(entries) : [];
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
