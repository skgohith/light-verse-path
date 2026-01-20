import { useState, useEffect } from 'react';

interface ReadingStreak {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string | null;
  totalDaysRead: number;
  readDates: string[];
}

const DEFAULT_STREAK: ReadingStreak = {
  currentStreak: 0,
  longestStreak: 0,
  lastReadDate: null,
  totalDaysRead: 0,
  readDates: [],
};

export function useReadingStreak() {
  const [streak, setStreak] = useState<ReadingStreak>(DEFAULT_STREAK);

  useEffect(() => {
    const saved = localStorage.getItem('reading_streak');
    if (saved) {
      const data = JSON.parse(saved);
      // Check if streak should be reset (missed a day)
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      if (data.lastReadDate && data.lastReadDate !== today && data.lastReadDate !== yesterday) {
        // Streak broken - reset current streak but keep longest
        data.currentStreak = 0;
      }
      
      setStreak(data);
    }
  }, []);

  const recordReading = () => {
    const today = new Date().toISOString().split('T')[0];
    
    setStreak(prev => {
      if (prev.lastReadDate === today) {
        return prev; // Already recorded today
      }

      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const isConsecutive = prev.lastReadDate === yesterday || prev.lastReadDate === null;
      
      const newCurrentStreak = isConsecutive ? prev.currentStreak + 1 : 1;
      const newLongestStreak = Math.max(prev.longestStreak, newCurrentStreak);
      
      const updated: ReadingStreak = {
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastReadDate: today,
        totalDaysRead: prev.totalDaysRead + 1,
        readDates: [...prev.readDates.slice(-30), today], // Keep last 30 days
      };
      
      localStorage.setItem('reading_streak', JSON.stringify(updated));
      return updated;
    });
  };

  const hasReadToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return streak.lastReadDate === today;
  };

  const getWeeklyData = () => {
    const today = new Date();
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      weekData.push({
        day: date.toLocaleDateString('en', { weekday: 'short' }),
        date: dateStr,
        read: streak.readDates.includes(dateStr),
      });
    }
    
    return weekData;
  };

  return { streak, recordReading, hasReadToday, getWeeklyData };
}
