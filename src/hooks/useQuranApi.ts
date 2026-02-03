import { useState, useEffect } from 'react';
import { Surah, SurahDetail, TafsirText } from '@/types/quran';

const API_BASE = 'https://api.alquran.cloud/v1';

export function useSurahs() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSurahs() {
      try {
        const response = await fetch(`${API_BASE}/surah`);
        const data = await response.json();
        if (data.code === 200) {
          setSurahs(data.data);
        } else {
          setError('Failed to fetch surahs');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }

    fetchSurahs();
  }, []);

  return { surahs, loading, error };
}

export function useSurahDetail(surahNumber: number) {
  const [surah, setSurah] = useState<SurahDetail | null>(null);
  const [translation, setTranslation] = useState<SurahDetail | null>(null);
  const [transliteration, setTransliteration] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSurahDetail() {
      setLoading(true);
      try {
        const [arabicRes, englishRes, translitRes] = await Promise.all([
          fetch(`${API_BASE}/surah/${surahNumber}/ar.alafasy`),
          fetch(`${API_BASE}/surah/${surahNumber}/en.sahih`),
          fetch(`${API_BASE}/surah/${surahNumber}/en.transliteration`)
        ]);

        const arabicData = await arabicRes.json();
        const englishData = await englishRes.json();
        const translitData = await translitRes.json();

        if (arabicData.code === 200) {
          setSurah(arabicData.data);
        }
        if (englishData.code === 200) {
          setTranslation(englishData.data);
        }
        if (translitData.code === 200) {
          setTransliteration(translitData.data);
        }
      } catch (err) {
        setError('Failed to fetch surah details');
      } finally {
        setLoading(false);
      }
    }

    if (surahNumber) {
      fetchSurahDetail();
    }
  }, [surahNumber]);

  return { surah, translation, transliteration, loading, error };
}

export function useTafsir(surahNumber: number, ayahNumber: number) {
  const [tafsir, setTafsir] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTafsir() {
      if (!surahNumber || !ayahNumber) return;
      
      setLoading(true);
      try {
        // Using Ibn Kathir tafsir from quran.com API
        const response = await fetch(
          `https://api.quran.com/api/v4/tafsirs/en-tafisr-ibn-kathir/by_ayah/${surahNumber}:${ayahNumber}`
        );
        const data = await response.json();
        
        if (data.tafsir?.text) {
          // Clean HTML tags from tafsir text
          const cleanText = data.tafsir.text.replace(/<[^>]*>/g, '');
          setTafsir(cleanText);
        } else {
          // Fallback: use a simpler explanation
          setTafsir('Tafsir not available for this verse. Please check back later.');
        }
      } catch (err) {
        setError('Failed to fetch tafsir');
        setTafsir(null);
      } finally {
        setLoading(false);
      }
    }

    fetchTafsir();
  }, [surahNumber, ayahNumber]);

  return { tafsir, loading, error };
}

export function useSearchQuran(query: string) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function searchQuran() {
      if (!query || query.length < 3) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/search/${encodeURIComponent(query)}/all/en`);
        const data = await response.json();
        if (data.code === 200) {
          setResults(data.data.matches || []);
        }
      } catch (err) {
        setError('Search failed');
      } finally {
        setLoading(false);
      }
    }

    const debounce = setTimeout(searchQuran, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return { results, loading, error };
}

export function useJuzList() {
  const [juzList, setJuzList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJuzList() {
      try {
        const response = await fetch(`${API_BASE}/juz`);
        const data = await response.json();
        if (data.code === 200) {
          setJuzList(data.data);
        }
      } catch (err) {
        console.error('Failed to fetch juz list');
      } finally {
        setLoading(false);
      }
    }

    fetchJuzList();
  }, []);

  return { juzList, loading };
}
