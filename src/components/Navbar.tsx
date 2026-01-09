import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Menu, X, Lightbulb, Rocket, FolderOpen, ChevronDown, Settings } from "lucide-react";
import portobelloLogo from "@/assets/portobello-logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { LanguageSelector } from "@/components/LanguageSelector";
interface NavbarProps {
  showNav?: boolean;
  currentPage?: string;
  rightContent?: React.ReactNode;
}

interface SectionLabel {
  id: string;
  translationKey: "whoWeAre" | "portoDeIdeias" | "ourServices";
  settingsKey?: string;
}

const defaultSections: SectionLabel[] = [
  { id: "sobre", translationKey: "whoWeAre", settingsKey: "quem_somos_content" },
  { id: "porto-de-ideias", translationKey: "portoDeIdeias", settingsKey: "ecossistema_text" },
  { id: "servicos", translationKey: "ourServices", settingsKey: "nossos_servicos_content" },
];

export function Navbar({ showNav = true, currentPage, rightContent }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [projectsPopoverOpen, setProjectsPopoverOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const { isAdmin } = useAuth();
  const { t, language } = useLanguage();

  // Optional admin-configured titles (stored in PT in the backend today).
  // We only apply them for PT to avoid overriding translated UI.
  const [adminTitlesPt, setAdminTitlesPt] = useState<Record<string, string>>({});

  const getSectionLabel = (section: SectionLabel) => {
    if (section.translationKey === "portoDeIdeias") return t.nav.portoDeIdeias;
    if (section.translationKey === "whoWeAre") return t.home.whoWeAre;
    return t.home.ourServices;
  };

  useEffect(() => {
    const fetchSectionTitles = async () => {
      const titles: Record<string, string> = {};

      const { data: ecossistemaData } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "ecossistema_text")
        .maybeSingle();

      if (ecossistemaData?.value) {
        const settings = ecossistemaData.value as { title?: string };
        if (settings.title) titles["porto-de-ideias"] = settings.title;
      }

      const { data: servicosData } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "nossos_servicos_content")
        .maybeSingle();

      if (servicosData?.value) {
        const settings = servicosData.value as { title?: string };
        if (settings.title) titles["servicos"] = settings.title;
      }

      setAdminTitlesPt(titles);
    };

    fetchSectionTitles();
  }, []);

  const sections = defaultSections.map((s) => ({
    id: s.id,
    label: language === "pt" && adminTitlesPt[s.id] ? adminTitlesPt[s.id] : getSectionLabel(s),
  }));

  useEffect(() => {
    if (currentPage !== "home") return;

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;
      requestAnimationFrame(() => {
        const scrollPosition = window.scrollY + 150; // Offset for navbar height

        // Check each section
        for (const section of [...sections].reverse()) {
          const element = document.getElementById(section.id);
          if (element) {
            const offsetTop = element.offsetTop;
            if (scrollPosition >= offsetTop) {
              setActiveSection(section.id);
              ticking = false;
              return;
            }
          }
        }
        setActiveSection("");
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentPage, sections]);

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
    <header className="border-b border-border/50 bg-card/80 backdrop-blur-md fixed top-0 left-0 right-0 z-50 shadow-soft">
      <div className="container mx-auto px-2 sm:px-4 h-20 flex items-center justify-between relative">
        {/* Logo - Homepage - clipped to navbar bounds */}
        <Link to="/" className="flex items-center group -ml-6 sm:-ml-12 h-20 overflow-hidden">
          <img 
            src={portobelloLogo} 
            alt="Porto Bello" 
            className="h-32 sm:h-44 md:h-52 w-auto group-hover:scale-105 transition-transform duration-300 object-contain object-left pointer-events-none"
          />
        </Link>

        {/* Admin Button - Always centered for admins on all pages (lg+) */}
        {isAdmin && (
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2">
            <Link
              to="/admin"
              className="p-2 text-foreground bg-accent/15 hover:bg-accent/25 rounded-xl transition-colors"
              title={t.nav.admin}
            >
              <Settings className="w-5 h-5" />
            </Link>
          </div>
        )}

        {/* Desktop Navigation - Section Links */}
        {showNav && currentPage === "home" && (
          <nav className="hidden md:flex items-center gap-1">
            {/* Admin Button - In nav for md screens, centered for lg+ */}
            {isAdmin && (
              <Link
                to="/admin"
                className="lg:hidden p-2 text-foreground bg-accent/15 hover:bg-accent/25 rounded-xl transition-colors mr-2"
                title={t.nav.admin}
              >
                <Settings className="w-5 h-5" />
              </Link>
            )}

            {/* Projetos Dropdown */}
            <Popover open={projectsPopoverOpen} onOpenChange={setProjectsPopoverOpen}>
              <PopoverTrigger asChild>
                <button className="group flex items-center gap-2 px-3 lg:px-4 py-2 text-base lg:text-lg font-semibold transition-all duration-300 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/10">
                  <span className="whitespace-nowrap">{t.nav.projects}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${projectsPopoverOpen ? 'rotate-180' : ''}`} />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3 bg-card border-border shadow-xl" align="center">
                <div className="grid gap-3">
                  {/* Projetos em Captação */}
                  <Link
                    to="/porto-de-ideias"
                    onClick={() => setProjectsPopoverOpen(false)}
                    className="group relative flex items-center gap-4 p-4 rounded-xl border border-border bg-gradient-to-br from-yellow-500/10 to-orange-500/10 hover:from-yellow-500/20 hover:to-orange-500/20 hover:border-yellow-500/50 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_50%,rgba(250,204,21,0.15),transparent_70%)]" />
                    <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-yellow-500/20 group-hover:scale-110 transition-transform duration-300">
                      <Lightbulb className="w-6 h-6 text-yellow-400 group-hover:fill-yellow-400 group-hover:drop-shadow-[0_0_12px_rgba(250,204,21,0.8)] transition-all duration-300" />
                    </div>
                    <div className="relative flex-1">
                      <h3 className="font-semibold text-foreground group-hover:text-yellow-400 transition-colors">Projetos em Captação</h3>
                      <p className="text-sm text-muted-foreground">Apoie projetos culturais</p>
                    </div>
                  </Link>

                  {/* Projetos em Andamento */}
                  <Link
                    to="/projetos"
                    onClick={() => setProjectsPopoverOpen(false)}
                    className="group relative flex items-center gap-4 p-4 rounded-xl border border-border bg-gradient-to-br from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 hover:border-primary/50 transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.15),transparent_70%)]" />
                    <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 group-hover:scale-110 transition-transform duration-300">
                      <Rocket className="w-6 h-6 text-primary group-hover:drop-shadow-[0_0_12px_hsl(var(--primary)/0.8)] transition-all duration-300" />
                    </div>
                    <div className="relative flex-1">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">Projetos em Andamento</h3>
                      <p className="text-sm text-muted-foreground">Acompanhe nosso portfólio</p>
                    </div>
                  </Link>
                </div>
              </PopoverContent>
            </Popover>

            {/* Section Links */}
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`relative px-2 lg:px-4 py-2 text-xs lg:text-sm font-medium transition-all duration-200 rounded-lg whitespace-nowrap ${
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

            {/* Language Selector */}
            <LanguageSelector />
          </nav>
        )}

        {/* Desktop Navigation for other pages */}
        {showNav && currentPage !== "home" && (
          <nav className="hidden md:flex items-center gap-2">
            {/* Admin button for md screens (lg+ uses centered one) */}
            {isAdmin && (
              <Link
                to="/admin"
                className="lg:hidden p-2 text-foreground bg-accent/15 hover:bg-accent/25 rounded-xl transition-colors"
                title={t.nav.admin}
              >
                <Settings className="w-5 h-5" />
              </Link>
            )}

            {/* Projetos Dropdown for other pages */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-colors">
                  {t.nav.projects}
                  <ChevronDown className="w-3 h-3" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-3 bg-card border-border shadow-xl" align="center">
                <div className="grid gap-2">
                  <Link
                    to="/porto-de-ideias"
                    className="group flex items-center gap-3 p-3 rounded-lg hover:bg-yellow-500/10 transition-colors"
                  >
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    <div>
                      <h3 className="text-sm font-medium text-foreground">Projetos em Captação</h3>
                      <p className="text-xs text-muted-foreground">Apoie projetos culturais</p>
                    </div>
                  </Link>
                  <Link
                    to="/projetos"
                    className="group flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    <Rocket className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="text-sm font-medium text-foreground">Projetos em Andamento</h3>
                      <p className="text-xs text-muted-foreground">Acompanhe nosso portfólio</p>
                    </div>
                  </Link>
                </div>
              </PopoverContent>
            </Popover>

            <LanguageSelector />
          </nav>
        )}
        
        {/* Right Content (for pages without nav) */}
        {!showNav && rightContent && (
          <div className="flex items-center gap-4">
            <LanguageSelector />
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
                  <span className="sr-only">{t.common.openMenu}</span>
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
                  <div className="flex flex-col gap-2 mt-4 border-t border-border pt-4">
                    {/* Language Selector Mobile */}
                     <div className="flex items-center justify-between px-3 py-2">
                       <span className="text-sm text-muted-foreground">{t.common.language}</span>
                       <LanguageSelector />
                     </div>

                    {/* Projetos Section - Mobile */}
                    <div className="text-sm font-medium text-muted-foreground px-4 py-2">{t.nav.projects}</div>
                    
                    {/* Projetos em Captação */}
                    <Link
                      to="/porto-de-ideias"
                      onClick={handleNavClick}
                      className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 hover:from-yellow-500/20 hover:to-orange-500/20 transition-all duration-300"
                    >
                      <Lightbulb className="w-6 h-6 text-yellow-400 group-hover:fill-yellow-400 transition-all duration-300" />
                      <div>
                        <span className="block font-semibold text-foreground">Projetos em Captação</span>
                        <span className="text-xs text-muted-foreground">Apoie projetos culturais</span>
                      </div>
                    </Link>

                    {/* Projetos em Andamento */}
                    <Link
                      to="/projetos"
                      onClick={handleNavClick}
                      className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 hover:from-primary/20 hover:to-accent/20 transition-all duration-300"
                    >
                      <Rocket className="w-6 h-6 text-primary transition-all duration-300" />
                      <div>
                        <span className="block font-semibold text-foreground">Projetos em Andamento</span>
                        <span className="text-xs text-muted-foreground">Acompanhe nosso portfólio</span>
                      </div>
                    </Link>

                    {currentPage === "home" && (
                      <>
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
                      </>
                    )}

                    {/* Admin Button - Only visible for admins */}
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={handleNavClick}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-lg transition-colors mt-2 border-t border-border pt-4"
                      >
                        <Settings className="w-4 h-4" />
                      </Link>
                    )}
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