import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

interface ProjectMember {
  name: string;
  role: string;
  verified?: boolean;
}

interface InvestmentTier {
  min: number;
  max?: number;
  benefits: string[];
  taxBenefits: string;
}

interface ProjectDetail {
  id: number;
  title: string;
  category: string;
  location: string;
  budgetRange: string;
  stage: string;
  incentiveLaw?: string;
  synopsis: string;
  description: string;
  creator: string;
  budget: number;
  image: string;
  video?: string;
  tags: string[];
  team: ProjectMember[];
  investmentTiers: InvestmentTier[];
  impact: {
    cultural: string;
    social: string;
    audience: string;
    differentials: string[];
  };
  awards?: string[];
  news?: Array<{
    title: string;
    url: string;
    date: string;
  }>;
  updates?: Array<{
    title: string;
    content: string;
    date: string;
  }>;
}

const mockProject: ProjectDetail = {
  id: 1,
  title: "Galeria de Arte Contemporânea",
  category: "Artes Visuais",
  location: "São Paulo/SP",
  budgetRange: "Pequeno Porte",
  stage: "Desenvolvimento",
  incentiveLaw: "PROAC",
  synopsis: "Um espaço de galeria moderna dedicado a artistas contemporâneos emergentes, oferecendo oportunidades de exposição e programas de educação cultural. Este projeto pioneiro na região central de São Paulo funcionará como uma ponte entre artistas promissores e o público, criando um ambiente onde a arte contemporânea pode florescer e encontrar seu público. Nosso espaço não será apenas uma galeria tradicional, mas um hub cultural completo que inclui programas educativos, residências artísticas e um calendário diversificado de eventos culturais.",
  description: "A Galeria de Arte Contemporânea surge como um projeto pioneiro na região central de São Paulo, dedicado a promover e expor artistas contemporâneos emergentes. O espaço funcionará como uma ponte entre artistas promissores e o público, oferecendo exposições mensais, workshops educativos e programas de residência artística.\\n\\nNossa proposta vai além da simples exposição de obras: criamos um ecossistema cultural completo que inclui palestras, debates e encontros entre artistas e colecionadores. O projeto contempla a reforma e adequação de um espaço de 400m² no centro histórico da cidade, incluindo sistema de iluminação profissional, climatização adequada para preservação das obras e espaços multiuso para atividades educativas.\\n\\nO diferencial do nosso projeto está na curadoria dedicada exclusivamente a artistas emergentes, oferecendo uma plataforma de lançamento para talentos que ainda não encontraram espaço no circuito comercial tradicional. Cada exposição será acompanhada de um programa educativo que conecta a obra com o público, democratizando o acesso à arte contemporânea.\\n\\nEsperamos impactar diretamente mais de 5.000 visitantes no primeiro ano, além de oferecer oportunidades concretas de crescimento para 50 artistas emergentes através de nossos programas de mentoria e exposição. O espaço também funcionará como incubadora cultural, oferecendo suporte técnico e comercial para artistas desenvolverem suas carreiras.",
  creator: "Maria Santos",
  budget: 75000,
  image: "https://readdy.ai/api/search-image?query=Galeria%20de%20arte%20contempor%C3%A2nea%20moderna%20e%20sofisticada%20com%20obras%20de%20arte%20expostas%2C%20ilumina%C3%A7%C3%A3o%20profissional%2C%20visitantes%20apreciando%20as%20pe%C3%A7as%2C%20espa%C3%A7o%20amplo%20e%20clean%20com%20paredes%20brancas%2C%20ambiente%20cultural%20elegante%20e%20inspirador&width=800&height=500&seq=galeria-detail-1&orientation=landscape",
  video: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  tags: ["Arte", "Educação", "Exposição", "Cultura Contemporânea"],
  team: [
    { name: "Maria Santos", role: "Produtora e Curadora", verified: true },
    { name: "Carlos Oliveira", role: "Diretor Artístico", verified: false },
    { name: "Ana Lima", role: "Coordenação Educativa", verified: false },
    { name: "Roberto Silva", role: "Designer de Exposições", verified: false },
    { name: "Fernanda Costa", role: "Gestão de Projetos", verified: false },
    { name: "Paulo Mendes", role: "Comunicação e Marketing", verified: false },
    { name: "Julia Rodrigues", role: "Assistente de Curadoria", verified: false },
    { name: "Pedro Almeida", role: "Produção Executiva", verified: false }
  ],
  investmentTiers: [
    {
      min: 5000,
      max: 14999,
      benefits: ["Reconhecimento na inauguração", "Convite para eventos exclusivos", "Catálogo digital personalizado"],
      taxBenefits: "100% dedutível do Imposto de Renda"
    },
    {
      min: 15000,
      max: 39999,
      benefits: ["Todos os benefícios anteriores", "Placa de reconhecimento permanente", "Workshop privativo com artistas", "Obra de arte exclusiva"],
      taxBenefits: "100% dedutível do Imposto de Renda"
    },
    {
      min: 40000,
      benefits: ["Todos os benefícios anteriores", "Sala com nome do apoiador", "Curadoria personalizada", "Evento de lançamento exclusivo"],
      taxBenefits: "100% dedutível do Imposto de Renda"
    }
  ],
  impact: {
    cultural: "Fortalecimento da cena artística contemporânea paulistana com foco em novos talentos",
    social: "Democratização do acesso à arte através de programas educativos gratuitos para comunidades locais",
    audience: "5.000+ visitantes no primeiro ano, incluindo estudantes, artistas e público geral",
    differentials: [
      "Primeiro espaço dedicado exclusivamente a artistas emergentes na região",
      "Programa de mentoria com artistas consagrados",
      "Parcerias com universidades para programas educativos",
      "Sustentabilidade através de materiais reciclados na montagem das exposições"
    ]
  },
  awards: [
    "Prêmio Cultura Viva 2023 - Categoria Artes Visuais",
    "Menção Honrosa no Edital ProAC 2023",
    "Projeto selecionado no Festival de Arte Contemporânea de SP"
  ],
  news: [
    {
      title: "Galeria promete revolucionar cenário artístico paulistano",
      url: "#",
      date: "15/03/2024"
    },
    {
      title: "Projeto cultural recebe apoio de artistas renomados",
      url: "#",
      date: "02/03/2024"
    }
  ],
  updates: [
    {
      title: "Início das obras de reforma do espaço",
      content: "Começamos oficialmente as obras de adequação do espaço da galeria. A previsão é de conclusão em 60 dias.",
      date: "20/03/2024"
    },
    {
      title: "Parcerias confirmadas com universidades",
      content: "Firmamos parcerias com USP e PUC-SP para desenvolvimento de programas educativos integrados.",
      date: "10/03/2024"
    }
  ]
};

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showDocuments, setShowDocuments] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    // Simulate loading project data
    setProject(mockProject);
    // Check if user is logged in (simulate)
    setIsLoggedIn(!!localStorage.getItem('user'));
  }, [id]);

  if (!project) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando projeto...</p>
        </div>
      </div>
    );
  }

  const formatBudget = (budget: number): string => {
    if (budget >= 1000000) {
      return `R$ ${(budget / 1000000).toFixed(1)}M`;
    } else if (budget >= 1000) {
      return `R$ ${(budget / 1000)}k`;
    }
    return `R$ ${budget.toLocaleString('pt-BR')}`;
  };

  const formatTierBudget = (min: number, max?: number): string => {
    if (max) {
      return `R$ ${min.toLocaleString('pt-BR')} - R$ ${max.toLocaleString('pt-BR')}`;
    }
    return `A partir de R$ ${min.toLocaleString('pt-BR')}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a href="/" className="text-2xl font-bold text-blue-600 cursor-pointer" style={{ fontFamily: "Pacifico, serif" }}>
                Porto de Ideias
              </a>
              <span className="text-gray-400">•</span>
              <a href="/projects" className="text-gray-600 hover:text-blue-600 cursor-pointer">Projetos</a>
              <span className="text-gray-400">•</span>
              <span className="text-gray-800 font-medium">{project.title}</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsFavorited(!isFavorited)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isFavorited ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400 hover:text-red-600'
                }`}
              >
                <i className={`ri-heart-${isFavorited ? 'fill' : 'line'}`}></i>
              </button>
              <button 
                onClick={() => window.REACT_APP_NAVIGATE('/auth')}
                className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Entrar na Plataforma
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative">
        <img 
          src={project.image}
          alt={project.title}
          className="w-full h-96 object-cover object-top"
        />
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{project.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90 mb-6">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">{project.category}</span>
                <span className="flex items-center"><i className="ri-map-pin-line mr-1"></i>{project.location}</span>
                <span className="bg-green-500/80 px-3 py-1 rounded-full text-sm">{project.budgetRange}</span>
                <span className="bg-orange-500/80 px-3 py-1 rounded-full text-sm">{project.stage}</span>
                {project.incentiveLaw && (
                  <span className="bg-indigo-500/80 px-3 py-1 rounded-full text-sm">
                    <i className="ri-government-line mr-1"></i>{project.incentiveLaw}
                  </span>
                )}
              </div>
              <button className="bg-white text-gray-800 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors flex items-center">
                <i className="ri-download-line mr-2"></i>
                Baixar apresentação em PDF
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Video */}
            {project.video && (
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Vídeo de Apresentação</h2>
                <div className="relative w-full h-0 pb-[56.25%] rounded-2xl overflow-hidden">
                  <iframe
                    src={project.video}
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    title="Vídeo de apresentação do projeto"
                  ></iframe>
                </div>
              </section>
            )}

            {/* Synopsis and Description */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Sobre o Projeto</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Sinopse</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">{project.synopsis}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Descrição Completa</h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">{project.description}</p>
                </div>
              </div>
            </section>

            {/* Team */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Ficha Técnica</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {project.team.map((member, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-semibold">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-gray-800 flex items-center text-sm">
                        {member.name}
                        {member.verified && (
                          <i className="ri-verified-badge-fill text-blue-600 ml-1 text-sm"></i>
                        )}
                      </h4>
                      <p className="text-xs text-gray-600">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Investment Tiers */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Contrapartidas para Investidores</h2>
              <div className="space-y-6">
                {project.investmentTiers.map((tier, index) => (
                  <div key={index} className="border border-gray-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-800">
                        {formatTierBudget(tier.min, tier.max)}
                      </h3>
                      <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                        {tier.taxBenefits}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {tier.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-start space-x-2">
                          <i className="ri-check-line text-green-600 mt-0.5"></i>
                          <span className="text-gray-600">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* Impact */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Impacto do Projeto</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-2xl">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <i className="ri-palette-line text-blue-600 mr-2"></i>
                    Impacto Cultural
                  </h3>
                  <p className="text-gray-600">{project.impact.cultural}</p>
                </div>
                <div className="bg-green-50 p-6 rounded-2xl">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <i className="ri-community-line text-green-600 mr-2"></i>
                    Impacto Social
                  </h3>
                  <p className="text-gray-600">{project.impact.social}</p>
                </div>
                <div className="bg-purple-50 p-6 rounded-2xl">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <i className="ri-group-line text-purple-600 mr-2"></i>
                    Público Estimado
                  </h3>
                  <p className="text-gray-600">{project.impact.audience}</p>
                </div>
                <div className="bg-orange-50 p-6 rounded-2xl">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <i className="ri-star-line text-orange-600 mr-2"></i>
                    Diferenciais
                  </h3>
                  <ul className="space-y-1">
                    {project.impact.differentials.map((diff, index) => (
                      <li key={index} className="text-gray-600 text-sm flex items-start">
                        <i className="ri-arrow-right-s-line text-orange-600 mt-0.5 mr-1"></i>
                        {diff}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Documents Section */}
            <section>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Documentos do Projeto</h2>
              {isLoggedIn ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <i className="ri-file-chart-line text-2xl text-blue-600"></i>
                      <div>
                        <h4 className="font-semibold text-gray-800">Orçamento Detalhado</h4>
                        <p className="text-sm text-gray-600">Planilha completa com custos do projeto</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 font-semibold">
                      <i className="ri-download-line mr-1"></i>Baixar
                    </button>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <i className="ri-advertisement-line text-2xl text-green-600"></i>
                      <div>
                        <h4 className="font-semibold text-gray-800">Plano de Mídia</h4>
                        <p className="text-sm text-gray-600">Estratégia de divulgação e difusão</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 font-semibold">
                      <i className="ri-download-line mr-1"></i>Baixar
                    </button>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <i className="ri-shield-check-line text-2xl text-purple-600"></i>
                      <div>
                        <h4 className="font-semibold text-gray-800">Certidões e Anexos</h4>
                        <p className="text-sm text-gray-600">Documentação técnica e legal</p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 font-semibold">
                      <i className="ri-download-line mr-1"></i>Baixar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-50 rounded-2xl">
                  <i className="ri-lock-line text-4xl text-gray-400 mb-4"></i>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Documentos Restritos</h3>
                  <p className="text-gray-600 mb-6">Para acessar os documentos completos do projeto, você precisa ter uma conta verificada.</p>
                  <button 
                    onClick={() => window.REACT_APP_NAVIGATE('/auth')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors"
                  >
                    Criar Conta Verificada
                  </button>
                </div>
              )}
            </section>

            {/* Awards and News */}
            {(project.awards || project.news) && (
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Reconhecimentos e Mídia</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {project.awards && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <i className="ri-award-line text-yellow-600 mr-2"></i>
                        Prêmios e Reconhecimentos
                      </h3>
                      <ul className="space-y-2">
                        {project.awards.map((award, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <i className="ri-medal-line text-yellow-600 mt-0.5"></i>
                            <span className="text-gray-600">{award}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {project.news && (
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <i className="ri-newspaper-line text-blue-600 mr-2"></i>
                        Na Mídia
                      </h3>
                      <ul className="space-y-3">
                        {project.news.map((newsItem, index) => (
                          <li key={index}>
                            <a href={newsItem.url} className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                              <h4 className="font-medium text-gray-800 mb-1">{newsItem.title}</h4>
                              <p className="text-sm text-gray-500">{newsItem.date}</p>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Updates */}
            {project.updates && (
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Atualizações do Projeto</h2>
                <div className="space-y-6">
                  {project.updates.map((update, index) => (
                    <div key={index} className="border-l-4 border-blue-600 pl-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800">{update.title}</h3>
                        <span className="text-sm text-gray-500">{update.date}</span>
                      </div>
                      <p className="text-gray-600">{update.content}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              {/* Project Info */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="font-bold text-xl text-gray-800 mb-4">Informações do Projeto</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-500">Orçamento Total</span>
                    <div className="text-2xl font-bold text-gray-800">{formatBudget(project.budget)}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-lg text-gray-800 mb-4">Ações</h3>
                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-full font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center">
                  <i className="ri-message-3-line mr-2"></i>
                  Solicitar Conexão
                </button>
                <button className="w-full bg-green-600 text-white py-3 px-4 rounded-full font-semibold hover:bg-green-700 transition-colors flex items-center justify-center">
                  <i className="ri-hand-heart-line mr-2"></i>
                  Quero Apoiar
                </button>
                <button 
                  onClick={() => setIsFavorited(!isFavorited)}
                  className={`w-full py-3 px-4 rounded-full font-semibold transition-colors flex items-center justify-center ${
                    isFavorited 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'border-2 border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <i className={`ri-heart-${isFavorited ? 'fill' : 'line'} mr-2`}></i>
                  {isFavorited ? 'Salvo nos Favoritos' : 'Salvar nos Favoritos'}
                </button>
              </div>

              {/* Creator Info */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="font-bold text-lg text-gray-800 mb-4">Criador do Projeto</h3>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg font-semibold">
                      {project.creator.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 flex items-center">
                      {project.creator}
                      <i className="ri-verified-badge-fill text-blue-600 ml-2"></i>
                    </h4>
                    <p className="text-sm text-gray-600">Produtora Cultural</p>
                  </div>
                </div>
                <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-full hover:bg-gray-50 transition-colors">
                  Ver Perfil Completo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 mt-16">
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
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Plataforma</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Como Funciona</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Enviar Projeto</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Encontrar Investidores</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Recursos</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Guias</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">FAQ</a></li>
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