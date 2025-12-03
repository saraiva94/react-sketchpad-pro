import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  Target, 
  Heart, 
  CheckCircle, 
  TrendingUp, 
  Shield,
  ArrowRight,
  MapPin,
  Sparkles,
  Lightbulb,
  BarChart3,
  Presentation,
  Search,
  FileText,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPinned
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
  link_pagamento: string | null;
}

const HomePage = () => {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    fetchFeaturedProjects();
  }, []);

  const fetchFeaturedProjects = async () => {
    const { data } = await supabase
      .from("projects")
      .select("id, title, synopsis, project_type, image_url, location, categorias_tags, responsavel_nome, link_pagamento")
      .eq("status", "approved")
      .eq("featured_on_homepage", true)
      .order("created_at", { ascending: true })
      .limit(6);
    
    setFeaturedProjects(data || []);
    setLoadingProjects(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-blue-50/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-3xl font-handwritten font-bold text-primary animate-pulse hover:animate-none transition-all">
            Porto de Ideias
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#inicio" className="text-sm text-foreground hover:text-primary transition-colors">Início</a>
            <a href="#sobre" className="text-sm text-foreground hover:text-primary transition-colors">Sobre</a>
            <a href="#plataforma" className="text-sm text-foreground hover:text-primary transition-colors">Plataforma</a>
            <Link to="/projetos" className="text-sm text-foreground hover:text-primary transition-colors">Projetos</Link>
            <a href="#contato" className="text-sm text-foreground hover:text-primary transition-colors">Contato</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="relative py-24 lg:py-32 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Onde a Cultura Encontra o{" "}
              <span className="text-primary">Investimento</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Conectando o setor cultural com empreendedores e investidores, criando um espaço onde projetos ganham visibilidade e se conectam com os parceiros certos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/submit">
                <Button size="lg" className="w-full sm:w-auto">
                  Cadastre seu Projeto Agora
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/projetos">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary text-primary hover:bg-primary/5">
                  Descubra Projetos para Apoiar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Projetos Culturais em Destaque
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Descubra iniciativas culturais inovadoras que buscam oportunidades de investimento e parceria.
            </p>
          </div>

          {loadingProjects ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-56 bg-muted rounded-t-lg" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                    <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                    <div className="h-16 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredProjects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project) => (
                <Card key={project.id} className="group h-full hover:shadow-lg transition-all duration-300 overflow-hidden bg-card">
                  <div className="relative h-56 overflow-hidden">
                    {project.image_url ? (
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                        <Sparkles className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="text-xs">
                        {project.categorias_tags?.[0] || project.project_type}
                      </Badge>
                      {project.location && (
                        <span className="text-xs text-muted-foreground">{project.location}</span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {project.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                      {project.synopsis}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Users className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {project.responsavel_nome || "Produtor"}
                        </span>
                      </div>
                      <Link to={`/project/${project.id}`}>
                        <Button variant="link" size="sm" className="text-primary p-0">
                          Ver Detalhes
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="max-w-lg mx-auto text-center p-12">
              <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum projeto em destaque</h3>
              <p className="text-muted-foreground mb-6">
                Seja o primeiro a cadastrar um projeto cultural!
              </p>
              <Link to="/submit">
                <Button>Cadastrar Projeto</Button>
              </Link>
            </Card>
          )}

          {featuredProjects.length > 0 && (
            <div className="text-center mt-10">
              <Link to="/projetos">
                <Button variant="outline" size="lg">
                  Ver Todos os Projetos
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Mission Section */}
      <section id="sobre" className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Nossa Missão</h2>
            <p className="text-lg text-muted-foreground">
              Nossa missão é simples, mas transformadora: garantir que as iniciativas culturais recebam a atenção que merecem, aproximando criadores daqueles que podem apoiar, financiar e fortalecer a cultura.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-lg transition-shadow bg-card">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Lightbulb className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="mb-3">Para Criadores</CardTitle>
              <CardDescription className="text-base">
                Mostre seu projeto para quem pode investir de verdade. Não mais apresentações perdidas ou projetos esquecidos em gavetas.
              </CardDescription>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow bg-card">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="mb-3">Para Investidores</CardTitle>
              <CardDescription className="text-base">
                🪙 Encontre oportunidades culturais seguras e bem estruturadas. Projetos curados, sérios e prontos para decolar.
              </CardDescription>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow bg-card">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="mb-3">Para Todos</CardTitle>
              <CardDescription className="text-base">
                🌟 Criamos um ciclo virtuoso: cultura ganha força, investidores encontram propósito, e a sociedade se beneficia.
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Section - For Cultural Producers */}
      <section id="plataforma" className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Um Ecossistema de Conexões</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Mais que uma vitrine, somos um porto seguro onde as ideias atracam, ganham força e partem para o mundo.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h3 className="text-2xl font-bold text-foreground mb-8">Para Produtores Culturais</h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Presentation className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Vitrine de Projetos</h4>
                    <p className="text-muted-foreground">
                      Apresente suas iniciativas culturais com visibilidade profissional e informações detalhadas do projeto.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Credibilidade e Confiança</h4>
                    <p className="text-muted-foreground">
                      Construa confiança com perfis verificados e documentação abrangente do projeto.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Dashboard Completo</h4>
                    <p className="text-muted-foreground">
                      Acompanhe visualizações, favoritos e conexões solicitadas em tempo real.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?w=800"
                alt="Galeria de arte"
                className="rounded-2xl shadow-xl w-full h-[400px] object-cover"
              />
            </div>
          </div>

          {/* For Investors */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img
                src="https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800"
                alt="Reunião de negócios"
                className="rounded-2xl shadow-xl w-full h-[400px] object-cover"
              />
            </div>

            <div className="order-1 lg:order-2">
              <h3 className="text-2xl font-bold text-foreground mb-8">Para Empreendedores e Investidores</h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Search className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Seleção Curada</h4>
                    <p className="text-muted-foreground">
                      Acesso a uma seleção cuidadosamente curada de propostas culturais sérias, criativas e bem estruturadas.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Marco Legal</h4>
                    <p className="text-muted-foreground">
                      Projetos prontos para financiamento através de leis de incentivo cultural ou patrocínio direto.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Dashboard Personalizado</h4>
                    <p className="text-muted-foreground">
                      Gerencie projetos salvos, histórico de contatos e relatórios de impacto das iniciativas apoiadas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contato" className="py-12 bg-slate-900 text-slate-300">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-handwritten text-2xl font-bold text-white mb-4">Porto de Ideias</h3>
              <p className="text-sm mb-4">
                O Porto de Ideias é uma iniciativa da Porto Bello Filmes, criada para aproximar cultura e investimento.
              </p>
              <p className="text-sm italic mb-6">
                Onde a cultura encontra o investimento, e o investimento encontra propósito.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary/80 transition-colors">
                  <Facebook className="w-5 h-5 text-white" />
                </a>
                <a href="#" className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary/80 transition-colors">
                  <Twitter className="w-5 h-5 text-white" />
                </a>
                <a href="#" className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary/80 transition-colors">
                  <Instagram className="w-5 h-5 text-white" />
                </a>
                <a href="#" className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary/80 transition-colors">
                  <Linkedin className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Plataforma</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#plataforma" className="hover:text-white transition-colors">Como Funciona</a></li>
                <li><Link to="/submit" className="hover:text-white transition-colors">Enviar Projeto</Link></li>
                <li><Link to="/projetos" className="hover:text-white transition-colors">Encontrar Investidores</Link></li>
                <li><a href="#" className="hover:text-white transition-colors">Histórias de Sucesso</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contato</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  portobellofilmes@gmail.com
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  +55 (11) 9999-9999
                </li>
                <li className="flex items-center gap-2">
                  <MapPinned className="w-4 h-4" />
                  São Paulo, Brasil
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-700 text-center text-sm">
            © 2024 Porto de Ideias. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;