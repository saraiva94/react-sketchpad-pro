import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import portobelloLogo from "@/assets/portobello-logo.png";

interface NavbarProps {
  showNav?: boolean;
  currentPage?: string;
  rightContent?: React.ReactNode;
}

const sections = [
  { id: "inicio", label: "Início" },
  { id: "sobre", label: "Quem Somos" },
  { id: "servicos", label: "Serviços" },
  { id: "porto-de-ideias", label: "Porto de Ideias" },
];

export function Navbar({ showNav = true, currentPage, rightContent }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = () => {
    setIsOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsOpen(false);
  };

  return (
    <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-soft">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo - Homepage */}
        <Link to="/" className="flex items-center group -ml-12">
          <img 
            src={portobelloLogo} 
            alt="Porto Bello" 
            className="h-44 md:h-52 w-auto group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Desktop Navigation - Section Links */}
        {showNav && currentPage === "home" && (
          <nav className="hidden md:flex items-center gap-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-accent/10"
              >
                {section.label}
              </button>
            ))}
          </nav>
        )}
        
        {/* Right Content (for pages without nav) */}
        {!showNav && rightContent && (
          <div className="flex items-center gap-4">
            {rightContent}
          </div>
        )}

        {/* Mobile Menu */}
        {showNav && (
          <div className="md:hidden flex items-center gap-2">
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
                  {/* Homepage Logo */}
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
                  
                  {/* Section Links for Mobile */}
                  {currentPage === "home" && (
                    <div className="flex flex-col gap-2 mt-4 border-t border-border pt-4">
                      {sections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => scrollToSection(section.id)}
                          className="text-left px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-lg transition-colors"
                        >
                          {section.label}
                        </button>
                      ))}
                    </div>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </header>
  );
}