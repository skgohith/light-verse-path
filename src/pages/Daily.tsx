import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useBookmarks } from '@/hooks/useLocalStorage';
import { Sparkles, BookOpen, Bookmark, Share2, ArrowRight, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { HADITH_BOOKS } from '@/hooks/useHadith';

interface DailyVerseData {
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  translation: string;
  surahName: string;
}

interface DailyHadithData {
  hadithNumber: string;
  arabicText: string;
  englishText: string;
  narrator: string;
  bookName: string;
  bookId: string;
}

function useDailyQuran() {
  const [verse, setVerse] = useState<DailyVerseData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVerse = async () => {
    setLoading(true);
    try {
      const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
      );
      const ayahNumber = (dayOfYear % 6236) + 1;

      const [arabicRes, englishRes] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/ar.alafasy`),
        fetch(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/en.asad`),
      ]);

      const arabicData = await arabicRes.json();
      const englishData = await englishRes.json();

      if (arabicData.code === 200 && englishData.code === 200) {
        setVerse({
          surahNumber: arabicData.data.surah.number,
          ayahNumber: arabicData.data.numberInSurah,
          arabicText: arabicData.data.text,
          translation: englishData.data.text,
          surahName: arabicData.data.surah.englishName,
        });
      }
    } catch (error) {
      console.error('Failed to fetch daily verse:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVerse(); }, []);
  return { verse, loading, refresh: fetchVerse };
}

function useDailyHadith() {
  const [hadith, setHadith] = useState<DailyHadithData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHadith = async () => {
    setLoading(true);
    try {
      const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
      );
      // Alternate between Bukhari and Muslim daily
      const bookId = dayOfYear % 2 === 0 ? 'bukhari' : 'muslim';
      const book = HADITH_BOOKS.find(b => b.id === bookId)!;

      const [engRes, araRes] = await Promise.all([
        fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/eng-${bookId}.json`),
        fetch(`https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-${bookId}.json`),
      ]);

      if (engRes.ok) {
        const engData = await engRes.json();
        const araData = araRes.ok ? await araRes.json() : null;
        const engHadiths = engData.hadiths || [];
        const araHadiths = araData?.hadiths || [];

        // Pick a hadith based on the day
        const index = dayOfYear % Math.min(engHadiths.length, 500);
        const h = engHadiths[index];
        const hadithNum = h.hadithnumber?.toString() || `${index + 1}`;
        const arabicMatch = araHadiths.find((ah: any) => ah.hadithnumber?.toString() === hadithNum);

        const narratorMatch = (h.text || '').match(/^(Narrated[^:]+:|It was narrated[^:]+:)/i);
        const narrator = narratorMatch ? narratorMatch[1].replace(/:$/, '') : '';

        setHadith({
          hadithNumber: hadithNum,
          arabicText: arabicMatch?.text || '',
          englishText: h.text || '',
          narrator,
          bookName: book.name,
          bookId,
        });
      }
    } catch (error) {
      console.error('Failed to fetch daily hadith:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHadith(); }, []);
  return { hadith, loading, refresh: fetchHadith };
}

export default function Daily() {
  const { verse, loading: verseLoading, refresh: refreshVerse } = useDailyQuran();
  const { hadith, loading: hadithLoading, refresh: refreshHadith } = useDailyHadith();
  const { addBookmark, isBookmarked } = useBookmarks();

  const handleBookmarkVerse = () => {
    if (verse) {
      addBookmark(verse.surahNumber, verse.ayahNumber, verse.surahName, verse.translation);
    }
  };

  return (
    <div className="min-h-screen bg-background dark flex flex-col">
      <Header />
      <main className="flex-1 py-6 px-4 pb-24">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center mb-2">
            <h1 className="text-2xl font-bold text-foreground">Daily Inspiration</h1>
            <p className="text-sm text-muted-foreground">Your daily dose of Quran & Hadith</p>
          </div>

          {/* Daily Quran Section */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Daily Quran</h2>
            </div>

            {verseLoading ? (
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : verse ? (
              <div className="bg-gradient-to-br from-primary/10 to-accent/5 rounded-2xl p-6 border border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {verse.surahName} • Verse {verse.ayahNumber}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={refreshVerse} className="text-muted-foreground h-8 w-8">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleBookmarkVerse}
                      className={cn('h-8 w-8', isBookmarked(verse.surahNumber, verse.ayahNumber) ? 'text-primary' : 'text-muted-foreground')}
                    >
                      <Bookmark className="w-4 h-4" fill={isBookmarked(verse.surahNumber, verse.ayahNumber) ? 'currentColor' : 'none'} />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="font-arabic text-2xl text-foreground text-right leading-loose mb-4" dir="rtl">
                  {verse.arabicText}
                </p>

                <p className="text-muted-foreground leading-relaxed mb-4">
                  "{verse.translation}"
                </p>

                <Link to={`/surah/${verse.surahNumber}`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    Read full Surah <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            ) : null}
          </section>

          {/* Daily Hadith Section */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">Daily Hadith</h2>
            </div>

            {hadithLoading ? (
              <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : hadith ? (
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {hadith.bookName} • Hadith #{hadith.hadithNumber}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={refreshHadith} className="text-muted-foreground h-8 w-8">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {hadith.arabicText && (
                  <p className="font-arabic text-xl text-foreground text-right leading-loose mb-4" dir="rtl">
                    {hadith.arabicText}
                  </p>
                )}

                {hadith.narrator && (
                  <p className="text-sm text-primary font-medium mb-2">{hadith.narrator}</p>
                )}

                <p className="text-muted-foreground leading-relaxed mb-4">
                  {hadith.englishText}
                </p>

                <Link to={`/hadith/${hadith.bookId}`}>
                  <Button variant="outline" size="sm" className="gap-2">
                    Explore {hadith.bookName} <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            ) : null}
          </section>
        </div>
      </main>
      <MobileNav />
      <Footer className="hidden md:block" />
    </div>
  );
}
