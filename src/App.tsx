import { useState, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { SplashScreen } from "@/components/SplashScreen";
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import Index from "./pages/Index";
import Read from "./pages/Read";
import SurahDetail from "./pages/SurahDetail";
import MushafIndex from "./pages/MushafIndex";
import Mushaf from "./pages/Mushaf";
import Learn from "./pages/Learn";
import Bookmarks from "./pages/Bookmarks";
import PrayerTimes from "./pages/PrayerTimes";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Tasbeeh from "./pages/Tasbeeh";
import Memorization from "./pages/Memorization";
import Hadith from "./pages/Hadith";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to handle back button
function BackButtonHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (Capacitor.getPlatform() === 'web') return;

    const backButtonListener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      // If on home page, minimize the app instead of closing
      if (location.pathname === '/') {
        CapacitorApp.minimizeApp();
      } else if (canGoBack) {
        navigate(-1);
      } else {
        navigate('/');
      }
    });

    return () => {
      backButtonListener.then(listener => listener.remove());
    };
  }, [navigate, location.pathname]);

  return null;
}

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <div className="dark">
              {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <BackButtonHandler />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/read" element={<Read />} />
                  <Route path="/surah/:surahNumber" element={<SurahDetail />} />
                  <Route path="/mushaf" element={<MushafIndex />} />
                  <Route path="/mushaf/:surahNumber" element={<Mushaf />} />
                  <Route path="/learn" element={<Learn />} />
                  <Route path="/bookmarks" element={<Bookmarks />} />
                  <Route path="/prayer-times" element={<PrayerTimes />} />
                  <Route path="/tools" element={<PrayerTimes />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/tasbeeh" element={<Tasbeeh />} />
                  <Route path="/memorization" element={<Memorization />} />
                  <Route path="/hadith" element={<Hadith />} />
                  <Route path="/hadith/:bookId" element={<Hadith />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </div>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
