import { useState } from 'react';
import { useHadiths, useRandomHadith, HADITH_BOOKS, type Hadith } from '@/hooks/useHadith';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, BookOpen, ChevronLeft, ChevronRight, Shuffle, Copy, Check, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface HadithSectionProps {
  className?: string;
  compact?: boolean;
}

export function HadithSection({ className, compact = false }: HadithSectionProps) {
  const [selectedBook, setSelectedBook] = useState('bukhari');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHadith, setSelectedHadith] = useState<Hadith | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { hadiths, loading, error, hasMore } = useHadiths(selectedBook, page, compact ? 3 : 10);
  const { hadith: randomHadith, loading: randomLoading } = useRandomHadith();

  const currentBook = HADITH_BOOKS.find(b => b.id === selectedBook);

  const copyHadith = async (hadith: Hadith) => {
    const text = `${hadith.englishNarrator ? hadith.englishNarrator + ': ' : ''}${hadith.hadithEnglish}\n\n- ${currentBook?.name}, Hadith ${hadith.hadithNumber}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(hadith.id);
    toast.success('Hadith copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shareHadith = async (hadith: Hadith) => {
    const text = `${hadith.englishNarrator ? hadith.englishNarrator + ': ' : ''}${hadith.hadithEnglish}\n\n- ${currentBook?.name}, Hadith ${hadith.hadithNumber}`;
    if (navigator.share) {
      await navigator.share({ text });
    } else {
      copyHadith(hadith);
    }
  };

  if (compact) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Daily Hadith
          </h3>
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            <Shuffle className="w-3 h-3" /> New
          </Button>
        </div>

        {randomLoading ? (
          <Skeleton className="h-32 rounded-xl" />
        ) : randomHadith ? (
          <div 
            onClick={() => setSelectedHadith(randomHadith)}
            className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/50 transition-colors"
          >
            <p className="text-sm text-foreground line-clamp-4 mb-2">
              {randomHadith.hadithEnglish}
            </p>
            <p className="text-xs text-muted-foreground">
              {HADITH_BOOKS.find(b => b.id === randomHadith.bookSlug)?.name}
            </p>
          </div>
        ) : null}

        {/* Detail Dialog */}
        <Dialog open={!!selectedHadith} onOpenChange={() => setSelectedHadith(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Hadith Details
              </DialogTitle>
            </DialogHeader>
            {selectedHadith && (
              <div className="space-y-4">
                <Badge variant="secondary">
                  {HADITH_BOOKS.find(b => b.id === selectedHadith.bookSlug)?.name} - Hadith #{selectedHadith.hadithNumber}
                </Badge>
                
                {selectedHadith.hadithArabic && (
                  <p className="font-arabic text-xl text-right leading-loose text-foreground">
                    {selectedHadith.hadithArabic}
                  </p>
                )}
                
                {selectedHadith.englishNarrator && (
                  <p className="text-sm text-primary font-medium">
                    {selectedHadith.englishNarrator}
                  </p>
                )}
                
                <p className="text-foreground leading-relaxed">
                  {selectedHadith.hadithEnglish}
                </p>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => copyHadith(selectedHadith)} className="gap-2">
                    {copiedId === selectedHadith.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => shareHadith(selectedHadith)} className="gap-2">
                    <Share2 className="w-4 h-4" /> Share
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Book Selection */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={selectedBook} onValueChange={(v) => { setSelectedBook(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Select collection" />
          </SelectTrigger>
          <SelectContent>
            {HADITH_BOOKS.map((book) => (
              <SelectItem key={book.id} value={book.id}>
                <div className="flex items-center gap-2">
                  <span>{book.name}</span>
                  <span className="text-xs text-muted-foreground">({book.hadiths.toLocaleString()})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search hadiths..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-card"
          />
        </div>
      </div>

      {/* Book Info */}
      {currentBook && (
        <div className="bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{currentBook.name}</h3>
              <p className="font-arabic text-lg text-primary">{currentBook.arabicName}</p>
            </div>
            <Badge variant="secondary">{currentBook.hadiths.toLocaleString()} Hadiths</Badge>
          </div>
        </div>
      )}

      {/* Hadiths List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={() => setPage(1)} className="mt-4">
            Try Again
          </Button>
        </div>
      ) : (
        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-4">
            {hadiths.map((hadith) => (
              <div
                key={hadith.id}
                onClick={() => setSelectedHadith(hadith)}
                className="bg-card border border-border rounded-xl p-5 cursor-pointer hover:border-primary/50 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="outline" className="text-xs">
                    Hadith #{hadith.hadithNumber}
                  </Badge>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={(e) => { e.stopPropagation(); copyHadith(hadith); }}
                    >
                      {copiedId === hadith.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={(e) => { e.stopPropagation(); shareHadith(hadith); }}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {hadith.hadithArabic && (
                  <p className="font-arabic text-lg text-right leading-loose text-foreground mb-3">
                    {hadith.hadithArabic}
                  </p>
                )}

                {hadith.englishNarrator && (
                  <p className="text-sm text-primary font-medium mb-2">
                    {hadith.englishNarrator}
                  </p>
                )}

                <p className="text-foreground leading-relaxed line-clamp-3">
                  {hadith.hadithEnglish}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </Button>
        <span className="text-sm text-muted-foreground">Page {page}</span>
        <Button
          variant="outline"
          onClick={() => setPage(p => p + 1)}
          disabled={!hasMore || loading}
          className="gap-2"
        >
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedHadith} onOpenChange={() => setSelectedHadith(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Hadith Details
            </DialogTitle>
          </DialogHeader>
          {selectedHadith && (
            <div className="space-y-4">
              <Badge variant="secondary">
                {currentBook?.name} - Hadith #{selectedHadith.hadithNumber}
              </Badge>
              
              {selectedHadith.hadithArabic && (
                <p className="font-arabic text-xl text-right leading-loose text-foreground">
                  {selectedHadith.hadithArabic}
                </p>
              )}
              
              {selectedHadith.englishNarrator && (
                <p className="text-sm text-primary font-medium">
                  {selectedHadith.englishNarrator}
                </p>
              )}
              
              <p className="text-foreground leading-relaxed">
                {selectedHadith.hadithEnglish}
              </p>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => copyHadith(selectedHadith)} className="gap-2">
                  {copiedId === selectedHadith.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={() => shareHadith(selectedHadith)} className="gap-2">
                  <Share2 className="w-4 h-4" /> Share
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
