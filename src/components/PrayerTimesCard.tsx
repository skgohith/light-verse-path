import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { CALCULATION_METHODS } from '@/hooks/usePrayerCalculationMethod';
import { MapPin, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PrayerTimesCardProps {
  compact?: boolean;
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

export function PrayerTimesCard({ compact = false, className }: PrayerTimesCardProps) {
  const { 
    prayerTimes, 
    prayerDetails, 
    locationName, 
    loading, 
    nextPrayer, 
    makruhTimes, 
    calculationMethod,
    refreshLocation 
  } = usePrayerTimes();

  const currentMethod = CALCULATION_METHODS.find(m => m.id === calculationMethod);

  if (loading) {
    return (
      <div className={cn('bg-card border border-border rounded-xl p-6 animate-pulse', className)}>
        <div className="h-6 bg-muted rounded w-32 mb-4"></div>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded"></div>
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

  // Build prayers list with end times
  const mainPrayers = [
    { name: 'Fajr', time: prayerTimes.Fajr, endTime: prayerTimes.Sunrise },
    { name: 'Dhuhr', time: prayerTimes.Dhuhr, endTime: prayerTimes.Asr },
    { name: 'Asr', time: prayerTimes.Asr, endTime: prayerTimes.Maghrib },
    { name: 'Maghrib', time: prayerTimes.Maghrib, endTime: prayerTimes.Isha },
    { name: 'Isha', time: prayerTimes.Isha, endTime: prayerTimes.Fajr },
  ];

  // Hijri date display
  const hijriDate = prayerTimes.date?.hijri 
    ? `${prayerTimes.date.hijri.day} ${prayerTimes.date.hijri.month.en} ${prayerTimes.date.hijri.year}`
    : '';

  if (compact) {
    return (
      <div className={cn('bg-card border border-border rounded-xl p-4', className)}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground text-sm">Prayer Times</h3>
            {hijriDate && (
              <p className="text-xs text-muted-foreground">{hijriDate}</p>
            )}
          </div>
          {nextPrayer && (
            <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
              {nextPrayer.name} in {nextPrayer.remaining}
            </span>
          )}
        </div>
        
        <div className="space-y-2">
          {mainPrayers.map((prayer) => {
            const isNext = nextPrayer?.name === prayer.name;
            return (
              <div
                key={prayer.name}
                className={cn(
                  'flex items-center justify-between py-2 px-3 rounded-lg',
                  isNext && 'bg-primary/10 border border-primary/30'
                )}
              >
                <div className="flex items-center gap-2">
                  {isNext && <span className="w-2 h-2 bg-primary rounded-full" />}
                  <span className={cn('text-sm', isNext ? 'text-primary font-medium' : 'text-foreground')}>
                    {prayer.name}
                  </span>
                  <span className="text-xs text-muted-foreground font-arabic">{arabicNames[prayer.name]}</span>
                  {isNext && (
                    <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">Next</span>
                  )}
                </div>
                <div className="text-right text-xs">
                  <span className={cn(isNext ? 'text-primary' : 'text-muted-foreground')}>Start: </span>
                  <span className={cn('font-medium', isNext ? 'text-primary' : 'text-foreground')}>{prayer.time}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-card border border-border rounded-xl', className)}>
      {/* Header */}
      <div className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-xl font-bold text-foreground">Prayer Times</h3>
          <div className="flex items-center gap-2">
            <Button 
              variant="default" 
              size="icon" 
              className="h-10 w-10 rounded-full bg-primary hover:bg-primary/80"
              onClick={refreshLocation}
            >
              <MapPin className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={refreshLocation} className="h-10 w-10">
              <RefreshCw className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>
        </div>
        
        {/* Hijri Date */}
        {hijriDate && (
          <p className="text-muted-foreground text-sm">{hijriDate}</p>
        )}
      </div>

      {/* Prayer Times List */}
      <div className="px-4 md:px-6 pb-4">
        <div className="space-y-1">
          {mainPrayers.map((prayer, index) => {
            const isNext = nextPrayer?.name === prayer.name;
            const showMakruhAfterFajr = prayer.name === 'Fajr' && makruhTimes;
            const showMakruhBeforeMaghrib = prayer.name === 'Asr' && makruhTimes;
            
            return (
              <div key={prayer.name}>
                <div
                  className={cn(
                    'flex items-center justify-between py-4 px-4 rounded-xl transition-colors',
                    isNext && 'bg-primary/10 border border-primary/30'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {isNext && <span className="w-2 h-2 bg-primary rounded-full" />}
                    <span className={cn(
                      'text-lg font-medium',
                      isNext ? 'text-primary' : 'text-foreground'
                    )}>
                      {prayer.name}
                    </span>
                    <span className="text-muted-foreground font-arabic">{arabicNames[prayer.name]}</span>
                    {isNext && (
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-md font-medium">
                        Next
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">Start:</span>
                      <span className={cn('font-semibold', isNext ? 'text-primary' : 'text-foreground')}>
                        {prayer.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">End:</span>
                      <span className="text-foreground font-semibold">{prayer.endTime}</span>
                    </div>
                  </div>
                </div>

                {/* Makruh after Fajr (Sunrise) */}
                {showMakruhAfterFajr && (
                  <div className="flex items-center gap-2 px-4 py-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm text-muted-foreground">Makruh:</span>
                    <span className="text-sm text-amber-500 font-medium">
                      {makruhTimes.sunrise.start} - {makruhTimes.sunrise.end}
                    </span>
                  </div>
                )}

                {/* Makruh before Maghrib */}
                {showMakruhBeforeMaghrib && (
                  <div className="flex items-center gap-2 px-4 py-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm text-muted-foreground">Makruh:</span>
                    <span className="text-sm text-amber-500 font-medium">
                      {makruhTimes.sunset.start} - {makruhTimes.sunset.end}
                    </span>
                  </div>
                )}

                {/* Separator */}
                {index < mainPrayers.length - 1 && !isNext && (
                  <div className="border-b border-border mx-4" />
                )}
              </div>
            );
          })}
        </div>

        {/* Sunrise Section */}
        <div className="mt-4 bg-muted/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-foreground font-medium">Sunrise</span>
              <span className="text-muted-foreground font-arabic ml-2">{arabicNames.Sunrise}</span>
            </div>
            <span className="text-foreground font-semibold">{prayerTimes.Sunrise}</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-amber-500">Prayer forbidden at sunrise</span>
          </div>
        </div>

        {/* Zawal Section */}
        {makruhTimes && (
          <div className="mt-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="text-amber-500 font-medium">Zawal (Noon Makruh):</span>
              <span className="text-muted-foreground">
                ~15 min before Dhuhr ({prayerTimes.Dhuhr})
              </span>
            </div>
          </div>
        )}

        {/* Calculation Method Footer */}
        {currentMethod && (
          <div className="mt-6 pt-4 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">{currentMethod.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}
