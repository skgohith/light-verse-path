import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Headphones, Clock, Heart, Sparkles, Star } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { SurahCard } from '@/components/SurahCard';
import { ContinueReading } from '@/components/ContinueReading';
import { DailyVerse } from '@/components/DailyVerse';
import { PrayerTimesCard } from '@/components/PrayerTimesCard';
import { ReadingStreakCard } from '@/components/ReadingStreakCard';
import { QuickWidgets } from '@/components/QuickWidgets';
import { ProgressDashboard } from '@/components/ProgressDashboard';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { useSurahs } from '@/hooks/useQuranApi';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const features = [{
  icon: BookOpen,
  title: 'Read Quran',
  description: 'Arabic & translation',
  path: '/read'
}, {
  icon: Headphones,
  title: 'Audio',
  description: 'Listen to reciters',
  path: '/read'
}, {
  icon: Clock,
  title: 'Prayer Times',
  description: 'Live prayer times',
  path: '/tools'
}, {
  icon: Heart,
  title: 'Duas',
  description: 'Daily prayers',
  path: '/tools'
}, {
  icon: Sparkles,
  title: '99 Names',
  description: 'Names of Allah',
  path: '/tools'
}, {
  icon: Star,
  title: 'Hadith',
  description: '6 collections',
  path: '/hadith'
}];
export default function Index() {
  const {
    surahs,
    loading
  } = useSurahs();
  return <div className="min-h-screen bg-background dark flex flex-col">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">
        {/* Hero Section */}
        <section className="relative py-10 md:py-16 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="max-w-7xl mx-auto relative">
            <div className="text-center max-w-3xl mx-auto">
              
              <p className="text-sm md:text-lg text-muted-foreground mb-6 md:mb-8 px-4">
                Quran, Hadith, Prayer times, Tasbeeh, 99 Names & more
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link to="/read">
                  <Button size="lg" className="gap-2">
                    Read Quran <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/hadith">
                  <Button size="lg" variant="outline">Hadith</Button>
                </Link>
              </div>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 md:gap-4 mt-8 md:mt-12">
              {features.map(f => <Link key={f.title} to={f.path} className="bg-card border border-border rounded-xl p-3 md:p-4 text-center hover:border-primary/50 transition-colors">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-1 md:mb-2">
                    <f.icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground text-xs md:text-sm">{f.title}</h3>
                  <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">{f.description}</p>
                </Link>)}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-6 md:py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Sidebar - Mobile optimized */}
              <div className="space-y-4 md:space-y-6 order-first lg:order-none">
                <QuickWidgets />
                <ProgressDashboard />
                <AnalyticsDashboard />
                <ReadingStreakCard compact />
                <PrayerTimesCard compact />
                <ContinueReading />
                <DailyVerse />
              </div>

              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6 md:space-y-8">
                {/* Popular Surahs */}
                <div>
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <h2 className="text-lg md:text-xl font-semibold text-foreground">Popular Surahs</h2>
                    <Link to="/read" className="text-sm text-primary hover:underline flex items-center gap-1">
                      View all <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {loading ? Array.from({
                    length: 4
                  }).map((_, i) => <Skeleton key={i} className="h-20 md:h-24 rounded-xl" />) : surahs.slice(0, 4).map(surah => <SurahCard key={surah.number} surah={surah} />)}
                  </div>
                </div>

                {/* Hadith Quick Access */}
                <div>
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <h2 className="text-lg md:text-xl font-semibold text-foreground">Hadith Collections</h2>
                    <Link to="/hadith" className="text-sm text-primary hover:underline flex items-center gap-1">
                      View all <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[{
                    id: 'bukhari',
                    name: 'Sahih Bukhari',
                    arabic: 'صحيح البخاري'
                  }, {
                    id: 'muslim',
                    name: 'Sahih Muslim',
                    arabic: 'صحيح مسلم'
                  }, {
                    id: 'tirmidhi',
                    name: 'Jami Tirmidhi',
                    arabic: 'جامع الترمذي'
                  }].map(book => <Link key={book.id} to={`/hadith/${book.id}`} className="bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors">
                        <p className="font-arabic text-lg text-primary">{book.arabic}</p>
                        <p className="text-sm text-foreground">{book.name}</p>
                      </Link>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <MobileNav />
      <Footer className="hidden md:block" />
    </div>;
}