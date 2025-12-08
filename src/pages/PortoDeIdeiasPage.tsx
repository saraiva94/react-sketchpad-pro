import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { 
  Search,
  MapPin,
  ArrowRight,
  LayoutGrid,
  List,
  X,
  Shield,
  Anchor,
  Mail,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  SlidersHorizontal
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

const PortoDeIdeiasPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedLocation, setSelectedLocation] = useState("Todas");
  const [selectedBudgetRange, setSelectedBudgetRange] = useState("all");
  const [selectedStage, setSelectedStage] = useState("all");
  const [selectedIncentiveLaw, setSelectedIncentiveLaw] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    fetchProjects();
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
      if (selectedIncentiveLaw === "none") matchesIncentiveLaw = !project.has_incentive_law;
      else matchesIncentiveLaw = project.has_incentive_law;
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
    <div className="min-h-screen bg-background">
      <Navbar currentPage="porto-de-ideias" />

      {/* Header */}
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-12 md:py-16">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h1 className="text-2xl md:text-4xl font-serif font-bold text-foreground mb-3 md:mb-4">Explore Projetos Culturais</h1>
            <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Descubra iniciativas culturais inovadoras em busca de investimento e parceria estratégica.
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
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-6">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-base md:text-lg font-medium text-foreground">
              {sortedProjects.length} projeto{sortedProjects.length !== 1 ? 's' : ''} encontrado{sortedProjects.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="rounded-lg"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                className="rounded-lg hidden md:flex"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse bg-card rounded-2xl overflow-hidden border border-border">
                  <div className="h-48 bg-muted" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-16 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : sortedProjects.length > 0 ? (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" 
              : "flex flex-col gap-4"
            }>
              {sortedProjects.map((project, index) => {
                const budgetInfo = getBudgetRange(project.valor_sugerido);
                const stageInfo = getStageInfo(project.stage);
                
                return (
                  <Link 
                    key={project.id}
                    to={`/project/${project.id}`}
                    className="block group animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className={`bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}>
                      {/* Image */}
                      <div className={`relative overflow-hidden ${
                        viewMode === 'list' ? 'w-64 flex-shrink-0' : 'h-48'
                      }`}>
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
            </div>
          ) : (
            /* Placeholder Cards - Incentive Messages */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Card 1 - Add Your Project */}
              <Link 
                to="/submit"
                className="block group animate-fade-in"
                style={{ animationDelay: '0ms' }}
              >
                <div className="bg-gradient-to-br from-primary/10 via-accent/5 to-card border-2 border-dashed border-primary/30 rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary/60 transition-all duration-300 h-full">
                  <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                      <span className="text-4xl">✨</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <Badge className="mb-3 rounded-full bg-primary/20 text-primary hover:bg-primary/30">
                      Novo Projeto
                    </Badge>
                    <h3 className="text-lg font-serif font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      Adicione seu Projeto
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      Sua ideia cultural merece ganhar vida! Submeta seu projeto e conecte-se com investidores interessados em transformar cultura em realidade.
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-sm text-muted-foreground">Comece agora</span>
                      <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Submeter
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Card 2 - Inspire Others */}
              <Link 
                to="/exemplo/cultura-legado"
                className="block group animate-fade-in"
                style={{ animationDelay: '100ms' }}
              >
                <div className="bg-gradient-to-br from-accent/10 via-primary/5 to-card border border-border rounded-2xl overflow-hidden h-full hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                  <div className="relative h-48 bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center">
                      <span className="text-4xl animate-bounce">🎭</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <Badge variant="secondary" className="mb-3 rounded-full">
                      Inspire
                    </Badge>
                    <h3 className="text-lg font-serif font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      Sua Cultura, Seu Legado
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      Cada projeto cultural conta uma história única. Seja parte dessa rede de criadores que estão transformando o cenário cultural brasileiro.
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
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
                      <span className="text-sm font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver Exemplo
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Card 3 - Connect */}
              <Link 
                to="/exemplo/investidores-aguardam"
                className="block group animate-fade-in"
                style={{ animationDelay: '200ms' }}
              >
                <div className="bg-gradient-to-br from-primary/5 via-card to-accent/10 border border-border rounded-2xl overflow-hidden h-full hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                  <div className="relative h-48 bg-gradient-to-br from-primary/15 to-accent/25 flex items-center justify-center">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-4xl">🤝</span>
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center animate-ping opacity-75">
                        <span className="text-sm">💡</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <Badge variant="outline" className="mb-3 rounded-full border-accent text-accent">
                      Conecte-se
                    </Badge>
                    <h3 className="text-lg font-serif font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      Investidores Aguardam
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      Uma rede de investidores e patrocinadores interessados em apoiar projetos culturais está esperando por você. Faça a conexão acontecer!
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-sm text-emerald-600 dark:text-emerald-400">Online agora</span>
                      </div>
                      <span className="text-sm font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver Exemplo
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Card 4 - Success Stories */}
              <Link 
                to="/exemplo/historias-sucesso"
                className="block group animate-fade-in"
                style={{ animationDelay: '300ms' }}
              >
                <div className="bg-gradient-to-br from-amber-50 dark:from-amber-900/20 via-card to-orange-50 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-800/30 rounded-2xl overflow-hidden h-full hover:shadow-xl hover:border-amber-400/50 transition-all duration-300">
                  <div className="relative h-48 bg-gradient-to-br from-amber-100 dark:from-amber-900/40 to-orange-100 dark:to-orange-900/40 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                      <span className="text-4xl">🏆</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <Badge className="mb-3 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200">
                      Sucesso
                    </Badge>
                    <h3 className="text-lg font-serif font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      Histórias de Sucesso
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      Projetos que começaram aqui já impactaram milhares de pessoas. O próximo sucesso pode ser o seu!
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-1">
                        <span className="text-amber-500">★★★★★</span>
                      </div>
                      <span className="text-sm font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver Exemplo
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Card 5 - Funding */}
              <Link 
                to="/exemplo/recursos-disponiveis"
                className="block group animate-fade-in"
                style={{ animationDelay: '400ms' }}
              >
                <div className="bg-gradient-to-br from-emerald-50 dark:from-emerald-900/20 via-card to-teal-50 dark:to-teal-900/20 border border-emerald-200/50 dark:border-emerald-800/30 rounded-2xl overflow-hidden h-full">
                  <div className="relative h-48 bg-gradient-to-br from-emerald-100 dark:from-emerald-900/40 to-teal-100 dark:to-teal-900/40 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">R$ 10M+</div>
                      <div className="text-sm text-emerald-700 dark:text-emerald-300">já financiados</div>
                    </div>
                  </div>
                  <div className="p-5">
                    <Badge className="mb-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200">
                      Financiamento
                    </Badge>
                    <h3 className="text-lg font-serif font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      Recursos Disponíveis
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      Conectamos projetos a recursos via Lei Rouanet, PROAC, e investimento direto. Encontre o modelo ideal para você.
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">Rouanet</Badge>
                        <Badge variant="outline" className="text-xs">PROAC</Badge>
                      </div>
                      <span className="text-sm font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver Exemplo
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Card 6 - CTA */}
              <Link 
                to="/submit"
                className="block group animate-fade-in"
                style={{ animationDelay: '500ms' }}
              >
                <div className="bg-gradient-to-br from-primary via-primary/90 to-accent border border-primary/50 rounded-2xl overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 h-full">
                  <div className="relative h-48 flex items-center justify-center">
                    <div className="text-center text-primary-foreground">
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                        <Anchor className="w-8 h-8" />
                      </div>
                      <div className="text-lg font-medium">Pronto para começar?</div>
                    </div>
                  </div>
                  <div className="p-5 text-primary-foreground">
                    <h3 className="text-lg font-serif font-bold mb-2">
                      Embarque Nessa Jornada
                    </h3>
                    <p className="text-sm text-primary-foreground/80 line-clamp-3 mb-4">
                      Submeta seu projeto cultural agora e faça parte da maior plataforma de conexão entre cultura e investimento do Brasil.
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-white/20">
                      <span className="text-sm text-primary-foreground/70">Gratuito</span>
                      <span className="text-sm font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Começar Agora
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

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 md:py-16 mt-12 md:mt-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Anchor className="w-8 h-8 text-primary" />
                <span className="text-xl md:text-2xl font-handwritten font-bold text-primary">
                  Porto de Ideias
                </span>
              </div>
              <p className="text-background/70 mb-4 text-sm">
                O Porto de Ideias é uma iniciativa da Porto Bello Filmes, criada para aproximar cultura e investimento.
              </p>
              <div className="flex space-x-3">
                <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors">
                  <Facebook className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors">
                  <Twitter className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors">
                  <Instagram className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors">
                  <Linkedin className="w-4 h-4 text-primary-foreground" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-base mb-4 text-background">Plataforma</h3>
              <ul className="space-y-2 text-background/70 text-sm">
                <li><a href="#" className="hover:text-background transition-colors">Como Funciona</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Enviar Projeto</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Investidores</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-base mb-4 text-background">Suporte</h3>
              <ul className="space-y-2 text-background/70 text-sm">
                <li><a href="#" className="hover:text-background transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Ajuda</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Termos</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-base mb-4 text-background">Contato</h3>
              <ul className="space-y-2 text-background/70 text-sm">
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">portobellofilmes@gmail.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>+55 (11) 9999-9999</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-background/20 mt-8 md:mt-12 pt-6 md:pt-8 text-center text-background/70 text-sm">
            <p>&copy; 2024 Porto de Ideias. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PortoDeIdeiasPage;
