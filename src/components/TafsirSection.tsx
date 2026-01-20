import { useState } from 'react';
import { useTafsir } from '@/hooks/useQuranApi';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TafsirSectionProps {
  surahNumber: number;
  ayahNumber: number;
  className?: string;
}

export function TafsirSection({ surahNumber, ayahNumber, className }: TafsirSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { tafsir, loading, error } = useTafsir(surahNumber, ayahNumber);

  return (
    <div className={cn('border-t border-border pt-4 mt-4', className)}>
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between text-muted-foreground hover:text-foreground"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          <span>Tafsir (Interpretation)</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </Button>

      {isExpanded && (
        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading tafsir...</span>
            </div>
          ) : error ? (
            <p className="text-destructive text-center py-4">{error}</p>
          ) : tafsir ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Ibn Kathir Commentary
              </h4>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {tafsir}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No tafsir available for this verse.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
