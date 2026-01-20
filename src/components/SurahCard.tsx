import { Link } from 'react-router-dom';
import { Surah } from '@/types/quran';
import { cn } from '@/lib/utils';

interface SurahCardProps {
  surah: Surah;
  className?: string;
}

export function SurahCard({ surah, className }: SurahCardProps) {
  return (
    <Link
      to={`/surah/${surah.number}`}
      className={cn(
        'group block bg-card border border-border rounded-xl p-4 transition-all duration-300',
        'hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5',
        className
      )}
    >
      <div className="flex items-center gap-4">
        {/* Number Badge */}
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-sm font-semibold text-primary">{surah.number}</span>
        </div>

        {/* Surah Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {surah.englishName}
            </h3>
            <span className="font-arabic text-lg text-foreground shrink-0">
              {surah.name}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">
              {surah.englishNameTranslation}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              {surah.numberOfAyahs} verses
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              surah.revelationType === 'Meccan'
                ? 'bg-primary/10 text-primary'
                : 'bg-accent/10 text-accent'
            )}>
              {surah.revelationType}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
