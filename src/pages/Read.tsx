import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SurahCard } from '@/components/SurahCard';
import { useSurahs } from '@/hooks/useQuranApi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Grid, List, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Read() {
  const { surahs, loading } = useSurahs();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState<'all' | 'meccan' | 'medinan'>('all');

  const filteredSurahs = surahs.filter((surah) => {
    const matchesSearch =
      surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.name.includes(searchQuery) ||
      surah.number.toString() === searchQuery;

    const matchesFilter =
      filter === 'all' ||
      (filter === 'meccan' && surah.revelationType === 'Meccan') ||
      (filter === 'medinan' && surah.revelationType === 'Medinan');

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background dark">
      <Header />

      <main className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Read Quran</h1>
            <p className="text-muted-foreground">
              Browse all 114 Surahs with Arabic text and English translations
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, number, or Arabic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-card"
              />
            </div>

            <div className="flex items-center gap-2">
              <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Surahs</SelectItem>
                  <SelectItem value="meccan">Meccan</SelectItem>
                  <SelectItem value="medinan">Medinan</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center border border-border rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'h-8 w-8',
                    viewMode === 'grid' && 'bg-muted'
                  )}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'h-8 w-8',
                    viewMode === 'list' && 'bg-muted'
                  )}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <p className="text-sm text-muted-foreground mb-4">
            Showing {filteredSurahs.length} of {surahs.length} Surahs
          </p>

          {/* Surahs Grid/List */}
          <div
            className={cn(
              'gap-4',
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'flex flex-col'
            )}
          >
            {loading
              ? Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))
              : filteredSurahs.map((surah) => (
                  <SurahCard key={surah.number} surah={surah} />
                ))}
          </div>

          {!loading && filteredSurahs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No Surahs found matching your search.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
