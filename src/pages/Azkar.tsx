import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { AzkarAudioPlayer } from '@/components/AzkarAudioPlayer';
import { DuasSection } from '@/components/DuasSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sunrise, Moon, BookOpen } from 'lucide-react';

export default function Azkar() {
  return (
    <div className="min-h-screen bg-background dark flex flex-col">
      <Header />
      <main className="flex-1 py-8 px-4 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Morning & Evening Azkar
            </h1>
            <p className="text-muted-foreground">
              Listen and recite daily remembrances with audio
            </p>
          </div>

          <Tabs defaultValue="audio" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="audio" className="gap-2">
                <Sunrise className="w-4 h-4" />
                Audio Recitation
              </TabsTrigger>
              <TabsTrigger value="duas" className="gap-2">
                <BookOpen className="w-4 h-4" />
                All Duas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="audio">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AzkarAudioPlayer type="morning" />
                <AzkarAudioPlayer type="evening" />
              </div>
            </TabsContent>

            <TabsContent value="duas">
              <DuasSection />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <MobileNav />
      <Footer className="hidden md:block" />
    </div>
  );
}
