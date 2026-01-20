import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { SplashScreen } from "@/components/SplashScreen";
import Index from "./pages/Index";
import Read from "./pages/Read";
import SurahDetail from "./pages/SurahDetail";
import Learn from "./pages/Learn";
import Community from "./pages/Community";
import Bookmarks from "./pages/Bookmarks";
import PrayerTimes from "./pages/PrayerTimes";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Tasbeeh from "./pages/Tasbeeh";
import Memorization from "./pages/Memorization";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="dark">
            {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/read" element={<Read />} />
                <Route path="/surah/:surahNumber" element={<SurahDetail />} />
                <Route path="/learn" element={<Learn />} />
                <Route path="/community" element={<Community />} />
                <Route path="/bookmarks" element={<Bookmarks />} />
                <Route path="/prayer-times" element={<PrayerTimes />} />
                <Route path="/tools" element={<PrayerTimes />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/tasbeeh" element={<Tasbeeh />} />
                <Route path="/memorization" element={<Memorization />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
