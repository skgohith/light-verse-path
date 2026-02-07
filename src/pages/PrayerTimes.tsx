import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { HijriCalendar } from '@/components/HijriCalendar';
import { NamesOfAllahGrid } from '@/components/NamesOfAllahGrid';
import { DuasSection } from '@/components/DuasSection';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Sparkles, BookOpen, ArrowRight } from 'lucide-react';

export default function PrayerTimesPage() {
  return <div className="min-h-screen bg-background dark">
      <Header />
      <main className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 font-serif">Tools</h1>
            <p className="text-muted-foreground">Calendar, Duas, and more</p>
          </div>

          <Tabs defaultValue="calendar" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="calendar" className="gap-2"><Calendar className="w-4 h-4" /><span className="hidden sm:inline">Calendar</span></TabsTrigger>
              <TabsTrigger value="names" className="gap-2"><Sparkles className="w-4 h-4" /><span className="hidden sm:inline">99 Names</span></TabsTrigger>
              <TabsTrigger value="duas" className="gap-2"><BookOpen className="w-4 h-4" /><span className="hidden sm:inline">Duas</span></TabsTrigger>
            </TabsList>

            <TabsContent value="calendar">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <HijriCalendar />
                <div className="space-y-6">
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="font-semibold text-foreground mb-4">About Islamic Calendar</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      The Islamic calendar (Hijri) is a lunar calendar with 12 months. It began in 622 CE when Prophet Muhammad ﷺ migrated from Mecca to Medina.
                    </p>
                  </div>
                  <Link to="/read">
                    <Button className="w-full gap-2">Read Quran <ArrowRight className="w-4 h-4" /></Button>
                  </Link>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="names">
              <NamesOfAllahGrid />
            </TabsContent>

            <TabsContent value="duas">
              <DuasSection />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>;
}