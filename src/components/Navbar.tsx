import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import portobelloLogo from "@/assets/portobello-logo.png";

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
        <Link to="/" className="flex items-center group">
          <img 
            src={portobelloLogo} 
            alt="Porto Bello" 
            className="h-44 md:h-52 w-auto group-hover:scale-105 transition-transform duration-300"
          />
        </Link>
        
        {/* Desktop Navigation */}
        {showNav && (
          <nav className="hidden md:flex items-center gap-4">
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
                    className="group flex items-center"
                  >
                    <img 
                      src={portobelloLogo} 
                      alt="Porto Bello" 
                      className="h-24 w-auto group-hover:scale-105 transition-transform duration-300"
                    />
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