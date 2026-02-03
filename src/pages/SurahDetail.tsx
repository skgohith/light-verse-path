import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { AudioPlayer } from '@/components/AudioPlayer';
import { TafsirSection } from '@/components/TafsirSection';
import { useSurahDetail } from '@/hooks/useQuranApi';
import { useRomanUrduSurah } from '@/hooks/useRomanUrduQuran';
import { useReadingProgress, useBookmarks } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Bookmark, Share2, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SurahDetail() {
  const { surahNumber } = useParams<{ surahNumber: string }>();
  const number = parseInt(surahNumber || '1', 10);
  const { surah, translation, transliteration, loading } = useSurahDetail(number);
  const { surah: romanUrduSurah } = useRomanUrduSurah(number);
  const { updateProgress } = useReadingProgress();
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const [currentAyah, setCurrentAyah] = useState(1);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [translationLang, setTranslationLang] = useState<'english' | 'romanUrdu'>('romanUrdu');

  useEffect(() => {
    if (surah) {
      updateProgress(number, currentAyah);
    }
  }, [number, currentAyah, surah]);

  const handleBookmark = (ayahNumber: number, ayahText: string) => {
    const id = `${number}-${ayahNumber}`;
    if (isBookmarked(number, ayahNumber)) {
      removeBookmark(id);
    } else {
      addBookmark(number, ayahNumber, surah?.englishName || '', ayahText);
    }
  };

  const fontSizeClasses = {
    sm: { arabic: 'text-xl', english: 'text-sm', translit: 'text-xs' },
    md: { arabic: 'text-2xl', english: 'text-base', translit: 'text-sm' },
    lg: { arabic: 'text-3xl', english: 'text-lg', translit: 'text-base' },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark">
        <Header />
        <main className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-12 w-64 mb-4" />
            <Skeleton className="h-8 w-48 mb-8" />
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!surah) {
    return (
      <div className="min-h-screen bg-background dark">
        <Header />
        <main className="py-8 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Surah not found</h1>
            <Link to="/read"><Button>Go back to Surah list</Button></Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark">
      <Header />
      <main className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <Link to="/read">
              <Button variant="ghost" size="sm" className="gap-2">
                <ChevronLeft className="w-4 h-4" /> All Surahs
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              {number > 1 && (
                <Link to={`/surah/${number - 1}`}>
                  <Button variant="outline" size="sm"><ChevronLeft className="w-4 h-4" /> Previous</Button>
                </Link>
              )}
              {number < 114 && (
                <Link to={`/surah/${number + 1}`}>
                  <Button variant="outline" size="sm">Next <ChevronRight className="w-4 h-4" /></Button>
                </Link>
              )}
            </div>
          </div>

          {/* Surah Header */}
          <div className="bg-gradient-to-br from-primary/10 to-accent/5 rounded-2xl p-8 mb-8 text-center border border-primary/20">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-sm font-semibold text-primary">{surah.number}</span>
              <span className={cn('text-xs px-2 py-0.5 rounded-full', surah.revelationType === 'Meccan' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent')}>{surah.revelationType}</span>
            </div>
            <h1 className="font-arabic text-4xl text-foreground mb-2">{surah.name}</h1>
            <h2 className="text-2xl font-bold text-foreground mb-1">{surah.englishName}</h2>
            <p className="text-muted-foreground">{surah.englishNameTranslation}</p>
            <p className="text-sm text-muted-foreground mt-2">{surah.numberOfAyahs} Verses</p>
          </div>

          <AudioPlayer surahNumber={number} ayahNumber={currentAyah} totalAyahs={surah.numberOfAyahs} onAyahChange={setCurrentAyah} className="mb-8" />

          {/* Settings */}
          <div className="flex items-center justify-between mb-6 p-4 bg-card border border-border rounded-xl flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Text Size</span>
              <div className="flex items-center gap-1">
                {(['sm', 'md', 'lg'] as const).map((size) => (
                  <Button key={size} variant="ghost" size="sm" onClick={() => setFontSize(size)} className={cn(fontSize === size && 'bg-muted')}>{size.toUpperCase()}</Button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={translationLang} onValueChange={(v) => setTranslationLang(v as 'english' | 'romanUrdu')}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Translation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="romanUrdu">Roman Urdu</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                </SelectContent>
              </Select>
              <Button variant={showTransliteration ? 'default' : 'outline'} size="sm" onClick={() => setShowTransliteration(!showTransliteration)}>
                Transliteration
              </Button>
            </div>
          </div>

          {/* Bismillah */}
          {number !== 1 && number !== 9 && (
            <div className="text-center py-8 mb-8 border-b border-border">
              <p className="font-arabic text-3xl text-foreground">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
              <p className="text-primary italic mt-2">Bismillahir Rahmanir Raheem</p>
              <p className="text-muted-foreground mt-1">In the name of Allah, the Most Gracious, the Most Merciful</p>
            </div>
          )}

          {/* Ayahs */}
          <div className="space-y-6">
            {surah.ayahs.map((ayah, index) => {
              const translationAyah = translation?.ayahs[index];
              const translitAyah = transliteration?.ayahs[index];
              const romanUrduVerse = romanUrduSurah?.verses[index];
              const bookmarked = isBookmarked(number, ayah.numberInSurah);

              // Get translation text based on selected language
              const getTranslationText = () => {
                if (translationLang === 'romanUrdu' && romanUrduVerse) {
                  return romanUrduVerse.translation;
                }
                return translationAyah?.text || '';
              };

              // Get transliteration from local data if available
              const getTransliteration = () => {
                if (romanUrduVerse?.transliteration) {
                  return romanUrduVerse.transliteration;
                }
                return translitAyah?.text || '';
              };

              return (
                <div key={ayah.number} id={`ayah-${ayah.numberInSurah}`} className={cn('bg-card border border-border rounded-xl p-6 transition-all', currentAyah === ayah.numberInSurah && 'border-primary/50 bg-primary/5')}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-sm font-semibold text-primary">{ayah.numberInSurah}</span>
                      <span className="text-xs text-muted-foreground">Juz {romanUrduVerse?.juz || ayah.juz} • Page {ayah.page}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleBookmark(ayah.numberInSurah, getTranslationText())} className={cn(bookmarked ? 'text-primary' : 'text-muted-foreground')}>
                        <Bookmark className="w-4 h-4" fill={bookmarked ? 'currentColor' : 'none'} />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-muted-foreground"><Share2 className="w-4 h-4" /></Button>
                    </div>
                  </div>

                  <p className={cn('font-arabic text-foreground text-right leading-loose mb-4', fontSizeClasses[fontSize].arabic)} dir="rtl">{ayah.text}</p>

                  {showTransliteration && (
                    <p className={cn('text-primary italic mb-3', fontSizeClasses[fontSize].translit)}>{getTransliteration()}</p>
                  )}

                  <p className={cn('text-muted-foreground leading-relaxed', fontSizeClasses[fontSize].english)}>{getTranslationText()}</p>

                  {/* Deep Meaning Section for Roman Urdu */}
                  {translationLang === 'romanUrdu' && romanUrduVerse?.deepMeaning && (
                    <details className="mt-4 pt-4 border-t border-border">
                      <summary className="text-sm text-primary cursor-pointer hover:underline">View Deep Meaning</summary>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{romanUrduVerse.deepMeaning}</p>
                    </details>
                  )}

                  <TafsirSection surahNumber={number} ayahNumber={ayah.numberInSurah} />
                </div>
              );
            })}
          </div>

          {/* Bottom Navigation */}
          <div className="flex items-center justify-between mt-8 pt-8 border-t border-border">
            {number > 1 ? <Link to={`/surah/${number - 1}`}><Button variant="outline"><ChevronLeft className="w-4 h-4" /> Previous Surah</Button></Link> : <div />}
            {number < 114 ? <Link to={`/surah/${number + 1}`}><Button>Next Surah <ChevronRight className="w-4 h-4" /></Button></Link> : <div />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
