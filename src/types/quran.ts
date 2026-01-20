export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
}

export interface SurahDetail {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: 'Meccan' | 'Medinan';
  numberOfAyahs: number;
  ayahs: Ayah[];
}

export interface Reciter {
  id: string;
  name: string;
  identifier: string;
}

export interface ReadingProgress {
  surahNumber: number;
  ayahNumber: number;
  timestamp: number;
}

export interface Bookmark {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  ayahText: string;
  timestamp: number;
}

export interface LearningPlan {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  duration?: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  icon: string;
  articleCount: number;
}

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  date: {
    readable: string;
    hijri: {
      date: string;
      day: string;
      month: { en: string; ar: string };
      year: string;
    };
  };
}

export interface Tafsir {
  id: string;
  name: string;
  author: string;
  language: string;
}

export interface TafsirText {
  text: string;
  surah: number;
  ayah: number;
}

export interface NameOfAllah {
  id: number;
  name: string;
  transliteration: string;
  meaning: string;
  description?: string;
}

export interface Dua {
  id: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
  category: string;
}

export interface IslamicEvent {
  name: string;
  date: string;
  hijriDate: string;
  description: string;
}

export interface QiblaDirection {
  latitude: number;
  longitude: number;
  direction: number;
}
