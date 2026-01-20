import { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HijriCalendarProps {
  className?: string;
}

interface HijriDate {
  day: number;
  month: { en: string; ar: string; number: number };
  year: string;
  designation: { abbreviated: string; expanded: string };
  weekday: { en: string; ar: string };
}

interface GregorianDate {
  date: string;
  format: string;
  day: string;
  weekday: { en: string };
  month: { en: string; number: number };
  year: string;
}

const hijriMonths = [
  { en: 'Muharram', ar: 'مُحَرَّم' },
  { en: 'Safar', ar: 'صَفَر' },
  { en: 'Rabi al-Awwal', ar: 'رَبِيع الأَوَّل' },
  { en: 'Rabi al-Thani', ar: 'رَبِيع الثَّاني' },
  { en: 'Jumada al-Awwal', ar: 'جُمَادَى الأَوَّل' },
  { en: 'Jumada al-Thani', ar: 'جُمَادَى الثَّاني' },
  { en: 'Rajab', ar: 'رَجَب' },
  { en: 'Shaban', ar: 'شَعْبَان' },
  { en: 'Ramadan', ar: 'رَمَضَان' },
  { en: 'Shawwal', ar: 'شَوَّال' },
  { en: 'Dhul Qadah', ar: 'ذُو القَعْدَة' },
  { en: 'Dhul Hijjah', ar: 'ذُو الحِجَّة' },
];

const upcomingEvents = [
  { name: 'Ramadan', hijriMonth: 9, hijriDay: 1, description: 'Beginning of the blessed month of fasting' },
  { name: 'Eid ul-Fitr', hijriMonth: 10, hijriDay: 1, description: 'Festival of Breaking the Fast' },
  { name: 'Eid ul-Adha', hijriMonth: 12, hijriDay: 10, description: 'Festival of Sacrifice' },
  { name: 'Ashura', hijriMonth: 1, hijriDay: 10, description: 'Day of Ashura' },
  { name: 'Mawlid an-Nabi', hijriMonth: 3, hijriDay: 12, description: 'Birth of Prophet Muhammad ﷺ' },
  { name: 'Laylat al-Qadr', hijriMonth: 9, hijriDay: 27, description: 'Night of Power' },
  { name: 'Isra and Miraj', hijriMonth: 7, hijriDay: 27, description: 'Night Journey and Ascension' },
];

export function HijriCalendar({ className }: HijriCalendarProps) {
  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
  const [gregorianDate, setGregorianDate] = useState<GregorianDate | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    async function fetchDate() {
      try {
        const today = new Date();
        const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
        
        const response = await fetch(
          `https://api.aladhan.com/v1/gToH/${dateStr}`
        );
        const data = await response.json();
        
        if (data.code === 200) {
          setHijriDate(data.data.hijri);
          setGregorianDate(data.data.gregorian);
        }
      } catch (error) {
        console.error('Failed to fetch Hijri date:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDate();
  }, []);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className={cn('bg-card border border-border rounded-xl p-6 animate-pulse', className)}>
        <div className="h-8 bg-muted rounded w-48 mb-4"></div>
        <div className="h-6 bg-muted rounded w-32"></div>
      </div>
    );
  }

  return (
    <div className={cn('bg-card border border-border rounded-xl overflow-hidden', className)}>
      {/* Header with current date */}
      <div className="bg-gradient-to-br from-primary/20 to-accent/10 p-6 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Islamic Calendar</h3>
        </div>

        {hijriDate && (
          <div className="text-center">
            <p className="font-arabic text-3xl text-foreground mb-2">
              {hijriDate.day} {hijriDate.month.ar} {hijriDate.year}
            </p>
            <p className="text-lg text-foreground">
              {hijriDate.day} {hijriDate.month.en} {hijriDate.year} AH
            </p>
            {gregorianDate && (
              <p className="text-sm text-muted-foreground mt-1">
                {gregorianDate.weekday.en}, {gregorianDate.day} {gregorianDate.month.en} {gregorianDate.year}
              </p>
            )}
          </div>
        )}

        {/* Current Time */}
        <div className="flex items-center justify-center gap-2 mt-4 text-lg font-mono text-foreground">
          <Clock className="w-4 h-4 text-primary" />
          {currentTime.toLocaleTimeString()}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="p-4">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">Upcoming Islamic Events</h4>
        <div className="space-y-2">
          {upcomingEvents.slice(0, 4).map((event) => (
            <div
              key={event.name}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
            >
              <div>
                <p className="font-medium text-foreground">{event.name}</p>
                <p className="text-xs text-muted-foreground">{event.description}</p>
              </div>
              <span className="text-xs text-primary">
                {event.hijriDay} {hijriMonths[event.hijriMonth - 1]?.en}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
