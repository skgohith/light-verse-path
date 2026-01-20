import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Read from "./pages/Read";
import SurahDetail from "./pages/SurahDetail";
import Learn from "./pages/Learn";
import Community from "./pages/Community";
import Bookmarks from "./pages/Bookmarks";
import PrayerTimes from "./pages/PrayerTimes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="dark">
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
