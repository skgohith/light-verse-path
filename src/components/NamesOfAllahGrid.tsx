import { useState } from 'react';
import { namesOfAllah } from '@/data/namesOfAllah';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Sparkles, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NameOfAllah } from '@/types/quran';

interface NamesOfAllahGridProps {
  className?: string;
  compact?: boolean;
}

export function NamesOfAllahGrid({ className, compact = false }: NamesOfAllahGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedName, setSelectedName] = useState<NameOfAllah | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const filteredNames = namesOfAllah.filter(
    (name) =>
      name.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      name.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      name.name.includes(searchQuery)
  );

  const displayNames = compact ? filteredNames.slice(0, 9) : filteredNames;

  const playAllNames = () => {
    setIsPlaying(!isPlaying);
    // In a real app, this would use Web Speech API or audio files
  };

  return (
    <div className={cn('space-y-4', className)}>
      {!compact && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search names..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card"
            />
          </div>
          <Button variant="outline" onClick={playAllNames} className="gap-2">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? 'Pause' : 'Play All'}
          </Button>
        </div>
      )}

      <div className={cn(
        'grid gap-3',
        compact ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
      )}>
        {displayNames.map((name) => (
          <button
            key={name.id}
            onClick={() => setSelectedName(name)}
            className={cn(
              'group bg-card border border-border rounded-xl p-4 text-center transition-all duration-300',
              'hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5',
              compact && 'p-3'
            )}
          >
            <div className={cn(
              'w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2',
              compact && 'w-6 h-6 mb-1'
            )}>
              <span className={cn('text-xs font-semibold text-primary', compact && 'text-[10px]')}>
                {name.id}
              </span>
            </div>
            <p className={cn(
              'font-arabic text-lg text-foreground mb-1 group-hover:text-primary transition-colors',
              compact && 'text-base'
            )}>
              {name.name}
            </p>
            <p className={cn('text-sm font-medium text-foreground', compact && 'text-xs')}>
              {name.transliteration}
            </p>
            {!compact && (
              <p className="text-xs text-muted-foreground mt-1">{name.meaning}</p>
            )}
          </button>
        ))}
      </div>

      {compact && (
        <p className="text-center text-sm text-muted-foreground">
          Showing 9 of 99 names
        </p>
      )}

      {/* Name Detail Dialog */}
      <Dialog open={!!selectedName} onOpenChange={() => setSelectedName(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Name of Allah
            </DialogTitle>
          </DialogHeader>
          
          {selectedName && (
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-lg font-semibold text-primary">{selectedName.id}</span>
              </div>
              
              <p className="font-arabic text-4xl text-foreground mb-4">
                {selectedName.name}
              </p>
              
              <p className="text-xl font-semibold text-primary mb-2">
                {selectedName.transliteration}
              </p>
              
              <p className="text-lg text-foreground mb-4">
                {selectedName.meaning}
              </p>
              
              {selectedName.description && (
                <p className="text-muted-foreground leading-relaxed">
                  {selectedName.description}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
