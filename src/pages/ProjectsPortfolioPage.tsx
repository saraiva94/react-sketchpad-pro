import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { LazyArtisticBackground } from "@/components/LazyArtisticBackground";
import { ProjectGrid } from "@/components/porto-ideias/ProjectGrid";
import { TranslatedSelect } from "@/components/TranslatedSelect";
import { supabase } from "@/integrations/supabase/client";
import { fetchProjectLocations } from "@/components/admin/DynamicLocationSelect";
import { useInView } from "@/hooks/useInView";
import { useLanguage } from "@/hooks/useLanguage";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import { usePreloadTranslations, createTranslationItems } from "@/hooks/usePreloadTranslations";
import { useAuth } from "@/hooks/useAuth";
import { 
  Search,
  X,
  SlidersHorizontal,
  Rocket
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  synopsis: string;
  project_type: string;
  image_url: string | null;
  hero_image_url?: string | null;
  card_image_url?: string | null;
  updated_at?: string | null;
  location: string | null;
  categorias_tags: string[] | null;
  responsavel_nome: string | null;
  valor_sugerido: number | null;
  budget: string | null;
  has_incentive_law: boolean;
  incentive_law_details: string | null;
  stage: string | null;
  stages: string[] | null;
}

// Default values - will be overwritten by database values
const DEFAULT_PROJECT_TYPES = [
  "Tipo de Projeto",
  "Longa-metragem ficção",
  "Longa-metragem documentário", 
  "Curta-metragem ficção",
  "Curta-metragem documentário",
  "Série ficção",
  "Série documental",
  "Videocast",
  "Podcast",
  "Evento Cultural",
  "Musical",
  "Teatro",
  "Performance",
  "Instalação",
  "Videoclipe",
  "Projeto educativo",
  "Projeto formativo",
  "Projeto transmídia",
  "Outro",
];

const DEFAULT_LOCATIONS = [
  "Cidade",
  "São Paulo",
  "Rio de Janeiro",
  "Belo Horizonte",
  "Brasília",
  "Salvador",
  "Recife",
  "Porto Alegre",
  "Manaus",
  "Curitiba",
];

const ProjectsPortfolioPage = () => {
  const { t, language } = useLanguage();
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [displaySlots, setDisplaySlots] = useState(6);
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Header content - hardcoded for this page (can be made dynamic later)
  const headerTitlePt = t.projects.portfolioTitle || "Projetos em Andamento";
  const headerDescriptionPt = t.projects.portfolioSubtitle || "Acompanhe nosso portfólio de projetos culturais";
  
  // Auto-translate header content
  const { translated: translatedTitle } = useAutoTranslate('portfolio_header_title', headerTitlePt);
  const { translated: translatedDescription } = useAutoTranslate('portfolio_header_desc', headerDescriptionPt);
  
  // Display content based on language
  const headerTitle = language === 'pt' ? headerTitlePt : (translatedTitle || headerTitlePt);
  const headerDescription = language === 'pt' ? headerDescriptionPt : (translatedDescription || headerDescriptionPt);

  // Preload de traduções usando namespace padronizado project_full para consistência de cache
  const preloadItems = createTranslationItems.forProjectList(projects, "project_full");
  usePreloadTranslations(preloadItems, !loading);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tipo de Projeto");
  const [selectedLocation, setSelectedLocation] = useState("Cidade");
  const [selectedStage, setSelectedStage] = useState("all");
  const [selectedIncentiveLaw, setSelectedIncentiveLaw] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  
  // Dynamic filter options from database
  const [projectTypes, setProjectTypes] = useState<string[]>(DEFAULT_PROJECT_TYPES);
  const [locations, setLocations] = useState<string[]>(DEFAULT_LOCATIONS);

  // Intersection observers for animations
  const { ref: headerRef, isInView: headerInView } = useInView<HTMLElement>();
  const { ref: projectsRef, isInView: projectsInView } = useInView<HTMLElement>();

  useEffect(() => {
    fetchProjects();
    fetchDisplaySlots();
    fetchDynamicFilters();
  }, []);

  const fetchDynamicFilters = async () => {
    // Fetch project types
    const { data: typesData } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "project_types")
      .maybeSingle();

    if (typesData && typesData.value) {
      const types = (typesData.value as { types: string[] }).types;
      if (types && types.length > 0) {
        setProjectTypes(["Tipo de Projeto", ...types, "Outro"]);
      }
    }

    // Fetch locations
    const locs = await fetchProjectLocations();
    if (locs && locs.length > 0) {
      setLocations(["Cidade", ...locs, "Outra cidade"]);
    }
  };

  const fetchProjects = async () => {
    // Fetch only projects marked for portfolio page
    const { data } = await supabase
      .from("projects")
      .select("id, title, synopsis, project_type, image_url, hero_image_url, card_image_url, updated_at, location, categorias_tags, responsavel_nome, valor_sugerido, budget, has_incentive_law, incentive_law_details, stage, stages, show_on_portfolio")
      .eq("status", "approved")
      .eq("show_on_portfolio", true)
      .order("created_at", { ascending: false });
    
    setProjects((data || []) as Project[]);
    setLoading(false);
  };

  const fetchDisplaySlots = async () => {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "porto_ideias_slots")
      .maybeSingle();
    
    if (data) {
      setDisplaySlots((data.value as { count: number }).count || 6);
    }
  };

  const formatBudget = (value: number | null): string => {
    if (!value) return "";
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}k`;
    }
    return `R$ ${value.toLocaleString('pt-BR')}`;
  };

  const getBudgetRange = (value: number | null): { label: string; color: string } => {
    if (!value) return { label: "", color: "" };
    if (value < 100000) return { label: t.projects.budgetSmall, color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" };
    if (value < 500000) return { label: t.projects.budgetMedium, color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" };
    return { label: t.projects.budgetLarge, color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" };
  };


  const getInitials = (name: string | null): string => {
    if (!name) return "PC";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Normalize location name for better filtering
  const normalizeLocation = (loc: string | null): string => {
    if (!loc) return "";
    const normalized = loc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    if (normalized.includes("rio") && (normalized.includes("janeiro") || normalized === "rj")) return "Rio de Janeiro";
    if (normalized.includes("sao paulo") || normalized === "sp") return "São Paulo";
    if (normalized.includes("belo horizonte") || normalized === "bh") return "Belo Horizonte";
    if (normalized.includes("brasilia") || normalized === "df") return "Brasília";
    if (normalized.includes("salvador") || normalized === "ba") return "Salvador";
    if (normalized.includes("recife") || normalized === "pe") return "Recife";
    if (normalized.includes("porto alegre") || normalized === "rs" || normalized === "poa") return "Porto Alegre";
    if (normalized.includes("manaus") || normalized === "am") return "Manaus";
    if (normalized.includes("curitiba") || normalized === "pr") return "Curitiba";
    return loc;
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.synopsis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.categorias_tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "Tipo de Projeto" || project.project_type === selectedCategory;
    const normalizedProjectLocation = normalizeLocation(project.location);
    const matchesLocation = selectedLocation === "Cidade" || normalizedProjectLocation === selectedLocation;

    let matchesStage = true;
    if (selectedStage !== "all") {
      const projectStages = project.stages || [];
      matchesStage = projectStages.includes(selectedStage) || project.stage === selectedStage;
    }

    let matchesIncentiveLaw = true;
    if (selectedIncentiveLaw !== "all") {
      if (selectedIncentiveLaw === "none") {
        matchesIncentiveLaw = !project.has_incentive_law;
      } else {
        const lawDetails = project.incentive_law_details?.toLowerCase() || "";
        if (selectedIncentiveLaw === "rouanet") {
          matchesIncentiveLaw = project.has_incentive_law && lawDetails.includes("rouanet");
        } else if (selectedIncentiveLaw === "audiovisual") {
          matchesIncentiveLaw = project.has_incentive_law && lawDetails.includes("audiovisual");
        } else if (selectedIncentiveLaw === "proac") {
          matchesIncentiveLaw = project.has_incentive_law && lawDetails.includes("proac");
        } else {
          matchesIncentiveLaw = project.has_incentive_law;
        }
      }
    }

    return matchesSearch && matchesCategory && matchesLocation && matchesStage && matchesIncentiveLaw;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.title.localeCompare(b.title);
      case "budget-asc":
        return (a.valor_sugerido || 0) - (b.valor_sugerido || 0);
      case "budget-desc":
        return (b.valor_sugerido || 0) - (a.valor_sugerido || 0);
      default:
        return 0;
    }
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("Tipo de Projeto");
    setSelectedLocation("Cidade");
    setSelectedStage("all");
    setSelectedIncentiveLaw("all");
    setSortBy("recent");
  };

  const hasActiveFilters = searchTerm || selectedCategory !== "Tipo de Projeto" || selectedLocation !== "Cidade" || 
    selectedStage !== "all" || selectedIncentiveLaw !== "all";

  const activeFiltersCount = [
    searchTerm,
    selectedCategory !== "Tipo de Projeto",
    selectedLocation !== "Cidade",
    selectedStage !== "all",
    selectedIncentiveLaw !== "all"
  ].filter(Boolean).length;

  const FilterControls = ({ isMobile = false }: { isMobile?: boolean }) => {
    const projectStages = [
      { value: "all", label: t.projects.stageAll },
      { value: "ideia", label: t.projects.stageIdea },
      { value: "development", label: t.projects.stageDevelopment },
      { value: "captacao", label: t.projects.stageFundraising },
      { value: "pre_producao", label: t.projects.stagePreProduction },
      { value: "producao", label: t.projects.stageProduction },
      { value: "pos_producao", label: t.projects.stagePostProduction },
      { value: "finalizado", label: t.projects.stageFinished },
      { value: "em_exibicao", label: t.projects.stageExhibition },
      { value: "distribution", label: t.projects.stageDistribution }
    ];

    const incentiveLaws = [
      { value: "all", label: t.projects.lawAll },
      { value: "rouanet", label: t.projects.lawRouanet },
      { value: "audiovisual", label: t.projects.lawAudiovisual },
      { value: "proac", label: t.projects.lawProac },
      { value: "none", label: t.projects.lawNone }
    ];

    const sortOptions = [
      { value: "recent", label: t.projects.sortRecent },
      { value: "name", label: t.projects.sortByName },
      { value: "budget-asc", label: t.projects.sortByBudgetAsc },
      { value: "budget-desc", label: t.projects.sortByBudgetDesc }
    ];

    return (
      <div className={isMobile ? "space-y-4" : "flex flex-wrap gap-3 items-center justify-center"}>
        {/* Search */}
        <div className={`relative ${isMobile ? 'w-full' : 'flex-1 min-w-[200px] max-w-xs'}`}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t.projects.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 rounded-full"
          />
        </div>

        {/* Project Type */}
        <TranslatedSelect
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          placeholder={t.projects.projectType}
          options={projectTypes.map(type => ({ value: type, label: type }))}
          namespacePrefix="filter_type"
          isMobile={isMobile}
          translateLabels={true}
        />

        {/* Stage */}
        <Select value={selectedStage} onValueChange={setSelectedStage}>
          <SelectTrigger className={`rounded-full ${isMobile ? 'w-full' : 'w-fit'}`}>
            <SelectValue placeholder={t.projects.stage} />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4}>
            {projectStages.map(stage => (
              <SelectItem key={stage.value} value={stage.value}>{stage.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Incentive Law */}
        <Select value={selectedIncentiveLaw} onValueChange={setSelectedIncentiveLaw}>
          <SelectTrigger className={`rounded-full ${isMobile ? 'w-full' : 'w-fit'}`}>
            <SelectValue placeholder={t.projects.incentiveLaw} />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4}>
            {incentiveLaws.map(law => (
              <SelectItem key={law.value} value={law.value}>{law.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Location */}
        <TranslatedSelect
          value={selectedLocation}
          onValueChange={setSelectedLocation}
          placeholder={t.projects.city}
          options={locations.map(loc => ({ value: loc, label: loc }))}
          namespacePrefix="filter_loc"
          isMobile={isMobile}
          translateLabels={true}
        />

        {/* Sort */}
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className={`rounded-full ${isMobile ? 'w-full' : 'w-fit'}`}>
            <SelectValue placeholder={t.projects.sortBy} />
          </SelectTrigger>
          <SelectContent position="popper" sideOffset={4}>
            {sortOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button 
            variant="outline" 
            size={isMobile ? "default" : "sm"} 
            onClick={() => {
              clearFilters();
              if (isMobile) setFiltersOpen(false);
            }} 
            className={`rounded-full ${isMobile ? 'w-full' : ''}`}
          >
            <X className="w-4 h-4 mr-1" />
            {t.projects.clearFilters}
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Lazy Artistic Background Animation - deferred loading */}
      <LazyArtisticBackground />
      
      {/* Navbar */}
      <Navbar currentPage="projetos" />

      {/* Spacer for fixed navbar */}
      <div className="h-20" />

      {/* Header */}
      <section ref={headerRef} className="relative py-10 md:py-16 overflow-hidden z-10">
        {/* Solid background */}
        <div className="absolute inset-0 bg-background" />
        <div className="absolute top-6 left-10 w-64 h-64 bg-primary rounded-full blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-6 right-10 w-80 h-80 bg-accent rounded-full blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Icon */}
            <div className="relative inline-block mb-4">
              <div className="absolute inset-0 w-16 h-16 rounded-full bg-primary blur-xl opacity-20 animate-pulse" />
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center border border-primary shadow-2xl mx-auto">
                <Rocket className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
            
            <h1 className="text-2xl md:text-4xl font-serif font-bold text-foreground mb-2 md:mb-4">
              {headerTitle}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {headerDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Filters - Desktop */}
      <section className="hidden lg:block py-6 bg-card border-b border-border sticky top-20 z-40">
        <div className="container mx-auto px-6">
          <FilterControls />
        </div>
      </section>

      {/* Filters - Mobile */}
      <section className="lg:hidden py-4 bg-card border-b border-border sticky top-20 z-40">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-3">
            {/* Search on mobile */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t.projects.search}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 rounded-full"
              />
            </div>
            
            {/* Filter Button */}
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative rounded-full flex-shrink-0">
                  <SlidersHorizontal className="w-4 h-4" />
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl">
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-left">{t.projects.filters}</SheetTitle>
                </SheetHeader>
                <div className="overflow-y-auto h-[calc(100%-80px)]">
                  <FilterControls isMobile />
                </div>
                <div className="pt-4 border-t mt-4">
                  <Button className="w-full rounded-full" onClick={() => setFiltersOpen(false)}>
                    {t.projects.viewProjects.replace('{count}', String(sortedProjects.length))}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </section>

      {/* Projects List */}
      <section ref={projectsRef} className="py-8 md:py-12 relative z-10">
        <div className="container mx-auto px-6">
          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse bg-card card-solid rounded-2xl overflow-hidden border border-border shadow-2xl">
                  <div className="h-48 bg-muted" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-16 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ProjectGrid
              projects={sortedProjects}
              displaySlots={displaySlots}
              isInView={projectsInView}
              formatBudget={formatBudget}
              getBudgetRange={getBudgetRange}
              getInitials={getInitials}
              isAdmin={isAdmin}
              showEmptySlots={true}
            />
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProjectsPortfolioPage;
