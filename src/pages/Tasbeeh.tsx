import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, RotateCcw, Vibrate, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface TasbeehItem {
  id: string;
  dhikr_name: string;
  dhikr_arabic: string | null;
  count: number;
  target: number;
}

const DEFAULT_DHIKRS = [
  { name: 'SubhanAllah', arabic: 'سُبْحَانَ اللَّهِ', target: 33 },
  { name: 'Alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', target: 33 },
  { name: 'Allahu Akbar', arabic: 'اللَّهُ أَكْبَرُ', target: 33 },
  { name: 'La ilaha illallah', arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ', target: 100 },
  { name: 'Astaghfirullah', arabic: 'أَسْتَغْفِرُ اللَّهَ', target: 100 },
];

export default function Tasbeeh() {
  const { user } = useAuth();
  const [items, setItems] = useState<TasbeehItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<TasbeehItem | null>(null);
  const [newDhikr, setNewDhikr] = useState({ name: '', arabic: '', target: 33 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [vibrate, setVibrate] = useState(true);

  useEffect(() => {
    if (user) {
      loadTasbeehItems();
    } else {
      // Load from localStorage for guests
      const saved = localStorage.getItem('tasbeeh_items');
      if (saved) {
        setItems(JSON.parse(saved));
      } else {
        // Set default items
        const defaultItems = DEFAULT_DHIKRS.map((d, i) => ({
          id: `local-${i}`,
          dhikr_name: d.name,
          dhikr_arabic: d.arabic,
          count: 0,
          target: d.target,
        }));
        setItems(defaultItems);
      }
    }
  }, [user]);

  useEffect(() => {
    if (!user && items.length > 0) {
      localStorage.setItem('tasbeeh_items', JSON.stringify(items));
    }
  }, [items, user]);

  const loadTasbeehItems = async () => {
    const { data, error } = await supabase
      .from('tasbeeh_counts')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading tasbeeh:', error);
      return;
    }

    if (data.length === 0) {
      // Create default items for new users
      const defaultItems = DEFAULT_DHIKRS.map(d => ({
        user_id: user!.id,
        dhikr_name: d.name,
        dhikr_arabic: d.arabic,
        count: 0,
        target: d.target,
      }));

      const { data: inserted } = await supabase
        .from('tasbeeh_counts')
        .insert(defaultItems)
        .select();

      if (inserted) {
        setItems(inserted);
      }
    } else {
      setItems(data);
    }
  };

  const incrementCount = useCallback(async () => {
    if (!selectedItem) return;

    const newCount = selectedItem.count + 1;
    
    // Vibrate on each count
    if (vibrate && navigator.vibrate) {
      navigator.vibrate(30);
    }

    // Check if target reached
    if (newCount === selectedItem.target && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
      toast.success('Target reached! 🎉');
    }

    if (user) {
      await supabase
        .from('tasbeeh_counts')
        .update({ count: newCount })
        .eq('id', selectedItem.id);
    }

    setItems(prev => prev.map(item => 
      item.id === selectedItem.id ? { ...item, count: newCount } : item
    ));
    setSelectedItem(prev => prev ? { ...prev, count: newCount } : null);
  }, [selectedItem, user, vibrate]);

  const resetCount = async () => {
    if (!selectedItem) return;

    if (user) {
      await supabase
        .from('tasbeeh_counts')
        .update({ count: 0 })
        .eq('id', selectedItem.id);
    }

    setItems(prev => prev.map(item => 
      item.id === selectedItem.id ? { ...item, count: 0 } : item
    ));
    setSelectedItem(prev => prev ? { ...prev, count: 0 } : null);
    toast.success('Counter reset');
  };

  const addDhikr = async () => {
    if (!newDhikr.name) return;

    const newItem = {
      dhikr_name: newDhikr.name,
      dhikr_arabic: newDhikr.arabic || null,
      count: 0,
      target: newDhikr.target,
    };

    if (user) {
      const { data, error } = await supabase
        .from('tasbeeh_counts')
        .insert({ ...newItem, user_id: user.id })
        .select()
        .single();

      if (!error && data) {
        setItems(prev => [...prev, data]);
      }
    } else {
      const localItem = { ...newItem, id: `local-${Date.now()}` };
      setItems(prev => [...prev, localItem]);
    }

    setNewDhikr({ name: '', arabic: '', target: 33 });
    setDialogOpen(false);
    toast.success('Dhikr added');
  };

  const deleteDhikr = async (id: string) => {
    if (user) {
      await supabase.from('tasbeeh_counts').delete().eq('id', id);
    }
    setItems(prev => prev.filter(item => item.id !== id));
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
    toast.success('Dhikr removed');
  };

  // Counter view
  if (selectedItem) {
    const progress = (selectedItem.count / selectedItem.target) * 100;
    
    return (
      <div className="min-h-screen bg-background dark flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4 pb-24">
          <div className="text-center max-w-sm w-full">
            <Button 
              variant="ghost" 
              onClick={() => setSelectedItem(null)}
              className="mb-4"
            >
              ← Back to list
            </Button>

            {/* Dhikr Display */}
            <div className="mb-8">
              {selectedItem.dhikr_arabic && (
                <p className="font-arabic text-4xl text-primary mb-2">
                  {selectedItem.dhikr_arabic}
                </p>
              )}
              <p className="text-lg text-foreground font-medium">
                {selectedItem.dhikr_name}
              </p>
            </div>

            {/* Counter Button */}
            <button
              onClick={incrementCount}
              className="w-48 h-48 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground flex items-center justify-center mx-auto mb-6 active:scale-95 transition-transform shadow-xl shadow-primary/20"
            >
              <span className="text-6xl font-bold">{selectedItem.count}</span>
            </button>

            {/* Progress */}
            <div className="mb-6">
              <Progress value={progress} className="h-3 mb-2" />
              <p className="text-sm text-muted-foreground">
                {selectedItem.count} / {selectedItem.target}
                {selectedItem.count >= selectedItem.target && (
                  <Badge variant="secondary" className="ml-2">
                    <Check className="w-3 h-3 mr-1" /> Complete
                  </Badge>
                )}
              </p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" onClick={resetCount} className="gap-2">
                <RotateCcw className="w-4 h-4" /> Reset
              </Button>
              <Button
                variant={vibrate ? "default" : "outline"}
                onClick={() => setVibrate(!vibrate)}
                className="gap-2"
              >
                <Vibrate className="w-4 h-4" /> {vibrate ? 'On' : 'Off'}
              </Button>
            </div>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen bg-background dark flex flex-col">
      <Header />
      <main className="flex-1 py-6 px-4 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Tasbeeh</h1>
              <p className="text-sm text-muted-foreground">Digital dhikr counter</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" /> Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Dhikr</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      value={newDhikr.name}
                      onChange={(e) => setNewDhikr(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. SubhanAllah"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Arabic (optional)</label>
                    <Input
                      value={newDhikr.arabic}
                      onChange={(e) => setNewDhikr(prev => ({ ...prev, arabic: e.target.value }))}
                      placeholder="e.g. سُبْحَانَ اللَّهِ"
                      className="font-arabic text-right"
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Target Count</label>
                    <Input
                      type="number"
                      value={newDhikr.target}
                      onChange={(e) => setNewDhikr(prev => ({ ...prev, target: parseInt(e.target.value) || 33 }))}
                      min={1}
                    />
                  </div>
                  <Button onClick={addDhikr} className="w-full">Add Dhikr</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-3">
            {items.map((item) => {
              const progress = (item.count / item.target) * 100;
              return (
                <Card 
                  key={item.id}
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary/50",
                    item.count >= item.target && "border-primary/50 bg-primary/5"
                  )}
                  onClick={() => setSelectedItem(item)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        {item.dhikr_arabic && (
                          <p className="font-arabic text-xl text-primary">{item.dhikr_arabic}</p>
                        )}
                        <p className="font-medium text-foreground">{item.dhikr_name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary">{item.count}</span>
                        <span className="text-sm text-muted-foreground">/ {item.target}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteDhikr(item.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
      <MobileNav />
      <Footer className="hidden md:block" />
    </div>
  );
}
