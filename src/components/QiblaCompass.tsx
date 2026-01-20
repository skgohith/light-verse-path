import { useState, useEffect } from 'react';
import { useQiblaDirection } from '@/hooks/usePrayerTimes';
import { Compass, MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QiblaCompassProps {
  className?: string;
}

export function QiblaCompass({ className }: QiblaCompassProps) {
  const { direction, loading } = useQiblaDirection();
  const [deviceOrientation, setDeviceOrientation] = useState<number | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        setDeviceOrientation(event.alpha);
      }
    };

    // Check if device orientation is available
    if ('DeviceOrientationEvent' in window) {
      // For iOS 13+ we need to request permission
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        setHasPermission(false);
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
        setHasPermission(true);
      }
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  const requestPermission = async () => {
    try {
      const permission = await (DeviceOrientationEvent as any).requestPermission();
      if (permission === 'granted') {
        setHasPermission(true);
        window.addEventListener('deviceorientation', (event) => {
          if (event.alpha !== null) {
            setDeviceOrientation(event.alpha);
          }
        });
      }
    } catch (error) {
      console.error('Permission denied:', error);
    }
  };

  if (loading) {
    return (
      <div className={cn('bg-card border border-border rounded-xl p-6', className)}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const rotation = direction 
    ? deviceOrientation !== null 
      ? direction - deviceOrientation 
      : direction
    : 0;

  return (
    <div className={cn('bg-card border border-border rounded-xl p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Compass className="w-5 h-5 text-primary" />
          Qibla Direction
        </h3>
        {direction && (
          <span className="text-sm text-muted-foreground">
            {direction.toFixed(1)}° from North
          </span>
        )}
      </div>

      {/* Compass */}
      <div className="relative w-48 h-48 mx-auto">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-4 border-muted">
          {/* Cardinal directions */}
          <span className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-bold text-foreground">N</span>
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-bold text-muted-foreground">S</span>
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">W</span>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">E</span>
        </div>

        {/* Inner compass */}
        <div 
          className="absolute inset-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 flex items-center justify-center transition-transform duration-300"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Qibla arrow */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[20px] border-b-primary"></div>
          </div>
          
          {/* Kaaba icon in center */}
          <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-2xl">🕋</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center">
        {hasPermission === false ? (
          <button
            onClick={requestPermission}
            className="text-sm text-primary hover:underline"
          >
            Enable compass for live direction
          </button>
        ) : deviceOrientation !== null ? (
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            <MapPin className="w-4 h-4" />
            Point your phone towards the arrow
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Face {direction?.toFixed(0)}° from North towards Mecca
          </p>
        )}
      </div>
    </div>
  );
}
