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
  ArrowRight,
  Sparkles,
  Lightbulb,
  BarChart3,
  Presentation,
  Search,
  FileText,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPinned,
  Anchor
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

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
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-soft">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
              <Anchor className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-3xl md:text-4xl font-handwritten font-bold text-primary pulse-glow">
              Porto de Ideias
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#inicio" className="text-base font-medium text-foreground hover:text-primary transition-colors elegant-link">Início</a>
            <a href="#sobre" className="text-base font-medium text-foreground hover:text-primary transition-colors elegant-link">Sobre</a>
            <a href="#plataforma" className="text-base font-medium text-foreground hover:text-primary transition-colors elegant-link">Plataforma</a>
            <Link to="/projetos" className="text-base font-medium text-foreground hover:text-primary transition-colors elegant-link">Projetos</Link>
            <a href="#contato" className="text-base font-medium text-foreground hover:text-primary transition-colors elegant-link">Contato</a>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="inicio" className="relative py-28 lg:py-40 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-mist via-background to-background" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        
        {/* Decorative elements */}
        <div className="absolute top-1/4 right-[15%] w-2 h-2 bg-primary/40 rounded-full float-gentle" />
        <div className="absolute top-1/3 left-[20%] w-3 h-3 bg-accent/30 rounded-full float-gentle" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 right-[25%] w-2 h-2 bg-primary/30 rounded-full float-gentle" style={{ animationDelay: '2s' }} />
        
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-fade-in-up">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
                <Sparkles className="w-4 h-4" />
                Conectando Cultura e Investimento
              </span>
            </div>
            
            <h1 className="animate-fade-in-up delay-100 text-4xl md:text-5xl lg:text-7xl font-serif font-semibold text-foreground mb-6 leading-tight tracking-tight">
              Onde a <span className="font-handwritten text-5xl md:text-6xl lg:text-8xl gradient-text">Cultura</span> Encontra o{" "}
              <span className="text-primary">Investimento</span>
            </h1>
            
            <p className="animate-fade-in-up delay-200 text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Um porto seguro onde projetos culturais encontram parceiros ideais. 
              Conectamos criadores visionários com investidores que acreditam no poder transformador da cultura.
            </p>
            
            <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/submit">
                <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6 rounded-full shadow-elegant hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
                  Cadastre seu Projeto
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/projetos">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6 rounded-full border-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-primary transition-all duration-300">
                  Explorar Projetos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-mist via-blue-light/30 to-blue-mist" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Em Destaque
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-foreground mb-4 decorative-line">
              Projetos Culturais
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-8 text-lg">
              Descubra iniciativas culturais inovadoras que buscam oportunidades de investimento e parceria.
            </p>
          </div>

          {loadingProjects ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse overflow-hidden">
                  <div className="h-56 bg-muted" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-1/4 mb-3" />
                    <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                    <div className="h-16 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredProjects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProjects.map((project, index) => (
                <Card 
                  key={project.id} 
                  className="group h-full overflow-hidden bg-card/80 backdrop-blur-sm border-border/50 card-hover"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-56 overflow-hidden">
                    {project.image_url ? (
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10">
                        <Sparkles className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="text-xs font-medium bg-primary/5 border-primary/20 text-primary">
                        {project.categorias_tags?.[0] || project.project_type}
                      </Badge>
                      {project.location && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPinned className="w-3 h-3" />
                          {project.location}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-serif font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                      {project.synopsis}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <Users className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">
                          {project.responsavel_nome || "Produtor Cultural"}
                        </span>
                      </div>
                      <Link to={`/project/${project.id}`}>
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 font-medium">
                          Ver mais
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="max-w-lg mx-auto text-center p-12 bg-card/80 backdrop-blur-sm">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-primary/50" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-2">Nenhum projeto em destaque</h3>
              <p className="text-muted-foreground mb-6">
                Seja o primeiro a cadastrar um projeto cultural!
              </p>
              <Link to="/submit">
                <Button className="rounded-full px-8">Cadastrar Projeto</Button>
              </Link>
            </Card>
          )}

          {featuredProjects.length > 0 && (
            <div className="text-center mt-12">
              <Link to="/projetos">
                <Button variant="outline" size="lg" className="rounded-full px-10 border-2 hover:bg-primary/5">
                  Ver Todos os Projetos
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Mission Section */}
      <section id="sobre" className="py-20 lg:py-28 bg-background relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Quem Somos
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-foreground mb-6 decorative-line">
              Nossa Missão
            </h2>
            <p className="text-lg text-muted-foreground mt-8 leading-relaxed">
              Garantir que as iniciativas culturais recebam a atenção que merecem, 
              aproximando criadores daqueles que podem apoiar, financiar e fortalecer a cultura brasileira.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 bg-card/80 backdrop-blur-sm border-border/50 card-hover group">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-elegant group-hover:scale-110 transition-transform duration-300">
                <Lightbulb className="w-10 h-10 text-primary-foreground" />
              </div>
              <CardTitle className="text-xl font-serif mb-3">Para Criadores</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Mostre seu projeto para quem pode investir de verdade. 
                Não mais apresentações perdidas ou projetos esquecidos.
              </CardDescription>
            </Card>

            <Card className="text-center p-8 bg-card/80 backdrop-blur-sm border-border/50 card-hover group">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-elegant group-hover:scale-110 transition-transform duration-300">
                <Target className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-xl font-serif mb-3">Para Investidores</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Encontre oportunidades culturais seguras e bem estruturadas. 
                Projetos curados, sérios e prontos para decolar.
              </CardDescription>
            </Card>

            <Card className="text-center p-8 bg-card/80 backdrop-blur-sm border-border/50 card-hover group">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-elegant group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-xl font-serif mb-3">Para a Sociedade</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                Criamos um ciclo virtuoso: cultura ganha força, 
                investidores encontram propósito, e todos se beneficiam.
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section id="plataforma" className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-mist via-blue-light/30 to-blue-mist" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Como Funciona
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-foreground mb-4 decorative-line">
              Um Ecossistema de Conexões
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-8">
              Mais que uma vitrine, somos um porto seguro onde as ideias atracam, ganham força e partem para o mundo.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <h3 className="text-2xl md:text-3xl font-serif font-semibold text-foreground mb-10">
                Para Produtores Culturais
              </h3>
              
              <div className="space-y-8">
                <div className="flex gap-5 group">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Presentation className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 text-lg">Vitrine de Projetos</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Apresente suas iniciativas culturais com visibilidade profissional e informações detalhadas.
                    </p>
                  </div>
                </div>

                <div className="flex gap-5 group">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 text-lg">Credibilidade</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Construa confiança com perfis verificados e documentação completa do projeto.
                    </p>
                  </div>
                </div>

                <div className="flex gap-5 group">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 text-lg">Dashboard Completo</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Acompanhe visualizações, favoritos e conexões solicitadas em tempo real.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-accent/10 rounded-3xl blur-2xl" />
              <img
                src="https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?w=800"
                alt="Galeria de arte"
                className="relative rounded-2xl shadow-elegant w-full h-[450px] object-cover"
              />
            </div>
          </div>

          {/* For Investors */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-emerald-500/20 to-primary/10 rounded-3xl blur-2xl" />
              <img
                src="https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800"
                alt="Reunião de negócios"
                className="relative rounded-2xl shadow-elegant w-full h-[450px] object-cover"
              />
            </div>

            <div className="order-1 lg:order-2">
              <h3 className="text-2xl md:text-3xl font-serif font-semibold text-foreground mb-10">
                Para Empreendedores e Investidores
              </h3>
              
              <div className="space-y-8">
                <div className="flex gap-5 group">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Search className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 text-lg">Seleção Curada</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Acesso a propostas culturais sérias, criativas e bem estruturadas.
                    </p>
                  </div>
                </div>

                <div className="flex gap-5 group">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 text-lg">Marco Legal</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Projetos prontos para financiamento através de leis de incentivo ou patrocínio direto.
                    </p>
                  </div>
                </div>

                <div className="flex gap-5 group">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <Heart className="w-7 h-7 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2 text-lg">Impacto Real</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Gerencie projetos salvos, histórico de contatos e relatórios de impacto.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contato" className="py-16 bg-slate-900 text-slate-300 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Anchor className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-handwritten text-2xl font-bold text-white">Porto de Ideias</h3>
              </div>
              <p className="text-sm mb-4 text-slate-400 leading-relaxed">
                Uma iniciativa da Porto Bello Filmes, criada para aproximar cultura e investimento.
              </p>
              <p className="text-sm italic text-slate-500">
                "Onde a cultura encontra o investimento."
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4 text-lg">Navegação</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#inicio" className="hover:text-primary transition-colors">Início</a></li>
                <li><a href="#sobre" className="hover:text-primary transition-colors">Sobre</a></li>
                <li><a href="#plataforma" className="hover:text-primary transition-colors">Plataforma</a></li>
                <li><Link to="/projetos" className="hover:text-primary transition-colors">Projetos</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4 text-lg">Ações</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/submit" className="hover:text-primary transition-colors">Cadastrar Projeto</Link></li>
                <li><Link to="/projetos" className="hover:text-primary transition-colors">Explorar Projetos</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4 text-lg">Contato</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  <a href="mailto:contato@portodeideias.com.br" className="hover:text-primary transition-colors">
                    contato@portodeideias.com.br
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>(11) 99999-9999</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPinned className="w-4 h-4 text-primary" />
                  <span>São Paulo, SP</span>
                </li>
              </ul>
              <div className="flex gap-3 mt-6">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            <p>&copy; {new Date().getFullYear()} Porto de Ideias. Todos os direitos reservados.</p>
            <p className="mt-2">Uma iniciativa <span className="text-primary">Porto Bello Filmes</span></p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
