import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, GraduationCap, Users, Headphones, Clock, Compass, Sparkles } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SurahCard } from '@/components/SurahCard';
import { ContinueReading } from '@/components/ContinueReading';
import { DailyVerse } from '@/components/DailyVerse';
import { PrayerTimesCard } from '@/components/PrayerTimesCard';
import { LearningPlanCard } from '@/components/LearningPlanCard';
import { TopicCard } from '@/components/TopicCard';
import { useSurahs } from '@/hooks/useQuranApi';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LearningPlan, Topic } from '@/types/quran';

const featuredPlans: LearningPlan[] = [
  { id: 'quran-year', title: 'Quran in a Year', description: 'Read the entire Quran in 365 days', icon: 'calendar', category: 'Reading Plan', duration: '365 days' },
  { id: 'memorization', title: 'Memorization Guide', description: 'Step-by-step memorization techniques', icon: 'star', category: 'Learning', duration: 'Self-paced' },
  { id: 'ramadan', title: 'Ramadan Special', description: 'Complete Quran during Ramadan', icon: 'moon', category: 'Seasonal', duration: '30 days' },
];

const topics: Topic[] = [
  { id: 'about-quran', title: 'About The Quran', description: 'Learn about the holy book', icon: 'bookOpen', articleCount: 15 },
  { id: 'sunnah', title: 'Verses about Sunnah', description: 'Prophetic traditions', icon: 'heart', articleCount: 23 },
  { id: 'ramadan', title: 'What is Ramadan', description: 'The month of fasting', icon: 'moon', articleCount: 12 },
  { id: 'prayer', title: 'Verses about Prayer', description: 'Salah in the Quran', icon: 'star', articleCount: 31 },
];

const features = [
  { icon: BookOpen, title: 'Read Quran', description: 'Arabic, transliteration & translation', path: '/read' },
  { icon: Headphones, title: 'Audio', description: 'Listen to reciters', path: '/read' },
  { icon: Clock, title: 'Prayer Times', description: 'Live prayer times', path: '/tools' },
  { icon: Compass, title: 'Qibla', description: 'Find Qibla direction', path: '/tools' },
  { icon: Sparkles, title: '99 Names', description: 'Names of Allah', path: '/tools' },
  { icon: GraduationCap, title: 'Learn', description: 'Duas & more', path: '/learn' },
];

export default function Index() {
  const { surahs, loading } = useSurahs();

  return (
    <div className="min-h-screen bg-background dark">
      <Header />
      <main>
        <section className="relative py-16 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="max-w-7xl mx-auto relative">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Complete <span className="text-primary">Islamic App</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Quran with Arabic, transliteration & translation. Prayer times, Qibla, 99 Names, Duas & more.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link to="/read"><Button size="lg" className="gap-2">Read Quran <ArrowRight className="w-4 h-4" /></Button></Link>
                <Link to="/tools"><Button size="lg" variant="outline">Prayer Times</Button></Link>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-12">
              {features.map((f) => (
                <Link key={f.title} to={f.path} className="bg-card border border-border rounded-xl p-4 text-center hover:border-primary/50 transition-colors">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground text-sm">{f.title}</h3>
                  <p className="text-xs text-muted-foreground">{f.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-6">
                <PrayerTimesCard compact />
                <ContinueReading />
                <DailyVerse />
              </div>

              <div className="lg:col-span-2 space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground">Popular Surahs</h2>
                    <Link to="/read" className="text-sm text-primary hover:underline flex items-center gap-1">View all <ArrowRight className="w-4 h-4" /></Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {loading ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />) : surahs.slice(0, 6).map((surah) => <SurahCard key={surah.number} surah={surah} />)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground">Learning Plans</h2>
                    <Link to="/learn" className="text-sm text-primary hover:underline flex items-center gap-1">View all <ArrowRight className="w-4 h-4" /></Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {featuredPlans.map((plan) => <LearningPlanCard key={plan.id} plan={plan} />)}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground">Explore Topics</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {topics.map((topic) => <TopicCard key={topic.id} topic={topic} />)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
