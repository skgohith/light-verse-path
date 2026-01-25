import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp, Calendar, ChevronLeft, ChevronRight, BookOpen, Flame, Target, Award, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
interface DayData {
  date: string;
  pagesRead: number;
  ayahsMemorized: number;
  hasActivity: boolean;
}
interface WeekData {
  weekStart: string;
  weekEnd: string;
  totalPages: number;
  totalAyahs: number;
  activeDays: number;
  dailyData: DayData[];
}
interface MonthData {
  month: string;
  year: number;
  totalPages: number;
  totalAyahs: number;
  activeDays: number;
  weeklyBreakdown: {
    week: number;
    pages: number;
    ayahs: number;
  }[];
}
export function AnalyticsDashboard() {
  const {
    user
  } = useAuth();
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekData, setWeekData] = useState<WeekData | null>(null);
  const [monthData, setMonthData] = useState<MonthData | null>(null);
  const [loading, setLoading] = useState(true);
  const getDaysOfWeek = (date: Date): Date[] => {
    const week: Date[] = [];
    const startOfWeek = new Date(date);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };
  const fetchWeeklyData = async () => {
    if (!user) return;
    setLoading(true);
    const days = getDaysOfWeek(currentDate);
    const startDate = formatDate(days[0]);
    const endDate = formatDate(days[6]);
    try {
      const {
        data: readingData
      } = await supabase.from('reading_history').select('*').eq('user_id', user.id).gte('created_at', `${startDate}T00:00:00`).lte('created_at', `${endDate}T23:59:59`);
      const {
        data: memData
      } = await supabase.from('memorization_progress').select('*').eq('user_id', user.id).gte('updated_at', `${startDate}T00:00:00`).lte('updated_at', `${endDate}T23:59:59`);
      const dailyData: DayData[] = days.map(day => {
        const dateStr = formatDate(day);
        const dayReading = readingData?.filter(r => r.created_at.startsWith(dateStr)) || [];
        const dayMem = memData?.filter(m => m.updated_at.startsWith(dateStr)) || [];
        return {
          date: dateStr,
          pagesRead: dayReading.length,
          ayahsMemorized: dayMem.reduce((acc, m) => acc + (m.ayahs_memorized?.length || 0), 0),
          hasActivity: dayReading.length > 0 || dayMem.length > 0
        };
      });
      setWeekData({
        weekStart: startDate,
        weekEnd: endDate,
        totalPages: dailyData.reduce((acc, d) => acc + d.pagesRead, 0),
        totalAyahs: dailyData.reduce((acc, d) => acc + d.ayahsMemorized, 0),
        activeDays: dailyData.filter(d => d.hasActivity).length,
        dailyData
      });
    } catch (error) {
      console.error('Error fetching weekly data:', error);
    } finally {
      setLoading(false);
    }
  };
  const fetchMonthlyData = async () => {
    if (!user) return;
    setLoading(true);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`;
    try {
      const {
        data: readingData
      } = await supabase.from('reading_history').select('*').eq('user_id', user.id).gte('created_at', `${startDate}T00:00:00`).lte('created_at', `${endDate}T23:59:59`);
      const {
        data: memData
      } = await supabase.from('memorization_progress').select('*').eq('user_id', user.id).gte('updated_at', `${startDate}T00:00:00`).lte('updated_at', `${endDate}T23:59:59`);
      const weeklyBreakdown: {
        week: number;
        pages: number;
        ayahs: number;
      }[] = [];
      const activeDaysSet = new Set<string>();
      for (let week = 0; week < 5; week++) {
        const weekStart = week * 7 + 1;
        const weekEnd = Math.min(weekStart + 6, lastDay);
        let weekPages = 0;
        let weekAyahs = 0;
        for (let day = weekStart; day <= weekEnd; day++) {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayReading = readingData?.filter(r => r.created_at.startsWith(dateStr)) || [];
          const dayMem = memData?.filter(m => m.updated_at.startsWith(dateStr)) || [];
          weekPages += dayReading.length;
          weekAyahs += dayMem.reduce((acc, m) => acc + (m.ayahs_memorized?.length || 0), 0);
          if (dayReading.length > 0 || dayMem.length > 0) {
            activeDaysSet.add(dateStr);
          }
        }
        weeklyBreakdown.push({
          week: week + 1,
          pages: weekPages,
          ayahs: weekAyahs
        });
      }
      setMonthData({
        month: new Date(year, month).toLocaleString('default', {
          month: 'long'
        }),
        year,
        totalPages: readingData?.length || 0,
        totalAyahs: memData?.reduce((acc, m) => acc + (m.ayahs_memorized?.length || 0), 0) || 0,
        activeDays: activeDaysSet.size,
        weeklyBreakdown
      });
    } catch (error) {
      console.error('Error fetching monthly data:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (view === 'weekly') {
      fetchWeeklyData();
    } else {
      fetchMonthlyData();
    }
  }, [user, view, currentDate]);
  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'weekly') {
      newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -1 : 1));
    }
    setCurrentDate(newDate);
  };
  const getWeekDayNames = () => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const maxPagesInWeek = weekData ? Math.max(...weekData.dailyData.map(d => d.pagesRead), 1) : 1;
  const maxPagesInMonth = monthData ? Math.max(...monthData.weeklyBreakdown.map(w => w.pages), 1) : 1;
  if (!user) {
    return <div className="bg-card border border-border rounded-xl p-6 text-center">
        <BarChart3 className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-semibold text-foreground mb-2">Reading Analytics</h3>
        <p className="text-sm text-muted-foreground">Sign in to view your reading patterns</p>
      </div>;
  }
  return <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/20 to-accent/10 p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Reading Analytics
          </h3>
        </div>

        <Tabs value={view} onValueChange={v => setView(v as 'weekly' | 'monthly')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={() => navigatePeriod('prev')}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="font-medium text-foreground">
          {view === 'weekly' ? `${new Date(weekData?.weekStart || '').toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })} - ${new Date(weekData?.weekEnd || '').toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        })}` : `${monthData?.month} ${monthData?.year}`}
        </span>
        <Button variant="ghost" size="icon" onClick={() => navigatePeriod('next')}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? <div className="space-y-4 animate-pulse">
            <div className="h-32 bg-muted rounded-lg" />
            <div className="grid grid-cols-3 gap-3">
              <div className="h-16 bg-muted rounded-lg" />
              <div className="h-16 bg-muted rounded-lg" />
              <div className="h-16 bg-muted rounded-lg" />
            </div>
          </div> : view === 'weekly' && weekData ? <>
            {/* Weekly Chart */}
            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-3">Pages Read This Week</p>
              <div className="flex items-end justify-between gap-2 h-32">
                {weekData.dailyData.map((day, idx) => <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <div className={cn("w-full rounded-t-md transition-all", day.pagesRead > 0 ? "bg-primary" : "bg-muted")} style={{
                height: `${day.pagesRead / maxPagesInWeek * 100}%`,
                minHeight: day.pagesRead > 0 ? '8px' : '4px'
              }} />
                    <span className="text-[10px] text-muted-foreground">
                      {getWeekDayNames()[idx]}
                    </span>
                    {day.pagesRead > 0 && <span className="text-[10px] font-medium text-foreground">
                        {day.pagesRead}
                      </span>}
                  </div>)}
              </div>
            </div>

            {/* Weekly Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-500/10 rounded-xl p-3 text-center">
                <BookOpen className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{weekData.totalPages}</p>
                <p className="text-[10px] text-muted-foreground">Pages Read</p>
              </div>
              <div className="bg-purple-500/10 rounded-xl p-3 text-center">
                <Target className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{weekData.totalAyahs}</p>
                <p className="text-[10px] text-muted-foreground">Ayahs Memorized</p>
              </div>
              <div className="bg-orange-500/10 rounded-xl p-3 text-center">
                <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{weekData.activeDays}/7</p>
                <p className="text-[10px] text-muted-foreground">Active Days</p>
              </div>
            </div>

            {/* Activity Heatmap */}
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">Activity This Week</p>
              <div className="items-start justify-start flex flex-row gap-[4px] border border-neutral-950">
                {weekData.dailyData.map(day => <div key={day.date} className={cn("flex-1 h-8 rounded transition-colors", day.hasActivity ? "bg-primary/70" : "bg-muted")} title={`${new Date(day.date).toLocaleDateString()}: ${day.pagesRead} pages`} />)}
              </div>
            </div>
          </> : monthData ? <>
            {/* Monthly Chart */}
            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-3">Weekly Breakdown</p>
              <div className="flex items-end justify-between gap-3 h-32">
                {monthData.weeklyBreakdown.map(week => <div key={week.week} className="flex-1 flex flex-col items-center gap-1">
                    <div className={cn("w-full rounded-t-md transition-all", week.pages > 0 ? "bg-primary" : "bg-muted")} style={{
                height: `${week.pages / maxPagesInMonth * 100}%`,
                minHeight: week.pages > 0 ? '8px' : '4px'
              }} />
                    <span className="text-[10px] text-muted-foreground">
                      Wk {week.week}
                    </span>
                    {week.pages > 0 && <span className="text-[10px] font-medium text-foreground">
                        {week.pages}
                      </span>}
                  </div>)}
              </div>
            </div>

            {/* Monthly Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-blue-500/10 rounded-xl p-3 text-center">
                <BookOpen className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{monthData.totalPages}</p>
                <p className="text-[10px] text-muted-foreground">Pages Read</p>
              </div>
              <div className="bg-purple-500/10 rounded-xl p-3 text-center">
                <Target className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{monthData.totalAyahs}</p>
                <p className="text-[10px] text-muted-foreground">Ayahs Memorized</p>
              </div>
              <div className="bg-green-500/10 rounded-xl p-3 text-center">
                <Award className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{monthData.activeDays}</p>
                <p className="text-[10px] text-muted-foreground">Active Days</p>
              </div>
            </div>
          </> : null}
      </div>
    </div>;
}