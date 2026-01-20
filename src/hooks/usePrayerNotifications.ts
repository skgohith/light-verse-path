import { useState, useEffect } from 'react';
import { usePrayerTimes } from './usePrayerTimes';

interface NotificationSettings {
  enabled: boolean;
  minutesBefore: number;
  prayers: {
    Fajr: boolean;
    Dhuhr: boolean;
    Asr: boolean;
    Maghrib: boolean;
    Isha: boolean;
  };
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: false,
  minutesBefore: 10,
  prayers: {
    Fajr: true,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: true,
  },
};

export function usePrayerNotifications() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const { prayerTimes, nextPrayer } = usePrayerTimes();

  useEffect(() => {
    const saved = localStorage.getItem('prayer_notifications');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
    
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('prayer_notifications', JSON.stringify(settings));
  }, [settings]);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      return false;
    }
    
    const result = await Notification.requestPermission();
    setPermission(result);
    
    if (result === 'granted') {
      setSettings(prev => ({ ...prev, enabled: true }));
      return true;
    }
    return false;
  };

  const toggleNotifications = async (enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return;
    }
    setSettings(prev => ({ ...prev, enabled }));
  };

  const togglePrayer = (prayer: keyof NotificationSettings['prayers']) => {
    setSettings(prev => ({
      ...prev,
      prayers: { ...prev.prayers, [prayer]: !prev.prayers[prayer] },
    }));
  };

  const setMinutesBefore = (minutes: number) => {
    setSettings(prev => ({ ...prev, minutesBefore: minutes }));
  };

  // Schedule notifications
  useEffect(() => {
    if (!settings.enabled || !prayerTimes || permission !== 'granted') return;

    const checkAndNotify = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
      
      for (const prayer of prayers) {
        if (!settings.prayers[prayer]) continue;
        
        const timeStr = prayerTimes[prayer];
        if (!timeStr) continue;
        
        const [hours, minutes] = timeStr.split(':').map(Number);
        const prayerMinutes = hours * 60 + minutes;
        const notifyAt = prayerMinutes - settings.minutesBefore;
        
        if (currentMinutes === notifyAt) {
          new Notification(`${prayer} Prayer in ${settings.minutesBefore} minutes`, {
            body: `${prayer} is at ${timeStr}`,
            icon: '/pwa-192x192.png',
            tag: `prayer-${prayer}`,
          });
        }
        
        if (currentMinutes === prayerMinutes) {
          new Notification(`${prayer} Prayer Time`, {
            body: `It's time for ${prayer} prayer`,
            icon: '/pwa-192x192.png',
            tag: `prayer-${prayer}-now`,
          });
        }
      }
    };

    const interval = setInterval(checkAndNotify, 60000);
    return () => clearInterval(interval);
  }, [settings, prayerTimes, permission]);

  return {
    settings,
    permission,
    requestPermission,
    toggleNotifications,
    togglePrayer,
    setMinutesBefore,
    supported: 'Notification' in window,
  };
}
