import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useReadingStreak } from '@/hooks/useReadingStreak';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, BookOpen, Clock, Target, Award, ChevronRight,
  Flame, Calendar, BookMarked, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface MemorizationStats {
  totalSurahs: number;
  completed: number;
  inProgress: number;
  totalAyahs: number;
  memorizedAyahs: number;
}

interface ReadingStats {
  totalPagesRead: number;
  bookmarksCount: number;
  lastReadSurah: string | null;
}

export function ProgressDashboard() {
  const { user } = useAuth();
  const { streak } = useReadingStreak();
  const [memStats, setMemStats] = useState<MemorizationStats>({
    totalSurahs: 114,
    completed: 0,
    inProgress: 0,
    totalAyahs: 6236,
    memorizedAyahs: 0,
  });
  const [readingStats, setReadingStats] = useState<ReadingStats>({
    totalPagesRead: 0,
    bookmarksCount: 0,
    lastReadSurah: null,
  });

  useEffect(() => {
    if (!user) return;

    async function fetchStats() {
      // Fetch memorization progress
      const { data: memData } = await supabase
        .from('memorization_progress')
        .select('*')
        .eq('user_id', user.id);

      if (memData) {
        const completed = memData.filter(m => m.status === 'completed').length;
        const inProgress = memData.filter(m => m.status === 'in_progress').length;
        const memorizedAyahs = memData.reduce((acc, m) => 
          acc + (m.ayahs_memorized?.length || 0), 0
        );
        setMemStats(prev => ({
          ...prev,
          completed,
          inProgress,
          memorizedAyahs,
        }));
      }

      // Fetch reading history
      const { data: readingData } = await supabase
        .from('reading_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (readingData) {
        const bookmarks = readingData.filter(r => r.is_bookmark).length;
        setReadingStats({
          totalPagesRead: readingData.length,
          bookmarksCount: bookmarks,
          lastReadSurah: readingData[0]?.surah_number ? `Surah ${readingData[0].surah_number}` : null,
        });
      }
    }

    fetchStats();
  }, [user]);

  const memProgress = (memStats.memorizedAyahs / memStats.totalAyahs) * 100;
  const streakDays = streak?.currentStreak || 0;

  const stats = [
    {
      icon: Flame,
      label: 'Current Streak',
      value: `${streakDays} days`,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      icon: BookOpen,
      label: 'Pages Read',
      value: readingStats.totalPagesRead.toString(),
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Star,
      label: 'Memorized',
      value: `${memStats.memorizedAyahs} ayahs`,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: BookMarked,
      label: 'Bookmarks',
      value: readingStats.bookmarksCount.toString(),
      color: 'text-rose-500',
      bgColor: 'bg-rose-500/10',
    },
  ];

  if (!user) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="text-center">
          <TrendingUp className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-2">Track Your Progress</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Sign in to track your reading streaks, memorization, and more
          </p>
          <Link to="/auth">
            <Button className="gap-2">
              Sign In <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 to-accent/10 p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Your Progress
          </h3>
          <Link to="/profile">
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View All <ChevronRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={cn('p-3 rounded-xl', stat.bgColor)}
            >
              <stat.icon className={cn('w-5 h-5 mb-2', stat.color)} />
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Memorization Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Hifz Progress</span>
            <span className="text-foreground font-medium">{memProgress.toFixed(1)}%</span>
          </div>
          <Progress value={memProgress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{memStats.completed} completed</span>
            <span>{memStats.inProgress} in progress</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-4">
          <Link to="/read" className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-2">
              <BookOpen className="w-4 h-4" /> Continue Reading
            </Button>
          </Link>
          <Link to="/memorization" className="flex-1">
            <Button variant="outline" size="sm" className="w-full gap-2">
              <Target className="w-4 h-4" /> Memorize
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
