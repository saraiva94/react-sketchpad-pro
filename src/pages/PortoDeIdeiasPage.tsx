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
import { supabase } from "@/integrations/supabase/client";
import { useInView } from "@/hooks/useInView";
import { 
  Search,
  MapPin,
  ArrowRight,
  X,
  Shield,
  SlidersHorizontal,
  Anchor,
  Compass
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  synopsis: string;
  project_type: string;
  image_url: string | null;
  location: string | null;
  categorias_tags: string[] | null;
  responsavel_nome: string | null;
  valor_sugerido: number | null;
  budget: string | null;
  has_incentive_law: boolean;
  incentive_law_details: string | null;
  stage: string | null;
}

const projectTypes = [
  "Todos",
  "Filme de Ficção",
  "Documentário",
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
const locations = ["Todas", "São Paulo", "Rio de Janeiro", "Belo Horizonte", "Brasília", "Salvador", "Recife", "Porto Alegre", "Manaus", "Curitiba"];
const budgetRanges = [
  { value: "all", label: "Todos os Portes" },
  { value: "small", label: "Pequeno Porte" },
  { value: "medium", label: "Médio Porte" },
  { value: "large", label: "Grande Porte" }
];
const projectStages = [
  { value: "all", label: "Todos os Estágios" },
  { value: "ideia", label: "Ideia inicial" },
  { value: "development", label: "Desenvolvimento" },
  { value: "captacao", label: "Captação de recursos" },
  { value: "pre_producao", label: "Pré-produção" },
  { value: "producao", label: "Produção" },
  { value: "pos_producao", label: "Pós-produção" },
  { value: "finalizado", label: "Finalizado" },
  { value: "em_exibicao", label: "Em exibição" },
  { value: "distribution", label: "Distribuição" }
];
const incentiveLaws = [
  { value: "all", label: "Todas as Leis" },
  { value: "rouanet", label: "Lei Rouanet" },
  { value: "audiovisual", label: "Lei do Audiovisual" },
  { value: "proac", label: "PROAC" },
  { value: "none", label: "Sem Lei de Incentivo" }
];
const sortOptions = [
  { value: "recent", label: "Mais Recentes" },
  { value: "name", label: "Nome A-Z" },
  { value: "budget-asc", label: "Menor Orçamento" },
  { value: "budget-desc", label: "Maior Orçamento" }
];

// Example project data for placeholder cards
const exampleProjects = [
  {
    id: "exemplo-cultura-legado",
    title: "Sua Cultura, Seu Legado",
    synopsis: "Cada projeto cultural conta uma história única. Seja parte dessa rede de criadores que estão transformando o cenário cultural brasileiro.",
    emoji: "🎭",
    badge: "Inspire",
    badgeVariant: "secondary" as const,
    link: "/exemplo/cultura-legado",
    gradientClass: "from-accent to-primary",
    emojiBgClass: "bg-accent",
    footerContent: <span className="text-sm text-muted-foreground">Projeto exemplo</span>,
  },
  {
    id: "exemplo-investidores-aguardam",
    title: "Investidores Aguardam",
    synopsis: "Uma rede de investidores e patrocinadores interessados em apoiar projetos culturais está esperando por você. Faça a conexão acontecer!",
    emoji: "🤝",
    badge: "Conecte-se",
    badgeVariant: "outline" as const,
    link: "/exemplo/investidores-aguardam",
    gradientClass: "from-primary to-accent",
    emojiBgClass: "bg-primary",
    footerContent: <span className="text-sm text-muted-foreground">Projeto exemplo</span>,
  },
  {
    id: "exemplo-historias-sucesso",
    title: "Histórias de Sucesso",
    synopsis: "Projetos que começaram aqui já impactaram milhares de pessoas. O próximo sucesso pode ser o seu!",
    emoji: "🏆",
    badge: "Sucesso",
    badgeVariant: "default" as const,
    badgeClass: "bg-amber-500 text-white hover:bg-amber-600",
    link: "/exemplo/historias-sucesso",
    borderClass: "border-amber-500",
    gradientClass: "from-amber-400 to-orange-500",
    emojiBgClass: "bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg",
    footerContent: <span className="text-sm text-muted-foreground">Projeto exemplo</span>,
  },
  {
    id: "exemplo-recursos-disponiveis",
    title: "Recursos Disponíveis",
    synopsis: "Conectamos projetos a recursos via Lei Rouanet, PROAC, e investimento direto. Encontre o modelo ideal para você.",
    emoji: "💰",
    badge: "Financiamento",
    badgeVariant: "default" as const,
    badgeClass: "bg-emerald-500 text-white hover:bg-emerald-600",
    link: "/exemplo/recursos-disponiveis",
    borderClass: "border-emerald-500",
    gradientClass: "from-emerald-400 to-teal-500",
    emojiBgClass: "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg",
    footerContent: <span className="text-sm text-muted-foreground">Projeto exemplo</span>,
  },
];

const PortoDeIdeiasPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [displaySlots, setDisplaySlots] = useState(6); // Default 6 project slots (2 rows of 3)
  const [cardVisibility, setCardVisibility] = useState<{ [key: string]: boolean }>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedLocation, setSelectedLocation] = useState("Todas");
  const [selectedBudgetRange, setSelectedBudgetRange] = useState("all");
  const [selectedStage, setSelectedStage] = useState("all");
  const [selectedIncentiveLaw, setSelectedIncentiveLaw] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // Intersection observers for animations
  const { ref: headerRef, isInView: headerInView } = useInView<HTMLElement>();
  const { ref: projectsRef, isInView: projectsInView } = useInView<HTMLElement>();

  useEffect(() => {
    fetchProjects();
    fetchDisplaySlots();
    fetchCardVisibility();
  }, []);

  const fetchProjects = async () => {
    // Use projects_public view to avoid exposing sensitive contact information
    const { data } = await supabase
      .from("projects_public")
      .select("id, title, synopsis, project_type, image_url, location, categorias_tags, responsavel_primeiro_nome, valor_sugerido, budget, has_incentive_law, incentive_law_details, stage")
      .order("created_at", { ascending: false });
    
    // Map responsavel_primeiro_nome to responsavel_nome for compatibility
    const mappedData = (data || []).map(p => ({
      ...p,
      responsavel_nome: p.responsavel_primeiro_nome
    }));
    
    setProjects(mappedData as Project[]);
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

  const fetchCardVisibility = async () => {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "porto_ideias_card_visibility")
      .maybeSingle();
    
    if (data) {
      setCardVisibility(data.value as { [key: string]: boolean });
    }
  };

  const formatBudget = (value: number | null): string => {
    if (!value) return "A definir";
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}k`;
    }
    return `R$ ${value.toLocaleString('pt-BR')}`;
  };

  const getBudgetRange = (value: number | null): { label: string; color: string } => {
    if (!value) return { label: "A definir", color: "bg-muted text-muted-foreground" };
    if (value < 100000) return { label: "Pequeno", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" };
    if (value < 500000) return { label: "Médio", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" };
    return { label: "Grande", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" };
  };

  const getStageInfo = (stage: string | null): { label: string; color: string } => {
    switch (stage) {
      case 'development':
        return { label: "Desenvolvimento", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" };
      case 'production':
        return { label: "Produção", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" };
      case 'distribution':
        return { label: "Difusão", color: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400" };
      default:
        return { label: "Desenvolvimento", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" };
    }
  };

  const getInitials = (name: string | null): string => {
    if (!name) return "PC";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.synopsis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.categorias_tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "Todos" || project.project_type === selectedCategory;
    const matchesLocation = selectedLocation === "Todas" || project.location === selectedLocation;
    
    let matchesBudgetRange = true;
    if (selectedBudgetRange !== "all" && project.valor_sugerido) {
      if (selectedBudgetRange === "small") matchesBudgetRange = project.valor_sugerido < 100000;
      else if (selectedBudgetRange === "medium") matchesBudgetRange = project.valor_sugerido >= 100000 && project.valor_sugerido < 500000;
      else if (selectedBudgetRange === "large") matchesBudgetRange = project.valor_sugerido >= 500000;
    }

    let matchesStage = true;
    if (selectedStage !== "all") {
      matchesStage = project.stage === selectedStage;
    }

    let matchesIncentiveLaw = true;
    if (selectedIncentiveLaw !== "all") {
      if (selectedIncentiveLaw === "none") {
        matchesIncentiveLaw = !project.has_incentive_law;
      } else {
        // Check if project has incentive law and matches the selected type
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

    return matchesSearch && matchesCategory && matchesLocation && matchesBudgetRange && matchesStage && matchesIncentiveLaw;
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
    setSelectedCategory("Todos");
    setSelectedLocation("Todas");
    setSelectedBudgetRange("all");
    setSelectedStage("all");
    setSelectedIncentiveLaw("all");
    setSortBy("recent");
  };

  const hasActiveFilters = searchTerm || selectedCategory !== "Todos" || selectedLocation !== "Todas" || 
    selectedBudgetRange !== "all" || selectedStage !== "all" || selectedIncentiveLaw !== "all";

  const activeFiltersCount = [
    searchTerm,
    selectedCategory !== "Todos",
    selectedLocation !== "Todas",
    selectedBudgetRange !== "all",
    selectedStage !== "all",
    selectedIncentiveLaw !== "all"
  ].filter(Boolean).length;

  const FilterControls = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={isMobile ? "space-y-4" : "flex flex-wrap gap-3 items-center"}>
      {/* Search */}
      <div className={`relative ${isMobile ? 'w-full' : 'flex-1 min-w-[200px] max-w-xs'}`}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar projetos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 rounded-full"
        />
      </div>

      {/* Project Type */}
      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
        <SelectTrigger className={`rounded-full ${isMobile ? 'w-full' : 'w-[180px]'}`}>
          <SelectValue placeholder="Tipo de Projeto" />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={4}>
          {projectTypes.map(type => (
            <SelectItem key={type} value={type}>{type}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Budget Range */}
      <Select value={selectedBudgetRange} onValueChange={setSelectedBudgetRange}>
        <SelectTrigger className={`rounded-full ${isMobile ? 'w-full' : 'w-[150px]'}`}>
          <SelectValue placeholder="Porte" />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={4}>
          {budgetRanges.map(range => (
            <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Stage */}
      <Select value={selectedStage} onValueChange={setSelectedStage}>
        <SelectTrigger className={`rounded-full ${isMobile ? 'w-full' : 'w-[160px]'}`}>
          <SelectValue placeholder="Estágio" />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={4}>
          {projectStages.map(stage => (
            <SelectItem key={stage.value} value={stage.value}>{stage.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Incentive Law */}
      <Select value={selectedIncentiveLaw} onValueChange={setSelectedIncentiveLaw}>
        <SelectTrigger className={`rounded-full ${isMobile ? 'w-full' : 'w-[140px]'}`}>
          <SelectValue placeholder="Lei" />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={4}>
          {incentiveLaws.map(law => (
            <SelectItem key={law.value} value={law.value}>{law.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Location */}
      <Select value={selectedLocation} onValueChange={setSelectedLocation}>
        <SelectTrigger className={`rounded-full ${isMobile ? 'w-full' : 'w-[130px]'}`}>
          <SelectValue placeholder="Local" />
        </SelectTrigger>
        <SelectContent position="popper" sideOffset={4}>
          {locations.map(loc => (
            <SelectItem key={loc} value={loc}>{loc}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className={`rounded-full ${isMobile ? 'w-full' : 'w-[150px]'}`}>
          <SelectValue placeholder="Ordenar" />
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
          Limpar Filtros
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background relative">
      {/* Lazy Artistic Background Animation - deferred loading */}
      <LazyArtisticBackground />
      
      {/* Navbar */}
      <Navbar currentPage="porto-de-ideias" />

      {/* Spacer for fixed navbar */}
      <div className="h-20" />

      {/* Header */}
      <section ref={headerRef} className="relative py-16 md:py-24 overflow-hidden z-10">
        {/* Solid background */}
        <div className="absolute inset-0 bg-background" />
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary rounded-full blur-3xl opacity-10 animate-pulse" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent rounded-full blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Icon */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 w-20 h-20 rounded-full bg-primary blur-xl opacity-20 animate-pulse" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center border border-primary shadow-2xl mx-auto">
                <Compass className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4 md:mb-6">
              Conheça os Projetos da Porto de Ideias
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Selecionamos projetos com potencial de impacto. Conheça as ideias que já fazem parte da nossa rede.
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
                placeholder="Buscar projetos..."
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
                  <SheetTitle className="text-left">Filtros</SheetTitle>
                </SheetHeader>
                <div className="overflow-y-auto h-[calc(100%-80px)]">
                  <FilterControls isMobile />
                </div>
                <div className="pt-4 border-t mt-4">
                  <Button className="w-full rounded-full" onClick={() => setFiltersOpen(false)}>
                    Ver {sortedProjects.length} Projeto{sortedProjects.length !== 1 ? 's' : ''}
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
              exampleProjects={exampleProjects.filter(e => cardVisibility[e.id] !== false)}
              displaySlots={displaySlots}
              isInView={projectsInView}
              formatBudget={formatBudget}
              getBudgetRange={getBudgetRange}
              getStageInfo={getStageInfo}
              getInitials={getInitials}
            />
          )}
        </div>
      </section>


      <Footer />
    </div>
  );
};

export default PortoDeIdeiasPage;
