import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return [storedValue, setValue] as const;
}

export function useReadingProgress() {
  const [progress, setProgress] = useLocalStorage<{
    surahNumber: number;
    ayahNumber: number;
    timestamp: number;
  } | null>('quran-reading-progress', null);

  const updateProgress = (surahNumber: number, ayahNumber: number) => {
    setProgress({
      surahNumber,
      ayahNumber,
      timestamp: Date.now()
    });
  };

  return { progress, updateProgress };
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useLocalStorage<Array<{
    id: string;
    surahNumber: number;
    ayahNumber: number;
    surahName: string;
    ayahText: string;
    timestamp: number;
  }>>('quran-bookmarks', []);

  const addBookmark = (surahNumber: number, ayahNumber: number, surahName: string, ayahText: string) => {
    const id = `${surahNumber}-${ayahNumber}`;
    if (!bookmarks.find(b => b.id === id)) {
      setBookmarks([...bookmarks, {
        id,
        surahNumber,
        ayahNumber,
        surahName,
        ayahText,
        timestamp: Date.now()
      }]);
    }
  };

  const removeBookmark = (id: string) => {
    setBookmarks(bookmarks.filter(b => b.id !== id));
  };

  const isBookmarked = (surahNumber: number, ayahNumber: number) => {
    return bookmarks.some(b => b.id === `${surahNumber}-${ayahNumber}`);
  };

  return { bookmarks, addBookmark, removeBookmark, isBookmarked };
}
