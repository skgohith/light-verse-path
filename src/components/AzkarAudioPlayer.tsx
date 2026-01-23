import { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  Repeat, Shuffle, Sunrise, Moon, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface AzkarItem {
  id: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  audioUrl: string;
  count: number;
}

// Morning Azkar with audio URLs (using public Quran/Islamic audio sources)
const morningAzkar: AzkarItem[] = [
  {
    id: 'm1',
    title: 'Ayatul Kursi',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...',
    transliteration: 'Allahu la ilaha illa huwal hayyul qayyum...',
    translation: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence...',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/255.mp3',
    count: 1,
  },
  {
    id: 'm2',
    title: 'Surah Al-Ikhlas',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ...',
    transliteration: 'Qul huwa Allahu ahad...',
    translation: 'Say, "He is Allah, [who is] One..."',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/112.mp3',
    count: 3,
  },
  {
    id: 'm3',
    title: 'Surah Al-Falaq',
    arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ...',
    transliteration: 'Qul a\'udhu bi rabbil falaq...',
    translation: 'Say, "I seek refuge in the Lord of daybreak..."',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/113.mp3',
    count: 3,
  },
  {
    id: 'm4',
    title: 'Surah An-Nas',
    arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ...',
    transliteration: 'Qul a\'udhu bi rabbin naas...',
    translation: 'Say, "I seek refuge in the Lord of mankind..."',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/114.mp3',
    count: 3,
  },
  {
    id: 'm5',
    title: 'Morning Dhikr',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ...',
    transliteration: 'Asbahna wa asbahal mulku lillah...',
    translation: 'We have reached the morning and sovereignty belongs to Allah...',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3',
    count: 1,
  },
];

const eveningAzkar: AzkarItem[] = [
  {
    id: 'e1',
    title: 'Ayatul Kursi',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...',
    transliteration: 'Allahu la ilaha illa huwal hayyul qayyum...',
    translation: 'Allah - there is no deity except Him, the Ever-Living...',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/255.mp3',
    count: 1,
  },
  {
    id: 'e2',
    title: 'Surah Al-Ikhlas',
    arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ...',
    transliteration: 'Qul huwa Allahu ahad...',
    translation: 'Say, "He is Allah, [who is] One..."',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/112.mp3',
    count: 3,
  },
  {
    id: 'e3',
    title: 'Surah Al-Falaq',
    arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ...',
    transliteration: 'Qul a\'udhu bi rabbil falaq...',
    translation: 'Say, "I seek refuge in the Lord of daybreak..."',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/113.mp3',
    count: 3,
  },
  {
    id: 'e4',
    title: 'Surah An-Nas',
    arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ...',
    transliteration: 'Qul a\'udhu bi rabbin naas...',
    translation: 'Say, "I seek refuge in the Lord of mankind..."',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/114.mp3',
    count: 3,
  },
  {
    id: 'e5',
    title: 'Evening Dhikr',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ...',
    transliteration: 'Amsayna wa amsal mulku lillah...',
    translation: 'We have reached the evening and sovereignty belongs to Allah...',
    audioUrl: 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3',
    count: 1,
  },
];

interface AzkarAudioPlayerProps {
  type?: 'morning' | 'evening';
  compact?: boolean;
}

export function AzkarAudioPlayer({ type = 'morning', compact = false }: AzkarAudioPlayerProps) {
  const [currentType, setCurrentType] = useState<'morning' | 'evening'>(type);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentCount, setCurrentCount] = useState(1);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isRepeat, setIsRepeat] = useState(false);
  const [expanded, setExpanded] = useState(!compact);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const azkarList = currentType === 'morning' ? morningAzkar : eveningAzkar;
  const currentAzkar = azkarList[currentIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      if (currentCount < currentAzkar.count) {
        setCurrentCount(prev => prev + 1);
        audio.currentTime = 0;
        audio.play();
      } else if (currentIndex < azkarList.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setCurrentCount(1);
      } else if (isRepeat) {
        setCurrentIndex(0);
        setCurrentCount(1);
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentIndex, currentCount, currentAzkar, azkarList.length, isRepeat]);

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentIndex]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const playPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setCurrentCount(1);
    }
  };

  const playNext = () => {
    if (currentIndex < azkarList.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentCount(1);
    }
  };

  const selectAzkar = (index: number) => {
    setCurrentIndex(index);
    setCurrentCount(1);
    setIsPlaying(true);
  };

  const handleProgressChange = (value: number[]) => {
    if (audioRef.current) {
      const newTime = (value[0] / 100) * duration;
      audioRef.current.currentTime = newTime;
      setProgress(value[0]);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <audio ref={audioRef} src={currentAzkar.audioUrl} preload="metadata" />
      
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 to-accent/10 p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            {currentType === 'morning' ? (
              <Sunrise className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-500" />
            )}
            {currentType === 'morning' ? 'Morning' : 'Evening'} Azkar
          </h3>
          {compact && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setExpanded(!expanded)}
              className="h-8 w-8"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          )}
        </div>

        {/* Type Toggle */}
        <div className="flex gap-2">
          <Button
            variant={currentType === 'morning' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setCurrentType('morning'); setCurrentIndex(0); setCurrentCount(1); }}
            className="flex-1 gap-2"
          >
            <Sunrise className="w-4 h-4" />
            Morning
          </Button>
          <Button
            variant={currentType === 'evening' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setCurrentType('evening'); setCurrentIndex(0); setCurrentCount(1); }}
            className="flex-1 gap-2"
          >
            <Moon className="w-4 h-4" />
            Evening
          </Button>
        </div>
      </div>

      {/* Now Playing */}
      <div className="p-4 border-b border-border">
        <div className="text-center mb-3">
          <p className="font-arabic text-xl text-primary mb-1">{currentAzkar.arabic}</p>
          <p className="text-sm text-foreground font-medium">{currentAzkar.title}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Repeat {currentCount}/{currentAzkar.count}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[progress]}
            max={100}
            step={0.1}
            onValueChange={handleProgressChange}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime((progress / 100) * duration)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsRepeat(!isRepeat)}
            className={cn('h-8 w-8', isRepeat && 'text-primary')}
          >
            <Repeat className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={playPrevious}
            disabled={currentIndex === 0}
            className="h-10 w-10"
          >
            <SkipBack className="w-5 h-5" />
          </Button>
          
          <Button
            size="icon"
            onClick={togglePlay}
            className="h-14 w-14 rounded-full"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={playNext}
            disabled={currentIndex === azkarList.length - 1}
            className="h-10 w-10"
          >
            <SkipForward className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMuted(!isMuted)}
            className="h-8 w-8"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-3 mt-3 px-4">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <Slider
            value={[volume]}
            max={100}
            step={1}
            onValueChange={(v) => setVolume(v[0])}
            className="flex-1"
          />
        </div>
      </div>

      {/* Playlist */}
      {expanded && (
        <ScrollArea className="h-48">
          <div className="p-2">
            {azkarList.map((azkar, idx) => (
              <button
                key={azkar.id}
                onClick={() => selectAzkar(idx)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors",
                  idx === currentIndex 
                    ? "bg-primary/10 border border-primary/30" 
                    : "hover:bg-muted"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0",
                  idx === currentIndex ? "bg-primary text-primary-foreground" : "bg-muted"
                )}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium truncate",
                    idx === currentIndex ? "text-primary" : "text-foreground"
                  )}>
                    {azkar.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Repeat {azkar.count}x
                  </p>
                </div>
                {idx === currentIndex && isPlaying && (
                  <div className="flex gap-0.5">
                    <div className="w-1 h-4 bg-primary rounded-full animate-pulse" />
                    <div className="w-1 h-4 bg-primary rounded-full animate-pulse delay-75" />
                    <div className="w-1 h-4 bg-primary rounded-full animate-pulse delay-150" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
