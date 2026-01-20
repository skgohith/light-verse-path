import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Reciter {
  id: string;
  name: string;
  identifier: string;
}

const RECITERS: Reciter[] = [
  { id: '1', name: 'Mishary Rashid Alafasy', identifier: 'ar.alafasy' },
  { id: '2', name: 'Abdul Basit (Murattal)', identifier: 'ar.abdulbasitmurattal' },
  { id: '3', name: 'Abdul Rahman Al-Sudais', identifier: 'ar.abdurrahmaansudais' },
  { id: '4', name: 'Maher Al-Muaiqly', identifier: 'ar.maaboroshed' },
  { id: '5', name: 'Saad Al-Ghamdi', identifier: 'ar.saoodshuraym' },
];

// Calculate absolute ayah number across the entire Quran
const SURAH_AYAH_COUNTS = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];

function getAbsoluteAyahNumber(surahNumber: number, ayahNumber: number): number {
  let total = 0;
  for (let i = 0; i < surahNumber - 1; i++) {
    total += SURAH_AYAH_COUNTS[i];
  }
  return total + ayahNumber;
}

interface AudioPlayerProps {
  surahNumber: number;
  ayahNumber?: number;
  totalAyahs: number;
  onAyahChange?: (ayahNumber: number) => void;
  className?: string;
}

export function AudioPlayer({ surahNumber, ayahNumber = 1, totalAyahs, onAyahChange, className }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState(RECITERS[0].identifier);
  const [currentAyah, setCurrentAyah] = useState(ayahNumber);
  const [audioError, setAudioError] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Calculate proper audio URL using absolute ayah number
  const absoluteAyahNumber = getAbsoluteAyahNumber(surahNumber, currentAyah);
  const audioUrl = `https://cdn.islamic.network/quran/audio/128/${selectedReciter}/${absoluteAyahNumber}.mp3`;

  useEffect(() => {
    setCurrentAyah(ayahNumber);
  }, [ayahNumber]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentAyah, selectedReciter]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    if (repeat) {
      audioRef.current?.play();
    } else if (currentAyah < totalAyahs) {
      const nextAyah = currentAyah + 1;
      setCurrentAyah(nextAyah);
      onAyahChange?.(nextAyah);
    } else {
      setIsPlaying(false);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume || 1;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const skipPrevious = () => {
    if (currentAyah > 1) {
      const prevAyah = currentAyah - 1;
      setCurrentAyah(prevAyah);
      onAyahChange?.(prevAyah);
    }
  };

  const skipNext = () => {
    if (currentAyah < totalAyahs) {
      const nextAyah = currentAyah + 1;
      setCurrentAyah(nextAyah);
      onAyahChange?.(nextAyah);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleError = () => {
    setAudioError(true);
    setIsPlaying(false);
  };

  return (
    <div className={cn('bg-card border border-border rounded-xl p-4', className)}>
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => { handleLoadedMetadata(); setAudioError(false); }}
        onEnded={handleEnded}
        onError={handleError}
      />

      {/* Reciter Selection */}
      <div className="mb-4">
        <Select value={selectedReciter} onValueChange={setSelectedReciter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select reciter" />
          </SelectTrigger>
          <SelectContent>
            {RECITERS.map((reciter) => (
              <SelectItem key={reciter.id} value={reciter.identifier}>
                {reciter.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={1}
          onValueChange={handleSeek}
          className="w-full"
        />
        <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>Verse {currentAyah} of {totalAyahs}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="text-muted-foreground"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.1}
            onValueChange={handleVolumeChange}
            className="w-20"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={skipPrevious}
            disabled={currentAyah <= 1}
            className="text-muted-foreground"
          >
            <SkipBack className="w-5 h-5" />
          </Button>
          <Button
            onClick={togglePlay}
            size="icon"
            className="w-12 h-12 rounded-full bg-primary text-primary-foreground"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={skipNext}
            disabled={currentAyah >= totalAyahs}
            className="text-muted-foreground"
          >
            <SkipForward className="w-5 h-5" />
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setRepeat(!repeat)}
          className={cn('text-muted-foreground', repeat && 'text-primary')}
        >
          <Repeat className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
