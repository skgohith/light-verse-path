import { useState, useEffect, useCallback } from 'react';
import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { usePrayerTimes } from './usePrayerTimes';

interface LocalPrayerNotificationSettings {
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

const DEFAULT_SETTINGS: LocalPrayerNotificationSettings = {
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

export function useLocalPrayerNotifications() {
  const [settings, setSettings] = useState<LocalPrayerNotificationSettings>(DEFAULT_SETTINGS);
  const [isNative, setIsNative] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const { prayerTimes } = usePrayerTimes();

  useEffect(() => {
    const platform = Capacitor.getPlatform();
    setIsNative(platform === 'ios' || platform === 'android');

    const saved = localStorage.getItem('local_prayer_notifications');
    if (saved) {
      setSettings(JSON.parse(saved));
    }

    // Check permission status
    if (platform !== 'web') {
      LocalNotifications.checkPermissions().then((result) => {
        setPermissionGranted(result.display === 'granted');
      });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('local_prayer_notifications', JSON.stringify(settings));
  }, [settings]);

  const requestPermission = useCallback(async () => {
    if (!isNative) return false;

    try {
      const result = await LocalNotifications.requestPermissions();
      const granted = result.display === 'granted';
      setPermissionGranted(granted);
      return granted;
    } catch (error) {
      console.error('Error requesting local notification permission:', error);
      return false;
    }
  }, [isNative]);

  const scheduleNotifications = useCallback(async () => {
    if (!isNative || !settings.enabled || !prayerTimes || !permissionGranted) return;

    try {
      // Cancel all existing notifications first
      await LocalNotifications.cancel({ notifications: await getPendingNotifications() });

      const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
      const notifications: ScheduleOptions['notifications'] = [];
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      prayers.forEach((prayer, index) => {
        if (!settings.prayers[prayer]) return;

        const timeStr = prayerTimes[prayer];
        if (!timeStr) return;

        const [hours, minutes] = timeStr.split(':').map(Number);
        
        // Schedule for today
        const prayerTime = new Date(today);
        prayerTime.setHours(hours, minutes, 0, 0);

        // Notification before prayer
        const notifyTime = new Date(prayerTime.getTime() - settings.minutesBefore * 60 * 1000);
        
        if (notifyTime > now) {
          notifications.push({
            id: index * 2 + 1,
            title: `${prayer} in ${settings.minutesBefore} minutes`,
            body: `${prayer} prayer at ${timeStr}`,
            schedule: { at: notifyTime },
            sound: 'default',
            smallIcon: 'ic_stat_icon',
            largeIcon: 'ic_launcher',
          });
        }

        // Notification at prayer time
        if (prayerTime > now) {
          notifications.push({
            id: index * 2 + 2,
            title: `${prayer} Prayer Time`,
            body: `It's time for ${prayer} prayer`,
            schedule: { at: prayerTime },
            sound: 'default',
            smallIcon: 'ic_stat_icon',
            largeIcon: 'ic_launcher',
          });
        }
      });

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
        console.log(`Scheduled ${notifications.length} prayer notifications`);
      }
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  }, [isNative, settings, prayerTimes, permissionGranted]);

  const getPendingNotifications = async () => {
    try {
      const pending = await LocalNotifications.getPending();
      return pending.notifications;
    } catch {
      return [];
    }
  };

  const enableNotifications = useCallback(async () => {
    const granted = await requestPermission();
    if (granted) {
      setSettings(prev => ({ ...prev, enabled: true }));
      return true;
    }
    return false;
  }, [requestPermission]);

  const disableNotifications = useCallback(async () => {
    setSettings(prev => ({ ...prev, enabled: false }));
    // Cancel all scheduled notifications
    if (isNative) {
      const pending = await getPendingNotifications();
      if (pending.length > 0) {
        await LocalNotifications.cancel({ notifications: pending });
      }
    }
  }, [isNative]);

  const togglePrayer = (prayer: keyof LocalPrayerNotificationSettings['prayers']) => {
    setSettings(prev => ({
      ...prev,
      prayers: { ...prev.prayers, [prayer]: !prev.prayers[prayer] },
    }));
  };

  const setMinutesBefore = (minutes: number) => {
    setSettings(prev => ({ ...prev, minutesBefore: minutes }));
  };

  // Reschedule notifications when settings or prayer times change
  useEffect(() => {
    if (settings.enabled && prayerTimes && permissionGranted) {
      scheduleNotifications();
    }
  }, [settings, prayerTimes, permissionGranted, scheduleNotifications]);

  // Listen for notification actions
  useEffect(() => {
    if (!isNative) return;

    const actionListener = LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      console.log('Local notification action:', notification);
    });

    return () => {
      actionListener.then(l => l.remove());
    };
  }, [isNative]);

  return {
    settings,
    isNative,
    permissionGranted,
    enableNotifications,
    disableNotifications,
    togglePrayer,
    setMinutesBefore,
    scheduleNotifications,
  };
}
