import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Linkedin
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
      .select("id, title, synopsis, project_type, image_url, location, categorias_tags, responsavel_nome, valor_sugerido, budget, has_incentive_law, incentive_law_details")
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

  const getStageInfo = (): { label: string; color: string } => {
    // Simulating stage based on project - in real app this would come from DB
    const stages = [
      { label: "Desenvolvimento", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
      { label: "Produção", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
      { label: "Difusão", color: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400" }
    ];
    return stages[Math.floor(Math.random() * stages.length)];
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

    let matchesIncentiveLaw = true;
    if (selectedIncentiveLaw !== "all") {
      if (selectedIncentiveLaw === "none") matchesIncentiveLaw = !project.has_incentive_law;
      else matchesIncentiveLaw = project.has_incentive_law;
    }

    return matchesSearch && matchesCategory && matchesLocation && matchesBudgetRange && matchesIncentiveLaw;
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
        return 0; // Already sorted by recent from DB
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentPage="porto-de-ideias" />

      {/* Header */}
      <section className="bg-gradient-to-br from-primary/10 via-accent/5 to-background py-16">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">Explore Projetos Culturais</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Descubra iniciativas culturais inovadoras em busca de investimento e parceria estratégica.
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 bg-card border-b border-border sticky top-20 z-40">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] max-w-xs">
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
              <SelectTrigger className="w-[140px] rounded-full">
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
              <SelectTrigger className="w-[150px] rounded-full">
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
              <SelectTrigger className="w-[160px] rounded-full">
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
              <SelectTrigger className="w-[140px] rounded-full">
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
              <SelectTrigger className="w-[130px] rounded-full">
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
              <SelectTrigger className="w-[150px] rounded-full">
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
              <Button variant="outline" size="sm" onClick={clearFilters} className="rounded-full">
                <X className="w-4 h-4 mr-1" />
                Limpar Filtros
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Projects List */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-lg font-medium text-foreground">
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
                className="rounded-lg"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "flex flex-col gap-4"
            }>
              {sortedProjects.map((project, index) => {
                const budgetInfo = getBudgetRange(project.valor_sugerido);
                const stageInfo = getStageInfo();
                
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
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 flex items-center justify-center">
                            <span className="text-4xl font-handwritten text-primary/40">{project.title.charAt(0)}</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 flex-1">
                        {/* Category, Budget Range, Location */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
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
                            <span className="text-sm text-muted-foreground">
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
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum projeto encontrado</h3>
              <p className="text-muted-foreground mb-6">Tente ajustar os filtros ou buscar por outros termos.</p>
              <Button onClick={clearFilters} variant="outline" className="rounded-full">
                Limpar Filtros
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-16 mt-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Anchor className="w-8 h-8 text-primary" />
                <span className="text-2xl font-handwritten font-bold text-primary">
                  Porto de Ideias
                </span>
              </div>
              <p className="text-background/70 mb-4">
                O Porto de Ideias é uma iniciativa da Porto Bello Filmes, criada para aproximar cultura e investimento.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors">
                  <Facebook className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors">
                  <Twitter className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors">
                  <Instagram className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors">
                  <Linkedin className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4 text-background">Plataforma</h3>
              <ul className="space-y-2 text-background/70">
                <li><a href="#" className="hover:text-background transition-colors">Como Funciona</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Enviar Projeto</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Encontrar Investidores</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4 text-background">Suporte</h3>
              <ul className="space-y-2 text-background/70">
                <li><a href="#" className="hover:text-background transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Ajuda</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Termos de Uso</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4 text-background">Contato</h3>
              <ul className="space-y-2 text-background/70">
                <li className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>portobellofilmes@gmail.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+55 (11) 9999-9999</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-background/20 mt-12 pt-8 text-center text-background/70">
            <p>&copy; 2024 Porto de Ideias. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PortoDeIdeiasPage;
