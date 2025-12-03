import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="w-10 h-10 rounded-full hover:bg-primary/10 transition-all duration-300"
      aria-label="Alternar tema"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-gold-accent transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="h-5 w-5 text-primary transition-transform duration-300 hover:-rotate-12" />
      )}
    </Button>
  );
}
