import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";
import portobelloLogo from "@/assets/portobello-logo.png";
import { 
  ArrowLeft, 
  MapPin, 
  DollarSign,
  Calendar,
  Sparkles,
  Heart,
  MessageCircle,
  HandHeart,
  Download,
  Users,
  Target,
  Globe,
  Star,
  FileText,
  Shield,
  BarChart,
  Lock,
  CheckCircle,
  Play,
  Mail,
  Phone,
  Anchor
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  synopsis: string;
  description: string | null;
  project_type: string;
  media_url: string | null;
  has_incentive_law: boolean;
  incentive_law_details: string | null;
  image_url: string | null;
  budget: string | null;
  location: string | null;
  created_at: string;
  categorias_tags: string[] | null;
  responsavel_nome: string | null;
  responsavel_email: string | null;
  link_video: string | null;
  link_pagamento: string | null;
  impacto_cultural: string | null;
  impacto_social: string | null;
  publico_alvo: string | null;
  diferenciais: string | null;
  valor_sugerido: number | null;
}

interface ProjectMember {
  id: string;
  nome: string;
  funcao: string | null;
  email: string | null;
}

const ProjectPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchMembers();
    }
  }, [id]);

  const fetchProject = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .eq("status", "approved")
      .maybeSingle();

    if (!error && data) {
      setProject(data as Project);
    }
    setLoading(false);
  };

  const fetchMembers = async () => {
    const { data } = await supabase
      .from("project_members")
      .select("id, nome, funcao, email")
      .eq("project_id", id);
    
    if (data) {
      setMembers(data);
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

  const getVideoEmbedUrl = (url: string | null): string | null => {
    if (!url) return null;
    
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    return url;
  };

  const getInitials = (name: string): string => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando projeto...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        {/* Simple navbar for not found */}
        <nav className="bg-card/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-border/50">
          <div className="container mx-auto px-6 py-4">
            <Link to="/" className="flex items-center group">
              <img 
                src={portobelloLogo} 
                alt="Porto Bello" 
                className="h-20 w-auto group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-16 text-center">
          <Sparkles className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-bold mb-2">Projeto não encontrado</h1>
          <p className="text-muted-foreground mb-6">
            Este projeto pode não existir ou não estar aprovado ainda.
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
      {/* Navigation Breadcrumb */}
      <nav className="bg-card/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-border/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/porto-de-ideias" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Link>
            </div>
            
            <Link to="/" className="flex items-center group -ml-12">
              <img 
                src={portobelloLogo} 
                alt="Porto Bello" 
                className="h-32 md:h-44 w-auto group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsFavorited(!isFavorited)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isFavorited ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-muted text-muted-foreground hover:text-red-600'
                }`}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative">
        <div className="w-full h-96 overflow-hidden">
          {project.image_url ? (
            <img 
              src={project.image_url}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 flex items-center justify-center">
              <span className="text-8xl font-handwritten text-primary/30">{project.title.charAt(0)}</span>
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">{project.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-white/90 mb-6">
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">{project.project_type}</Badge>
                {project.location && (
                  <span className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-1" />{project.location}
                  </span>
                )}
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
                {project.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Descrição Completa</h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{project.description}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Team */}
            {members.length > 0 && (
              <section>
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6 flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  Ficha Técnica
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center space-x-3 p-4 bg-muted/50 rounded-xl border border-border/50">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-foreground text-sm font-semibold">
                          {getInitials(member.nome)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-foreground text-sm">{member.nome}</h4>
                        {member.funcao && (
                          <p className="text-xs text-muted-foreground">{member.funcao}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Impact */}
            {(project.impacto_cultural || project.impacto_social || project.publico_alvo || project.diferenciais) && (
              <section>
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6 flex items-center gap-2">
                  <Target className="w-6 h-6 text-primary" />
                  Impacto do Projeto
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {project.impacto_cultural && (
                    <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center">
                        <Sparkles className="w-5 h-5 text-primary mr-2" />
                        Impacto Cultural
                      </h3>
                      <p className="text-muted-foreground">{project.impacto_cultural}</p>
                    </div>
                  )}
                  {project.impacto_social && (
                    <div className="bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/10">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center">
                        <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-2" />
                        Impacto Social
                      </h3>
                      <p className="text-muted-foreground">{project.impacto_social}</p>
                    </div>
                  )}
                  {project.publico_alvo && (
                    <div className="bg-violet-500/5 p-6 rounded-2xl border border-violet-500/10">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center">
                        <Users className="w-5 h-5 text-violet-600 dark:text-violet-400 mr-2" />
                        Público Estimado
                      </h3>
                      <p className="text-muted-foreground">{project.publico_alvo}</p>
                    </div>
                  )}
                  {project.diferenciais && (
                    <div className="bg-amber-500/5 p-6 rounded-2xl border border-amber-500/10">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center">
                        <Star className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2" />
                        Diferenciais
                      </h3>
                      <p className="text-muted-foreground">{project.diferenciais}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

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
            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Documentos do Projeto
              </h2>
              <div className="text-center p-8 bg-muted/50 rounded-2xl border border-border">
                <Lock className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Documentos Restritos</h3>
                <p className="text-muted-foreground mb-6">Para acessar os documentos completos do projeto, você precisa ter uma conta verificada.</p>
                <Link to="/auth">
                  <Button className="rounded-full">
                    Criar Conta Verificada
                  </Button>
                </Link>
              </div>
            </section>
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
                      {project.valor_sugerido ? formatBudget(project.valor_sugerido) : (project.budget || "A definir")}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Publicado em</span>
                    <div className="font-medium text-foreground">
                      {new Date(project.created_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                  {project.categorias_tags && project.categorias_tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.categorias_tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="rounded-full">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-lg text-foreground mb-4">Ações</h3>
                <Button className="w-full rounded-full" size="lg">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Solicitar Conexão
                </Button>
                {project.link_pagamento && (
                  <a href={project.link_pagamento} target="_blank" rel="noopener noreferrer" className="block">
                    <Button variant="secondary" className="w-full rounded-full bg-emerald-500 hover:bg-emerald-600 text-white" size="lg">
                      <HandHeart className="w-4 h-4 mr-2" />
                      Quero Apoiar
                    </Button>
                  </a>
                )}
                <Button 
                  variant="outline"
                  className={`w-full rounded-full ${isFavorited ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:border-red-800' : ''}`}
                  size="lg"
                  onClick={() => setIsFavorited(!isFavorited)}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isFavorited ? 'fill-current' : ''}`} />
                  {isFavorited ? 'Salvo nos Favoritos' : 'Salvar nos Favoritos'}
                </Button>
              </div>

              {/* Creator Info */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="font-serif font-bold text-lg text-foreground mb-4">Criador do Projeto</h3>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-lg font-semibold">
                      {project.responsavel_nome ? getInitials(project.responsavel_nome) : 'PC'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground flex items-center">
                      {project.responsavel_nome || "Produtor Cultural"}
                      <CheckCircle className="w-4 h-4 text-primary ml-2" />
                    </h4>
                    <p className="text-sm text-muted-foreground">Produtor(a) Cultural</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full rounded-full">
                  Ver Perfil Completo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ProjectPage;
