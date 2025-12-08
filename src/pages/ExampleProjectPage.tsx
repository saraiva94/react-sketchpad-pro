import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  MapPin, 
  Download,
  Users,
  Target,
  Globe,
  Star,
  FileText,
  Shield,
  Lock,
  Play,
  Mail,
  Phone,
  Anchor,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Sparkles,
  Heart,
  MessageCircle,
  HandHeart,
  Home,
  Send,
  X
} from "lucide-react";

// Component for Documents Access Request
const DocumentsAccessSection = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    interesse: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim() || !formData.telefone.trim() || !formData.interesse.trim()) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate submission
    setTimeout(() => {
      toast.success("Solicitação enviada com sucesso! A administração entrará em contato.");
      setShowForm(false);
      setFormData({ nome: "", telefone: "", interesse: "" });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section>
      <h2 className="text-2xl font-serif font-bold text-foreground mb-6 flex items-center gap-2">
        <FileText className="w-6 h-6 text-primary" />
        Documentos do Projeto
      </h2>
      <div className="p-6 md:p-8 bg-muted/50 rounded-2xl border border-border">
        {!showForm ? (
          <div className="text-center">
            <Lock className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Documentos Restritos</h3>
            <p className="text-muted-foreground mb-6">
              Para acessar os documentos completos do projeto, solicite acesso à administração.
            </p>
            <Button 
              className="rounded-full"
              onClick={() => setShowForm(true)}
            >
              Solicitar Acesso
            </Button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Solicitar Acesso aos Documentos</h3>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowForm(false)}
                className="rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Nome</label>
                <Input
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="rounded-lg"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Telefone</label>
                <Input
                  type="tel"
                  placeholder="(00) 00000-0000"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="rounded-lg"
                  maxLength={20}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">O que gostaria de acessar?</label>
                <Textarea
                  placeholder="Descreva brevemente quais documentos ou informações você precisa..."
                  value={formData.interesse}
                  onChange={(e) => setFormData({ ...formData, interesse: e.target.value })}
                  className="rounded-lg resize-none"
                  rows={3}
                  maxLength={500}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full rounded-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Enviando..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Solicitação
                  </>
                )}
              </Button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

// Dados fictícios dos projetos de exemplo
const exampleProjects: Record<string, {
  id: string;
  title: string;
  synopsis: string;
  description: string;
  project_type: string;
  image_url: string;
  location: string;
  created_at: string;
  categorias_tags: string[];
  responsavel_nome: string;
  link_video: string | null;
  impacto_cultural: string;
  impacto_social: string;
  publico_alvo: string;
  diferenciais: string;
  valor_sugerido: number;
  has_incentive_law: boolean;
  incentive_law_details: string | null;
  members: { nome: string; funcao: string }[];
}> = {
  "cultura-legado": {
    id: "cultura-legado",
    title: "Sua Cultura, Seu Legado",
    synopsis: "Cada projeto cultural conta uma história única. Seja parte dessa rede de criadores que estão transformando o cenário cultural brasileiro.",
    description: "Este é um exemplo de como seu projeto pode ser apresentado na plataforma Porto de Ideias. Ao submeter seu projeto, você terá acesso a uma página completa como esta, onde investidores e parceiros poderão conhecer todos os detalhes da sua iniciativa cultural.\n\nA plataforma oferece visibilidade para projetos de todas as áreas culturais, desde artes visuais até audiovisual, passando por música, teatro, dança e muito mais. Cada projeto recebe uma página dedicada com informações detalhadas sobre impacto, equipe e oportunidades de investimento.",
    project_type: "Artes Visuais",
    image_url: "https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=1200",
    location: "São Paulo",
    created_at: new Date().toISOString(),
    categorias_tags: ["Arte", "Cultura", "Transformação Social"],
    responsavel_nome: "Maria Silva",
    link_video: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    impacto_cultural: "Resgate e valorização de tradições culturais brasileiras, promovendo o diálogo entre gerações e preservando memórias coletivas através da arte contemporânea.",
    impacto_social: "Formação de 200 jovens em técnicas artísticas, geração de renda para comunidades tradicionais e democratização do acesso à cultura em regiões periféricas.",
    publico_alvo: "Jovens de 15 a 29 anos de comunidades periféricas, artistas emergentes e público interessado em manifestações culturais brasileiras.",
    diferenciais: "Metodologia inovadora que combina técnicas tradicionais com tecnologias digitais, parcerias consolidadas com instituições culturais e histórico comprovado de impacto social.",
    valor_sugerido: 350000,
    has_incentive_law: true,
    incentive_law_details: "Projeto aprovado na Lei Rouanet (PRONAC 12345) e PROAC-ICMS, permitindo dedução fiscal para empresas investidoras.",
    members: [
      { nome: "Maria Silva", funcao: "Diretora Artística" },
      { nome: "João Santos", funcao: "Produtor Executivo" },
      { nome: "Ana Oliveira", funcao: "Coordenadora de Produção" },
      { nome: "Carlos Ferreira", funcao: "Diretor Técnico" }
    ]
  },
  "investidores-aguardam": {
    id: "investidores-aguardam",
    title: "Investidores Aguardam",
    synopsis: "Uma rede de investidores e patrocinadores interessados em apoiar projetos culturais está esperando por você. Faça a conexão acontecer!",
    description: "O Porto de Ideias conecta produtores culturais com investidores qualificados que buscam oportunidades de impacto social e cultural. Nossa plataforma facilita o encontro entre quem tem ideias transformadoras e quem tem recursos para torná-las realidade.\n\nAtravés de ferramentas de matchmaking inteligente, análise de compatibilidade e comunicação facilitada, criamos pontes entre o setor cultural e o corporativo, promovendo parcerias duradouras e mutuamente benéficas.",
    project_type: "Audiovisual",
    image_url: "https://images.unsplash.com/photo-1515169067868-5387ec356754?w=1200",
    location: "Rio de Janeiro",
    created_at: new Date().toISOString(),
    categorias_tags: ["Conexões", "Networking", "Investimento"],
    responsavel_nome: "Pedro Costa",
    link_video: null,
    impacto_cultural: "Fortalecimento do ecossistema cultural brasileiro através da conexão efetiva entre criadores e investidores.",
    impacto_social: "Democratização do acesso a financiamento cultural, especialmente para produtores de regiões menos favorecidas.",
    publico_alvo: "Produtores culturais independentes, empresas com interesse em responsabilidade social e investidores de impacto.",
    diferenciais: "Plataforma tecnológica proprietária, curadoria especializada e acompanhamento personalizado do processo de investimento.",
    valor_sugerido: 500000,
    has_incentive_law: true,
    incentive_law_details: "Compatível com Lei Rouanet, Lei do Audiovisual e incentivos estaduais.",
    members: [
      { nome: "Pedro Costa", funcao: "CEO" },
      { nome: "Lucia Mendes", funcao: "Diretora de Parcerias" },
      { nome: "Roberto Alves", funcao: "Analista de Investimentos" }
    ]
  },
  "historias-sucesso": {
    id: "historias-sucesso",
    title: "Histórias de Sucesso",
    synopsis: "Projetos que começaram aqui já impactaram milhares de pessoas. O próximo sucesso pode ser o seu!",
    description: "Celebramos as conquistas dos projetos que passaram pela plataforma Porto de Ideias e alcançaram seus objetivos. De pequenas iniciativas locais a grandes produções nacionais, cada história de sucesso inspira novos criadores a acreditarem em seus projetos.\n\nNossos cases incluem documentários premiados, festivais consolidados, exposições itinerantes e projetos de formação cultural que transformaram comunidades inteiras. Cada sucesso reforça nossa missão de democratizar o acesso à cultura.",
    project_type: "Teatro",
    image_url: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=1200",
    location: "Belo Horizonte",
    created_at: new Date().toISOString(),
    categorias_tags: ["Sucesso", "Impacto", "Transformação"],
    responsavel_nome: "Fernanda Lima",
    link_video: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    impacto_cultural: "Mais de 50 projetos financiados com sucesso, representando R$ 10 milhões em investimentos culturais mobilizados.",
    impacto_social: "Alcance de mais de 500 mil pessoas através dos projetos apoiados, com presença em todas as regiões do Brasil.",
    publico_alvo: "Toda a sociedade brasileira, com foco especial em comunidades com acesso limitado a bens culturais.",
    diferenciais: "Taxa de sucesso de 92% nos projetos apoiados, mentoria especializada e rede de parceiros estratégicos.",
    valor_sugerido: 750000,
    has_incentive_law: false,
    incentive_law_details: null,
    members: [
      { nome: "Fernanda Lima", funcao: "Diretora Geral" },
      { nome: "Marcus Vinicius", funcao: "Curador" },
      { nome: "Beatriz Santos", funcao: "Produtora" },
      { nome: "Ricardo Nunes", funcao: "Comunicação" },
      { nome: "Camila Rocha", funcao: "Financeiro" }
    ]
  },
  "recursos-disponiveis": {
    id: "recursos-disponiveis",
    title: "Recursos Disponíveis",
    synopsis: "Conectamos projetos a recursos via Lei Rouanet, PROAC, e investimento direto. Encontre o modelo ideal para você.",
    description: "O financiamento cultural no Brasil conta com diversas modalidades, desde incentivos fiscais até investimento privado direto. O Porto de Ideias ajuda produtores a navegarem esse ecossistema complexo, identificando as melhores oportunidades para cada tipo de projeto.\n\nOferecemos orientação sobre Lei Rouanet, Lei do Audiovisual, PROAC, editais públicos, crowdfunding e investimento de impacto. Nossa equipe especializada acompanha cada etapa, desde a captação até a prestação de contas.",
    project_type: "Música",
    image_url: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200",
    location: "Salvador",
    created_at: new Date().toISOString(),
    categorias_tags: ["Financiamento", "Recursos", "Leis de Incentivo"],
    responsavel_nome: "André Souza",
    link_video: null,
    impacto_cultural: "Capacitação de produtores culturais em gestão financeira e captação de recursos, fortalecendo a sustentabilidade do setor.",
    impacto_social: "Ampliação do acesso a recursos públicos e privados para projetos culturais de todas as regiões do país.",
    publico_alvo: "Produtores culturais, gestores de instituições culturais e empreendedores criativos.",
    diferenciais: "Conhecimento profundo das legislações de incentivo, rede de contatos com decisores e histórico comprovado de captação.",
    valor_sugerido: 200000,
    has_incentive_law: true,
    incentive_law_details: "Expertise em todas as modalidades de incentivo fiscal disponíveis no Brasil.",
    members: [
      { nome: "André Souza", funcao: "Consultor Principal" },
      { nome: "Patricia Melo", funcao: "Analista de Projetos" }
    ]
  },
  "comunidade-criativa": {
    id: "comunidade-criativa",
    title: "Comunidade Criativa",
    synopsis: "Junte-se a uma rede de produtores culturais, artistas e investidores que acreditam no poder transformador da cultura.",
    description: "O Porto de Ideias é mais do que uma plataforma de projetos — é uma comunidade vibrante de pessoas apaixonadas por cultura. Conectamos artistas, produtores, curadores, gestores e investidores em um ecossistema colaborativo.\n\nAtravés de eventos, workshops, mentorias e networking, criamos oportunidades para que membros da comunidade troquem experiências, formem parcerias e desenvolvam projetos conjuntos. Juntos, estamos construindo o futuro da cultura brasileira.",
    project_type: "Dança",
    image_url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200",
    location: "Recife",
    created_at: new Date().toISOString(),
    categorias_tags: ["Comunidade", "Networking", "Colaboração"],
    responsavel_nome: "Juliana Araújo",
    link_video: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    impacto_cultural: "Fortalecimento das redes de colaboração no setor cultural, promovendo a diversidade e a inovação.",
    impacto_social: "Criação de oportunidades de trabalho e desenvolvimento profissional para artistas e produtores.",
    publico_alvo: "Profissionais e entusiastas do setor cultural de todas as áreas e níveis de experiência.",
    diferenciais: "Comunidade ativa e engajada, eventos regulares e metodologia de facilitação de conexões.",
    valor_sugerido: 150000,
    has_incentive_law: false,
    incentive_law_details: null,
    members: [
      { nome: "Juliana Araújo", funcao: "Community Manager" },
      { nome: "Diego Torres", funcao: "Curador de Eventos" },
      { nome: "Mariana Costa", funcao: "Facilitadora" }
    ]
  }
};

const ExampleProjectPage = () => {
  const navigate = useNavigate();
  const { exampleId } = useParams();
  const project = exampleId ? exampleProjects[exampleId] : null;

  const formatBudget = (value: number): string => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}k`;
    }
    return `R$ ${value.toLocaleString('pt-BR')}`;
  };

  const getVideoEmbedUrl = (url: string | null): string | null => {
    if (!url) return null;
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    return url;
  };

  const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-soft">
          <div className="container mx-auto px-4 h-20 flex items-center justify-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-glow group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 flex-shrink-0 bg-gradient-to-br from-primary/80 to-accent/80 group-hover:from-primary group-hover:to-accent">
                <Home className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl md:text-2xl font-semibold transition-colors duration-300 text-foreground group-hover:text-primary">
                Homepage
              </span>
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-16 text-center">
          <Sparkles className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-bold mb-2">Projeto de exemplo não encontrado</h1>
          <p className="text-muted-foreground mb-6">
            Este exemplo pode não existir.
          </p>
          <Link to="/porto-de-ideias">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Projetos
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  const embedUrl = getVideoEmbedUrl(project.link_video);

  return (
    <div className="min-h-screen bg-background">
      {/* Custom Navbar for Project Page */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          {/* Back Button - Left */}
          <Link 
            to="/porto-de-ideias"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Voltar</span>
          </Link>
          
          {/* Homepage - Center */}
          <Link to="/" className="flex items-center gap-3 group absolute left-1/2 -translate-x-1/2">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-glow group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 flex-shrink-0 bg-gradient-to-br from-primary/80 to-accent/80 group-hover:from-primary group-hover:to-accent">
              <Home className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl md:text-2xl font-semibold transition-colors duration-300 text-foreground group-hover:text-primary hidden md:inline">
              Homepage
            </span>
          </Link>
          
          {/* Theme Toggle - Right */}
          <ThemeToggle />
        </div>
      </header>

      {/* Example Banner */}
      <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border-b border-primary/20">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-center gap-2 text-sm text-primary">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">Este é um exemplo de como seu projeto pode ser apresentado.</span>
            <Link to="/submit" className="underline hover:no-underline font-semibold">
              Cadastre-se!
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative">
        <div className="w-full h-96 overflow-hidden">
          <img 
            src={project.image_url}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">{project.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-white/90 mb-6">
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">{project.project_type}</Badge>
                <span className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-1" />{project.location}
                </span>
                {project.has_incentive_law && (
                  <Badge className="bg-violet-500/80 hover:bg-violet-500 text-white border-0">
                    <Shield className="w-3 h-3 mr-1" />Lei de Incentivo
                  </Badge>
                )}
              </div>
              <Button variant="secondary" className="rounded-full">
                <Download className="w-4 h-4 mr-2" />
                Baixar apresentação em PDF
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Video */}
            {embedUrl && (
              <section>
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6 flex items-center gap-2">
                  <Play className="w-6 h-6 text-primary" />
                  Vídeo de Apresentação
                </h2>
                <div className="relative w-full h-0 pb-[56.25%] rounded-2xl overflow-hidden shadow-lg">
                  <iframe
                    src={embedUrl}
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
              <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Sobre o Projeto</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Sinopse</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">{project.synopsis}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Descrição Completa</h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{project.description}</p>
                </div>
              </div>
            </section>

            {/* Team */}
            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-6 flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                Ficha Técnica
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {project.members.map((member, index) => (
                  <div key={index} className="flex items-center space-x-3 p-4 bg-muted/50 rounded-xl border border-border/50">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-foreground text-sm font-semibold">
                        {getInitials(member.nome)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-foreground text-sm">{member.nome}</h4>
                      <p className="text-xs text-muted-foreground">{member.funcao}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Impact */}
            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-primary" />
                Impacto do Projeto
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center">
                    <Sparkles className="w-5 h-5 text-primary mr-2" />
                    Impacto Cultural
                  </h3>
                  <p className="text-muted-foreground">{project.impacto_cultural}</p>
                </div>
                <div className="bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/10">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center">
                    <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-2" />
                    Impacto Social
                  </h3>
                  <p className="text-muted-foreground">{project.impacto_social}</p>
                </div>
                <div className="bg-violet-500/5 p-6 rounded-2xl border border-violet-500/10">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center">
                    <Users className="w-5 h-5 text-violet-600 dark:text-violet-400 mr-2" />
                    Público Estimado
                  </h3>
                  <p className="text-muted-foreground">{project.publico_alvo}</p>
                </div>
                <div className="bg-amber-500/5 p-6 rounded-2xl border border-amber-500/10">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center">
                    <Star className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2" />
                    Diferenciais
                  </h3>
                  <p className="text-muted-foreground">{project.diferenciais}</p>
                </div>
              </div>
            </section>

            {/* Incentive Law */}
            {project.has_incentive_law && project.incentive_law_details && (
              <section>
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-primary" />
                  Lei de Incentivo
                </h2>
                <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl">
                  <p className="text-muted-foreground">{project.incentive_law_details}</p>
                </div>
              </section>
            )}

            {/* Documents Section */}
            <DocumentsAccessSection />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Project Info */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="font-serif font-bold text-xl text-foreground mb-4">Informações do Projeto</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Orçamento Total</span>
                    <div className="text-2xl font-bold text-foreground">
                      {formatBudget(project.valor_sugerido)}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Publicado em</span>
                    <div className="font-medium text-foreground">
                      {new Date(project.created_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.categorias_tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="rounded-full">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-lg text-foreground mb-4">Ações</h3>
                <Button className="w-full rounded-full" size="lg">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Solicitar Conexão
                </Button>
                <Button variant="secondary" className="w-full rounded-full" size="lg">
                  <HandHeart className="w-4 h-4 mr-2" />
                  Apoiar Projeto
                </Button>
                <Button variant="outline" className="w-full rounded-full" size="lg">
                  <Heart className="w-4 h-4 mr-2" />
                  Salvar nos Favoritos
                </Button>
              </div>

              {/* Creator Info */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="font-serif font-bold text-lg text-foreground mb-4">Responsável</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-semibold">
                      {getInitials(project.responsavel_nome)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{project.responsavel_nome}</h4>
                    <p className="text-sm text-muted-foreground">Produtor Cultural</p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 border border-primary/30 rounded-2xl p-6">
                <h3 className="font-serif font-bold text-lg text-foreground mb-2">Tem um projeto?</h3>
                <p className="text-sm text-muted-foreground mb-4">Sua ideia cultural também pode ter uma página como esta!</p>
                <Link to="/submit">
                  <Button className="w-full rounded-full">
                    Submeter Meu Projeto
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-foreground text-background py-6 md:py-8 mt-8 md:mt-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-1.5 mb-2">
                <Anchor className="w-5 h-5 text-primary" />
                <span className="text-base md:text-lg font-handwritten font-bold text-primary">
                  Porto de Ideias
                </span>
              </div>
              <p className="text-background/70 mb-2 text-xs leading-relaxed">
                Iniciativa da Porto Bello Filmes para aproximar cultura e investimento.
              </p>
              <div className="flex space-x-2">
                <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors">
                  <Facebook className="w-3 h-3 text-primary-foreground" />
                </div>
                <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors">
                  <Twitter className="w-3 h-3 text-primary-foreground" />
                </div>
                <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors">
                  <Instagram className="w-3 h-3 text-primary-foreground" />
                </div>
                <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors">
                  <Linkedin className="w-3 h-3 text-primary-foreground" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-sm mb-2 text-background">Plataforma</h3>
              <ul className="space-y-1 text-background/70 text-xs">
                <li><a href="#" className="hover:text-background transition-colors">Como Funciona</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Enviar Projeto</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Investidores</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-sm mb-2 text-background">Suporte</h3>
              <ul className="space-y-1 text-background/70 text-xs">
                <li><a href="#" className="hover:text-background transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Ajuda</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Termos</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-sm mb-2 text-background">Contato</h3>
              <ul className="space-y-1 text-background/70 text-xs">
                <li className="flex items-center space-x-1.5">
                  <Mail className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">portobellofilmes@gmail.com</span>
                </li>
                <li className="flex items-center space-x-1.5">
                  <Phone className="w-3 h-3 flex-shrink-0" />
                  <span>+55 (11) 9999-9999</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-background/20 mt-4 md:mt-6 pt-4 text-center text-background/70 text-xs">
            <p>&copy; 2024 Porto de Ideias. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ExampleProjectPage;
