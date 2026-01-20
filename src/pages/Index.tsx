import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, GraduationCap, Users, Headphones } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SurahCard } from '@/components/SurahCard';
import { ContinueReading } from '@/components/ContinueReading';
import { DailyVerse } from '@/components/DailyVerse';
import { LearningPlanCard } from '@/components/LearningPlanCard';
import { TopicCard } from '@/components/TopicCard';
import { useSurahs } from '@/hooks/useQuranApi';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LearningPlan, Topic } from '@/types/quran';

const featuredPlans: LearningPlan[] = [
  {
    id: 'quran-year',
    title: 'Quran in a Year',
    description: 'Read the entire Quran in 365 days with daily verse recommendations',
    icon: 'calendar',
    category: 'Reading Plan',
    duration: '365 days'
  },
  {
    id: 'memorization',
    title: 'Memorization Guide',
    description: 'Step-by-step guide to memorizing the Quran with proven techniques',
    icon: 'star',
    category: 'Learning',
    duration: 'Self-paced'
  },
  {
    id: 'ramadan',
    title: 'Ramadan Special',
    description: 'Complete the Quran during the blessed month of Ramadan',
    icon: 'moon',
    category: 'Seasonal',
    duration: '30 days'
  },
];

const topics: Topic[] = [
  { id: 'about-quran', title: 'About The Quran', description: 'Learn about the holy book', icon: 'bookOpen', articleCount: 15 },
  { id: 'sunnah', title: 'Verses about the Sunnah', description: 'Prophetic traditions', icon: 'heart', articleCount: 23 },
  { id: 'ramadan', title: 'What is Ramadan', description: 'The month of fasting', icon: 'moon', articleCount: 12 },
  { id: 'prayer', title: 'Verses about Prayer', description: 'Salah in the Quran', icon: 'star', articleCount: 31 },
  { id: 'patience', title: 'Patience & Perseverance', description: 'Sabr in the Quran', icon: 'sparkles', articleCount: 18 },
  { id: 'charity', title: 'Charity & Giving', description: 'Zakat and Sadaqah', icon: 'heart', articleCount: 22 },
];

const features = [
  {
    icon: BookOpen,
    title: 'Read Quran',
    description: 'Access all 114 Surahs with Arabic text and English translations',
  },
  {
    icon: Headphones,
    title: 'Audio Recitation',
    description: 'Listen to beautiful recitations from renowned Qaris',
  },
  {
    icon: GraduationCap,
    title: 'Learn & Reflect',
    description: 'Explore topics, reading plans, and daily reflections',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Connect with fellow readers and share reflections',
  },
];

export default function Index() {
  const { surahs, loading } = useSurahs();

  return (
    <div className="min-h-screen bg-background dark">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="max-w-7xl mx-auto relative">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                Read, Learn & Reflect on the{' '}
                <span className="text-primary">Holy Quran</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Access the complete Quran with translations, audio recitations, 
                and learning resources. Start your journey today.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link to="/read">
                  <Button size="lg" className="gap-2">
                    Start Reading <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/learn">
                  <Button size="lg" variant="outline" className="gap-2">
                    Explore Learning
                  </Button>
                </Link>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-card border border-border rounded-xl p-6 text-center"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content Grid */}
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Continue Reading & Daily Verse */}
              <div className="space-y-6">
                <ContinueReading />
                <DailyVerse />
              </div>

              {/* Right Column - Surahs & Learning */}
              <div className="lg:col-span-2 space-y-8">
                {/* Popular Surahs */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground">Popular Surahs</h2>
                    <Link to="/read" className="text-sm text-primary hover:underline flex items-center gap-1">
                      View all <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {loading ? (
                      Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                      ))
                    ) : (
                      surahs.slice(0, 6).map((surah) => (
                        <SurahCard key={surah.number} surah={surah} />
                      ))
                    )}
                  </div>
                </div>

                {/* Learning Plans */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground">Featured Learning Plans</h2>
                    <Link to="/learn" className="text-sm text-primary hover:underline flex items-center gap-1">
                      View all <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {featuredPlans.map((plan) => (
                      <LearningPlanCard key={plan.id} plan={plan} />
                    ))}
                  </div>
                </div>

                {/* Explore Topics */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground">Explore Topics</h2>
                    <Link to="/learn" className="text-sm text-primary hover:underline flex items-center gap-1">
                      View all <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {topics.map((topic) => (
                      <TopicCard key={topic.id} topic={topic} />
                    ))}
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
