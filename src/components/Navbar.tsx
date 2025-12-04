import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Anchor } from "lucide-react";

interface NavbarProps {
  showNav?: boolean;
  currentPage?: string;
  rightContent?: React.ReactNode;
}

export function Navbar({ showNav = true, currentPage, rightContent }: NavbarProps) {
  return (
    <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-soft">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
            <Anchor className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-3xl md:text-4xl font-handwritten font-bold text-primary pulse-glow">
            Porto de Ideias
          </span>
        </Link>
        
        {showNav && (
          <nav className="hidden md:flex items-center gap-8">
            <Link 
              to="/" 
              className={`text-base font-medium transition-colors elegant-link ${
                currentPage === "home" ? "text-primary" : "text-foreground hover:text-primary"
              }`}
            >
              Início
            </Link>
            <a 
              href="/#sobre" 
              className="text-base font-medium text-foreground hover:text-primary transition-colors elegant-link"
            >
              Sobre
            </a>
            <a 
              href="/#plataforma" 
              className="text-base font-medium text-foreground hover:text-primary transition-colors elegant-link"
            >
              Plataforma
            </a>
            <Link 
              to="/projetos" 
              className={`text-base font-medium transition-colors elegant-link ${
                currentPage === "projetos" ? "text-primary" : "text-foreground hover:text-primary"
              }`}
            >
              Projetos
            </Link>
            <a 
              href="/#contato" 
              className="text-base font-medium text-foreground hover:text-primary transition-colors elegant-link"
            >
              Contato
            </a>
            <ThemeToggle />
          </nav>
        )}

        {!showNav && (
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {rightContent}
          </div>
        )}

        {showNav && (
          <div className="md:hidden">
            <ThemeToggle />
          </div>
        )}
      </div>
    </header>
  );
}
