import { useState, useEffect, useCallback } from 'react';

export interface RomanUrduVerse {
  arabic: string;
  audioTimestamp: number;
  translation: string;
  transliteration?: string;
  deepMeaning?: string;
  engTranslation?: string;
  engDeepMeaning?: string;
  juz?: number;
  urduMeaning?: string;
  urduFooter?: string;
}

export interface RomanUrduSurah {
  arabicName: string;
  isMeccan: boolean;
  name: string;
  numberOfVerses: number;
  verses: RomanUrduVerse[];
}

// Cache for loaded surahs to avoid re-fetching
const surahCache: Map<number, RomanUrduSurah> = new Map();
let allSurahsMetadata: { number: number; name: string; arabicName: string; numberOfVerses: number; isMeccan: boolean }[] | null = null;

// Dynamically import the full data only when needed
async function loadQuranData(): Promise<RomanUrduSurah[]> {
  const module = await import('@/data/quranRomanUrdu.json');
  return module.default as unknown as RomanUrduSurah[];
}

export function useRomanUrduSurah(surahNumber: number) {
  const [surah, setSurah] = useState<RomanUrduSurah | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchSurah() {
      setLoading(true);
      
      // Check cache first
      if (surahCache.has(surahNumber)) {
        setSurah(surahCache.get(surahNumber)!);
        setLoading(false);
        return;
      }

      try {
        const data = await loadQuranData();
        const surahIndex = surahNumber - 1;
        
        if (surahIndex >= 0 && surahIndex < data.length && !cancelled) {
          const surahData = data[surahIndex];
          surahCache.set(surahNumber, surahData);
          setSurah(surahData);
        } else if (!cancelled) {
          setSurah(null);
        }
      } catch (error) {
        console.error('Error loading surah:', error);
        if (!cancelled) setSurah(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSurah();

    return () => {
      cancelled = true;
    };
  }, [surahNumber]);

  return { surah, loading };
}

export function useRandomVerse() {
  const [verse, setVerse] = useState<{
    surahName: string;
    surahNumber: number;
    verseNumber: number;
    arabic: string;
    translation: string;
    deepMeaning?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const getRandomVerse = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loadQuranData();
      const randomSurahIndex = Math.floor(Math.random() * data.length);
      const surah = data[randomSurahIndex];
      const randomVerseIndex = Math.floor(Math.random() * surah.verses.length);
      const verseData = surah.verses[randomVerseIndex];

      setVerse({
        surahName: surah.name,
        surahNumber: randomSurahIndex + 1,
        verseNumber: randomVerseIndex + 1,
        arabic: verseData.arabic,
        translation: verseData.translation,
        deepMeaning: verseData.deepMeaning,
      });
    } catch (error) {
      console.error('Error loading random verse:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getRandomVerse();
  }, [getRandomVerse]);

  return { verse, loading, refresh: getRandomVerse };
}

export async function getAllSurahs() {
  if (allSurahsMetadata) return allSurahsMetadata;

  try {
    const data = await loadQuranData();
    allSurahsMetadata = data.map((surah, index) => ({
      number: index + 1,
      name: surah.name,
      arabicName: surah.arabicName,
      numberOfVerses: surah.numberOfVerses,
      isMeccan: surah.isMeccan,
    }));
    return allSurahsMetadata;
  } catch (error) {
    console.error('Error loading surahs metadata:', error);
    return [];
  }
}

// Hook version for components
export function useSurahsList() {
  const [surahs, setSurahs] = useState<typeof allSurahsMetadata>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllSurahs().then((data) => {
      setSurahs(data);
      setLoading(false);
    });
  }, []);

  return { surahs, loading };
}
