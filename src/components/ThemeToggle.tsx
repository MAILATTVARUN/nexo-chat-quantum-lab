
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ThemeToggleProps {
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
}

export const ThemeToggle = ({ darkMode, setDarkMode }: ThemeToggleProps) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setDarkMode(!darkMode)}
      className="hover:bg-accent"
    >
      {darkMode ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
};
