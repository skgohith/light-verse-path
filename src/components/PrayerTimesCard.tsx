import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { Clock, MapPin, Sun, Sunrise, Moon, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PrayerTimesCardProps {
  compact?: boolean;
  className?: string;
}

const prayerIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Fajr: Sunrise,
  Sunrise: Sun,
  Dhuhr: Sun,
  Asr: Sun,
  Maghrib: Sunrise,
  Isha: Moon,
};

export function PrayerTimesCard({ compact = false, className }: PrayerTimesCardProps) {
  const { prayerTimes, prayerDetails, locationName, loading, nextPrayer, makruhTimes, refreshLocation } = usePrayerTimes();

  if (loading) {
    return (
      <div className={cn('bg-card border border-border rounded-xl p-6 animate-pulse', className)}>
        <div className="h-6 bg-muted rounded w-32 mb-4"></div>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!prayerTimes) {
    return (
      <div className={cn('bg-card border border-border rounded-xl p-6', className)}>
        <p className="text-muted-foreground text-center">Unable to load prayer times</p>
        <Button variant="outline" size="sm" onClick={refreshLocation} className="w-full mt-4 gap-2">
          <RefreshCw className="w-4 h-4" /> Retry
        </Button>
      </div>
    );
  }

  const prayers = prayerDetails.length > 0 ? prayerDetails : [
    { name: 'Fajr', time: prayerTimes.Fajr },
    { name: 'Sunrise', time: prayerTimes.Sunrise },
    { name: 'Dhuhr', time: prayerTimes.Dhuhr },
    { name: 'Asr', time: prayerTimes.Asr },
    { name: 'Maghrib', time: prayerTimes.Maghrib },
    { name: 'Isha', time: prayerTimes.Isha },
  ];

  if (compact) {
    return (
      <div className={cn('bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 rounded-xl p-4', className)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground text-sm">Prayer Times</span>
          </div>
          {nextPrayer && (
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
              {nextPrayer.name} in {nextPrayer.remaining}
            </span>
          )}
        </div>
        
        {locationName && (
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {locationName}
          </p>
        )}
        
        <div className="grid grid-cols-3 gap-2">
          {prayers.filter(p => p.name !== 'Sunrise').slice(0, 5).map((prayer) => {
            const isNext = nextPrayer?.name === prayer.name;
            return (
              <div
                key={prayer.name}
                className={cn(
                  'text-center p-2 rounded-lg',
                  isNext ? 'bg-primary/20' : 'bg-card/50'
                )}
              >
                <p className="text-[10px] text-muted-foreground">{prayer.name}</p>
                <p className={cn('text-xs font-medium', isNext ? 'text-primary' : 'text-foreground')}>
                  {prayer.time}
                </p>
                {prayer.endTime && (
                  <p className="text-[9px] text-muted-foreground">
                    → {prayer.endTime}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-card border border-border rounded-xl overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 to-accent/10 p-4 md:p-6 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Prayer Times
          </h3>
          <Button variant="ghost" size="icon" onClick={refreshLocation} className="h-8 w-8">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Location */}
        {locationName && (
          <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
            <MapPin className="w-3 h-3" />
            {locationName}
          </p>
        )}
        
        {/* Hijri Date */}
        {prayerTimes.date?.hijri && (
          <div className="text-sm text-muted-foreground">
            <span className="font-arabic">{prayerTimes.date.hijri.day} {prayerTimes.date.hijri.month.ar}</span>
            <span className="mx-2">•</span>
            <span>{prayerTimes.date.hijri.day} {prayerTimes.date.hijri.month.en} {prayerTimes.date.hijri.year} AH</span>
          </div>
        )}

        {/* Next Prayer */}
        {nextPrayer && (
          <div className="mt-4 p-3 bg-primary/20 rounded-lg">
            <p className="text-xs text-muted-foreground">Next Prayer</p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-primary">{nextPrayer.name}</span>
              <span className="text-foreground font-medium">{nextPrayer.time}</span>
            </div>
            <p className="text-xs text-muted-foreground">in {nextPrayer.remaining}</p>
          </div>
        )}
      </div>

      {/* Makruh Times Warning */}
      {makruhTimes && (
        <div className="px-4 pt-4">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-500">Makruh (Disliked) Prayer Times</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center p-2 bg-card/50 rounded">
                <p className="text-muted-foreground">After Sunrise</p>
                <p className="text-amber-500 font-medium">{makruhTimes.sunrise.start} - {makruhTimes.sunrise.end}</p>
              </div>
              <div className="text-center p-2 bg-card/50 rounded">
                <p className="text-muted-foreground">Zawal</p>
                <p className="text-amber-500 font-medium">{makruhTimes.zawal.start} - {makruhTimes.zawal.end}</p>
              </div>
              <div className="text-center p-2 bg-card/50 rounded">
                <p className="text-muted-foreground">Before Maghrib</p>
                <p className="text-amber-500 font-medium">{makruhTimes.sunset.start} - {makruhTimes.sunset.end}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prayer Times List */}
      <div className="p-4">
        <div className="space-y-2">
          {prayers.map((prayer) => {
            const Icon = prayerIcons[prayer.name] || Sun;
            const isNext = nextPrayer?.name === prayer.name;
            
            return (
              <div
                key={prayer.name}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg transition-colors',
                  isNext ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    isNext ? 'bg-primary/20' : 'bg-muted'
                  )}>
                    <Icon className={cn('w-4 h-4', isNext ? 'text-primary' : 'text-muted-foreground')} />
                  </div>
                  <div>
                    <span className={cn('font-medium', isNext ? 'text-primary' : 'text-foreground')}>
                      {prayer.name}
                    </span>
                    {prayer.endTime && (
                      <p className="text-xs text-muted-foreground">
                        Ends: {prayer.endTime}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn('font-mono text-sm block', isNext ? 'text-primary font-semibold' : 'text-foreground')}>
                    {prayer.time}
                  </span>
                  {prayer.endTime && (
                    <span className="text-xs text-muted-foreground">
                      → {prayer.endTime}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
