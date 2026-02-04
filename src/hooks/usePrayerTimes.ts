import { useState, useEffect } from 'react';
import { PrayerTimes as PrayerTimesType } from '@/types/quran';
import { useLocalStorage } from './useLocalStorage';

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
  isMakruh?: boolean;
  makruhStart?: string;
  makruhEnd?: string;
}

export function usePrayerTimes() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesType | null>(null);
  const [prayerDetails, setPrayerDetails] = useState<PrayerTimeDetail[]>([]);
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; remaining: string } | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [makruhTimes, setMakruhTimes] = useState<{ sunrise: { start: string; end: string }; zawal: { start: string; end: string }; sunset: { start: string; end: string } } | null>(null);
  const [calculationMethod, setCalculationMethodStorage] = useLocalStorage<number>('prayer-calculation-method', 1);
  
  const setCalculationMethod = (method: number) => {
    setCalculationMethodStorage(method);
  };
  
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
              await fetchPrayerTimes(loc.latitude, loc.longitude, calculationMethod);
              await fetchLocationName(loc.latitude, loc.longitude);
            },
            async () => {
              // Default to Mecca if location denied
              const defaultLoc = { latitude: 21.4225, longitude: 39.8262, city: 'Mecca', country: 'Saudi Arabia' };
              setLocation(defaultLoc);
              setLocationName('Mecca, Saudi Arabia');
              await fetchPrayerTimes(defaultLoc.latitude, defaultLoc.longitude, calculationMethod);
            }
          );
        } else {
          const defaultLoc = { latitude: 21.4225, longitude: 39.8262, city: 'Mecca', country: 'Saudi Arabia' };
          setLocation(defaultLoc);
          setLocationName('Mecca, Saudi Arabia');
          await fetchPrayerTimes(defaultLoc.latitude, defaultLoc.longitude, calculationMethod);
        }
      } catch (err) {
        setError('Failed to get location');
        setLoading(false);
      }
    }

    getLocation();
  }, [calculationMethod]);

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

  async function fetchPrayerTimes(lat: number, lng: number, method: number = 2) {
    try {
      const today = new Date();
      const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
      
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=${method}`
      );
      const data = await response.json();
      
      if (data.code === 200) {
        const timings = data.data.timings;
        
        const sunrise = timings.Sunrise.split(' ')[0];
        const dhuhr = timings.Dhuhr.split(' ')[0];
        const maghrib = timings.Maghrib.split(' ')[0];
        
        // Calculate Makruh times (approx 15-20 mins around sunrise, zawal, and sunset)
        const calculateMakruhWindow = (time: string, minutesBefore: number, minutesAfter: number) => {
          const [hours, mins] = time.split(':').map(Number);
          const totalMins = hours * 60 + mins;
          
          const startMins = totalMins - minutesBefore;
          const endMins = totalMins + minutesAfter;
          
          const formatTime = (m: number) => {
            const h = Math.floor(m / 60) % 24;
            const min = m % 60;
            return `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
          };
          
          return { start: formatTime(startMins), end: formatTime(endMins) };
        };
        
        // Zawal is approximately 10 mins before Dhuhr
        const zawalTime = (() => {
          const [h, m] = dhuhr.split(':').map(Number);
          const totalMins = h * 60 + m - 10;
          const hours = Math.floor(totalMins / 60);
          const mins = totalMins % 60;
          return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
        })();
        
        const makruh = {
          sunrise: calculateMakruhWindow(sunrise, 0, 20),
          zawal: calculateMakruhWindow(zawalTime, 0, 15),
          sunset: calculateMakruhWindow(maghrib, 20, 0)
        };
        setMakruhTimes(makruh);
        
        setPrayerTimes({
          Fajr: timings.Fajr.split(' ')[0],
          Sunrise: sunrise,
          Dhuhr: dhuhr,
          Asr: timings.Asr.split(' ')[0],
          Maghrib: maghrib,
          Isha: timings.Isha.split(' ')[0],
          date: {
            readable: data.data.date.readable,
            hijri: data.data.date.hijri
          }
        });

        // Calculate prayer windows (start and end times) with Makruh info
        const details: PrayerTimeDetail[] = [
          { 
            name: 'Fajr', 
            time: timings.Fajr.split(' ')[0], 
            endTime: sunrise,
            isMakruh: false 
          },
          { 
            name: 'Sunrise', 
            time: sunrise,
            isMakruh: true,
            makruhStart: makruh.sunrise.start,
            makruhEnd: makruh.sunrise.end
          },
          { 
            name: 'Dhuhr', 
            time: dhuhr, 
            endTime: timings.Asr.split(' ')[0],
            isMakruh: false 
          },
          { 
            name: 'Asr', 
            time: timings.Asr.split(' ')[0], 
            endTime: maghrib,
            isMakruh: false 
          },
          { 
            name: 'Maghrib', 
            time: maghrib, 
            endTime: timings.Isha.split(' ')[0],
            isMakruh: false 
          },
          { 
            name: 'Isha', 
            time: timings.Isha.split(' ')[0], 
            endTime: timings.Midnight?.split(' ')[0],
            isMakruh: false 
          },
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
          await fetchPrayerTimes(loc.latitude, loc.longitude, calculationMethod);
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
    makruhTimes,
    calculationMethod,
    setCalculationMethod,
    refreshLocation 
  };
}

