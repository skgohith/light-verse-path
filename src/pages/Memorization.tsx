import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useSurahs } from '@/hooks/useQuranApi';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Star, RotateCcw, Check, Clock, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MemorizationItem {
  id: string;
  surah_number: number;
  surah_name: string;
  ayahs_memorized: number[];
  total_ayahs: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'revision';
  last_reviewed_at: string | null;
}

const statusColors = {
  not_started: 'bg-muted text-muted-foreground',
  in_progress: 'bg-yellow-500/20 text-yellow-600',
  completed: 'bg-green-500/20 text-green-600',
  revision: 'bg-blue-500/20 text-blue-600',
};

const statusLabels = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  revision: 'Revision',
};

export default function Memorization() {
  const { user } = useAuth();
  const { surahs, loading: surahsLoading } = useSurahs();
  const [items, setItems] = useState<MemorizationItem[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<MemorizationItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProgress();
    } else {
      const saved = localStorage.getItem('memorization_progress');
      if (saved) {
        setItems(JSON.parse(saved));
      }
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user && items.length > 0) {
      localStorage.setItem('memorization_progress', JSON.stringify(items));
    }
  }, [items, user]);

  const loadProgress = async () => {
    const { data, error } = await supabase
      .from('memorization_progress')
      .select('*')
      .order('surah_number', { ascending: true });

    if (!error && data) {
      setItems(data as MemorizationItem[]);
    }
    setLoading(false);
  };

  const startMemorizing = async (surah: { number: number; name: string; englishName: string; numberOfAyahs: number }) => {
    const existingItem = items.find(i => i.surah_number === surah.number);
    
    if (existingItem) {
      setSelectedSurah(existingItem);
      return;
    }

    const newItem: Omit<MemorizationItem, 'id'> = {
      surah_number: surah.number,
      surah_name: surah.englishName,
      ayahs_memorized: [],
      total_ayahs: surah.numberOfAyahs,
      status: 'in_progress',
      last_reviewed_at: null,
    };

    if (user) {
      const { data, error } = await supabase
        .from('memorization_progress')
        .insert({ ...newItem, user_id: user.id })
        .select()
        .single();

      if (!error && data) {
        setItems(prev => [...prev, data as MemorizationItem]);
        setSelectedSurah(data as MemorizationItem);
      }
    } else {
      const localItem = { ...newItem, id: `local-${Date.now()}` };
      setItems(prev => [...prev, localItem]);
      setSelectedSurah(localItem);
    }
  };

  const toggleAyahMemorized = async (ayahNumber: number) => {
    if (!selectedSurah) return;

    const ayahs = selectedSurah.ayahs_memorized || [];
    const newAyahs = ayahs.includes(ayahNumber)
      ? ayahs.filter(a => a !== ayahNumber)
      : [...ayahs, ayahNumber].sort((a, b) => a - b);

    const newStatus = newAyahs.length === selectedSurah.total_ayahs 
      ? 'completed' 
      : newAyahs.length > 0 
        ? 'in_progress' 
        : 'not_started';

    if (user) {
      await supabase
        .from('memorization_progress')
        .update({ 
          ayahs_memorized: newAyahs, 
          status: newStatus,
          last_reviewed_at: new Date().toISOString()
        })
        .eq('id', selectedSurah.id);
    }

    const updatedItem = {
      ...selectedSurah,
      ayahs_memorized: newAyahs,
      status: newStatus as MemorizationItem['status'],
      last_reviewed_at: new Date().toISOString(),
    };

    setItems(prev => prev.map(i => i.id === selectedSurah.id ? updatedItem : i));
    setSelectedSurah(updatedItem);

    if (newStatus === 'completed') {
      toast.success('Surah completed! 🎉');
    }
  };

  const markForRevision = async () => {
    if (!selectedSurah) return;

    if (user) {
      await supabase
        .from('memorization_progress')
        .update({ status: 'revision', last_reviewed_at: new Date().toISOString() })
        .eq('id', selectedSurah.id);
    }

    const updatedItem = { ...selectedSurah, status: 'revision' as const };
    setItems(prev => prev.map(i => i.id === selectedSurah.id ? updatedItem : i));
    setSelectedSurah(updatedItem);
    toast.success('Marked for revision');
  };

  // Stats
  const stats = {
    total: items.length,
    inProgress: items.filter(i => i.status === 'in_progress').length,
    completed: items.filter(i => i.status === 'completed').length,
    revision: items.filter(i => i.status === 'revision').length,
    totalAyahs: items.reduce((acc, i) => acc + (i.ayahs_memorized?.length || 0), 0),
  };

  return (
    <div className="min-h-screen bg-background dark flex flex-col">
      <Header />
      <main className="flex-1 py-6 px-4 pb-24">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Memorization Tracker</h1>
            <p className="text-sm text-muted-foreground">Track your Quran memorization progress</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{stats.totalAyahs}</p>
                <p className="text-xs text-muted-foreground">Ayahs Memorized</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <BookOpen className="w-5 h-5 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Check className="w-5 h-5 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <RotateCcw className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{stats.revision}</p>
                <p className="text-xs text-muted-foreground">In Revision</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="progress" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="progress">My Progress</TabsTrigger>
              <TabsTrigger value="surahs">All Surahs</TabsTrigger>
            </TabsList>

            <TabsContent value="progress">
              {items.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-foreground mb-2">No progress yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Start memorizing by selecting a Surah from the "All Surahs" tab
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {items.map((item) => {
                    const progress = ((item.ayahs_memorized?.length || 0) / item.total_ayahs) * 100;
                    return (
                      <Card 
                        key={item.id}
                        className="cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => setSelectedSurah(item)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <span className="text-sm font-bold text-primary">{item.surah_number}</span>
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{item.surah_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.ayahs_memorized?.length || 0} / {item.total_ayahs} ayahs
                                </p>
                              </div>
                            </div>
                            <Badge className={statusColors[item.status]}>
                              {statusLabels[item.status]}
                            </Badge>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="surahs">
              <ScrollArea className="h-[500px]">
                <div className="grid gap-2">
                  {surahs.map((surah) => {
                    const progress = items.find(i => i.surah_number === surah.number);
                    const progressPercent = progress 
                      ? ((progress.ayahs_memorized?.length || 0) / progress.total_ayahs) * 100 
                      : 0;
                    
                    return (
                      <Card 
                        key={surah.number}
                        className="cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => startMemorizing(surah)}
                      >
                        <CardContent className="p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <span className="text-xs font-bold text-primary">{surah.number}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{surah.englishName}</p>
                              <p className="text-xs text-muted-foreground">{surah.numberOfAyahs} ayahs</p>
                            </div>
                          </div>
                          {progress && (
                            <div className="flex items-center gap-2">
                              <Progress value={progressPercent} className="w-16 h-2" />
                              <span className="text-xs text-muted-foreground">{Math.round(progressPercent)}%</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Ayah Selection Dialog */}
      <Dialog open={!!selectedSurah} onOpenChange={() => setSelectedSurah(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {selectedSurah?.surah_name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedSurah && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={statusColors[selectedSurah.status]}>
                  {statusLabels[selectedSurah.status]}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {selectedSurah.ayahs_memorized?.length || 0} / {selectedSurah.total_ayahs} ayahs
                </span>
              </div>

              <Progress 
                value={((selectedSurah.ayahs_memorized?.length || 0) / selectedSurah.total_ayahs) * 100} 
                className="h-3" 
              />

              <p className="text-sm text-muted-foreground">Tap ayahs to mark as memorized:</p>

              <ScrollArea className="h-48">
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: selectedSurah.total_ayahs }, (_, i) => i + 1).map((ayah) => {
                    const isMemorized = selectedSurah.ayahs_memorized?.includes(ayah);
                    return (
                      <button
                        key={ayah}
                        onClick={() => toggleAyahMemorized(ayah)}
                        className={cn(
                          "w-9 h-9 rounded-lg text-sm font-medium transition-colors",
                          isMemorized 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {ayah}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>

              <div className="flex gap-2">
                <Button variant="outline" onClick={markForRevision} className="flex-1 gap-2">
                  <RotateCcw className="w-4 h-4" /> Revision
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <MobileNav />
      <Footer className="hidden md:block" />
    </div>
  );
}
