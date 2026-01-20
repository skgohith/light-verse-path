import { useState, useEffect } from 'react';
import { Surah, SurahDetail } from '@/types/quran';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSurahDetail() {
      setLoading(true);
      try {
        const [arabicRes, englishRes] = await Promise.all([
          fetch(`${API_BASE}/surah/${surahNumber}/ar.alafasy`),
          fetch(`${API_BASE}/surah/${surahNumber}/en.asad`)
        ]);

        const arabicData = await arabicRes.json();
        const englishData = await englishRes.json();

        if (arabicData.code === 200) {
          setSurah(arabicData.data);
        }
        if (englishData.code === 200) {
          setTranslation(englishData.data);
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

  return { surah, translation, loading, error };
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
