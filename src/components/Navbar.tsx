import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, Home, Lightbulb } from "lucide-react";

interface NavbarProps {
  showNav?: boolean;
  currentPage?: string;
  rightContent?: React.ReactNode;
}

export function Navbar({ showNav = true, currentPage, rightContent }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-soft">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo - Homepage */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-glow group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 flex-shrink-0 ${
            currentPage === "home" 
              ? "bg-gradient-to-br from-primary to-accent" 
              : "bg-gradient-to-br from-primary/80 to-accent/80 group-hover:from-primary group-hover:to-accent"
          }`}>
            <Home className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className={`text-xl md:text-2xl font-semibold transition-colors duration-300 ${
            currentPage === "home" 
              ? "text-primary" 
              : "text-foreground group-hover:text-primary"
          }`}>
            Homepage
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        {showNav && (
          <nav className="hidden md:flex items-center gap-4">
            <Link to="/porto-de-ideias" className="group flex items-center gap-2">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 ${
                currentPage === "porto-de-ideias" 
                  ? "bg-gradient-to-br from-accent to-primary shadow-glow" 
                  : "bg-gradient-to-br from-accent/80 to-primary/80 group-hover:from-accent group-hover:to-primary group-hover:shadow-glow"
              }`}>
                <Lightbulb className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className={`text-xl font-handwritten font-bold transition-colors duration-300 ${
                currentPage === "porto-de-ideias" 
                  ? "text-accent" 
                  : "text-foreground group-hover:text-accent"
              }`}>
                Porto de Idéias
              </span>
            </Link>
            <ThemeToggle />
          </nav>
        )}

        {/* Right Content (for pages without nav) */}
        {!showNav && (
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {rightContent}
          </div>
        )}

        {/* Mobile Menu */}
        {showNav && (
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="w-10 h-10 relative overflow-hidden"
                >
                  <span className="sr-only">Abrir menu</span>
                  <Menu 
                    className={`h-6 w-6 absolute transition-all duration-300 ease-in-out ${
                      isOpen ? "rotate-90 opacity-0 scale-0" : "rotate-0 opacity-100 scale-100"
                    }`} 
                  />
                  <X 
                    className={`h-6 w-6 absolute transition-all duration-300 ease-in-out ${
                      isOpen ? "rotate-0 opacity-100 scale-100" : "-rotate-90 opacity-0 scale-0"
                    }`} 
                  />
                </Button>
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-[280px] bg-card border-border"
              >
                <nav className="flex flex-col gap-4 mt-8">
                  {/* Homepage */}
                  <Link 
                    to="/"
                    onClick={handleNavClick}
                    className="group flex items-center gap-3"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                      currentPage === "home" 
                        ? "bg-gradient-to-br from-primary to-accent shadow-glow" 
                        : "bg-gradient-to-br from-primary/80 to-accent/80 group-hover:from-primary group-hover:to-accent"
                    }`}>
                      <Home className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className={`text-lg font-semibold transition-colors duration-300 ${
                      currentPage === "home" 
                        ? "text-primary" 
                        : "text-foreground group-hover:text-primary"
                    }`}>
                      Homepage
                    </span>
                  </Link>
                  
                  {/* Porto de Idéias */}
                  <Link 
                    to="/porto-de-ideias"
                    onClick={handleNavClick}
                    className="group flex items-center gap-3"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 ${
                      currentPage === "porto-de-ideias" 
                        ? "bg-gradient-to-br from-accent to-primary shadow-glow" 
                        : "bg-gradient-to-br from-accent/80 to-primary/80 group-hover:from-accent group-hover:to-primary"
                    }`}>
                      <Lightbulb className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className={`text-2xl font-handwritten font-bold transition-colors duration-300 ${
                      currentPage === "porto-de-ideias" 
                        ? "text-accent" 
                        : "text-foreground group-hover:text-accent"
                    }`}>
                      Porto de Idéias
                    </span>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </header>
  );
}