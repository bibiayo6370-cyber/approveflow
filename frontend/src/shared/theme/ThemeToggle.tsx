import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const destination = theme === 'light' ? 'dark' : 'light';
  return (
    <button type="button" className={`af-icon-button af-theme-toggle ${className}`.trim()}
      onClick={toggleTheme} aria-label={`Switch to ${destination} mode`} title={`Switch to ${destination} mode`}>
      {theme === 'light' ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
      <span className="af-theme-text">{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
    </button>
  );
}
