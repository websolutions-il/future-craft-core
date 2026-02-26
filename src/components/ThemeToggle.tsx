import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 left-4 z-50 flex items-center gap-2 bg-card text-foreground border border-border rounded-xl px-3 py-2 shadow-md hover:shadow-lg active:scale-95 transition-all md:top-6 md:left-6"
      aria-label={theme === 'light' ? 'מצב כהה' : 'מצב בהיר'}
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      <span className="text-sm font-medium hidden md:inline">
        {theme === 'light' ? 'כהה' : 'בהיר'}
      </span>
    </button>
  );
}
