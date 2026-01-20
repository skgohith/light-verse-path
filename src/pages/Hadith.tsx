import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHadiths, HADITH_BOOKS, type Hadith as HadithType } from '@/hooks/useHadith';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, BookOpen, ChevronLeft, ChevronRight, Copy, Check, Share2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Hadith() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const [selectedBook, setSelectedBook] = useState(bookId || '');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHadith, setSelectedHadith] = useState<HadithType | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { hadiths, loading, error, hasMore } = useHadiths(selectedBook, page, 10);
  const currentBook = HADITH_BOOKS.find(b => b.id === selectedBook);

  const copyHadith = async (hadith: HadithType) => {
    const bookName = HADITH_BOOKS.find(b => b.id === hadith.bookSlug)?.name || '';
    const text = `${hadith.englishNarrator ? hadith.englishNarrator + ': ' : ''}${hadith.hadithEnglish}\n\n- ${bookName}, Hadith ${hadith.hadithNumber}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(hadith.id);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shareHadith = async (hadith: HadithType) => {
    const bookName = HADITH_BOOKS.find(b => b.id === hadith.bookSlug)?.name || '';
    const text = `${hadith.englishNarrator ? hadith.englishNarrator + ': ' : ''}${hadith.hadithEnglish}\n\n- ${bookName}, Hadith ${hadith.hadithNumber}`;
    if (navigator.share) {
      await navigator.share({ text });
    } else {
      copyHadith(hadith);
    }
  };

  // Book selection view
  if (!selectedBook) {
    return (
      <div className="min-h-screen bg-background dark flex flex-col">
        <Header />
        <main className="flex-1 py-6 px-4 pb-24">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground">Hadith Collections</h1>
              <p className="text-sm text-muted-foreground">Browse all 6 major hadith collections</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {HADITH_BOOKS.map((book) => (
                <Card 
                  key={book.id}
                  className="cursor-pointer hover:border-primary/50 transition-all group"
                  onClick={() => {
                    setSelectedBook(book.id);
                    navigate(`/hadith/${book.id}`);
                  }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-arabic text-2xl text-primary mb-1">{book.arabicName}</p>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {book.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {book.hadiths.toLocaleString()} hadiths
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
        <MobileNav />
        <Footer className="hidden md:block" />
      </div>
    );
  }

  // Hadith list view
  return (
    <div className="min-h-screen bg-background dark flex flex-col">
      <Header />
      <main className="flex-1 py-6 px-4 pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Header with back button */}
          <div className="flex items-center gap-3 mb-6">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                setSelectedBook('');
                navigate('/hadith');
              }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              {currentBook && (
                <>
                  <p className="font-arabic text-xl text-primary">{currentBook.arabicName}</p>
                  <h1 className="text-lg font-bold text-foreground">{currentBook.name}</h1>
                </>
              )}
            </div>
            <Badge variant="secondary">{currentBook?.hadiths.toLocaleString()} hadiths</Badge>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search hadiths..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card"
            />
          </div>

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
            <ScrollArea className="h-[calc(100vh-320px)]">
              <div className="space-y-3">
                {hadiths.map((hadith) => (
                  <Card
                    key={hadith.id}
                    onClick={() => setSelectedHadith(hadith)}
                    className="cursor-pointer hover:border-primary/50 transition-all group"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          #{hadith.hadithNumber}
                        </Badge>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={(e) => { e.stopPropagation(); copyHadith(hadith); }}
                          >
                            {copiedId === hadith.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={(e) => { e.stopPropagation(); shareHadith(hadith); }}
                          >
                            <Share2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {hadith.hadithArabic && (
                        <p className="font-arabic text-lg text-right leading-loose text-foreground mb-2">
                          {hadith.hadithArabic}
                        </p>
                      )}

                      {hadith.englishNarrator && (
                        <p className="text-xs text-primary font-medium mb-1">
                          {hadith.englishNarrator}
                        </p>
                      )}

                      <p className="text-sm text-foreground leading-relaxed line-clamp-3">
                        {hadith.hadithEnglish}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>
            <span className="text-sm text-muted-foreground">Page {page}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={!hasMore || loading}
              className="gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>

      {/* Detail Dialog */}
      <Dialog open={!!selectedHadith} onOpenChange={() => setSelectedHadith(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {currentBook?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedHadith && (
            <div className="space-y-4">
              <Badge variant="secondary">
                Hadith #{selectedHadith.hadithNumber}
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

              <div className="flex gap-2 pt-2">
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

      <MobileNav />
      <Footer className="hidden md:block" />
    </div>
  );
}
