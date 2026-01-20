import { Link } from 'react-router-dom';
import { LearningPlan } from '@/types/quran';
import { BookOpen, Calendar, Star, Moon, Sun, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LearningPlanCardProps {
  plan: LearningPlan;
  className?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  bookOpen: BookOpen,
  calendar: Calendar,
  star: Star,
  moon: Moon,
  sun: Sun,
  heart: Heart,
};

export function LearningPlanCard({ plan, className }: LearningPlanCardProps) {
  const Icon = iconMap[plan.icon] || BookOpen;

  return (
    <Link
      to={`/learn/${plan.id}`}
      className={cn(
        'group block bg-card border border-border rounded-xl p-5 transition-all duration-300',
        'hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <span className="text-xs font-medium text-primary uppercase tracking-wide">
            {plan.category}
          </span>
          <h3 className="font-semibold text-foreground mt-1 group-hover:text-primary transition-colors">
            {plan.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {plan.description}
          </p>
          {plan.duration && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground mt-2">
              <Calendar className="w-3 h-3" />
              {plan.duration}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
