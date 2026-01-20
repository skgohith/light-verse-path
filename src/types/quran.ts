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
