import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Anchor, Menu, X } from "lucide-react";

interface NavbarProps {
  showNav?: boolean;
  currentPage?: string;
  rightContent?: React.ReactNode;
}

export function Navbar({ showNav = true, currentPage, rightContent }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { to: "/porto-de-ideias", label: "Porto de Idéias", isLink: true, id: "porto-de-ideias" },
  ];

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-soft">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 flex-shrink-0">
            <Anchor className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-3xl md:text-4xl font-handwritten font-bold text-primary group-hover:text-accent transition-colors duration-300 translate-y-[2px]">
            Porto Bello
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        {showNav && (
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.isLink ? (
                <Link 
                  key={link.to}
                  to={link.to} 
                  className={`text-base font-medium transition-colors elegant-link ${
                    currentPage === link.id ? "text-primary" : "text-foreground hover:text-primary"
                  }`}
                >
                  {link.label}
                </Link>
              ) : (
                <a 
                  key={link.to}
                  href={link.to} 
                  className="text-base font-medium text-foreground hover:text-primary transition-colors elegant-link"
                >
                  {link.label}
                </a>
              )
            ))}
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
                <nav className="flex flex-col gap-2 mt-8">
                  {navLinks.map((link, index) => (
                    link.isLink ? (
                      <Link 
                        key={link.to}
                        to={link.to}
                        onClick={handleNavClick}
                        className={`text-lg font-medium py-3 px-4 rounded-lg transition-all duration-300 hover:bg-primary/10 hover:translate-x-2 ${
                          currentPage === link.id 
                            ? "text-primary bg-primary/5" 
                            : "text-foreground hover:text-primary"
                        }`}
                        style={{ 
                          animationDelay: `${index * 50}ms`,
                          animation: isOpen ? `slideInRight 0.3s ease-out ${index * 50}ms forwards` : 'none'
                        }}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a 
                        key={link.to}
                        href={link.to}
                        onClick={handleNavClick}
                        className="text-lg font-medium py-3 px-4 rounded-lg text-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 hover:translate-x-2"
                        style={{ 
                          animationDelay: `${index * 50}ms`,
                          animation: isOpen ? `slideInRight 0.3s ease-out ${index * 50}ms forwards` : 'none'
                        }}
                      >
                        {link.label}
                      </a>
                    )
                  ))}
                  
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </header>
  );
}
