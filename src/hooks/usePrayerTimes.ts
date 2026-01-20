import { useState, useEffect } from 'react';
import { PrayerTimes } from '@/types/quran';

interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

export function usePrayerTimes() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; remaining: string } | null>(null);

  useEffect(() => {
    async function getLocation() {
      try {
        // Try to get user's location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const loc = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              };
              setLocation(loc);
              await fetchPrayerTimes(loc.latitude, loc.longitude);
            },
            async () => {
              // Default to Mecca if location denied
              const defaultLoc = { latitude: 21.4225, longitude: 39.8262, city: 'Mecca', country: 'Saudi Arabia' };
              setLocation(defaultLoc);
              await fetchPrayerTimes(defaultLoc.latitude, defaultLoc.longitude);
            }
          );
        } else {
          // Default to Mecca
          const defaultLoc = { latitude: 21.4225, longitude: 39.8262, city: 'Mecca', country: 'Saudi Arabia' };
          setLocation(defaultLoc);
          await fetchPrayerTimes(defaultLoc.latitude, defaultLoc.longitude);
        }
      } catch (err) {
        setError('Failed to get location');
        setLoading(false);
      }
    }

    getLocation();
  }, []);

  async function fetchPrayerTimes(lat: number, lng: number) {
    try {
      const today = new Date();
      const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
      
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=2`
      );
      const data = await response.json();
      
      if (data.code === 200) {
        setPrayerTimes({
          Fajr: data.data.timings.Fajr,
          Sunrise: data.data.timings.Sunrise,
          Dhuhr: data.data.timings.Dhuhr,
          Asr: data.data.timings.Asr,
          Maghrib: data.data.timings.Maghrib,
          Isha: data.data.timings.Isha,
          date: {
            readable: data.data.date.readable,
            hijri: data.data.date.hijri
          }
        });
        
        // Calculate next prayer
        calculateNextPrayer(data.data.timings);
      }
    } catch (err) {
      setError('Failed to fetch prayer times');
    } finally {
      setLoading(false);
    }
  }

  function calculateNextPrayer(timings: any) {
    const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const prayer of prayers) {
      const [hours, minutes] = timings[prayer].split(':').map(Number);
      const prayerMinutes = hours * 60 + minutes;

      if (prayerMinutes > currentMinutes) {
        const diff = prayerMinutes - currentMinutes;
        const remainingHours = Math.floor(diff / 60);
        const remainingMins = diff % 60;
        
        setNextPrayer({
          name: prayer,
          time: timings[prayer],
          remaining: remainingHours > 0 
            ? `${remainingHours}h ${remainingMins}m` 
            : `${remainingMins}m`
        });
        return;
      }
    }

    // If all prayers passed, next is Fajr tomorrow
    setNextPrayer({
      name: 'Fajr',
      time: timings.Fajr,
      remaining: 'Tomorrow'
    });
  }

  // Update next prayer every minute
  useEffect(() => {
    if (!prayerTimes) return;

    const interval = setInterval(() => {
      const timings = {
        Fajr: prayerTimes.Fajr,
        Sunrise: prayerTimes.Sunrise,
        Dhuhr: prayerTimes.Dhuhr,
        Asr: prayerTimes.Asr,
        Maghrib: prayerTimes.Maghrib,
        Isha: prayerTimes.Isha
      };
      calculateNextPrayer(timings);
    }, 60000);

    return () => clearInterval(interval);
  }, [prayerTimes]);

  return { prayerTimes, location, loading, error, nextPrayer };
}

export function useQiblaDirection() {
  const [direction, setDirection] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://api.aladhan.com/v1/qibla/${position.coords.latitude}/${position.coords.longitude}`
            );
            const data = await response.json();
            if (data.code === 200) {
              setDirection(data.data.direction);
            }
          } catch (err) {
            console.error('Failed to get qibla direction');
          } finally {
            setLoading(false);
          }
        },
        () => {
          setLoading(false);
        }
      );
    } else {
      setLoading(false);
    }
  }, []);

  return { direction, loading };
}
