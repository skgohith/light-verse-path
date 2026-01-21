import { useState, useEffect, useCallback } from 'react';

interface AzkarSettings {
  morningEnabled: boolean;
  eveningEnabled: boolean;
  morningTime: string;
  eveningTime: string;
  lastMorningNotified: string | null;
  lastEveningNotified: string | null;
}

interface ReadingGoalSettings {
  enabled: boolean;
  dailyGoal: number; // pages or ayahs
  reminderTime: string;
  lastNotified: string | null;
}

interface ExpandedNotificationSettings {
  azkar: AzkarSettings;
  readingGoal: ReadingGoalSettings;
}

const DEFAULT_SETTINGS: ExpandedNotificationSettings = {
  azkar: {
    morningEnabled: false,
    eveningEnabled: false,
    morningTime: '06:00',
    eveningTime: '18:00',
    lastMorningNotified: null,
    lastEveningNotified: null,
  },
  readingGoal: {
    enabled: false,
    dailyGoal: 5,
    reminderTime: '20:00',
    lastNotified: null,
  },
};

const MORNING_AZKAR = [
  "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ",
  "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا",
  "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذَا الْيَوْمِ",
];

const EVENING_AZKAR = [
  "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ",
  "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا",
  "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذِهِ اللَّيْلَةِ",
];

export function useExpandedNotifications() {
  const [settings, setSettings] = useState<ExpandedNotificationSettings>(DEFAULT_SETTINGS);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    const saved = localStorage.getItem('expanded_notifications');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
    
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('expanded_notifications', JSON.stringify(settings));
  }, [settings]);

  const requestPermission = async () => {
    if (!('Notification' in window)) return false;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  };

  // Azkar toggles
  const toggleMorningAzkar = async (enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return;
    }
    setSettings(prev => ({
      ...prev,
      azkar: { ...prev.azkar, morningEnabled: enabled }
    }));
  };

  const toggleEveningAzkar = async (enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return;
    }
    setSettings(prev => ({
      ...prev,
      azkar: { ...prev.azkar, eveningEnabled: enabled }
    }));
  };

  const setMorningTime = (time: string) => {
    setSettings(prev => ({
      ...prev,
      azkar: { ...prev.azkar, morningTime: time }
    }));
  };

  const setEveningTime = (time: string) => {
    setSettings(prev => ({
      ...prev,
      azkar: { ...prev.azkar, eveningTime: time }
    }));
  };

  // Reading goal
  const toggleReadingGoal = async (enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return;
    }
    setSettings(prev => ({
      ...prev,
      readingGoal: { ...prev.readingGoal, enabled }
    }));
  };

  const setDailyGoal = (goal: number) => {
    setSettings(prev => ({
      ...prev,
      readingGoal: { ...prev.readingGoal, dailyGoal: goal }
    }));
  };

  const setReadingReminderTime = (time: string) => {
    setSettings(prev => ({
      ...prev,
      readingGoal: { ...prev.readingGoal, reminderTime: time }
    }));
  };

  // Send notifications
  const sendMorningAzkar = useCallback(() => {
    if (permission !== 'granted') return;
    const randomAzkar = MORNING_AZKAR[Math.floor(Math.random() * MORNING_AZKAR.length)];
    new Notification('Morning Azkar ☀️', {
      body: randomAzkar,
      icon: '/pwa-192x192.png',
      tag: 'morning-azkar',
    });
    setSettings(prev => ({
      ...prev,
      azkar: { ...prev.azkar, lastMorningNotified: new Date().toDateString() }
    }));
  }, [permission]);

  const sendEveningAzkar = useCallback(() => {
    if (permission !== 'granted') return;
    const randomAzkar = EVENING_AZKAR[Math.floor(Math.random() * EVENING_AZKAR.length)];
    new Notification('Evening Azkar 🌙', {
      body: randomAzkar,
      icon: '/pwa-192x192.png',
      tag: 'evening-azkar',
    });
    setSettings(prev => ({
      ...prev,
      azkar: { ...prev.azkar, lastEveningNotified: new Date().toDateString() }
    }));
  }, [permission]);

  const sendReadingReminder = useCallback(() => {
    if (permission !== 'granted') return;
    new Notification('Daily Quran Reading 📖', {
      body: `Don't forget your daily goal of ${settings.readingGoal.dailyGoal} pages!`,
      icon: '/pwa-192x192.png',
      tag: 'reading-goal',
    });
    setSettings(prev => ({
      ...prev,
      readingGoal: { ...prev.readingGoal, lastNotified: new Date().toDateString() }
    }));
  }, [permission, settings.readingGoal.dailyGoal]);

  // Schedule notifications
  useEffect(() => {
    if (permission !== 'granted') return;

    const checkSchedule = () => {
      const now = new Date();
      const today = now.toDateString();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      // Morning azkar
      if (settings.azkar.morningEnabled && 
          settings.azkar.lastMorningNotified !== today &&
          currentTime === settings.azkar.morningTime) {
        sendMorningAzkar();
      }

      // Evening azkar
      if (settings.azkar.eveningEnabled && 
          settings.azkar.lastEveningNotified !== today &&
          currentTime === settings.azkar.eveningTime) {
        sendEveningAzkar();
      }

      // Reading goal
      if (settings.readingGoal.enabled && 
          settings.readingGoal.lastNotified !== today &&
          currentTime === settings.readingGoal.reminderTime) {
        sendReadingReminder();
      }
    };

    checkSchedule();
    const interval = setInterval(checkSchedule, 60000);
    return () => clearInterval(interval);
  }, [settings, permission, sendMorningAzkar, sendEveningAzkar, sendReadingReminder]);

  return {
    settings,
    permission,
    toggleMorningAzkar,
    toggleEveningAzkar,
    setMorningTime,
    setEveningTime,
    toggleReadingGoal,
    setDailyGoal,
    setReadingReminderTime,
    sendMorningAzkar,
    sendEveningAzkar,
    sendReadingReminder,
    supported: 'Notification' in window,
  };
}
