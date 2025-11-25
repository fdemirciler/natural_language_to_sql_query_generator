import { useEffect, useState } from 'react';
import { ColorMode } from '../types';

export const useColorMode = () => {
  const [colorMode, setColorMode] = useState<ColorMode>('dark');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Check system preference or stored preference
    const stored = localStorage.getItem('colorMode') as ColorMode | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const mode = stored || (prefersDark ? 'dark' : 'light');
    setColorMode(mode);

    // Apply to document
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleColorMode = () => {
    setColorMode((prev) => {
      const newMode = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('colorMode', newMode);

      if (newMode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      return newMode;
    });
  };

  return {
    colorMode: isMounted ? colorMode : 'dark',
    toggleColorMode,
    isDark: isMounted ? colorMode === 'dark' : true,
  };
};
