import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BookOpen, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const SURAH_LIST = [
  { number: 1, name: 'الفاتحة', englishName: 'Al-Fatiha', verses: 7, type: 'Meccan' },
  { number: 2, name: 'البقرة', englishName: 'Al-Baqarah', verses: 286, type: 'Medinan' },
  { number: 3, name: 'آل عمران', englishName: 'Aal-Imran', verses: 200, type: 'Medinan' },
  { number: 4, name: 'النساء', englishName: 'An-Nisa', verses: 176, type: 'Medinan' },
  { number: 5, name: 'المائدة', englishName: 'Al-Maidah', verses: 120, type: 'Medinan' },
  { number: 6, name: 'الأنعام', englishName: 'Al-Anam', verses: 165, type: 'Meccan' },
  { number: 7, name: 'الأعراف', englishName: 'Al-Araf', verses: 206, type: 'Meccan' },
  { number: 8, name: 'الأنفال', englishName: 'Al-Anfal', verses: 75, type: 'Medinan' },
  { number: 9, name: 'التوبة', englishName: 'At-Tawbah', verses: 129, type: 'Medinan' },
  { number: 10, name: 'يونس', englishName: 'Yunus', verses: 109, type: 'Meccan' },
  { number: 11, name: 'هود', englishName: 'Hud', verses: 123, type: 'Meccan' },
  { number: 12, name: 'يوسف', englishName: 'Yusuf', verses: 111, type: 'Meccan' },
  { number: 13, name: 'الرعد', englishName: 'Ar-Rad', verses: 43, type: 'Medinan' },
  { number: 14, name: 'إبراهيم', englishName: 'Ibrahim', verses: 52, type: 'Meccan' },
  { number: 15, name: 'الحجر', englishName: 'Al-Hijr', verses: 99, type: 'Meccan' },
  { number: 16, name: 'النحل', englishName: 'An-Nahl', verses: 128, type: 'Meccan' },
  { number: 17, name: 'الإسراء', englishName: 'Al-Isra', verses: 111, type: 'Meccan' },
  { number: 18, name: 'الكهف', englishName: 'Al-Kahf', verses: 110, type: 'Meccan' },
  { number: 19, name: 'مريم', englishName: 'Maryam', verses: 98, type: 'Meccan' },
  { number: 20, name: 'طه', englishName: 'Ta-Ha', verses: 135, type: 'Meccan' },
  { number: 21, name: 'الأنبياء', englishName: 'Al-Anbiya', verses: 112, type: 'Meccan' },
  { number: 22, name: 'الحج', englishName: 'Al-Hajj', verses: 78, type: 'Medinan' },
  { number: 23, name: 'المؤمنون', englishName: 'Al-Muminun', verses: 118, type: 'Meccan' },
  { number: 24, name: 'النور', englishName: 'An-Nur', verses: 64, type: 'Medinan' },
  { number: 25, name: 'الفرقان', englishName: 'Al-Furqan', verses: 77, type: 'Meccan' },
  { number: 26, name: 'الشعراء', englishName: 'Ash-Shuara', verses: 227, type: 'Meccan' },
  { number: 27, name: 'النمل', englishName: 'An-Naml', verses: 93, type: 'Meccan' },
  { number: 28, name: 'القصص', englishName: 'Al-Qasas', verses: 88, type: 'Meccan' },
  { number: 29, name: 'العنكبوت', englishName: 'Al-Ankabut', verses: 69, type: 'Meccan' },
  { number: 30, name: 'الروم', englishName: 'Ar-Rum', verses: 60, type: 'Meccan' },
  { number: 31, name: 'لقمان', englishName: 'Luqman', verses: 34, type: 'Meccan' },
  { number: 32, name: 'السجدة', englishName: 'As-Sajdah', verses: 30, type: 'Meccan' },
  { number: 33, name: 'الأحزاب', englishName: 'Al-Ahzab', verses: 73, type: 'Medinan' },
  { number: 34, name: 'سبأ', englishName: 'Saba', verses: 54, type: 'Meccan' },
  { number: 35, name: 'فاطر', englishName: 'Fatir', verses: 45, type: 'Meccan' },
  { number: 36, name: 'يس', englishName: 'Ya-Sin', verses: 83, type: 'Meccan' },
  { number: 37, name: 'الصافات', englishName: 'As-Saffat', verses: 182, type: 'Meccan' },
  { number: 38, name: 'ص', englishName: 'Sad', verses: 88, type: 'Meccan' },
  { number: 39, name: 'الزمر', englishName: 'Az-Zumar', verses: 75, type: 'Meccan' },
  { number: 40, name: 'غافر', englishName: 'Ghafir', verses: 85, type: 'Meccan' },
  { number: 41, name: 'فصلت', englishName: 'Fussilat', verses: 54, type: 'Meccan' },
  { number: 42, name: 'الشورى', englishName: 'Ash-Shura', verses: 53, type: 'Meccan' },
  { number: 43, name: 'الزخرف', englishName: 'Az-Zukhruf', verses: 89, type: 'Meccan' },
  { number: 44, name: 'الدخان', englishName: 'Ad-Dukhan', verses: 59, type: 'Meccan' },
  { number: 45, name: 'الجاثية', englishName: 'Al-Jathiyah', verses: 37, type: 'Meccan' },
  { number: 46, name: 'الأحقاف', englishName: 'Al-Ahqaf', verses: 35, type: 'Meccan' },
  { number: 47, name: 'محمد', englishName: 'Muhammad', verses: 38, type: 'Medinan' },
  { number: 48, name: 'الفتح', englishName: 'Al-Fath', verses: 29, type: 'Medinan' },
  { number: 49, name: 'الحجرات', englishName: 'Al-Hujurat', verses: 18, type: 'Medinan' },
  { number: 50, name: 'ق', englishName: 'Qaf', verses: 45, type: 'Meccan' },
  { number: 51, name: 'الذاريات', englishName: 'Adh-Dhariyat', verses: 60, type: 'Meccan' },
  { number: 52, name: 'الطور', englishName: 'At-Tur', verses: 49, type: 'Meccan' },
  { number: 53, name: 'النجم', englishName: 'An-Najm', verses: 62, type: 'Meccan' },
  { number: 54, name: 'القمر', englishName: 'Al-Qamar', verses: 55, type: 'Meccan' },
  { number: 55, name: 'الرحمن', englishName: 'Ar-Rahman', verses: 78, type: 'Medinan' },
  { number: 56, name: 'الواقعة', englishName: 'Al-Waqiah', verses: 96, type: 'Meccan' },
  { number: 57, name: 'الحديد', englishName: 'Al-Hadid', verses: 29, type: 'Medinan' },
  { number: 58, name: 'المجادلة', englishName: 'Al-Mujadilah', verses: 22, type: 'Medinan' },
  { number: 59, name: 'الحشر', englishName: 'Al-Hashr', verses: 24, type: 'Medinan' },
  { number: 60, name: 'الممتحنة', englishName: 'Al-Mumtahanah', verses: 13, type: 'Medinan' },
  { number: 61, name: 'الصف', englishName: 'As-Saff', verses: 14, type: 'Medinan' },
  { number: 62, name: 'الجمعة', englishName: 'Al-Jumuah', verses: 11, type: 'Medinan' },
  { number: 63, name: 'المنافقون', englishName: 'Al-Munafiqun', verses: 11, type: 'Medinan' },
  { number: 64, name: 'التغابن', englishName: 'At-Taghabun', verses: 18, type: 'Medinan' },
  { number: 65, name: 'الطلاق', englishName: 'At-Talaq', verses: 12, type: 'Medinan' },
  { number: 66, name: 'التحريم', englishName: 'At-Tahrim', verses: 12, type: 'Medinan' },
  { number: 67, name: 'الملك', englishName: 'Al-Mulk', verses: 30, type: 'Meccan' },
  { number: 68, name: 'القلم', englishName: 'Al-Qalam', verses: 52, type: 'Meccan' },
  { number: 69, name: 'الحاقة', englishName: 'Al-Haqqah', verses: 52, type: 'Meccan' },
  { number: 70, name: 'المعارج', englishName: 'Al-Maarij', verses: 44, type: 'Meccan' },
  { number: 71, name: 'نوح', englishName: 'Nuh', verses: 28, type: 'Meccan' },
  { number: 72, name: 'الجن', englishName: 'Al-Jinn', verses: 28, type: 'Meccan' },
  { number: 73, name: 'المزمل', englishName: 'Al-Muzzammil', verses: 20, type: 'Meccan' },
  { number: 74, name: 'المدثر', englishName: 'Al-Muddaththir', verses: 56, type: 'Meccan' },
  { number: 75, name: 'القيامة', englishName: 'Al-Qiyamah', verses: 40, type: 'Meccan' },
  { number: 76, name: 'الإنسان', englishName: 'Al-Insan', verses: 31, type: 'Medinan' },
  { number: 77, name: 'المرسلات', englishName: 'Al-Mursalat', verses: 50, type: 'Meccan' },
  { number: 78, name: 'النبأ', englishName: 'An-Naba', verses: 40, type: 'Meccan' },
  { number: 79, name: 'النازعات', englishName: 'An-Naziat', verses: 46, type: 'Meccan' },
  { number: 80, name: 'عبس', englishName: 'Abasa', verses: 42, type: 'Meccan' },
  { number: 81, name: 'التكوير', englishName: 'At-Takwir', verses: 29, type: 'Meccan' },
  { number: 82, name: 'الانفطار', englishName: 'Al-Infitar', verses: 19, type: 'Meccan' },
  { number: 83, name: 'المطففين', englishName: 'Al-Mutaffifin', verses: 36, type: 'Meccan' },
  { number: 84, name: 'الانشقاق', englishName: 'Al-Inshiqaq', verses: 25, type: 'Meccan' },
  { number: 85, name: 'البروج', englishName: 'Al-Buruj', verses: 22, type: 'Meccan' },
  { number: 86, name: 'الطارق', englishName: 'At-Tariq', verses: 17, type: 'Meccan' },
  { number: 87, name: 'الأعلى', englishName: 'Al-Ala', verses: 19, type: 'Meccan' },
  { number: 88, name: 'الغاشية', englishName: 'Al-Ghashiyah', verses: 26, type: 'Meccan' },
  { number: 89, name: 'الفجر', englishName: 'Al-Fajr', verses: 30, type: 'Meccan' },
  { number: 90, name: 'البلد', englishName: 'Al-Balad', verses: 20, type: 'Meccan' },
  { number: 91, name: 'الشمس', englishName: 'Ash-Shams', verses: 15, type: 'Meccan' },
  { number: 92, name: 'الليل', englishName: 'Al-Layl', verses: 21, type: 'Meccan' },
  { number: 93, name: 'الضحى', englishName: 'Ad-Duhaa', verses: 11, type: 'Meccan' },
  { number: 94, name: 'الشرح', englishName: 'Ash-Sharh', verses: 8, type: 'Meccan' },
  { number: 95, name: 'التين', englishName: 'At-Tin', verses: 8, type: 'Meccan' },
  { number: 96, name: 'العلق', englishName: 'Al-Alaq', verses: 19, type: 'Meccan' },
  { number: 97, name: 'القدر', englishName: 'Al-Qadr', verses: 5, type: 'Meccan' },
  { number: 98, name: 'البينة', englishName: 'Al-Bayyinah', verses: 8, type: 'Medinan' },
  { number: 99, name: 'الزلزلة', englishName: 'Az-Zalzalah', verses: 8, type: 'Medinan' },
  { number: 100, name: 'العاديات', englishName: 'Al-Adiyat', verses: 11, type: 'Meccan' },
  { number: 101, name: 'القارعة', englishName: 'Al-Qariah', verses: 11, type: 'Meccan' },
  { number: 102, name: 'التكاثر', englishName: 'At-Takathur', verses: 8, type: 'Meccan' },
  { number: 103, name: 'العصر', englishName: 'Al-Asr', verses: 3, type: 'Meccan' },
  { number: 104, name: 'الهمزة', englishName: 'Al-Humazah', verses: 9, type: 'Meccan' },
  { number: 105, name: 'الفيل', englishName: 'Al-Fil', verses: 5, type: 'Meccan' },
  { number: 106, name: 'قريش', englishName: 'Quraysh', verses: 4, type: 'Meccan' },
  { number: 107, name: 'الماعون', englishName: 'Al-Maun', verses: 7, type: 'Meccan' },
  { number: 108, name: 'الكوثر', englishName: 'Al-Kawthar', verses: 3, type: 'Meccan' },
  { number: 109, name: 'الكافرون', englishName: 'Al-Kafirun', verses: 6, type: 'Meccan' },
  { number: 110, name: 'النصر', englishName: 'An-Nasr', verses: 3, type: 'Medinan' },
  { number: 111, name: 'المسد', englishName: 'Al-Masad', verses: 5, type: 'Meccan' },
  { number: 112, name: 'الإخلاص', englishName: 'Al-Ikhlas', verses: 4, type: 'Meccan' },
  { number: 113, name: 'الفلق', englishName: 'Al-Falaq', verses: 5, type: 'Meccan' },
  { number: 114, name: 'الناس', englishName: 'An-Nas', verses: 6, type: 'Meccan' },
];

export default function MushafIndex() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSurahs = SURAH_LIST.filter(
    (surah) =>
      surah.name.includes(searchQuery) ||
      surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.number.toString().includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-background dark">
      <Header />
      <main className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-arabic text-4xl text-foreground mb-2">المصحف الشريف</h1>
            <p className="text-xl text-foreground font-semibold">The Holy Quran</p>
            <p className="text-muted-foreground mt-2">Arabic Only - Mushaf Style</p>
          </div>

          {/* Search */}
          <div className="relative max-w-md mx-auto mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search surah by name or number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Surah Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSurahs.map((surah) => (
              <Link
                key={surah.number}
                to={`/mushaf/${surah.number}`}
                className="group"
              >
                <div className="bg-card border border-border rounded-xl p-5 transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold">
                      {surah.number}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-arabic text-2xl text-foreground mb-1">{surah.name}</h3>
                      <p className="text-sm text-muted-foreground">{surah.englishName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{surah.verses} آيات</p>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        surah.type === 'Meccan' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
                      )}>
                        {surah.type === 'Meccan' ? 'مكية' : 'مدنية'}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
