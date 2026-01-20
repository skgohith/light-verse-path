import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LearningPlanCard } from '@/components/LearningPlanCard';
import { TopicCard } from '@/components/TopicCard';
import { LearningPlan, Topic } from '@/types/quran';
import { BookOpen, Calendar, Star, Moon, Sun, Heart, Sparkles, Target, Clock } from 'lucide-react';

const learningPlans: LearningPlan[] = [
  {
    id: 'quran-year',
    title: 'Quran in a Year',
    description: 'Read the entire Quran in 365 days with daily verse recommendations and progress tracking',
    icon: 'calendar',
    category: 'Reading Plan',
    duration: '365 days'
  },
  {
    id: 'memorization',
    title: 'Memorization Guide',
    description: 'Step-by-step guide to memorizing the Quran with proven techniques and spaced repetition',
    icon: 'star',
    category: 'Learning',
    duration: 'Self-paced'
  },
  {
    id: 'ramadan',
    title: 'Ramadan Khatm',
    description: 'Complete the Quran during the blessed month of Ramadan with daily readings',
    icon: 'moon',
    category: 'Seasonal',
    duration: '30 days'
  },
  {
    id: 'tajweed',
    title: 'Tajweed Basics',
    description: 'Learn the fundamental rules of Quran recitation and pronunciation',
    icon: 'bookOpen',
    category: 'Learning',
    duration: '8 weeks'
  },
  {
    id: 'juz-amma',
    title: 'Juz Amma Mastery',
    description: 'Master the 30th Juz with memorization techniques and tafsir understanding',
    icon: 'heart',
    category: 'Memorization',
    duration: '12 weeks'
  },
  {
    id: 'daily-reflection',
    title: 'Daily Reflection',
    description: 'One verse per day with deep reflection questions and journaling prompts',
    icon: 'sun',
    category: 'Spiritual',
    duration: 'Ongoing'
  },
];

const topics: Topic[] = [
  { id: 'about-quran', title: 'About The Quran', description: 'Learn about the holy book and its significance', icon: 'bookOpen', articleCount: 15 },
  { id: 'sunnah', title: 'Verses about the Sunnah', description: 'Prophetic traditions in the Quran', icon: 'heart', articleCount: 23 },
  { id: 'ramadan', title: 'What is Ramadan', description: 'The blessed month of fasting', icon: 'moon', articleCount: 12 },
  { id: 'prayer', title: 'Verses about Prayer', description: 'Salah and its importance in the Quran', icon: 'star', articleCount: 31 },
  { id: 'patience', title: 'Patience & Perseverance', description: 'Sabr in the Quran', icon: 'sparkles', articleCount: 18 },
  { id: 'charity', title: 'Charity & Giving', description: 'Zakat and Sadaqah', icon: 'heart', articleCount: 22 },
  { id: 'family', title: 'Family & Marriage', description: 'Family values in Islam', icon: 'users', articleCount: 28 },
  { id: 'paradise', title: 'Paradise (Jannah)', description: 'Descriptions of paradise', icon: 'sparkles', articleCount: 19 },
  { id: 'prophets', title: 'Stories of Prophets', description: 'Learn from the prophets', icon: 'bookOpen', articleCount: 45 },
];

const stats = [
  { icon: Target, label: 'Learning Plans', value: '12+' },
  { icon: BookOpen, label: 'Topics', value: '50+' },
  { icon: Clock, label: 'Daily Verses', value: '6236' },
];

export default function Learn() {
  return (
    <div className="min-h-screen bg-background dark">
      <Header />

      <main className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Learn & Grow with the Quran
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore structured learning plans, discover topics, and deepen your understanding of the Quran
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-card border border-border rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Learning Plans */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Featured Learning Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {learningPlans.map((plan) => (
                <LearningPlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          </section>

          {/* Topics */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">Explore Topics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map((topic) => (
                <TopicCard key={topic.id} topic={topic} />
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
