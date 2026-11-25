import { createContext, useContext, useLayoutEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { getStoredTheme, THEME_STORAGE_KEY } from './theme';

interface ThemeContextValue {
  theme: 'light' | 'dark';
  setTheme: (value: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function initialTheme() {
  try { return getStoredTheme(window.localStorage.getItem(THEME_STORAGE_KEY)); }
  catch { return 'light' as const; }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(initialTheme);

  // useLayoutEffect updates the DOM before the browser paints after React commits.
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try { window.localStorage.setItem(THEME_STORAGE_KEY, theme); } catch { /* storage is optional */ }
  }, [theme]);

  const value = useMemo<ThemeContextValue>(() => ({
    theme, setTheme, toggleTheme: () => setTheme((previous) => previous === 'light' ? 'dark' : 'light'),
  }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used under ThemeProvider.');
  return context;
}
