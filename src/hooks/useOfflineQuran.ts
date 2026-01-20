import { useState, useEffect } from 'react';

interface OfflineData {
  surahs: any[];
  lastUpdated: string | null;
}

export function useOfflineQuran() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData>({ surahs: [], lastUpdated: null });
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Load cached data
    const cached = localStorage.getItem('offline_quran');
    if (cached) {
      setOfflineData(JSON.parse(cached));
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const downloadForOffline = async () => {
    if (downloading) return;
    
    setDownloading(true);
    setDownloadProgress(0);

    try {
      // Download surah list
      const response = await fetch('https://api.alquran.cloud/v1/surah');
      const data = await response.json();
      
      if (data.code !== 200) throw new Error('Failed to fetch surahs');
      
      const surahs = data.data;
      const totalSurahs = surahs.length;
      const downloadedSurahs: any[] = [];

      // Download first 10 surahs for quick access (can be extended)
      const surahsToDownload = surahs.slice(0, 10);
      
      for (let i = 0; i < surahsToDownload.length; i++) {
        const surah = surahsToDownload[i];
        
        try {
          const [arabicRes, englishRes] = await Promise.all([
            fetch(`https://api.alquran.cloud/v1/surah/${surah.number}/ar.alafasy`),
            fetch(`https://api.alquran.cloud/v1/surah/${surah.number}/en.asad`),
          ]);
          
          const arabicData = await arabicRes.json();
          const englishData = await englishRes.json();
          
          downloadedSurahs.push({
            ...surah,
            arabic: arabicData.data,
            english: englishData.data,
          });
          
          setDownloadProgress(((i + 1) / surahsToDownload.length) * 100);
        } catch (err) {
          console.error(`Failed to download surah ${surah.number}`);
        }
      }

      const offlineDataNew: OfflineData = {
        surahs: downloadedSurahs,
        lastUpdated: new Date().toISOString(),
      };
      
      localStorage.setItem('offline_quran', JSON.stringify(offlineDataNew));
      setOfflineData(offlineDataNew);
      
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  const getOfflineSurah = (surahNumber: number) => {
    return offlineData.surahs.find(s => s.number === surahNumber);
  };

  const clearOfflineData = () => {
    localStorage.removeItem('offline_quran');
    setOfflineData({ surahs: [], lastUpdated: null });
  };

  return {
    isOffline,
    offlineData,
    downloading,
    downloadProgress,
    downloadForOffline,
    getOfflineSurah,
    clearOfflineData,
    hasOfflineData: offlineData.surahs.length > 0,
  };
}
