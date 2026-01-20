import { useReadingStreak } from '@/hooks/useReadingStreak';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Check, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReadingStreakCardProps {
  className?: string;
  compact?: boolean;
}

export function ReadingStreakCard({ className, compact = false }: ReadingStreakCardProps) {
  const { streak, getWeeklyData, hasReadToday } = useReadingStreak();
  const weekData = getWeeklyData();

  if (compact) {
    return (
      <div className={cn("bg-gradient-to-br from-orange-500/20 to-yellow-500/10 border border-orange-500/20 rounded-xl p-4", className)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="font-medium text-foreground">Reading Streak</span>
          </div>
          <span className="text-2xl font-bold text-orange-500">{streak.currentStreak}</span>
        </div>
        <div className="flex justify-between gap-1">
          {weekData.map((day) => (
            <div key={day.date} className="flex flex-col items-center">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs",
                day.read 
                  ? "bg-orange-500 text-white" 
                  : "bg-muted text-muted-foreground"
              )}>
                {day.read ? <Check className="w-3 h-3" /> : day.day.charAt(0)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className={cn("border-orange-500/20", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Reading Streak
            </h3>
            <p className="text-sm text-muted-foreground">Keep reading daily to build your streak</p>
          </div>
          {!hasReadToday() && (
            <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-1 rounded-full">
              Read today to continue!
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gradient-to-br from-orange-500/20 to-yellow-500/10 rounded-xl">
            <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-orange-500">{streak.currentStreak}</p>
            <p className="text-xs text-muted-foreground">Current Streak</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-xl">
            <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
            <p className="text-3xl font-bold text-foreground">{streak.longestStreak}</p>
            <p className="text-xs text-muted-foreground">Longest Streak</p>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-xl">
            <Check className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-foreground">{streak.totalDaysRead}</p>
            <p className="text-xs text-muted-foreground">Total Days</p>
          </div>
        </div>

        <div>
          <p className="text-xs text-muted-foreground mb-3">This Week</p>
          <div className="flex justify-between gap-2">
            {weekData.map((day) => (
              <div key={day.date} className="flex flex-col items-center gap-1">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                  day.read 
                    ? "bg-orange-500 text-white" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {day.read ? <Check className="w-5 h-5" /> : null}
                </div>
                <span className="text-xs text-muted-foreground">{day.day}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
