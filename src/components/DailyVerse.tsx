import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Share2, Bookmark, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useBookmarks } from '@/hooks/useLocalStorage';

interface DailyVerseData {
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  translation: string;
  surahName: string;
}

export function DailyVerse() {
  const [verse, setVerse] = useState<DailyVerseData | null>(null);
  const [loading, setLoading] = useState(true);
  const { addBookmark, isBookmarked } = useBookmarks();

  useEffect(() => {
    async function fetchDailyVerse() {
      try {
        // Get a random ayah (for demo, using a specific one)
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        const randomAyah = (dayOfYear % 6236) + 1;

        const [arabicRes, englishRes] = await Promise.all([
          fetch(`https://api.alquran.cloud/v1/ayah/${randomAyah}/ar.alafasy`),
          fetch(`https://api.alquran.cloud/v1/ayah/${randomAyah}/en.asad`)
        ]);

        const arabicData = await arabicRes.json();
        const englishData = await englishRes.json();

        if (arabicData.code === 200 && englishData.code === 200) {
          setVerse({
            surahNumber: arabicData.data.surah.number,
            ayahNumber: arabicData.data.numberInSurah,
            arabicText: arabicData.data.text,
            translation: englishData.data.text,
            surahName: arabicData.data.surah.englishName
          });
        }
      } catch (error) {
        console.error('Failed to fetch daily verse:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDailyVerse();
  }, []);

  const handleBookmark = () => {
    if (verse) {
      addBookmark(verse.surahNumber, verse.ayahNumber, verse.surahName, verse.translation);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-primary/10 to-accent/5 rounded-2xl p-8 border border-primary/20 animate-pulse">
        <div className="h-6 bg-muted rounded w-32 mb-6"></div>
        <div className="h-8 bg-muted rounded w-full mb-4"></div>
        <div className="h-20 bg-muted rounded w-full"></div>
      </div>
    );
  }

  if (!verse) return null;

  return (
    <div className="bg-gradient-to-br from-primary/10 to-accent/5 rounded-2xl p-8 border border-primary/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-medium text-foreground">Verse of the Day</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBookmark}
            className={isBookmarked(verse.surahNumber, verse.ayahNumber) ? 'text-primary' : 'text-muted-foreground'}
          >
            <Bookmark className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <p className="font-arabic text-2xl text-foreground text-right leading-loose mb-6" dir="rtl">
        {verse.arabicText}
      </p>

      <p className="text-muted-foreground leading-relaxed mb-6">
        "{verse.translation}"
      </p>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {verse.surahName} • Verse {verse.ayahNumber}
        </span>
        <Link to={`/surah/${verse.surahNumber}?ayah=${verse.ayahNumber}`}>
          <Button variant="outline" size="sm" className="gap-2">
            Read more <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
