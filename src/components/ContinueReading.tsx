import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { useReadingProgress } from '@/hooks/useLocalStorage';
import { useSurahs } from '@/hooks/useQuranApi';
import { Button } from '@/components/ui/button';

export function ContinueReading() {
  const { progress } = useReadingProgress();
  const { surahs } = useSurahs();

  if (!progress) {
    return (
      <div className="bg-gradient-to-br from-primary/20 to-accent/10 rounded-2xl p-6 border border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Start Your Journey</h3>
            <p className="text-sm text-muted-foreground">Begin reading the Quran today</p>
          </div>
        </div>
        <Link to="/surah/1">
          <Button className="w-full gap-2">
            Start Reading <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    );
  }

  const currentSurah = surahs.find(s => s.number === progress.surahNumber);
  const lastRead = new Date(progress.timestamp).toLocaleDateString();

  return (
    <div className="bg-gradient-to-br from-primary/20 to-accent/10 rounded-2xl p-6 border border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Continue Reading</h3>
        <span className="text-xs text-muted-foreground">Last read: {lastRead}</span>
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
          <span className="font-semibold text-primary">{progress.surahNumber}</span>
        </div>
        <div>
          <h4 className="font-semibold text-foreground">
            {currentSurah?.englishName || `Surah ${progress.surahNumber}`}
          </h4>
          <p className="text-sm text-muted-foreground">
            Verse {progress.ayahNumber}
          </p>
        </div>
      </div>

      <Link to={`/surah/${progress.surahNumber}?ayah=${progress.ayahNumber}`}>
        <Button className="w-full gap-2">
          Continue <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  );
}
