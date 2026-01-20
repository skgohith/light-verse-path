import { Link } from 'react-router-dom';
import { Topic } from '@/types/quran';
import { BookOpen, FileText, Heart, Moon, Star, Sun, Sparkles, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopicCardProps {
  topic: Topic;
  className?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  bookOpen: BookOpen,
  fileText: FileText,
  heart: Heart,
  moon: Moon,
  star: Star,
  sun: Sun,
  sparkles: Sparkles,
  users: Users,
};

export function TopicCard({ topic, className }: TopicCardProps) {
  const Icon = iconMap[topic.icon] || BookOpen;

  return (
    <Link
      to={`/topic/${topic.id}`}
      className={cn(
        'group flex items-center gap-4 bg-card border border-border rounded-xl p-4 transition-all duration-300',
        'hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5',
        className
      )}
    >
      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
          {topic.title}
        </h3>
        <p className="text-xs text-muted-foreground">
          {topic.articleCount} articles
        </p>
      </div>
    </Link>
  );
}
