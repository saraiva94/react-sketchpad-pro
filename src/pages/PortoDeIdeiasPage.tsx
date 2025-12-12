import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ArtisticBackground } from "@/components/ArtisticBackground";
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

const categories = ["Todos", "Artes Visuais", "Teatro", "Música", "Audiovisual", "Educação Cultural", "Dança", "Literatura", "Patrimônio"];
const locations = ["Todas", "São Paulo", "Rio de Janeiro", "Belo Horizonte", "Brasília", "Salvador", "Recife", "Porto Alegre", "Manaus", "Curitiba"];
const budgetRanges = [
  { value: "all", label: "Todos os Portes" },
  { value: "small", label: "Pequeno Porte" },
  { value: "medium", label: "Médio Porte" },
  { value: "large", label: "Grande Porte" }
];
const projectStages = [
  { value: "all", label: "Todos os Estágios" },
  { value: "development", label: "Desenvolvimento" },
  { value: "production", label: "Produção" },
  { value: "distribution", label: "Difusão" }
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
    footerContent: (
      <div className="flex -space-x-2">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center border-2 border-card">
          <span className="text-xs text-white">🎨</span>
        </div>
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-2 border-card">
          <span className="text-xs text-white">🎵</span>
        </div>
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center border-2 border-card">
          <span className="text-xs text-white">📽️</span>
        </div>
      </div>
    ),
  },
  {
    id: "exemplo-investidores-aguardam",
    title: "Investidores Aguardam",
    synopsis: "Uma rede de investidores e patrocinadores interessados em apoiar projetos culturais está esperando por você. Faça a conexão acontecer!",
    emoji: "🤝",
    badge: "Conecte-se",
    badgeVariant: "outline" as const,
    link: "/exemplo/investidores-aguardam",
    footerContent: (
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-sm text-emerald-600 dark:text-emerald-400">Online agora</span>
      </div>
    ),
  },
  {
    id: "exemplo-historias-sucesso",
    title: "Histórias de Sucesso",
    synopsis: "Projetos que começaram aqui já impactaram milhares de pessoas. O próximo sucesso pode ser o seu!",
    emoji: "🏆",
    badge: "Sucesso",
    badgeVariant: "default" as const,
    badgeClass: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200",
    link: "/exemplo/historias-sucesso",
    borderClass: "border-amber-500/30",
    gradientClass: "from-amber-100 dark:from-amber-900/40 to-orange-100 dark:to-orange-900/40",
    emojiBgClass: "bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg",
    footerContent: <span className="text-amber-500">★★★★★</span>,
  },
  {
    id: "exemplo-recursos-disponiveis",
    title: "Recursos Disponíveis",
    synopsis: "Conectamos projetos a recursos via Lei Rouanet, PROAC, e investimento direto. Encontre o modelo ideal para você.",
    emoji: "💰",
    badge: "Financiamento",
    badgeVariant: "default" as const,
    badgeClass: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200",
    link: "/exemplo/recursos-disponiveis",
    borderClass: "border-emerald-500/30",
    gradientClass: "from-emerald-100 dark:from-emerald-900/40 to-teal-100 dark:to-teal-900/40",
    emojiBgClass: "bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg",
    emojiAnimate: true,
    footerContent: (
      <div className="flex gap-2">
        <Badge variant="outline" className="text-xs">Rouanet</Badge>
        <Badge variant="outline" className="text-xs">PROAC</Badge>
      </div>
    ),
  },
  {
    id: "exemplo-novo-projeto",
    title: "Adicione seu Projeto",
    synopsis: "Sua ideia cultural merece ganhar vida! Submeta seu projeto e conecte-se com investidores interessados em transformar cultura em realidade.",
    emoji: "✨",
    badge: "Novo Projeto",
    badgeVariant: "default" as const,
    badgeClass: "bg-primary/20 text-primary hover:bg-primary/30",
    link: "/submit",
    borderClass: "border-dashed border-primary/30 border-2",
    emojiAnimate: true,
    footerContent: <span className="text-sm text-muted-foreground">Comece agora</span>,
    footerAction: "Submeter",
  },
];

const PortoDeIdeiasPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [displaySlots, setDisplaySlots] = useState(5); // Default 5 project slots
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
  }, []);

  const fetchProjects = async () => {
    const { data } = await supabase
      .from("projects")
      .select("id, title, synopsis, project_type, image_url, location, categorias_tags, responsavel_nome, valor_sugerido, budget, has_incentive_law, incentive_law_details, stage")
      .eq("status", "approved")
      .order("created_at", { ascending: false });
    
    setProjects(data || []);
    setLoading(false);
  };

  const fetchDisplaySlots = async () => {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "porto_ideias_slots")
      .maybeSingle();
    
    if (data) {
      setDisplaySlots((data.value as { count: number }).count || 5);
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

      {/* Category */}
      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
        <SelectTrigger className={`rounded-full ${isMobile ? 'w-full' : 'w-[140px]'}`}>
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          {categories.map(cat => (
            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Budget Range */}
      <Select value={selectedBudgetRange} onValueChange={setSelectedBudgetRange}>
        <SelectTrigger className={`rounded-full ${isMobile ? 'w-full' : 'w-[150px]'}`}>
          <SelectValue placeholder="Porte" />
        </SelectTrigger>
        <SelectContent>
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
        <SelectContent>
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
        <SelectContent>
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
        <SelectContent>
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
        <SelectContent>
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
      {/* Artistic Background Animation */}
      <ArtisticBackground />
      
      {/* Navbar */}
      <Navbar currentPage="porto-de-ideias" />

      {/* Header */}
      <section ref={headerRef} className="relative py-16 md:py-24 overflow-hidden z-10">
        {/* Semi-transparent background matching homepage hero */}
        <div className="absolute inset-0 bg-background/60" />
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className={`max-w-4xl mx-auto text-center transition-all duration-1000 ${headerInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Icon */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 w-20 h-20 rounded-full bg-primary/20 blur-xl animate-pulse" />
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center backdrop-blur-sm border border-primary/30 shadow-2xl mx-auto">
                <Compass className="w-8 h-8 text-primary" />
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
      <section className="hidden lg:block py-6 bg-card/95 backdrop-blur-md border-b border-border sticky top-20 z-40">
        <div className="container mx-auto px-6">
          <FilterControls />
        </div>
      </section>

      {/* Filters - Mobile */}
      <section className="lg:hidden py-4 bg-card/95 backdrop-blur-md border-b border-border sticky top-20 z-40">
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
      <section ref={projectsRef} className="py-8 md:py-12">
        <div className="container mx-auto px-6">
          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse bg-card rounded-2xl overflow-hidden border border-border/50 shadow-lg">
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
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 transition-all duration-1000 ${projectsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Real Projects - up to displaySlots */}
              {sortedProjects.slice(0, displaySlots).map((project, index) => {
                const budgetInfo = getBudgetRange(project.valor_sugerido);
                const stageInfo = getStageInfo(project.stage);
                
                return (
                  <Link 
                    key={project.id}
                    to={`/project/${project.id}`}
                    className="block group"
                    style={{ 
                      opacity: projectsInView ? 1 : 0,
                      transform: projectsInView ? 'translateY(0)' : 'translateY(20px)',
                      transition: `all 0.6s ease-out ${index * 100}ms`
                    }}
                  >
                    <div className="card-3d bg-card border border-border/50 rounded-2xl overflow-hidden shadow-lg h-full">
                      {/* Image */}
                      <div className="relative overflow-hidden h-48">
                        {project.image_url ? (
                          <img
                            src={project.image_url}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 flex items-center justify-center min-h-[192px]">
                            <span className="text-4xl font-handwritten text-primary/40">{project.title.charAt(0)}</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 md:p-5 flex-1">
                        {/* Category, Budget Range, Location */}
                        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="rounded-full text-xs">
                              {project.project_type}
                            </Badge>
                            <Badge className={`rounded-full text-xs ${budgetInfo.color}`}>
                              {budgetInfo.label}
                            </Badge>
                          </div>
                          {project.location && (
                            <span className="flex items-center text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3 mr-1" />
                              {project.location}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                          {project.title}
                        </h3>

                        {/* Synopsis */}
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {project.synopsis}
                        </p>

                        {/* Budget & Stage */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-foreground">
                            {formatBudget(project.valor_sugerido)}
                          </span>
                          <Badge className={`rounded-full text-xs ${stageInfo.color}`}>
                            {stageInfo.label}
                          </Badge>
                        </div>

                        {/* Incentive Law */}
                        {project.has_incentive_law && (
                          <div className="mb-3">
                            <Badge variant="outline" className="rounded-full text-xs border-primary/30 text-primary">
                              <Shield className="w-3 h-3 mr-1" />
                              {project.incentive_law_details || "Lei de Incentivo"}
                            </Badge>
                          </div>
                        )}

                        {/* Tags */}
                        {project.categorias_tags && project.categorias_tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {project.categorias_tags.slice(0, 3).map((tag, i) => (
                              <Badge key={i} variant="outline" className="rounded-full text-xs bg-muted/50">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Creator & Link */}
                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                              <span className="text-xs text-primary-foreground font-semibold">
                                {getInitials(project.responsavel_nome)}
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground truncate max-w-[120px]">
                              {project.responsavel_nome || "Produtor Cultural"}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            Ver Detalhes
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {/* Example Cards - fill remaining slots (up to displaySlots - realProjects) */}
              {sortedProjects.length < displaySlots && exampleProjects.slice(0, displaySlots - sortedProjects.length).map((example, index) => {
                const cardIndex = sortedProjects.length + index;
                
                return (
                  <Link 
                    key={example.id}
                    to={example.link}
                    className="block group"
                    style={{ 
                      opacity: projectsInView ? 1 : 0,
                      transform: projectsInView ? 'translateY(0)' : 'translateY(20px)',
                      transition: `all 0.6s ease-out ${cardIndex * 100}ms`
                    }}
                  >
                    <div className={`card-3d bg-card ${example.borderClass || 'border border-border/50'} rounded-2xl overflow-hidden h-full shadow-lg`}>
                      <div className={`relative h-48 bg-gradient-to-br ${example.gradientClass || 'from-accent/20 to-primary/20'} flex items-center justify-center`}>
                        <div className={`w-20 h-20 rounded-full ${example.emojiBgClass || 'bg-accent/20'} flex items-center justify-center`}>
                          <span className={`text-4xl ${example.emojiAnimate ? 'animate-pulse' : ''}`}>{example.emoji}</span>
                        </div>
                      </div>
                      <div className="p-5">
                        <Badge 
                          variant={example.badgeVariant} 
                          className={`mb-3 rounded-full ${example.badgeClass || ''}`}
                        >
                          {example.badge}
                        </Badge>
                        <h3 className="text-lg font-serif font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {example.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {example.synopsis}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          {example.footerContent}
                          <span className="text-sm font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {example.footerAction || "Ver Exemplo"}
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {/* CTA Card - Always last */}
              <Link 
                to="/submit"
                className="block group"
                style={{ 
                  opacity: projectsInView ? 1 : 0,
                  transform: projectsInView ? 'translateY(0)' : 'translateY(20px)',
                  transition: `all 0.6s ease-out ${Math.min(sortedProjects.length, displaySlots) * 100 + (displaySlots - Math.min(sortedProjects.length, displaySlots)) * 100}ms`
                }}
              >
                <div className="card-3d bg-gradient-to-br from-primary via-primary/95 to-accent border border-primary/50 rounded-2xl overflow-hidden h-full shadow-lg">
                  <div className="relative h-48 flex items-center justify-center">
                    <div className="text-center text-primary-foreground">
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <Anchor className="w-8 h-8" />
                      </div>
                      <div className="text-lg font-medium">Quer enviar seu projeto?</div>
                    </div>
                  </div>
                  <div className="p-5 text-primary-foreground">
                    <h3 className="text-lg font-serif font-bold mb-2">
                      Faça Parte da Nossa Rede
                    </h3>
                    <p className="text-sm text-primary-foreground/80 line-clamp-3 mb-4">
                      Se você tem uma ideia potente e bem estruturada, envie para nossa curadoria.
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-white/20">
                      <span className="text-sm text-primary-foreground/70">Gratuito</span>
                      <span className="text-sm font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Enviar projeto
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PortoDeIdeiasPage;
