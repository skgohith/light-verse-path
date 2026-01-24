import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface CalculationMethod {
  id: number;
  name: string;
  description: string;
}

export const CALCULATION_METHODS: CalculationMethod[] = [
  { id: 1, name: 'University of Islamic Sciences, Karachi', description: 'Karachi - Fajr: 18°, Isha: 18°' },
  { id: 2, name: 'Islamic Society of North America (ISNA)', description: 'ISNA - Fajr: 15°, Isha: 15°' },
  { id: 3, name: 'Muslim World League (MWL)', description: 'MWL - Fajr: 18°, Isha: 17°' },
  { id: 4, name: 'Umm Al-Qura University, Makkah', description: 'Makkah - Fajr: 18.5°, Isha: 90 min' },
  { id: 5, name: 'Egyptian General Authority of Survey', description: 'Egypt - Fajr: 19.5°, Isha: 17.5°' },
  { id: 7, name: 'Institute of Geophysics, Tehran', description: 'Tehran - Fajr: 17.7°, Isha: 14°' },
  { id: 8, name: 'Gulf Region', description: 'Gulf - Fajr: 19.5°, Isha: 90 min' },
  { id: 9, name: 'Kuwait', description: 'Kuwait - Fajr: 18°, Isha: 17.5°' },
  { id: 10, name: 'Qatar', description: 'Qatar - Fajr: 18°, Isha: 90 min' },
  { id: 11, name: 'Majlis Ugama Islam Singapura', description: 'Singapore - Fajr: 20°, Isha: 18°' },
  { id: 12, name: 'Union des Organisations Islamiques de France', description: 'France - Fajr: 12°, Isha: 12°' },
  { id: 13, name: 'Diyanet İşleri Başkanlığı, Turkey', description: 'Turkey - Fajr: 18°, Isha: 17°' },
  { id: 14, name: 'Spiritual Administration of Muslims of Russia', description: 'Russia - Fajr: 16°, Isha: 15°' },
  { id: 15, name: 'Moonsighting Committee Worldwide', description: 'Moonsighting - Fajr: 18°, Isha: 18°' },
];

export function usePrayerCalculationMethod() {
  const [method, setMethodStorage] = useLocalStorage<number>('prayer-calculation-method', 1);
  const [selectedMethod, setSelectedMethod] = useState<CalculationMethod | null>(null);

  useEffect(() => {
    const found = CALCULATION_METHODS.find(m => m.id === method);
    setSelectedMethod(found || CALCULATION_METHODS[1]);
  }, [method]);

  const setMethod = (id: number) => {
    setMethodStorage(id);
  };

  return {
    method,
    selectedMethod,
    setMethod,
    methods: CALCULATION_METHODS,
  };
}
