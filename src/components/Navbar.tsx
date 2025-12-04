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
    { to: "/", label: "Início", isLink: true, id: "home" },
    { to: "/#sobre", label: "Sobre", isLink: false },
    { to: "/#plataforma", label: "Plataforma", isLink: false },
    { to: "/projetos", label: "Projetos", isLink: true, id: "projetos" },
    { to: "/#contato", label: "Contato", isLink: false },
  ];

  const handleNavClick = () => {
    setIsOpen(false);
  };

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
                <Button variant="ghost" size="icon" className="w-10 h-10">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-card border-border">
                <nav className="flex flex-col gap-6 mt-8">
                  {navLinks.map((link) => (
                    link.isLink ? (
                      <Link 
                        key={link.to}
                        to={link.to}
                        onClick={handleNavClick}
                        className={`text-lg font-medium transition-colors ${
                          currentPage === link.id ? "text-primary" : "text-foreground hover:text-primary"
                        }`}
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a 
                        key={link.to}
                        href={link.to}
                        onClick={handleNavClick}
                        className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </a>
                    )
                  ))}
                  
                  <div className="pt-4 border-t border-border">
                    <Link to="/submit" onClick={handleNavClick}>
                      <Button className="w-full">
                        Cadastrar Projeto
                      </Button>
                    </Link>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        )}
      </div>
    </header>
  );
}
