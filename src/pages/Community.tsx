import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { DailyVerse } from '@/components/DailyVerse';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Heart, Share2, Users, Sparkles, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Reflection {
  id: string;
  author: string;
  avatar: string;
  content: string;
  verse: string;
  surah: string;
  likes: number;
  comments: number;
  timestamp: string;
}

const sampleReflections: Reflection[] = [
  {
    id: '1',
    author: 'Abdullah M.',
    avatar: 'A',
    content: 'This verse reminds me that patience is not just waiting, but how we behave while waiting. SubhanAllah, such profound wisdom in every word.',
    verse: '2:153',
    surah: 'Al-Baqarah',
    likes: 24,
    comments: 5,
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    author: 'Fatima K.',
    avatar: 'F',
    content: 'Reading this during difficult times gave me so much peace. The Quran truly is a healing for what is in the hearts.',
    verse: '10:57',
    surah: 'Yunus',
    likes: 42,
    comments: 8,
    timestamp: '4 hours ago'
  },
  {
    id: '3',
    author: 'Omar S.',
    avatar: 'O',
    content: 'Every time I recite this ayah, I am reminded of Allah\'s infinite mercy. May we always be grateful for His blessings.',
    verse: '55:13',
    surah: 'Ar-Rahman',
    likes: 36,
    comments: 12,
    timestamp: '6 hours ago'
  },
];

const stats = [
  { icon: Users, label: 'Community Members', value: '10K+' },
  { icon: MessageSquare, label: 'Reflections Shared', value: '25K+' },
  { icon: Heart, label: 'Verses Bookmarked', value: '100K+' },
];

export default function Community() {
  const [newReflection, setNewReflection] = useState('');
  const [reflections, setReflections] = useState(sampleReflections);

  const handleSubmitReflection = () => {
    if (newReflection.trim()) {
      const reflection: Reflection = {
        id: Date.now().toString(),
        author: 'You',
        avatar: 'Y',
        content: newReflection,
        verse: '',
        surah: '',
        likes: 0,
        comments: 0,
        timestamp: 'Just now'
      };
      setReflections([reflection, ...reflections]);
      setNewReflection('');
    }
  };

  return (
    <div className="min-h-screen bg-background dark">
      <Header />

      <main className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                QuranReflect
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join our community of believers. Share your reflections, connect with others, and grow together.
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Share Reflection */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-4">Share Your Reflection</h3>
                <Textarea
                  placeholder="What verse touched your heart today? Share your thoughts..."
                  value={newReflection}
                  onChange={(e) => setNewReflection(e.target.value)}
                  className="mb-4 min-h-[100px]"
                />
                <div className="flex items-center justify-end">
                  <Button onClick={handleSubmitReflection} disabled={!newReflection.trim()}>
                    Share Reflection
                  </Button>
                </div>
              </div>

              {/* Reflections Feed */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Recent Reflections
                  </h3>
                </div>

                {reflections.map((reflection) => (
                  <div
                    key={reflection.id}
                    className="bg-card border border-border rounded-xl p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-primary">
                          {reflection.avatar}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-foreground">
                            {reflection.author}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {reflection.timestamp}
                          </span>
                        </div>

                        {reflection.verse && (
                          <span className="inline-block text-xs bg-primary/10 text-primary px-2 py-1 rounded-full mb-2">
                            {reflection.surah} • {reflection.verse}
                          </span>
                        )}

                        <p className="text-muted-foreground leading-relaxed mb-4">
                          {reflection.content}
                        </p>

                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                            <Heart className="w-4 h-4" />
                            {reflection.likes}
                          </button>
                          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                            <MessageSquare className="w-4 h-4" />
                            {reflection.comments}
                          </button>
                          <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                            <Share2 className="w-4 h-4" />
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <DailyVerse />

              {/* Community Guidelines */}
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-4">Community Guidelines</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Share respectful and thoughtful reflections
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Be kind and supportive to fellow members
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Avoid controversial topics and debates
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Report any inappropriate content
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
