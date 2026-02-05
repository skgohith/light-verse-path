import { Link } from 'react-router-dom';
import { Star, Clock, BookOpen, BookMarked, TrendingUp, Heart } from 'lucide-react';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { cn } from '@/lib/utils';

interface QuickWidget {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  content?: React.ReactNode;
  gradient: string;
}

export function QuickWidgets() {
  const { prayerTimes, nextPrayer } = usePrayerTimes();

  const widgets: QuickWidget[] = [
    {
      id: 'prayer',
      title: 'Next Prayer',
      icon: Clock,
      path: '/tools',
      gradient: 'from-emerald-500/20 to-emerald-600/10',
      content: nextPrayer ? (
        <div className="mt-1">
          <p className="text-lg font-bold text-foreground">{nextPrayer.name}</p>
          <p className="text-xs text-muted-foreground">
            {nextPrayer.time} • {nextPrayer.remaining}
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground mt-1">Loading...</p>
      ),
    },
    {
      id: 'tasbeeh',
      title: 'Tasbeeh',
      icon: Star,
      path: '/tasbeeh',
      gradient: 'from-amber-500/20 to-amber-600/10',
      content: (
        <p className="text-xs text-muted-foreground mt-1">Quick counter</p>
      ),
    },
    {
      id: 'read',
      title: 'Continue',
      icon: BookOpen,
      path: '/read',
      gradient: 'from-purple-500/20 to-purple-600/10',
      content: (
        <p className="text-xs text-muted-foreground mt-1">Resume reading</p>
      ),
    },
    {
      id: 'bookmarks',
      title: 'Bookmarks',
      icon: BookMarked,
      path: '/bookmarks',
      gradient: 'from-rose-500/20 to-rose-600/10',
      content: (
        <p className="text-xs text-muted-foreground mt-1">Saved verses</p>
      ),
    },
    {
      id: 'duas',
      title: 'Duas',
      icon: Heart,
      path: '/memorization',
      gradient: 'from-pink-500/20 to-pink-600/10',
      content: (
        <p className="text-xs text-muted-foreground mt-1">Daily prayers</p>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">Quick Access</h3>
      <div className="grid grid-cols-3 gap-2">
        {widgets.map((widget) => (
          <Link
            key={widget.id}
            to={widget.path}
            className={cn(
              "relative p-3 rounded-xl border border-border bg-gradient-to-br transition-all hover:scale-[1.02] active:scale-[0.98]",
              widget.gradient
            )}
          >
            <div className="flex items-start justify-between">
              <widget.icon className="w-5 h-5 text-primary" />
            </div>
            <p className="text-xs font-medium text-foreground mt-2">{widget.title}</p>
            {widget.content}
          </Link>
        ))}
      </div>
    </div>
  );
}
