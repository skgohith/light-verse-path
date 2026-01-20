import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'emerald' | 'ocean' | 'sunset';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const THEMES: { id: Theme; name: string; primary: string }[] = [
  { id: 'dark', name: 'Dark Green', primary: 'hsl(150, 55%, 45%)' },
  { id: 'light', name: 'Light', primary: 'hsl(150, 60%, 40%)' },
  { id: 'emerald', name: 'Emerald Night', primary: 'hsl(160, 60%, 40%)' },
  { id: 'ocean', name: 'Ocean Blue', primary: 'hsl(210, 60%, 50%)' },
  { id: 'sunset', name: 'Sunset Gold', primary: 'hsl(35, 80%, 50%)' },
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('app-theme');
    return (saved as Theme) || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    
    // Remove all theme classes
    document.documentElement.classList.remove('dark', 'light', 'theme-emerald', 'theme-ocean', 'theme-sunset');
    
    // Apply theme
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      if (theme !== 'dark') {
        document.documentElement.classList.add(`theme-${theme}`);
      }
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
