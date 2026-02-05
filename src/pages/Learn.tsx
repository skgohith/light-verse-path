import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HadithSection } from '@/components/HadithSection';
import { DuasSection } from '@/components/DuasSection';
import { NamesOfAllahGrid } from '@/components/NamesOfAllahGrid';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Sparkles, Heart, ArrowRight, Target, Clock } from 'lucide-react';

const stats = [
  { icon: Target, label: 'Topics', value: '3' },
  { icon: BookOpen, label: 'Hadith Collections', value: '6' },
  { icon: Clock, label: '99 Names', value: 'الله' },
];

export default function Learn() {
  return (
    <div className="min-h-screen bg-background dark">
      <Header />
      <main className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Learn Islam
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore Hadith collections, learning plans, Duas, and the 99 Names of Allah
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-card border border-border rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          <Tabs defaultValue="hadith" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="hadith" className="gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Hadith</span>
              </TabsTrigger>
              <TabsTrigger value="names" className="gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="hidden sm:inline">99 Names</span>
              </TabsTrigger>
              <TabsTrigger value="duas" className="gap-2">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Duas</span>
              </TabsTrigger>
            </TabsList>

            {/* Hadith Tab */}
            <TabsContent value="hadith">
              <HadithSection />
            </TabsContent>

            {/* 99 Names Tab */}
            <TabsContent value="names">
              <NamesOfAllahGrid />
            </TabsContent>

            {/* Duas Tab */}
            <TabsContent value="duas">
              <DuasSection />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
