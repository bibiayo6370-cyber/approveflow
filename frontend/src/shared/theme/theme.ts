export type Theme = 'light' | 'dark';
export const THEME_STORAGE_KEY = 'approveflow-theme';

/** An explicit choice wins; first-time visitors always see Light Mode. */
export function getStoredTheme(value: string | null | undefined): Theme {
  return value === 'dark' ? 'dark' : 'light';
}
