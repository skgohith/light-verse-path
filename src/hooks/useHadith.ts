import { useState, useEffect } from 'react';

export interface Hadith {
  id: number;
  hadithNumber: string;
  englishNarrator: string;
  hadithEnglish: string;
  hadithArabic: string;
  bookSlug: string;
  chapterId: string;
  grades?: { grade: string; name: string }[];
}

export interface HadithBook {
  id: string;
  name: string;
  arabicName: string;
  hadiths: number;
}

export const HADITH_BOOKS: HadithBook[] = [
  { id: 'bukhari', name: 'Sahih al-Bukhari', arabicName: 'صحيح البخاري', hadiths: 7563 },
  { id: 'muslim', name: 'Sahih Muslim', arabicName: 'صحيح مسلم', hadiths: 7563 },
  { id: 'abudawud', name: 'Sunan Abu Dawud', arabicName: 'سنن أبي داود', hadiths: 5274 },
  { id: 'tirmidhi', name: 'Jami at-Tirmidhi', arabicName: 'جامع الترمذي', hadiths: 3956 },
  { id: 'nasai', name: "Sunan an-Nasa'i", arabicName: 'سنن النسائي', hadiths: 5761 },
  { id: 'ibnmajah', name: 'Sunan Ibn Majah', arabicName: 'سنن ابن ماجه', hadiths: 4341 },
];

// Using a free hadith API
const API_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';

export function useHadithBooks() {
  return { books: HADITH_BOOKS };
}

export function useHadiths(bookId: string, page: number = 1, limit: number = 10) {
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    async function fetchHadiths() {
      if (!bookId) return;
      
      setLoading(true);
      setError(null);

      try {
        // Fetch from the CDN-based API
        const response = await fetch(`${API_BASE}/editions/eng-${bookId}.json`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch hadiths');
        }

        const data = await response.json();
        const allHadiths = data.hadiths || [];
        
        // Paginate locally
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedHadiths = allHadiths.slice(startIndex, endIndex);
        
        const formattedHadiths: Hadith[] = paginatedHadiths.map((h: any, index: number) => ({
          id: startIndex + index + 1,
          hadithNumber: h.hadithnumber?.toString() || `${startIndex + index + 1}`,
          englishNarrator: h.grades?.[0]?.name || '',
          hadithEnglish: h.text || '',
          hadithArabic: '',
          bookSlug: bookId,
          chapterId: h.reference?.book?.toString() || '',
          grades: h.grades
        }));

        setHadiths(formattedHadiths);
        setHasMore(endIndex < allHadiths.length);
      } catch (err) {
        console.error('Error fetching hadiths:', err);
        setError('Failed to load hadiths. Please try again.');
        // Fallback to sample data
        setHadiths(getSampleHadiths(bookId, page, limit));
      } finally {
        setLoading(false);
      }
    }

    fetchHadiths();
  }, [bookId, page, limit]);

  return { hadiths, loading, error, hasMore };
}

export function useRandomHadith() {
  const [hadith, setHadith] = useState<Hadith | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRandomHadith() {
      try {
        const randomBook = HADITH_BOOKS[Math.floor(Math.random() * 2)]; // Bukhari or Muslim
        const response = await fetch(`${API_BASE}/editions/eng-${randomBook.id}.json`);
        
        if (response.ok) {
          const data = await response.json();
          const hadiths = data.hadiths || [];
          const randomIndex = Math.floor(Math.random() * Math.min(hadiths.length, 500));
          const h = hadiths[randomIndex];
          
          setHadith({
            id: randomIndex + 1,
            hadithNumber: h.hadithnumber?.toString() || `${randomIndex + 1}`,
            englishNarrator: h.grades?.[0]?.name || '',
            hadithEnglish: h.text || '',
            hadithArabic: '',
            bookSlug: randomBook.id,
            chapterId: '',
            grades: h.grades
          });
        } else {
          // Fallback
          setHadith(getSampleHadiths('bukhari', 1, 1)[0]);
        }
      } catch {
        setHadith(getSampleHadiths('bukhari', 1, 1)[0]);
      } finally {
        setLoading(false);
      }
    }

    fetchRandomHadith();
  }, []);

  return { hadith, loading };
}

// Sample hadiths for fallback
function getSampleHadiths(bookId: string, page: number, limit: number): Hadith[] {
  const sampleHadiths: Hadith[] = [
    {
      id: 1,
      hadithNumber: "1",
      englishNarrator: "Narrated 'Umar bin Al-Khattab",
      hadithEnglish: "I heard Allah's Messenger (ﷺ) saying, 'The reward of deeds depends upon the intentions and every person will get the reward according to what he has intended.'",
      hadithArabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى",
      bookSlug: 'bukhari',
      chapterId: '1'
    },
    {
      id: 2,
      hadithNumber: "2",
      englishNarrator: "Narrated Abu Huraira",
      hadithEnglish: "The Prophet (ﷺ) said, 'Faith (Belief) consists of more than sixty branches. And Haya (modesty) is a part of faith.'",
      hadithArabic: "الإِيمَانُ بِضْعٌ وَسِتُّونَ شُعْبَةً، وَالْحَيَاءُ شُعْبَةٌ مِنَ الإِيمَانِ",
      bookSlug: 'bukhari',
      chapterId: '2'
    },
    {
      id: 3,
      hadithNumber: "3",
      englishNarrator: "Narrated Abdullah bin Amr",
      hadithEnglish: "The Prophet (ﷺ) said, 'A Muslim is the one who avoids harming Muslims with his tongue and hands.'",
      hadithArabic: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ",
      bookSlug: 'bukhari',
      chapterId: '2'
    },
    {
      id: 4,
      hadithNumber: "4",
      englishNarrator: "Narrated Abu Musa",
      hadithEnglish: "Some people asked Allah's Messenger (ﷺ), 'Whose Islam is the best?' He replied, 'One who avoids harming the Muslims with his tongue and hands.'",
      hadithArabic: "",
      bookSlug: 'bukhari',
      chapterId: '2'
    },
    {
      id: 5,
      hadithNumber: "5",
      englishNarrator: "Narrated Anas",
      hadithEnglish: "The Prophet (ﷺ) said, 'None of you will have faith till he wishes for his (Muslim) brother what he likes for himself.'",
      hadithArabic: "لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
      bookSlug: 'bukhari',
      chapterId: '2'
    },
    {
      id: 6,
      hadithNumber: "6",
      englishNarrator: "Narrated Abu Huraira",
      hadithEnglish: "Allah's Messenger (ﷺ) said, 'By Him in Whose Hands my soul is, none of you will have faith till he loves me more than his father and his children.'",
      hadithArabic: "",
      bookSlug: 'bukhari',
      chapterId: '2'
    },
    {
      id: 7,
      hadithNumber: "7",
      englishNarrator: "Narrated Abu Said Al-Khudri",
      hadithEnglish: "The Prophet (ﷺ) said, 'When the people of Paradise enter Paradise and the people of the Fire enter the Fire, Allah will say, \"Take out of the Fire whoever has faith equal to a mustard seed in his heart.\"'",
      hadithArabic: "",
      bookSlug: 'bukhari',
      chapterId: '2'
    },
    {
      id: 8,
      hadithNumber: "8",
      englishNarrator: "Narrated Anas",
      hadithEnglish: "The Prophet (ﷺ) said, 'Whoever possesses the following three qualities will taste the sweetness of faith: The one to whom Allah and His Messenger become dearer than anything else.'",
      hadithArabic: "",
      bookSlug: 'bukhari',
      chapterId: '2'
    },
    {
      id: 9,
      hadithNumber: "13",
      englishNarrator: "Narrated Abu Huraira",
      hadithEnglish: "Allah's Messenger (ﷺ) said, 'The signs of a hypocrite are three: Whenever he speaks, he tells a lie; whenever he is entrusted, he proves to be dishonest; and whenever he promises, he breaks his promise.'",
      hadithArabic: "آيَةُ الْمُنَافِقِ ثَلاَثٌ إِذَا حَدَّثَ كَذَبَ، وَإِذَا وَعَدَ أَخْلَفَ، وَإِذَا اؤْتُمِنَ خَانَ",
      bookSlug: 'bukhari',
      chapterId: '2'
    },
    {
      id: 10,
      hadithNumber: "15",
      englishNarrator: "Narrated Abdullah bin Mas'ud",
      hadithEnglish: "The Prophet (ﷺ) said, 'Abusing a Muslim is Fusuq (an evil doing) and killing him is Kufr (disbelief).'",
      hadithArabic: "",
      bookSlug: 'bukhari',
      chapterId: '2'
    }
  ];

  const start = (page - 1) * limit;
  return sampleHadiths.slice(start, start + limit);
}

export function useSearchHadith(query: string, bookId?: string) {
  const [results, setResults] = useState<Hadith[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    
    // Simple client-side search through sample data
    const timeoutId = setTimeout(() => {
      const sampleHadiths = getSampleHadiths(bookId || 'bukhari', 1, 10);
      const filtered = sampleHadiths.filter(h => 
        h.hadithEnglish.toLowerCase().includes(query.toLowerCase()) ||
        h.englishNarrator.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, bookId]);

  return { results, loading };
}
