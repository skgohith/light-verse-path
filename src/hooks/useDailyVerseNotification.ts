import { useState, useEffect, useCallback } from 'react';

interface DailyVerseSettings {
  enabled: boolean;
  scheduledTime: string; // HH:mm format
  lastNotifiedDate: string | null;
}

const DEFAULT_SETTINGS: DailyVerseSettings = {
  enabled: false,
  scheduledTime: '08:00',
  lastNotifiedDate: null,
};

export function useDailyVerseNotification() {
  const [settings, setSettings] = useState<DailyVerseSettings>(DEFAULT_SETTINGS);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    const saved = localStorage.getItem('daily_verse_notifications');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
    
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('daily_verse_notifications', JSON.stringify(settings));
  }, [settings]);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      return false;
    }
    
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  };

  const toggleNotifications = async (enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return;
    }
    setSettings(prev => ({ ...prev, enabled }));
  };

  const setScheduledTime = (time: string) => {
    setSettings(prev => ({ ...prev, scheduledTime: time }));
  };

  const fetchRandomVerse = async (): Promise<{ arabic: string; translation: string; surah: string; ayah: number } | null> => {
    try {
      const randomAyah = Math.floor(Math.random() * 6236) + 1;
      const [arabicRes, translationRes] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/ayah/${randomAyah}/ar.alafasy`),
        fetch(`https://api.alquran.cloud/v1/ayah/${randomAyah}/en.asad`)
      ]);
      
      const arabicData = await arabicRes.json();
      const translationData = await translationRes.json();
      
      if (arabicData.code === 200 && translationData.code === 200) {
        return {
          arabic: arabicData.data.text,
          translation: translationData.data.text,
          surah: arabicData.data.surah.englishName,
          ayah: arabicData.data.numberInSurah
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch verse:', error);
      return null;
    }
  };

  const sendVerseNotification = useCallback(async () => {
    if (permission !== 'granted') return;
    
    const verse = await fetchRandomVerse();
    if (!verse) return;

    const truncatedTranslation = verse.translation.length > 100 
      ? verse.translation.substring(0, 100) + '...' 
      : verse.translation;

    new Notification('Daily Quran Verse', {
      body: `${truncatedTranslation}\n\n— ${verse.surah} ${verse.ayah}`,
      icon: '/pwa-192x192.png',
      tag: 'daily-verse',
    });

    setSettings(prev => ({
      ...prev,
      lastNotifiedDate: new Date().toDateString()
    }));
  }, [permission]);

  // Check and send notification at scheduled time
  useEffect(() => {
    if (!settings.enabled || permission !== 'granted') return;

    const checkSchedule = () => {
      const now = new Date();
      const today = now.toDateString();
      
      // Already notified today
      if (settings.lastNotifiedDate === today) return;

      const [scheduledHour, scheduledMinute] = settings.scheduledTime.split(':').map(Number);
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Check if it's time to send notification
      if (currentHour === scheduledHour && currentMinute === scheduledMinute) {
        sendVerseNotification();
      }
    };

    // Check immediately
    checkSchedule();
    
    // Check every minute
    const interval = setInterval(checkSchedule, 60000);
    return () => clearInterval(interval);
  }, [settings.enabled, settings.scheduledTime, settings.lastNotifiedDate, permission, sendVerseNotification]);

  return {
    settings,
    permission,
    toggleNotifications,
    setScheduledTime,
    sendVerseNotification,
    supported: 'Notification' in window,
  };
}
