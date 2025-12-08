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
      className="w-10 h-10 rounded-full hover:bg-primary/10 transition-all duration-300 overflow-hidden"
      aria-label="Alternar tema"
    >
      <div className="relative w-5 h-5">
        <Sun 
          className={`absolute inset-0 h-5 w-5 text-gold-accent transition-all duration-500 ${
            theme === "dark" 
              ? "rotate-0 scale-100 opacity-100" 
              : "rotate-90 scale-0 opacity-0"
          }`} 
        />
        <Moon 
          className={`absolute inset-0 h-5 w-5 text-primary transition-all duration-500 ${
            theme === "dark" 
              ? "-rotate-90 scale-0 opacity-0" 
              : "rotate-0 scale-100 opacity-100"
          }`} 
        />
      </div>
    </Button>
  );
}
