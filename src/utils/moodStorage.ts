
interface MoodEntry {
  date: string;
  mood: string;
  note?: string;
  timestamp: string;
}

const STORAGE_KEY = 'ruh-halim-entries';

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
