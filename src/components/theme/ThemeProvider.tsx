"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useUIStore } from '@/lib/store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { setDarkMode, setReducedMotion, checkReducedMotion } = useUIStore();
  
  // Handle initial hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    // Check and set reduced motion preference
    checkReducedMotion();
    
    // Listen for preference changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };
    
    // Listen for system theme changes
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleDarkModeChange = (e: MediaQueryListEvent) => {
      // Only update if theme is set to system
      const theme = localStorage.getItem('theme');
      if (theme === 'system' || !theme) {
        setDarkMode(e.matches);
      }
    };
    
    // Add event listeners
    mediaQuery.addEventListener('change', handleReducedMotionChange);
    darkModeQuery.addEventListener('change', handleDarkModeChange);
    
    // Initialize dark mode based on current system preference if using system theme
    const theme = localStorage.getItem('theme');
    if (theme === 'system' || !theme) {
      setDarkMode(darkModeQuery.matches);
    } else {
      setDarkMode(theme === 'dark');
    }
    
    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleReducedMotionChange);
      darkModeQuery.removeEventListener('change', handleDarkModeChange);
    };
  }, [checkReducedMotion, setReducedMotion, setDarkMode]);
  
  // Update Zustand store when theme changes
  const handleThemeChange = (theme: string | undefined) => {
    setDarkMode(theme === 'dark');
  };
  
  if (!mounted) {
    // Prevent theme flash during hydration
    return (
      <div style={{ visibility: 'hidden' }}>
        {children}
      </div>
    );
  }
  
  return (
    <NextThemesProvider 
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      onValueChange={handleThemeChange}
    >
      {children}
    </NextThemesProvider>
  );
}

export default ThemeProvider;
