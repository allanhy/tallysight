'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  accentColor: string;
  toggleTheme: (theme: Theme) => void;
  setAccentColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [accentColor, setAccentColor] = useState('#3B82F6'); // Default blue

  useEffect(() => {
    // Load theme from localStorage on initial render
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedAccentColor = localStorage.getItem('accentColor');
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
    if (savedAccentColor) setAccentColor(savedAccentColor);

    // Set the data-theme attribute on the root element
    const root = document.documentElement;
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.setAttribute('data-theme', systemTheme);
    } else {
      root.setAttribute('data-theme', theme);
    }

    // Add system theme change listener
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const applyTheme = (selectedTheme: Theme) => {
    const isDark = 
      selectedTheme === 'dark' || 
      (selectedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    
    document.documentElement.classList.toggle('dark', isDark);
  };

  const toggleTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const updateAccentColor = (color: string) => {
    setAccentColor(color);
    localStorage.setItem('accentColor', color);
  };

  return (
    <ThemeContext.Provider value={{ theme, accentColor, toggleTheme, setAccentColor: updateAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 