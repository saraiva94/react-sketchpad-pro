import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, Lightbulb } from "lucide-react";
import portobelloLogo from "@/assets/portobello-logo.png";

interface NavbarProps {
  showNav?: boolean;
  currentPage?: string;
  rightContent?: React.ReactNode;
}

const sections = [
  { id: "sobre", label: "Quem Somos" },
  { id: "porto-de-ideias", label: "Ecossistema" },
  { id: "servicos", label: "Serviços" },
];

export function Navbar({ showNav = true, currentPage, rightContent }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    if (currentPage !== "home") return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150; // Offset for navbar height
      
      // Check each section
      for (const section of [...sections].reverse()) {
        const element = document.getElementById(section.id);
        if (element) {
          const offsetTop = element.offsetTop;
          if (scrollPosition >= offsetTop) {
            setActiveSection(section.id);
            return;
          }
        }
      }
      setActiveSection("");
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentPage]);

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
            {/* Porto de Ideias Link with Lightbulb - Destacado */}
            <Link
              to="/porto-de-ideias"
              className="group flex items-center gap-2.5 px-5 py-2.5 text-base font-semibold text-foreground transition-all duration-300 rounded-xl hover:bg-yellow-400/15 hover:shadow-[0_0_25px_rgba(250,204,21,0.4)] border border-yellow-400/20 hover:border-yellow-400/50"
            >
              <Lightbulb className="w-5 h-5 text-yellow-400 group-hover:fill-yellow-400 group-hover:drop-shadow-[0_0_16px_rgba(250,204,21,1)] group-hover:scale-125 transition-all duration-300" />
              <span className="text-yellow-100 group-hover:text-yellow-300 group-hover:tracking-wide transition-all duration-300">Porto de Ideias</span>
            </Link>
            
            {/* Section Links */}
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                  activeSection === section.id
                    ? "text-foreground bg-accent/15"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                }`}
              >
                {section.label}
                {/* Active indicator */}
                {activeSection === section.id && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-full" />
                )}
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
                      {/* Porto de Ideias Link with Lightbulb - Destacado Mobile */}
                      <Link
                        to="/porto-de-ideias"
                        onClick={handleNavClick}
                        className="group flex items-center gap-2.5 px-4 py-3 text-base font-semibold text-yellow-100 hover:text-yellow-300 hover:bg-yellow-400/15 rounded-xl transition-all duration-300 border border-yellow-400/20 hover:border-yellow-400/50"
                      >
                        <Lightbulb className="w-5 h-5 text-yellow-400 group-hover:fill-yellow-400 group-hover:drop-shadow-[0_0_16px_rgba(250,204,21,1)] transition-all duration-300" />
                        Porto de Ideias
                      </Link>
                      
                      {sections.map((section) => (
                        <button
                          key={section.id}
                          onClick={() => scrollToSection(section.id)}
                          className={`text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            activeSection === section.id
                              ? "text-foreground bg-accent/15"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                          }`}
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