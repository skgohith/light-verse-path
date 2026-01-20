import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LearningPlanCard } from '@/components/LearningPlanCard';
import { TopicCard } from '@/components/TopicCard';
import { HadithSection } from '@/components/HadithSection';
import { DuasSection } from '@/components/DuasSection';
import { NamesOfAllahGrid } from '@/components/NamesOfAllahGrid';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, BookOpen, Sparkles, Heart, ArrowRight, Target, Clock } from 'lucide-react';
import { LearningPlan, Topic } from '@/types/quran';

const learningPlans: LearningPlan[] = [
  { id: 'quran-year', title: 'Quran in a Year', description: 'Read the entire Quran in 365 days with daily portions', icon: 'calendar', category: 'Reading Plan', duration: '365 days' },
  { id: 'memorization', title: 'Memorization Guide', description: 'Proven techniques for Quran memorization', icon: 'star', category: 'Learning', duration: 'Self-paced' },
  { id: 'ramadan', title: 'Ramadan Special', description: 'Complete the Quran during Ramadan', icon: 'moon', category: 'Seasonal', duration: '30 days' },
  { id: 'tajweed', title: 'Tajweed Basics', description: 'Learn the rules of Quran recitation', icon: 'bookOpen', category: 'Learning', duration: '4 weeks' },
  { id: 'arabic', title: 'Quranic Arabic', description: 'Understand Arabic vocabulary of the Quran', icon: 'heart', category: 'Language', duration: '12 weeks' },
  { id: 'tafsir', title: 'Tafsir Journey', description: 'Deep dive into Quranic interpretation', icon: 'star', category: 'Understanding', duration: 'Ongoing' },
];

const topics: Topic[] = [
  { id: 'about-quran', title: 'About The Quran', description: 'History, compilation and significance', icon: 'bookOpen', articleCount: 15 },
  { id: 'sunnah', title: 'Sunnah & Hadith', description: 'Prophetic traditions and sayings', icon: 'heart', articleCount: 23 },
  { id: 'pillars', title: 'Five Pillars', description: 'Foundation of Islamic practice', icon: 'star', articleCount: 20 },
  { id: 'prophets', title: 'Stories of Prophets', description: 'Narratives from the Quran', icon: 'moon', articleCount: 25 },
  { id: 'prayer', title: 'Salah (Prayer)', description: 'How to pray and its importance', icon: 'star', articleCount: 31 },
  { id: 'fasting', title: 'Sawm (Fasting)', description: 'Ramadan and voluntary fasting', icon: 'moon', articleCount: 18 },
  { id: 'zakat', title: 'Zakat & Sadaqah', description: 'Charity in Islam', icon: 'heart', articleCount: 12 },
  { id: 'hajj', title: 'Hajj & Umrah', description: 'The sacred pilgrimage', icon: 'star', articleCount: 16 },
];

const stats = [
  { icon: Target, label: 'Learning Plans', value: '12+' },
  { icon: BookOpen, label: 'Hadith Collections', value: '6' },
  { icon: Clock, label: '99 Names', value: 'الله' },
];

export default function Learn() {
  return (
    <div className="min-h-screen bg-background dark">
      <Header />
      <main className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Learn Islam
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore Hadith collections, learning plans, Duas, and the 99 Names of Allah
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-card border border-border rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          <Tabs defaultValue="hadith" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="hadith" className="gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Hadith</span>
              </TabsTrigger>
              <TabsTrigger value="plans" className="gap-2">
                <GraduationCap className="w-4 h-4" />
                <span className="hidden sm:inline">Plans</span>
              </TabsTrigger>
              <TabsTrigger value="names" className="gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">99 Names</span>
              </TabsTrigger>
              <TabsTrigger value="duas" className="gap-2">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Duas</span>
              </TabsTrigger>
            </TabsList>

            {/* Hadith Tab */}
            <TabsContent value="hadith">
              <HadithSection />
            </TabsContent>

            {/* Learning Plans Tab */}
            <TabsContent value="plans">
              <div className="space-y-8">
                {/* Learning Plans */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground">Learning Plans</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {learningPlans.map((plan) => (
                      <LearningPlanCard key={plan.id} plan={plan} />
                    ))}
                  </div>
                </div>

                {/* Topics Grid */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground">Explore Topics</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {topics.map((topic) => (
                      <TopicCard key={topic.id} topic={topic} />
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 rounded-xl p-6">
                    <h3 className="font-semibold text-foreground mb-2">Start Reading Today</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Begin your journey with the Quran. Read with Arabic, transliteration, and English translation.
                    </p>
                    <Link to="/read">
                      <Button className="gap-2">
                        Read Quran <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                  <div className="bg-gradient-to-br from-accent/20 to-primary/10 border border-accent/20 rounded-xl p-6">
                    <h3 className="font-semibold text-foreground mb-2">Prayer Times & Tools</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Access live prayer times, Qibla direction, Hijri calendar, and more Islamic tools.
                    </p>
                    <Link to="/tools">
                      <Button variant="secondary" className="gap-2">
                        View Tools <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 99 Names Tab */}
            <TabsContent value="names">
              <NamesOfAllahGrid />
            </TabsContent>

            {/* Duas Tab */}
            <TabsContent value="duas">
              <DuasSection />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
