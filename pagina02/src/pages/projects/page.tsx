import { useState } from 'react';
import { UserNav } from '../../components/feature/UserNav';

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  creator: string;
  image: string;
  tags: string[];
  budget: number;
  budgetRange: 'small' | 'medium' | 'large';
  stage: 'development' | 'production' | 'distribution';
  incentiveLaw?: string;
}

const mockProjects: Project[] = [
  {
    id: 1,
    title: "Galeria de Arte Contemporânea",
    description: "Um espaço de galeria moderna dedicado a artistas contemporâneos emergentes, oferecendo oportunidades de exposição e programas de educação cultural.",
    category: "Artes Visuais",
    location: "São Paulo",
    creator: "Maria Santos",
    image: "https://readdy.ai/api/search-image?query=Galeria%20de%20arte%20contempor%C3%A2nea%20brasileira%20com%20pinturas%20e%20esculturas%20modernas%2C%20visitantes%20apreciando%20obras%20de%20arte%2C%20paredes%20brancas%20limpas%20e%20ilumina%C3%A7%C3%A3o%20profissional%2C%20atmosfera%20cultural%20e%20art%C3%ADstica&width=400&height=250&seq=projeto-br-1&orientation=landscape",
    tags: ["Arte", "Educação", "Exposição"],
    budget: 75000,
    budgetRange: 'small',
    stage: 'development',
    incentiveLaw: 'PROAC'
  },
  {
    id: 2,
    title: "Iniciativa de Teatro Comunitário",
    description: "Construindo um espaço teatral comunitário que reúne talentos locais e oferece entretenimento cultural acessível para todas as idades.",
    category: "Teatro",
    location: "Rio de Janeiro",
    creator: "João Silva",
    image: "https://readdy.ai/api/search-image?query=Teatro%20comunit%C3%A1rio%20brasileiro%20com%20atores%20no%20palco%2C%20p%C3%BAblico%20diverso%20apreciando%20o%20espet%C3%A1culo%2C%20ilumina%C3%A7%C3%A3o%20teatral%20calorosa%20e%20assentos%20confort%C3%A1veis%2C%20local%20de%20entretenimento%20cultural&width=400&height=250&seq=projeto-br-2&orientation=landscape",
    tags: ["Teatro", "Comunidade", "Entretenimento"],
    budget: 180000,
    budgetRange: 'medium',
    stage: 'production'
  },
  {
    id: 3,
    title: "Festival Cultural de Música",
    description: "Festival anual celebrando tradições musicais regionais enquanto promove artistas emergentes e diversidade cultural em nossa comunidade.",
    category: "Música",
    location: "Belo Horizonte",
    creator: "Ana Costa",
    image: "https://readdy.ai/api/search-image?query=Festival%20de%20m%C3%BAsica%20brasileira%20ao%20ar%20livre%20com%20m%C3%BAsicos%20diversos%20se%20apresentando%2C%20multid%C3%A3o%20entusiasmada%20curtindo%20m%C3%BAsica%20ao%20vivo%2C%20ilumina%C3%A7%C3%A3o%20colorida%20do%20palco%20e%20atmosfera%20de%20celebra%C3%A7%C3%A3o%20cultural%2C%20encontro%20comunit%C3%A1rio&width=400&height=250&seq=projeto-br-3&orientation=landscape",
    tags: ["Música", "Festival", "Tradição"],
    budget: 320000,
    budgetRange: 'medium',
    stage: 'distribution',
    incentiveLaw: 'Rouanet'
  },
  {
    id: 4,
    title: "Documentário Ambiental",
    description: "Produção de documentário sobre preservação ambiental na Amazônia, destacando comunidades tradicionais e seus conhecimentos ancestrais.",
    category: "Audiovisual",
    location: "Manaus",
    creator: "Carlos Mendes",
    image: "https://readdy.ai/api/search-image?query=Equipe%20de%20filmagem%20brasileira%20na%20floresta%20amaz%C3%B4nica%20documentando%20comunidades%20tradicionais%2C%20c%C3%A2meras%20profissionais%20e%20equipamentos%20de%20grava%C3%A7%C3%A3o%2C%20ambiente%20natural%20exuberante%20com%20%C3%A1rvores%20e%20vegeta%C3%A7%C3%A3o%20tropical&width=400&height=250&seq=projeto-br-4&orientation=landscape",
    tags: ["Documentário", "Meio Ambiente", "Cultura Tradicional"],
    budget: 850000,
    budgetRange: 'large',
    stage: 'production',
    incentiveLaw: 'Lei do Audiovisual'
  },
  {
    id: 5,
    title: "Curta-metragem Independente",
    description: "Produção de curta-metragem sobre juventude periférica, abordando temas sociais contemporâneos com linguagem cinematográfica inovadora.",
    category: "Audiovisual",
    location: "Salvador",
    creator: "Fernanda Lima",
    image: "https://readdy.ai/api/search-image?query=Set%20de%20filmagem%20de%20curta-metragem%20brasileiro%20com%20jovens%20atores%2C%20diretor%20e%20equipe%20t%C3%A9cnica%2C%20equipamentos%20cinematogr%C3%A1ficos%20profissionais%2C%20cen%C3%A1rio%20urbano%20contempor%C3%A2neo%2C%20atmosfera%20criativa%20de%20produ%C3%A7%C3%A3o&width=400&height=250&seq=projeto-br-5&orientation=landscape",
    tags: ["Curta-metragem", "Juventude", "Social"],
    budget: 45000,
    budgetRange: 'small',
    stage: 'development',
    incentiveLaw: 'Lei do Audiovisual'
  },
  {
    id: 6,
    title: "Longa-metragem Drama",
    description: "Produção de longa-metragem dramático sobre imigração e identidade cultural no Brasil contemporâneo, com elenco diverso e técnica refinada.",
    category: "Audiovisual",
    location: "Porto Alegre",
    creator: "Roberto Alves",
    image: "https://readdy.ai/api/search-image?query=Produ%C3%A7%C3%A3o%20cinematogr%C3%A1fica%20brasileira%20de%20longa-metragem%20com%20atores%20profissionais%20em%20cena%20dram%C3%A1tica%2C%20ilumina%C3%A7%C3%A3o%20cinematogr%C3%A1fica%20sofisticada%2C%20equipe%20t%C3%A9cnica%20e%20equipamentos%20de%20alta%20qualidade%2C%20ambiente%20de%20est%C3%BAdio%20profissional&width=400&height=250&seq=projeto-br-6&orientation=landscape",
    tags: ["Longa-metragem", "Drama", "Imigração"],
    budget: 1200000,
    budgetRange: 'large',
    stage: 'development',
    incentiveLaw: 'Rouanet'
  },
  {
    id: 7,
    title: "Centro Cultural Infantil",
    description: "Criação de centro cultural dedicado à educação artística infantil, com ateliês, biblioteca e espaços para apresentações culturais.",
    category: "Educação Cultural",
    location: "Brasília",
    creator: "Patrícia Rocha",
    image: "https://readdy.ai/api/search-image?query=Centro%20cultural%20infantil%20brasileiro%20com%20crian%C3%A7as%20participando%20de%20atividades%20art%C3%ADsticas%2C%20pinturas%20coloridas%20nas%20paredes%2C%20materiais%20de%20arte%20espalhados%2C%20professores%20orientando%2C%20ambiente%20alegre%20e%20educativo&width=400&height=250&seq=projeto-br-7&orientation=landscape",
    tags: ["Educação", "Infantil", "Arte"],
    budget: 280000,
    budgetRange: 'medium',
    stage: 'production'
  },
  {
    id: 8,
    title: "Espetáculo de Dança Contemporânea",
    description: "Criação de espetáculo de dança contemporânea que explora temas de ancestralidade e modernidade na cultura brasileira.",
    category: "Dança",
    location: "Recife",
    creator: "Marcos Vieira",
    image: "https://readdy.ai/api/search-image?query=Espet%C3%A1culo%20de%20dan%C3%A7a%20contempor%C3%A2nea%20brasileira%20com%20dan%C3%A7arinos%20em%20movimento%20expressivo%2C%20ilumina%C3%A7%C3%A3o%20art%C3%ADstica%20do%20palco%2C%20figurinos%20modernos%2C%20teatro%20com%20p%C3%BAblico%20apreciando%2C%20performance%20cultural%20sofisticada&width=400&height=250&seq=projeto-br-8&orientation=landscape",
    tags: ["Dança", "Contemporâneo", "Ancestralidade"],
    budget: 95000,
    budgetRange: 'small',
    stage: 'distribution',
    incentiveLaw: 'PROAC'
  }
];

const categories = ["Todos", "Artes Visuais", "Teatro", "Música", "Audiovisual", "Educação Cultural", "Dança"];
const locations = ["Todas", "São Paulo", "Rio de Janeiro", "Belo Horizonte", "Manaus", "Salvador", "Porto Alegre", "Brasília", "Recife"];
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
const subcategories = {
  "Audiovisual": ["Todos", "Documentário", "Curta-metragem", "Longa-metragem", "Série", "Animação"],
  "Teatro": ["Todos", "Drama", "Comédia", "Musical", "Experimental"],
  "Música": ["Todos", "Festival", "Álbum", "Show", "Educacional"],
  "Artes Visuais": ["Todos", "Exposição", "Instalação", "Galeria", "Workshop"],
  "Dança": ["Todos", "Contemporâneo", "Folclórico", "Urbano", "Clássico"],
  "Educação Cultural": ["Todos", "Infantil", "Jovem", "Adulto", "Comunitário"]
};

const formatBudget = (budget: number): string => {
  if (budget >= 1000000) {
    return `R$ ${(budget / 1000000).toFixed(1)}M`;
  } else if (budget >= 1000) {
    return `R$ ${(budget / 1000)}k`;
  }
  return `R$ ${budget}`;
};

const getBudgetRangeColor = (range: string): string => {
  switch (range) {
    case 'small': return 'bg-green-100 text-green-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'large': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getBudgetRangeLabel = (range: string): string => {
  switch (range) {
    case 'small': return 'Pequeno';
    case 'medium': return 'Médio';
    case 'large': return 'Grande';
    default: return '';
  }
};

const getStageLabel = (stage: string): string => {
  switch (stage) {
    case 'development': return 'Desenvolvimento';
    case 'production': return 'Produção';
    case 'distribution': return 'Difusão';
    default: return '';
  }
};

const getStageColor = (stage: string): string => {
  switch (stage) {
    case 'development': return 'bg-blue-100 text-blue-800';
    case 'production': return 'bg-orange-100 text-orange-800';
    case 'distribution': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function Projects() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedLocation, setSelectedLocation] = useState("Todas");
  const [selectedSubcategory, setSelectedSubcategory] = useState("Todos");
  const [selectedBudgetRange, setSelectedBudgetRange] = useState("all");
  const [selectedStage, setSelectedStage] = useState("all");
  const [selectedIncentiveLaw, setSelectedIncentiveLaw] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const handleNavigate = (path: string) => {
    if (typeof window !== 'undefined' && window.REACT_APP_NAVIGATE) {
      window.REACT_APP_NAVIGATE(path);
    } else {
      window.location.href = path;
    }
  };

  const filteredProjects = mockProjects.filter(project => {
    const matchesCategory = selectedCategory === "Todos" || project.category === selectedCategory;
    const matchesLocation = selectedLocation === "Todas" || project.location === selectedLocation;
    const matchesBudgetRange = selectedBudgetRange === "all" || project.budgetRange === selectedBudgetRange;
    const matchesStage = selectedStage === "all" || project.stage === selectedStage;
    const matchesIncentiveLaw = selectedIncentiveLaw === "all" || 
      (selectedIncentiveLaw === "none" && !project.incentiveLaw) ||
      (selectedIncentiveLaw === "rouanet" && project.incentiveLaw === "Rouanet") ||
      (selectedIncentiveLaw === "audiovisual" && project.incentiveLaw === "Lei do Audiovisual") ||
      (selectedIncentiveLaw === "proac" && project.incentiveLaw === "PROAC");
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    let matchesSubcategory = true;
    if (selectedCategory !== "Todos" && selectedSubcategory !== "Todos") {
      matchesSubcategory = project.tags.some(tag => tag.toLowerCase().includes(selectedSubcategory.toLowerCase()));
    }

    return matchesCategory && matchesLocation && matchesBudgetRange && matchesStage && matchesIncentiveLaw && matchesSearch && matchesSubcategory;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.title.localeCompare(b.title);
      case "location":
        return a.location.localeCompare(b.location);
      case "budget-asc":
        return a.budget - b.budget;
      case "budget-desc":
        return b.budget - a.budget;
      default:
        return b.id - a.id; // recent first
    }
  });

  const clearAllFilters = () => {
    setSelectedCategory("Todos");
    setSelectedLocation("Todas");
    setSelectedSubcategory("Todos");
    setSelectedBudgetRange("all");
    setSelectedStage("all");
    setSelectedIncentiveLaw("all");
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <a href="/" className="text-2xl font-bold text-blue-600 cursor-pointer" style={{ fontFamily: "Pacifico, serif" }}>
                Porto de Ideias
              </a>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="/" className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap" onClick={() => handleNavigate('/')}>Início</a>
              <a href="/#about" className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap">Sobre</a>
              <a href="/#platform" className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap">Plataforma</a>
              <a href="/projects" className="text-blue-600 font-semibold cursor-pointer whitespace-nowrap">Projetos</a>
              <a href="/contact" className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap" onClick={() => handleNavigate('/contact')}>Contato</a>
              
              {/* User Navigation */}
              <UserNav onNavigate={handleNavigate} />
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Explore Projetos Culturais</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubra iniciativas culturais inovadoras em busca de investimento e parceria estratégica.
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="ri-search-line text-gray-400 text-sm"></i>
              </div>
              <input
                type="text"
                placeholder="Buscar projetos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubcategory("Todos");
                }}
                className="appearance-none bg-white border border-gray-300 rounded-full px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <i className="ri-arrow-down-s-line text-gray-400"></i>
              </div>
            </div>

            {/* Budget Range Filter */}
            <div className="relative">
              <select
                value={selectedBudgetRange}
                onChange={(e) => setSelectedBudgetRange(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-full px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-sm"
              >
                {budgetRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <i className="ri-money-dollar-circle-line text-gray-400"></i>
              </div>
            </div>

            {/* Stage Filter */}
            <div className="relative">
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-full px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-sm"
              >
                {projectStages.map(stage => (
                  <option key={stage.value} value={stage.value}>{stage.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <i className="ri-play-circle-line text-gray-400"></i>
              </div>
            </div>

            {/* Incentive Law Filter */}
            <div className="relative">
              <select
                value={selectedIncentiveLaw}
                onChange={(e) => setSelectedIncentiveLaw(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-full px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-sm"
              >
                {incentiveLaws.map(law => (
                  <option key={law.value} value={law.value}>{law.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <i className="ri-government-line text-gray-400"></i>
              </div>
            </div>

            {/* Subcategory Filter */}
            {selectedCategory !== "Todos" && subcategories[selectedCategory as keyof typeof subcategories] && (
              <div className="relative">
                <select
                  value={selectedSubcategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-full px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-sm"
                >
                  {subcategories[selectedCategory as keyof typeof subcategories].map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <i className="ri-arrow-down-s-line text-gray-400"></i>
                </div>
              </div>
            )}

            {/* Location Filter */}
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-full px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-sm"
              >
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <i className="ri-arrow-down-s-line text-gray-400"></i>
              </div>
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-full px-4 py-3 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-sm"
              >
                <option value="recent">Mais Recentes</option>
                <option value="name">Nome A-Z</option>
                <option value="location">Localização</option>
                <option value="budget-asc">Menor Valor</option>
                <option value="budget-desc">Maior Valor</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <i className="ri-arrow-down-s-line text-gray-400"></i>
              </div>
            </div>

            {/* Clear Filters Button */}
            <button 
              onClick={clearAllFilters}
              className="bg-gray-100 text-gray-700 px-4 py-3 rounded-full hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap text-sm"
            >
              <i className="ri-close-circle-line mr-2"></i>
              Limpar Filtros
            </button>
          </div>

          {/* Active Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {selectedCategory !== "Todos" && (
              <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {selectedCategory}
                <button onClick={() => setSelectedCategory("Todos")} className="ml-1 hover:text-blue-600">
                  <i className="ri-close-line text-xs"></i>
                </button>
              </span>
            )}
            {selectedBudgetRange !== "all" && (
              <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                {budgetRanges.find(r => r.value === selectedBudgetRange)?.label}
                <button onClick={() => setSelectedBudgetRange("all")} className="ml-1 hover:text-green-600">
                  <i className="ri-close-line text-xs"></i>
                </button>
              </span>
            )}
            {selectedStage !== "all" && (
              <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 rounded-full">
                {projectStages.find(s => s.value === selectedStage)?.label}
                <button onClick={() => setSelectedStage("all")} className="ml-1 hover:text-orange-600">
                  <i className="ri-close-line text-xs"></i>
                </button>
              </span>
            )}
            {selectedIncentiveLaw !== "all" && (
              <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
                {incentiveLaws.find(l => l.value === selectedIncentiveLaw)?.label}
                <button onClick={() => setSelectedIncentiveLaw("all")} className="ml-1 hover:text-indigo-600">
                  <i className="ri-close-line text-xs"></i>
                </button>
              </span>
            )}
            {selectedSubcategory !== "Todos" && (
              <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                {selectedSubcategory}
                <button onClick={() => setSelectedSubcategory("Todos")} className="ml-1 hover:text-purple-600">
                  <i className="ri-close-line text-xs"></i>
                </button>
              </span>
            )}
            {selectedLocation !== "Todas" && (
              <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                {selectedLocation}
                <button onClick={() => setSelectedLocation("Todas")} className="ml-1 hover:text-yellow-600">
                  <i className="ri-close-line text-xs"></i>
                </button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                "{searchTerm}"
                <button onClick={() => setSearchTerm("")} className="ml-1 hover:text-gray-600">
                  <i className="ri-close-line text-xs"></i>
                </button>
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              {sortedProjects.length} {sortedProjects.length === 1 ? 'projeto encontrado' : 'projetos encontrados'}
            </h2>
            <div className="flex items-center space-x-4">
              <button className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                <i className="ri-grid-line text-gray-600"></i>
              </button>
              <button className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                <i className="ri-list-check text-gray-600"></i>
              </button>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedProjects.map((project) => (
              <div key={project.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer" data-product-shop>
                <img 
                  src={project.image}
                  alt={project.title}
                  className="w-full h-48 object-cover object-top cursor-pointer"
                  onClick={() => window.REACT_APP_NAVIGATE(`/projects/${project.id}`)}
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                        {project.category}
                      </span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${getBudgetRangeColor(project.budgetRange)}`}>
                        {getBudgetRangeLabel(project.budgetRange)}
                      </span>
                    </div>
                    <span className="text-gray-500 text-sm flex items-center">
                      <i className="ri-map-pin-line mr-1"></i>
                      {project.location}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-xl text-gray-800 mb-3">{project.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
                  
                  {/* Budget and Stage */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-lg font-bold text-gray-800">
                      {formatBudget(project.budget)}
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStageColor(project.stage)}`}>
                      {getStageLabel(project.stage)}
                    </span>
                  </div>

                  {/* Incentive Law */}
                  {project.incentiveLaw && (
                    <div className="mb-4">
                      <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">
                        <i className="ri-government-line mr-1"></i>
                        {project.incentiveLaw}
                      </span>
                    </div>
                  )}
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {project.creator.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">{project.creator}</span>
                    </div>
                    <button 
                      onClick={() => window.REACT_APP_NAVIGATE(`/projects/${project.id}`)}
                      className="text-blue-600 font-semibold cursor-pointer hover:text-blue-700 whitespace-nowrap"
                    >
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {sortedProjects.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="ri-search-line text-3xl text-gray-400"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Nenhum projeto encontrado</h3>
              <p className="text-gray-600 mb-6">Tente ajustar os filtros para encontrar mais projetos.</p>
              <button 
                onClick={clearAllFilters}
                className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Limpar Filtros
              </button>
            </div>
          )}

          {/* Load More */}
          {sortedProjects.length > 0 && (
            <div className="text-center mt-12">
              <button className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-600 hover:text-white transition-colors cursor-pointer whitespace-nowrap">
                Carregar Mais Projetos
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="text-2xl font-bold mb-4" style={{ fontFamily: "Pacifico, serif" }}>
                Porto de Ideias
              </div>
              <p className="text-gray-400 mb-4">
                O Porto de Ideias é uma iniciativa da Porto Bello Filmes, criada para aproximar cultura e investimento.
              </p>
              <p className="text-gray-400 mb-6 text-sm">
                Onde a cultura encontra o investimento, e o investimento encontra propósito.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                  <i className="ri-facebook-fill text-white"></i>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                  <i className="ri-twitter-fill text-white"></i>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                  <i className="ri-instagram-fill text-white"></i>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                  <i className="ri-linkedin-fill text-white"></i>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Plataforma</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Como Funciona</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Enviar Projeto</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Encontrar Investidores</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Histórias de Sucesso</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Recursos</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Guias</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Suporte</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Contato</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center space-x-2">
                  <i className="ri-mail-line"></i>
                  <span>portobellofilmes@gmail.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <i className="ri-phone-line"></i>
                  <span>+55 (11) 9999-9999</span>
                </li>
                <li className="flex items-center space-x-2">
                  <i className="ri-map-pin-line"></i>
                  <span>São Paulo, Brasil</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Porto de Ideias. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}