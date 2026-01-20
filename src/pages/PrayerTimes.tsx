import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PrayerTimesCard } from '@/components/PrayerTimesCard';
import { QiblaCompass } from '@/components/QiblaCompass';
import { HijriCalendar } from '@/components/HijriCalendar';
import { NamesOfAllahGrid } from '@/components/NamesOfAllahGrid';
import { DuasSection } from '@/components/DuasSection';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Compass, Calendar, Sparkles, BookOpen, ArrowRight } from 'lucide-react';

export default function PrayerTimesPage() {
  return (
    <div className="min-h-screen bg-background dark">
      <Header />
      <main className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Islamic Tools</h1>
            <p className="text-muted-foreground">Prayer times, Qibla direction, calendar, and more</p>
          </div>

          <Tabs defaultValue="prayer" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-8">
              <TabsTrigger value="prayer" className="gap-2"><Clock className="w-4 h-4" /><span className="hidden sm:inline">Prayer</span></TabsTrigger>
              <TabsTrigger value="qibla" className="gap-2"><Compass className="w-4 h-4" /><span className="hidden sm:inline">Qibla</span></TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2"><Calendar className="w-4 h-4" /><span className="hidden sm:inline">Calendar</span></TabsTrigger>
              <TabsTrigger value="names" className="gap-2"><Sparkles className="w-4 h-4" /><span className="hidden sm:inline">99 Names</span></TabsTrigger>
              <TabsTrigger value="duas" className="gap-2"><BookOpen className="w-4 h-4" /><span className="hidden sm:inline">Duas</span></TabsTrigger>
            </TabsList>

            <TabsContent value="prayer">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <PrayerTimesCard />
                <div className="space-y-6">
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="font-semibold text-foreground mb-4">About Prayer Times</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Prayer times are calculated based on your location using the Islamic Society of North America (ISNA) method. 
                      The five daily prayers are Fajr (dawn), Dhuhr (midday), Asr (afternoon), Maghrib (sunset), and Isha (night).
                    </p>
                  </div>
                  <Link to="/read">
                    <Button className="w-full gap-2">Read Quran <ArrowRight className="w-4 h-4" /></Button>
                  </Link>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="qibla">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <QiblaCompass />
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-4">About Qibla</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    The Qibla is the direction of the Kaaba in Mecca, Saudi Arabia. Muslims face this direction during prayer.
                    The compass shows the direction from your current location.
                  </p>
                  <p className="text-muted-foreground text-sm">Allow location access for accurate direction.</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="calendar">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <HijriCalendar />
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-semibold text-foreground mb-4">About Islamic Calendar</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    The Islamic calendar (Hijri) is a lunar calendar with 12 months. It began in 622 CE when Prophet Muhammad ﷺ migrated from Mecca to Medina.
                  </p>
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
    </div>
  );
}
