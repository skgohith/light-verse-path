import { useState, useEffect } from 'react';
import { Surah, SurahDetail } from '@/types/quran';

const API_BASE = 'https://api.alquran.cloud/v1';
const QURAN_COM_API = 'https://api.quran.com/api/v4';

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
        // Fetch Arabic from alquran.cloud (for audio support)
        const arabicRes = await fetch(`${API_BASE}/surah/${surahNumber}/ar.alafasy`);
        const arabicData = await arabicRes.json();

        if (arabicData.code === 200) {
          setSurah(arabicData.data);
        }

        // Fetch English translation from Quran.com API (Sahih International - resource 131)
        try {
          const translationRes = await fetch(
            `${QURAN_COM_API}/quran/translations/131?chapter_number=${surahNumber}`
          );
          const translationData = await translationRes.json();
          
          if (translationData.translations) {
            // Format to match our expected structure
            const formattedTranslation: SurahDetail = {
              number: surahNumber,
              name: arabicData.data?.name || '',
              englishName: arabicData.data?.englishName || '',
              englishNameTranslation: arabicData.data?.englishNameTranslation || '',
              revelationType: arabicData.data?.revelationType || '',
              numberOfAyahs: translationData.translations.length,
              ayahs: translationData.translations.map((t: any, index: number) => ({
                number: t.resource_id,
                text: t.text.replace(/<[^>]*>/g, ''), // Remove HTML tags
                numberInSurah: index + 1,
                juz: 1,
                manzil: 1,
                page: 1,
                ruku: 1,
                hizbQuarter: 1,
                sajda: false
              }))
            };
            setTranslation(formattedTranslation);
          }
        } catch (translationErr) {
          // Fallback to alquran.cloud for translation
          console.warn('Quran.com API failed, falling back to alquran.cloud');
          const fallbackRes = await fetch(`${API_BASE}/surah/${surahNumber}/en.sahih`);
          const fallbackData = await fallbackRes.json();
          if (fallbackData.code === 200) {
            setTranslation(fallbackData.data);
          }
        }

        // Fetch transliteration from alquran.cloud
        const translitRes = await fetch(`${API_BASE}/surah/${surahNumber}/en.transliteration`);
        const translitData = await translitRes.json();
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
          `${QURAN_COM_API}/tafsirs/en-tafisr-ibn-kathir/by_ayah/${surahNumber}:${ayahNumber}`
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
        // Use Quran.com search API
        const response = await fetch(
          `${QURAN_COM_API}/search?q=${encodeURIComponent(query)}&size=20&language=en`
        );
        const data = await response.json();
        
        if (data.search?.results) {
          setResults(data.search.results.map((r: any) => ({
            text: r.text,
            surah: { number: r.verse_key?.split(':')[0], englishName: '' },
            numberInSurah: r.verse_key?.split(':')[1],
            verse_key: r.verse_key
          })));
        } else {
          // Fallback to alquran.cloud
          const fallbackRes = await fetch(`${API_BASE}/search/${encodeURIComponent(query)}/all/en`);
          const fallbackData = await fallbackRes.json();
          if (fallbackData.code === 200) {
            setResults(fallbackData.data.matches || []);
          }
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
        const response = await fetch(`${QURAN_COM_API}/juzs`);
        const data = await response.json();
        if (data.juzs) {
          setJuzList(data.juzs);
        } else {
          // Fallback
          const fallbackRes = await fetch(`${API_BASE}/juz`);
          const fallbackData = await fallbackRes.json();
          if (fallbackData.code === 200) {
            setJuzList(fallbackData.data);
          }
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
