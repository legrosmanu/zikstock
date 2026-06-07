import { useCallback, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'zikstock-theme';

const getInitialTheme = (): Theme => {
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  // Default: light
  return 'light';
};

const applyTheme = (theme: Theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEY, theme);
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  // Sync on mount
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'light' ? 'dark' : 'light';
      applyTheme(next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
};
