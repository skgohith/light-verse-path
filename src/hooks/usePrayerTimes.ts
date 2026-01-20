import { useState, useEffect } from 'react';
import { PrayerTimes as PrayerTimesType } from '@/types/quran';

interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

interface PrayerTimeDetail {
  name: string;
  time: string;
  endTime?: string;
}

export function usePrayerTimes() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesType | null>(null);
  const [prayerDetails, setPrayerDetails] = useState<PrayerTimeDetail[]>([]);
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; remaining: string } | null>(null);
  const [locationName, setLocationName] = useState<string>('');

  useEffect(() => {
    async function getLocation() {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const loc = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              };
              setLocation(loc);
              await fetchPrayerTimes(loc.latitude, loc.longitude);
              await fetchLocationName(loc.latitude, loc.longitude);
            },
            async () => {
              // Default to Mecca if location denied
              const defaultLoc = { latitude: 21.4225, longitude: 39.8262, city: 'Mecca', country: 'Saudi Arabia' };
              setLocation(defaultLoc);
              setLocationName('Mecca, Saudi Arabia');
              await fetchPrayerTimes(defaultLoc.latitude, defaultLoc.longitude);
            }
          );
        } else {
          const defaultLoc = { latitude: 21.4225, longitude: 39.8262, city: 'Mecca', country: 'Saudi Arabia' };
          setLocation(defaultLoc);
          setLocationName('Mecca, Saudi Arabia');
          await fetchPrayerTimes(defaultLoc.latitude, defaultLoc.longitude);
        }
      } catch (err) {
        setError('Failed to get location');
        setLoading(false);
      }
    }

    getLocation();
  }, []);

  async function fetchLocationName(lat: number, lng: number) {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
      );
      const data = await response.json();
      const city = data.city || data.locality || data.principalSubdivision;
      const country = data.countryName;
      setLocationName(city ? `${city}, ${country}` : country || 'Unknown Location');
    } catch {
      setLocationName('Your Location');
    }
  }

  async function fetchPrayerTimes(lat: number, lng: number) {
    try {
      const today = new Date();
      const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
      
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=2`
      );
      const data = await response.json();
      
      if (data.code === 200) {
        const timings = data.data.timings;
        
        setPrayerTimes({
          Fajr: timings.Fajr.split(' ')[0],
          Sunrise: timings.Sunrise.split(' ')[0],
          Dhuhr: timings.Dhuhr.split(' ')[0],
          Asr: timings.Asr.split(' ')[0],
          Maghrib: timings.Maghrib.split(' ')[0],
          Isha: timings.Isha.split(' ')[0],
          date: {
            readable: data.data.date.readable,
            hijri: data.data.date.hijri
          }
        });

        // Calculate prayer windows (start and end times)
        const details: PrayerTimeDetail[] = [
          { name: 'Fajr', time: timings.Fajr.split(' ')[0], endTime: timings.Sunrise.split(' ')[0] },
          { name: 'Sunrise', time: timings.Sunrise.split(' ')[0] },
          { name: 'Dhuhr', time: timings.Dhuhr.split(' ')[0], endTime: timings.Asr.split(' ')[0] },
          { name: 'Asr', time: timings.Asr.split(' ')[0], endTime: timings.Maghrib.split(' ')[0] },
          { name: 'Maghrib', time: timings.Maghrib.split(' ')[0], endTime: timings.Isha.split(' ')[0] },
          { name: 'Isha', time: timings.Isha.split(' ')[0], endTime: timings.Midnight?.split(' ')[0] },
        ];
        setPrayerDetails(details);
        
        calculateNextPrayer(timings);
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
      const timeStr = timings[prayer]?.split(' ')[0] || timings[prayer];
      if (!timeStr) continue;
      
      const [hours, minutes] = timeStr.split(':').map(Number);
      const prayerMinutes = hours * 60 + minutes;

      if (prayerMinutes > currentMinutes) {
        const diff = prayerMinutes - currentMinutes;
        const remainingHours = Math.floor(diff / 60);
        const remainingMins = diff % 60;
        
        setNextPrayer({
          name: prayer,
          time: timeStr,
          remaining: remainingHours > 0 
            ? `${remainingHours}h ${remainingMins}m` 
            : `${remainingMins}m`
        });
        return;
      }
    }

    // If all prayers passed, next is Fajr tomorrow
    const fajrTime = timings.Fajr?.split(' ')[0] || timings.Fajr;
    setNextPrayer({
      name: 'Fajr',
      time: fajrTime,
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

  // Refresh location periodically
  const refreshLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setLocation(loc);
          await fetchPrayerTimes(loc.latitude, loc.longitude);
          await fetchLocationName(loc.latitude, loc.longitude);
        },
        () => setLoading(false)
      );
    }
  };

  return { 
    prayerTimes, 
    prayerDetails,
    location, 
    locationName,
    loading, 
    error, 
    nextPrayer,
    refreshLocation 
  };
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
