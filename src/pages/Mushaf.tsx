import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useSurahDetail } from '@/hooks/useQuranApi';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, BookOpen, Settings, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const SURAH_NAMES = [
  { number: 1, name: 'الفاتحة', englishName: 'Al-Fatiha' },
  { number: 2, name: 'البقرة', englishName: 'Al-Baqarah' },
  { number: 3, name: 'آل عمران', englishName: 'Aal-Imran' },
  { number: 4, name: 'النساء', englishName: 'An-Nisa' },
  { number: 5, name: 'المائدة', englishName: 'Al-Maidah' },
  { number: 6, name: 'الأنعام', englishName: 'Al-Anam' },
  { number: 7, name: 'الأعراف', englishName: 'Al-Araf' },
  { number: 8, name: 'الأنفال', englishName: 'Al-Anfal' },
  { number: 9, name: 'التوبة', englishName: 'At-Tawbah' },
  { number: 10, name: 'يونس', englishName: 'Yunus' },
  { number: 11, name: 'هود', englishName: 'Hud' },
  { number: 12, name: 'يوسف', englishName: 'Yusuf' },
  { number: 13, name: 'الرعد', englishName: 'Ar-Rad' },
  { number: 14, name: 'إبراهيم', englishName: 'Ibrahim' },
  { number: 15, name: 'الحجر', englishName: 'Al-Hijr' },
  { number: 16, name: 'النحل', englishName: 'An-Nahl' },
  { number: 17, name: 'الإسراء', englishName: 'Al-Isra' },
  { number: 18, name: 'الكهف', englishName: 'Al-Kahf' },
  { number: 19, name: 'مريم', englishName: 'Maryam' },
  { number: 20, name: 'طه', englishName: 'Ta-Ha' },
  { number: 21, name: 'الأنبياء', englishName: 'Al-Anbiya' },
  { number: 22, name: 'الحج', englishName: 'Al-Hajj' },
  { number: 23, name: 'المؤمنون', englishName: 'Al-Muminun' },
  { number: 24, name: 'النور', englishName: 'An-Nur' },
  { number: 25, name: 'الفرقان', englishName: 'Al-Furqan' },
  { number: 26, name: 'الشعراء', englishName: 'Ash-Shuara' },
  { number: 27, name: 'النمل', englishName: 'An-Naml' },
  { number: 28, name: 'القصص', englishName: 'Al-Qasas' },
  { number: 29, name: 'العنكبوت', englishName: 'Al-Ankabut' },
  { number: 30, name: 'الروم', englishName: 'Ar-Rum' },
  { number: 31, name: 'لقمان', englishName: 'Luqman' },
  { number: 32, name: 'السجدة', englishName: 'As-Sajdah' },
  { number: 33, name: 'الأحزاب', englishName: 'Al-Ahzab' },
  { number: 34, name: 'سبأ', englishName: 'Saba' },
  { number: 35, name: 'فاطر', englishName: 'Fatir' },
  { number: 36, name: 'يس', englishName: 'Ya-Sin' },
  { number: 37, name: 'الصافات', englishName: 'As-Saffat' },
  { number: 38, name: 'ص', englishName: 'Sad' },
  { number: 39, name: 'الزمر', englishName: 'Az-Zumar' },
  { number: 40, name: 'غافر', englishName: 'Ghafir' },
  { number: 41, name: 'فصلت', englishName: 'Fussilat' },
  { number: 42, name: 'الشورى', englishName: 'Ash-Shura' },
  { number: 43, name: 'الزخرف', englishName: 'Az-Zukhruf' },
  { number: 44, name: 'الدخان', englishName: 'Ad-Dukhan' },
  { number: 45, name: 'الجاثية', englishName: 'Al-Jathiyah' },
  { number: 46, name: 'الأحقاف', englishName: 'Al-Ahqaf' },
  { number: 47, name: 'محمد', englishName: 'Muhammad' },
  { number: 48, name: 'الفتح', englishName: 'Al-Fath' },
  { number: 49, name: 'الحجرات', englishName: 'Al-Hujurat' },
  { number: 50, name: 'ق', englishName: 'Qaf' },
  { number: 51, name: 'الذاريات', englishName: 'Adh-Dhariyat' },
  { number: 52, name: 'الطور', englishName: 'At-Tur' },
  { number: 53, name: 'النجم', englishName: 'An-Najm' },
  { number: 54, name: 'القمر', englishName: 'Al-Qamar' },
  { number: 55, name: 'الرحمن', englishName: 'Ar-Rahman' },
  { number: 56, name: 'الواقعة', englishName: 'Al-Waqiah' },
  { number: 57, name: 'الحديد', englishName: 'Al-Hadid' },
  { number: 58, name: 'المجادلة', englishName: 'Al-Mujadilah' },
  { number: 59, name: 'الحشر', englishName: 'Al-Hashr' },
  { number: 60, name: 'الممتحنة', englishName: 'Al-Mumtahanah' },
  { number: 61, name: 'الصف', englishName: 'As-Saff' },
  { number: 62, name: 'الجمعة', englishName: 'Al-Jumuah' },
  { number: 63, name: 'المنافقون', englishName: 'Al-Munafiqun' },
  { number: 64, name: 'التغابن', englishName: 'At-Taghabun' },
  { number: 65, name: 'الطلاق', englishName: 'At-Talaq' },
  { number: 66, name: 'التحريم', englishName: 'At-Tahrim' },
  { number: 67, name: 'الملك', englishName: 'Al-Mulk' },
  { number: 68, name: 'القلم', englishName: 'Al-Qalam' },
  { number: 69, name: 'الحاقة', englishName: 'Al-Haqqah' },
  { number: 70, name: 'المعارج', englishName: 'Al-Maarij' },
  { number: 71, name: 'نوح', englishName: 'Nuh' },
  { number: 72, name: 'الجن', englishName: 'Al-Jinn' },
  { number: 73, name: 'المزمل', englishName: 'Al-Muzzammil' },
  { number: 74, name: 'المدثر', englishName: 'Al-Muddaththir' },
  { number: 75, name: 'القيامة', englishName: 'Al-Qiyamah' },
  { number: 76, name: 'الإنسان', englishName: 'Al-Insan' },
  { number: 77, name: 'المرسلات', englishName: 'Al-Mursalat' },
  { number: 78, name: 'النبأ', englishName: 'An-Naba' },
  { number: 79, name: 'النازعات', englishName: 'An-Naziat' },
  { number: 80, name: 'عبس', englishName: 'Abasa' },
  { number: 81, name: 'التكوير', englishName: 'At-Takwir' },
  { number: 82, name: 'الانفطار', englishName: 'Al-Infitar' },
  { number: 83, name: 'المطففين', englishName: 'Al-Mutaffifin' },
  { number: 84, name: 'الانشقاق', englishName: 'Al-Inshiqaq' },
  { number: 85, name: 'البروج', englishName: 'Al-Buruj' },
  { number: 86, name: 'الطارق', englishName: 'At-Tariq' },
  { number: 87, name: 'الأعلى', englishName: 'Al-Ala' },
  { number: 88, name: 'الغاشية', englishName: 'Al-Ghashiyah' },
  { number: 89, name: 'الفجر', englishName: 'Al-Fajr' },
  { number: 90, name: 'البلد', englishName: 'Al-Balad' },
  { number: 91, name: 'الشمس', englishName: 'Ash-Shams' },
  { number: 92, name: 'الليل', englishName: 'Al-Layl' },
  { number: 93, name: 'الضحى', englishName: 'Ad-Duhaa' },
  { number: 94, name: 'الشرح', englishName: 'Ash-Sharh' },
  { number: 95, name: 'التين', englishName: 'At-Tin' },
  { number: 96, name: 'العلق', englishName: 'Al-Alaq' },
  { number: 97, name: 'القدر', englishName: 'Al-Qadr' },
  { number: 98, name: 'البينة', englishName: 'Al-Bayyinah' },
  { number: 99, name: 'الزلزلة', englishName: 'Az-Zalzalah' },
  { number: 100, name: 'العاديات', englishName: 'Al-Adiyat' },
  { number: 101, name: 'القارعة', englishName: 'Al-Qariah' },
  { number: 102, name: 'التكاثر', englishName: 'At-Takathur' },
  { number: 103, name: 'العصر', englishName: 'Al-Asr' },
  { number: 104, name: 'الهمزة', englishName: 'Al-Humazah' },
  { number: 105, name: 'الفيل', englishName: 'Al-Fil' },
  { number: 106, name: 'قريش', englishName: 'Quraysh' },
  { number: 107, name: 'الماعون', englishName: 'Al-Maun' },
  { number: 108, name: 'الكوثر', englishName: 'Al-Kawthar' },
  { number: 109, name: 'الكافرون', englishName: 'Al-Kafirun' },
  { number: 110, name: 'النصر', englishName: 'An-Nasr' },
  { number: 111, name: 'المسد', englishName: 'Al-Masad' },
  { number: 112, name: 'الإخلاص', englishName: 'Al-Ikhlas' },
  { number: 113, name: 'الفلق', englishName: 'Al-Falaq' },
  { number: 114, name: 'الناس', englishName: 'An-Nas' },
];

export default function Mushaf() {
  const { surahNumber } = useParams<{ surahNumber: string }>();
  const navigate = useNavigate();
  const number = parseInt(surahNumber || '1', 10);
  const { surah, loading } = useSurahDetail(number);
  const [fontSize, setFontSize] = useState<number>(32);

  const currentSurah = SURAH_NAMES.find(s => s.number === number);

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark">
        <Header />
        <main className="py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <Skeleton className="h-16 w-64 mx-auto mb-8" />
            <div className="space-y-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
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
            <Link to="/mushaf"><Button>Go back to Mushaf</Button></Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark">
      <Header />
      <main className="py-6 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Navigation Bar */}
          <div className="flex items-center justify-between mb-6">
            <Link to="/mushaf">
              <Button variant="ghost" size="sm" className="gap-2">
                <ChevronLeft className="w-4 h-4" /> All Surahs
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              {number > 1 && (
                <Link to={`/mushaf/${number - 1}`}>
                  <Button variant="outline" size="sm"><ChevronLeft className="w-4 h-4" /></Button>
                </Link>
              )}
              <Select value={number.toString()} onValueChange={(v) => navigate(`/mushaf/${v}`)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {SURAH_NAMES.map((s) => (
                    <SelectItem key={s.number} value={s.number.toString()}>
                      {s.number}. {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {number < 114 && (
                <Link to={`/mushaf/${number + 1}`}>
                  <Button variant="outline" size="sm"><ChevronRight className="w-4 h-4" /></Button>
                </Link>
              )}
            </div>
          </div>

          {/* Font Size Controls */}
          <div className="flex items-center justify-center gap-4 mb-6 p-3 bg-card border border-border rounded-xl">
            <Settings className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Text Size</span>
            <Button variant="outline" size="icon" onClick={() => setFontSize(Math.max(20, fontSize - 4))}>
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium w-8 text-center">{fontSize}</span>
            <Button variant="outline" size="icon" onClick={() => setFontSize(Math.min(56, fontSize + 4))}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Surah Header */}
          <div className="bg-gradient-to-br from-primary/10 to-accent/5 rounded-2xl p-8 mb-8 text-center border border-primary/20">
            <div className="flex items-center justify-center gap-3 mb-2">
              <BookOpen className="w-6 h-6 text-primary" />
              <span className="text-xs px-3 py-1 bg-primary/10 rounded-full text-primary">
                {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
              </span>
            </div>
            <h1 className="font-arabic text-5xl text-foreground mb-2">{currentSurah?.name}</h1>
            <p className="text-muted-foreground">{surah.numberOfAyahs} آيات</p>
          </div>

          {/* Bismillah */}
          {number !== 1 && number !== 9 && (
            <div className="text-center py-8 mb-8 border-b border-border">
              <p className="font-arabic text-4xl text-foreground leading-loose">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
            </div>
          )}

          {/* Arabic Text - Mushaf Style */}
          <div className="bg-card border border-border rounded-2xl p-6 md:p-10">
            <div className="text-right leading-[2.5] font-arabic" dir="rtl" style={{ fontSize: `${fontSize}px` }}>
              {surah.ayahs.map((ayah, index) => (
                <span key={ayah.number} className="inline">
                  <span className="text-foreground">{ayah.text}</span>
                  <span className="inline-flex items-center justify-center mx-1 w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-sans" style={{ fontSize: '14px' }}>
                    {ayah.numberInSurah}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="flex items-center justify-between mt-8 pt-8 border-t border-border">
            {number > 1 ? (
              <Link to={`/mushaf/${number - 1}`}>
                <Button variant="outline">
                  <ChevronLeft className="w-4 h-4 mr-2" /> السورة السابقة
                </Button>
              </Link>
            ) : <div />}
            {number < 114 ? (
              <Link to={`/mushaf/${number + 1}`}>
                <Button>
                  السورة التالية <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            ) : <div />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
