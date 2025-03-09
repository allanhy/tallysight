'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

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
    // Load theme and accent color from localStorage on initial render
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedAccentColor = localStorage.getItem('accentColor');
    
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
    if (savedAccentColor) {
      setAccentColor(savedAccentColor);
      applyAccentColor(savedAccentColor);
    }

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

  const applyAccentColor = (color: string) => {
    document.documentElement.style.setProperty('--accent-color', color);
    // Update button hover states
    document.documentElement.style.setProperty('--accent-color-hover', adjustColorBrightness(color, -10));
  };

  // Helper function to darken/lighten colors for hover states
  const adjustColorBrightness = (hex: string, percent: number) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (
      0x1000000 +
      (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1);
  };

  const toggleTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  const updateAccentColor = (color: string) => {
    setAccentColor(color);
    localStorage.setItem('accentColor', color);
    applyAccentColor(color);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      accentColor, 
      toggleTheme, 
      setAccentColor: updateAccentColor 
    }}>
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