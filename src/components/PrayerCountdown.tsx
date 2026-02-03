import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface PrayerCountdownProps {
  nextPrayer: { name: string; time: string; remaining: string } | null;
  className?: string;
}

// Arabic names for prayers
const arabicNames: Record<string, string> = {
  Fajr: 'فجر',
  Sunrise: 'طلوع آفتاب',
  Dhuhr: 'ظہر',
  Asr: 'عصر',
  Maghrib: 'مغرب',
  Isha: 'عشاء',
};

export function PrayerCountdown({ nextPrayer, className }: PrayerCountdownProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [displayTime, setDisplayTime] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!nextPrayer?.time) return;

    const calculateRemaining = () => {
      const now = new Date();
      const [hours, minutes] = nextPrayer.time.split(':').map(Number);
      
      const prayerDate = new Date();
      prayerDate.setHours(hours, minutes, 0, 0);
      
      // If prayer time has passed, it's for tomorrow
      if (prayerDate <= now) {
        prayerDate.setDate(prayerDate.getDate() + 1);
      }
      
      const diff = Math.max(0, Math.floor((prayerDate.getTime() - now.getTime()) / 1000));
      return diff;
    };

    // Calculate initial values
    const initial = calculateRemaining();
    setSecondsRemaining(initial);
    
    // Set total seconds for progress calculation (max 24 hours)
    const maxDuration = 24 * 60 * 60;
    setTotalSeconds(Math.min(initial, maxDuration));

    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        const newVal = Math.max(0, prev - 1);
        return newVal;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [nextPrayer?.time, nextPrayer?.name]);

  useEffect(() => {
    const hours = Math.floor(secondsRemaining / 3600);
    const minutes = Math.floor((secondsRemaining % 3600) / 60);
    const seconds = secondsRemaining % 60;
    setDisplayTime({ hours, minutes, seconds });
  }, [secondsRemaining]);

  if (!nextPrayer) return null;

  // Calculate progress (0 to 1, where 1 is complete/prayer time reached)
  const progress = totalSeconds > 0 ? 1 - (secondsRemaining / totalSeconds) : 0;
  const circumference = 2 * Math.PI * 54; // radius = 54
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className={cn('bg-card border border-border rounded-xl p-6', className)}>
      <div className="flex flex-col items-center">
        {/* Progress Ring */}
        <div className="relative w-36 h-36 mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Next</span>
            <span className="text-lg font-bold text-foreground">{nextPrayer.name}</span>
            <span className="text-xs text-muted-foreground font-arabic">
              {arabicNames[nextPrayer.name]}
            </span>
          </div>
        </div>

        {/* Countdown Display */}
        <div className="flex items-center gap-2 text-center">
          {/* Hours */}
          <div className="flex flex-col items-center">
            <div className="bg-muted rounded-lg px-3 py-2 min-w-[48px]">
              <span className="text-2xl font-bold text-foreground tabular-nums">
                {String(displayTime.hours).padStart(2, '0')}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 uppercase">Hours</span>
          </div>
          
          <span className="text-2xl font-bold text-muted-foreground pb-5">:</span>
          
          {/* Minutes */}
          <div className="flex flex-col items-center">
            <div className="bg-muted rounded-lg px-3 py-2 min-w-[48px]">
              <span className="text-2xl font-bold text-foreground tabular-nums">
                {String(displayTime.minutes).padStart(2, '0')}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 uppercase">Mins</span>
          </div>
          
          <span className="text-2xl font-bold text-muted-foreground pb-5">:</span>
          
          {/* Seconds */}
          <div className="flex flex-col items-center">
            <div className="bg-primary/20 rounded-lg px-3 py-2 min-w-[48px]">
              <span className="text-2xl font-bold text-primary tabular-nums">
                {String(displayTime.seconds).padStart(2, '0')}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground mt-1 uppercase">Secs</span>
          </div>
        </div>

        {/* Prayer Time */}
        <p className="text-sm text-muted-foreground mt-4">
          {nextPrayer.name} starts at <span className="font-semibold text-foreground">{nextPrayer.time}</span>
        </p>
      </div>
    </div>
  );
}
