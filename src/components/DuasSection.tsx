import { useState } from 'react';
import { duas, duaCategories } from '@/data/duas';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BookOpen, Heart, Moon, Sun, Star, Sparkles, Users, Copy, Check, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dua } from '@/types/quran';
import { useToast } from '@/hooks/use-toast';

interface DuasSectionProps {
  className?: string;
  compact?: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  bookOpen: BookOpen,
  heart: Heart,
  moon: Moon,
  sun: Sun,
  star: Star,
  sparkles: Sparkles,
  users: Users,
};

export function DuasSection({ className, compact = false }: DuasSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDua, setSelectedDua] = useState<Dua | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredDuas = selectedCategory
    ? duas.filter((dua) => dua.category === selectedCategory)
    : duas;

  const displayDuas = compact ? filteredDuas.slice(0, 4) : filteredDuas;

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast({
        title: 'Copied!',
        description: 'Dua copied to clipboard',
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast({
        title: 'Failed to copy',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Categories */}
      {!compact && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Button>
          {duaCategories.map((category) => {
            const Icon = iconMap[category.icon] || BookOpen;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="gap-1"
              >
                <Icon className="w-3 h-3" />
                {category.name}
              </Button>
            );
          })}
        </div>
      )}

      {/* Duas Grid */}
      <div className={cn(
        'grid gap-4',
        compact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
      )}>
        {displayDuas.map((dua) => (
          <div
            key={dua.id}
            className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => setSelectedDua(dua)}
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-medium text-foreground">{dua.title}</h4>
              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full capitalize">
                {dua.category}
              </span>
            </div>
            
            <p className="font-arabic text-lg text-foreground text-right leading-loose mb-3" dir="rtl">
              {dua.arabic}
            </p>
            
            <p className="text-sm text-muted-foreground italic mb-2">
              {dua.transliteration}
            </p>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {dua.translation}
            </p>
          </div>
        ))}
      </div>

      {compact && (
        <p className="text-center text-sm text-muted-foreground">
          View all {duas.length} duas
        </p>
      )}

      {/* Dua Detail Dialog */}
      <Dialog open={!!selectedDua} onOpenChange={() => setSelectedDua(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {selectedDua?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedDua && (
            <div className="space-y-6 py-4">
              {/* Arabic */}
              <div className="bg-muted/30 rounded-lg p-4">
                <p className="font-arabic text-2xl text-foreground text-right leading-loose" dir="rtl">
                  {selectedDua.arabic}
                </p>
              </div>

              {/* Transliteration */}
              <div>
                <h5 className="text-sm font-medium text-muted-foreground mb-2">Transliteration</h5>
                <p className="text-foreground italic">{selectedDua.transliteration}</p>
              </div>

              {/* Translation */}
              <div>
                <h5 className="text-sm font-medium text-muted-foreground mb-2">Translation</h5>
                <p className="text-foreground">{selectedDua.translation}</p>
              </div>

              {/* Reference */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Reference: {selectedDua.reference}</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(
                      `${selectedDua.arabic}\n\n${selectedDua.transliteration}\n\n${selectedDua.translation}`,
                      selectedDua.id
                    )}
                  >
                    {copiedId === selectedDua.id ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
