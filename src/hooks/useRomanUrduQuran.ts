import { useState, useEffect } from 'react';
import quranData from '@/data/quranRomanUrdu.json';

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

// Type assertion for the imported JSON
const typedQuranData = quranData as unknown as RomanUrduSurah[];

export function useRomanUrduSurah(surahNumber: number) {
  const [surah, setSurah] = useState<RomanUrduSurah | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Surah numbers are 1-indexed, array is 0-indexed
    const surahIndex = surahNumber - 1;
    if (surahIndex >= 0 && surahIndex < typedQuranData.length) {
      setSurah(typedQuranData[surahIndex]);
    } else {
      setSurah(null);
    }
    setLoading(false);
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

  const getRandomVerse = () => {
    setLoading(true);
    const randomSurahIndex = Math.floor(Math.random() * typedQuranData.length);
    const surah = typedQuranData[randomSurahIndex];
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
    setLoading(false);
  };

  useEffect(() => {
    getRandomVerse();
  }, []);

  return { verse, loading, refresh: getRandomVerse };
}

export function getAllSurahs() {
  return typedQuranData.map((surah, index) => ({
    number: index + 1,
    name: surah.name,
    arabicName: surah.arabicName,
    numberOfVerses: surah.numberOfVerses,
    isMeccan: surah.isMeccan,
  }));
}
