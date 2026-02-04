import { useState, useEffect, useCallback, useRef } from 'react';
import { useQiblaDirection } from '@/hooks/usePrayerTimes';
import { Compass, MapPin, Loader2, RotateCcw, Smartphone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface QiblaCompassProps {
  className?: string;
}

export function QiblaCompass({ className }: QiblaCompassProps) {
  const { direction: qiblaDirection, loading } = useQiblaDirection();
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [accuracy, setAccuracy] = useState<'low' | 'medium' | 'high' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const lastAlpha = useRef<number | null>(null);

  // Smooth the compass readings to avoid jittery movement
  const smoothHeading = useCallback((newHeading: number) => {
    if (lastAlpha.current === null) {
      lastAlpha.current = newHeading;
      return newHeading;
    }
    
    // Use exponential smoothing
    const smoothingFactor = 0.3;
    let diff = newHeading - lastAlpha.current;
    
    // Handle wrap-around at 360 degrees
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    const smoothed = lastAlpha.current + diff * smoothingFactor;
    lastAlpha.current = (smoothed + 360) % 360;
    
    return lastAlpha.current;
  }, []);

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    // Check for iOS-specific webkitCompassHeading (more accurate on iOS)
    const webkitEvent = event as DeviceOrientationEvent & { webkitCompassHeading?: number; webkitCompassAccuracy?: number };
    
    let heading: number | null = null;
    
    if (webkitEvent.webkitCompassHeading !== undefined && webkitEvent.webkitCompassHeading !== null) {
      // iOS devices - webkitCompassHeading gives true heading (0-360, 0 = North)
      heading = webkitEvent.webkitCompassHeading;
      
      // Check accuracy on iOS
      if (webkitEvent.webkitCompassAccuracy !== undefined) {
        if (webkitEvent.webkitCompassAccuracy < 0) {
          setAccuracy(null);
          setIsCalibrating(true);
        } else if (webkitEvent.webkitCompassAccuracy <= 10) {
          setAccuracy('high');
          setIsCalibrating(false);
        } else if (webkitEvent.webkitCompassAccuracy <= 25) {
          setAccuracy('medium');
          setIsCalibrating(false);
        } else {
          setAccuracy('low');
          setIsCalibrating(true);
        }
      }
    } else if (event.alpha !== null && event.alpha !== undefined) {
      // Android and other devices
      // Alpha: 0-360, represents the rotation around the z-axis (compass heading)
      // On Android, alpha = 0 means the device is pointing to wherever it was when the page loaded
      // We need to calculate the true heading
      
      if (event.absolute) {
        // If absolute is true, alpha is relative to true north
        heading = (360 - event.alpha) % 360;
      } else {
        // Otherwise, it's relative - still usable but less accurate
        heading = (360 - event.alpha) % 360;
      }
      
      setAccuracy('medium');
      setIsCalibrating(false);
    }
    
    if (heading !== null) {
      const smoothedHeading = smoothHeading(heading);
      setDeviceHeading(smoothedHeading);
    }
  }, [smoothHeading]);

  const requestPermission = async () => {
    setErrorMessage(null);
    
    try {
      // Check if DeviceOrientationEvent.requestPermission exists (iOS 13+)
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        
        if (permission === 'granted') {
          setHasPermission(true);
          window.addEventListener('deviceorientation', handleOrientation, true);
        } else {
          setHasPermission(false);
          setErrorMessage('Permission denied. Please enable motion sensors in your device settings.');
        }
      } else {
        // Non-iOS devices or older iOS
        setHasPermission(true);
        window.addEventListener('deviceorientation', handleOrientation, true);
      }
    } catch (error) {
      console.error('Error requesting orientation permission:', error);
      setErrorMessage('Failed to access compass. Please ensure your device has a compass sensor.');
      setHasPermission(false);
    }
  };

  useEffect(() => {
    // Check if device orientation is available
    if (!('DeviceOrientationEvent' in window)) {
      setErrorMessage('Your device does not support compass functionality.');
      setHasPermission(false);
      return;
    }

    // For iOS 13+ we need to request permission via user gesture
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      setHasPermission(false); // Will need to request
    } else {
      // For Android and older iOS, try to add listener directly
      setHasPermission(true);
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [handleOrientation]);

  // Calculate the rotation needed to point to Qibla
  // When deviceHeading is the direction the phone is pointing,
  // we need to rotate the needle by (qiblaDirection - deviceHeading) to point to Qibla
  const calculateQiblaRotation = () => {
    if (qiblaDirection === null) return 0;
    
    if (deviceHeading !== null) {
      // The compass needle should rotate to show Qibla direction relative to where phone is pointing
      let rotation = qiblaDirection - deviceHeading;
      // Normalize to 0-360
      rotation = ((rotation % 360) + 360) % 360;
      return rotation;
    }
    
    // If no device heading, just show the static Qibla direction from North
    return qiblaDirection;
  };

  const qiblaRotation = calculateQiblaRotation();
  const isPointingToQibla = deviceHeading !== null && Math.abs(qiblaRotation) < 15 || Math.abs(qiblaRotation - 360) < 15;

  if (loading) {
    return (
      <div className={cn('bg-card border border-border rounded-xl p-6', className)}>
        <div className="flex flex-col items-center justify-center py-8 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Getting your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-card border border-border rounded-xl p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Compass className="w-5 h-5 text-primary" />
          Qibla Direction
        </h3>
        <div className="flex items-center gap-2">
          {accuracy && (
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              accuracy === 'high' && 'bg-green-500/20 text-green-400',
              accuracy === 'medium' && 'bg-yellow-500/20 text-yellow-400',
              accuracy === 'low' && 'bg-red-500/20 text-red-400'
            )}>
              {accuracy === 'high' ? 'Accurate' : accuracy === 'medium' ? 'Good' : 'Calibrate'}
            </span>
          )}
          {qiblaDirection && (
            <span className="text-sm text-muted-foreground">
              {qiblaDirection.toFixed(1)}°
            </span>
          )}
        </div>
      </div>

      {/* Compass */}
      <div className="relative w-56 h-56 mx-auto">
        {/* Outer ring with degree markers */}
        <div className="absolute inset-0 rounded-full border-4 border-muted">
          {/* Degree markers */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <div
              key={deg}
              className="absolute w-0.5 h-3 bg-muted-foreground/30 left-1/2 -translate-x-1/2 origin-bottom"
              style={{
                top: '4px',
                transform: `translateX(-50%) rotate(${deg}deg)`,
                transformOrigin: 'center 108px'
              }}
            />
          ))}
          
          {/* Cardinal directions - rotate with device */}
          <div 
            className="absolute inset-0 transition-transform duration-100"
            style={{ transform: deviceHeading !== null ? `rotate(${-deviceHeading}deg)` : 'rotate(0deg)' }}
          >
            <span className="absolute top-3 left-1/2 -translate-x-1/2 text-sm font-bold text-red-400">N</span>
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 text-sm font-bold text-muted-foreground">S</span>
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">W</span>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">E</span>
          </div>
        </div>

        {/* Inner compass with Qibla direction */}
        <div className="absolute inset-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20">
          {/* Qibla arrow - rotates to point to Mecca */}
          <div 
            className="absolute inset-0 transition-transform duration-150 ease-out"
            style={{ transform: `rotate(${qiblaRotation}deg)` }}
          >
            {/* Arrow pointing up (which represents Qibla direction) */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 flex flex-col items-center">
              <div className={cn(
                "w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[24px] transition-colors",
                isPointingToQibla ? "border-b-green-500" : "border-b-primary"
              )} />
              <div className={cn(
                "w-1 h-8 -mt-1 transition-colors",
                isPointingToQibla ? "bg-green-500" : "bg-primary"
              )} />
            </div>
          </div>
          
          {/* Center Kaaba icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-all",
              isPointingToQibla 
                ? "bg-green-500/30 ring-4 ring-green-500/50" 
                : "bg-primary/20"
            )}>
              <span className="text-3xl">🕋</span>
            </div>
          </div>
        </div>

        {/* Pointing indicator at top (shows where phone is pointing) */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
          <div className="w-4 h-4 bg-foreground rotate-45 transform origin-center" />
        </div>
      </div>

      {/* Calibration warning */}
      {isCalibrating && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-400">
            <RotateCcw className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">Calibrating compass...</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Move your phone in a figure-8 pattern to calibrate
          </p>
        </div>
      )}

      {/* Status and instructions */}
      <div className="mt-6 text-center space-y-3">
        {errorMessage && (
          <p className="text-sm text-red-400">{errorMessage}</p>
        )}
        
        {hasPermission === false && !errorMessage && (
          <Button
            onClick={requestPermission}
            variant="outline"
            className="gap-2"
          >
            <Smartphone className="w-4 h-4" />
            Enable Live Compass
          </Button>
        )}
        
        {hasPermission === true && deviceHeading !== null && (
          <div className="space-y-1">
            {isPointingToQibla ? (
              <p className="text-sm font-medium text-green-400 flex items-center justify-center gap-1">
                ✓ You are facing Qibla!
              </p>
            ) : (
              <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <MapPin className="w-4 h-4" />
                Rotate until the arrow points up
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Device heading: {deviceHeading.toFixed(0)}°
            </p>
          </div>
        )}
        
        {hasPermission === true && deviceHeading === null && (
          <div className="space-y-2">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">
              Waiting for compass data...
            </p>
            <p className="text-xs text-muted-foreground">
              Make sure you're on a mobile device with a compass sensor
            </p>
          </div>
        )}

        {!hasPermission && qiblaDirection && (
          <p className="text-sm text-muted-foreground">
            Face {qiblaDirection.toFixed(0)}° from North towards Mecca
          </p>
        )}
      </div>
    </div>
  );
}
