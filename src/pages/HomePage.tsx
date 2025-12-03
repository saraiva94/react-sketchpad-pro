import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
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
  LogOut,
  User,
  Settings
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  synopsis: string;
  project_type: string;
  image_url: string | null;
  location: string | null;
  budget: string | null;
}

const HomePage = () => {
  const { user, isAdmin, signOut, loading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    fetchApprovedProjects();
  }, []);

  const fetchApprovedProjects = async () => {
    const { data } = await supabase
      .from("projects")
      .select("id, title, synopsis, project_type, image_url, location, budget")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(6);
    
    setProjects(data || []);
    setLoadingProjects(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-foreground">
            Porto de Ideias
          </Link>
          
          <nav className="flex items-center gap-4">
            {loading ? null : user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Meus Projetos
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm">Entrar</Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm">Cadastrar</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-accent/10 text-accent border-accent/20">
              <Sparkles className="w-3 h-3 mr-1" />
              Plataforma Cultural
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Onde a Cultura Encontra o{" "}
              <span className="text-accent">Investimento</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Conectando projetos culturais com empresas e investidores interessados em gerar impacto social através da cultura e das leis de incentivo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={user ? "/dashboard" : "/auth"}>
                <Button size="lg" className="w-full sm:w-auto">
                  Cadastrar um Projeto agora
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Procurando Projetos para Investir
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-16 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Projetos Culturais em Destaque
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Descubra projetos culturais incríveis que estão transformando comunidades e gerando impacto positivo.
            </p>
          </div>

          {loadingProjects ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                    <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                    <div className="h-16 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link to={`/project/${project.id}`} key={project.id}>
                  <Card className="group h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                    <div className="relative h-48 overflow-hidden bg-muted">
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
                      <Badge className="absolute top-3 left-3 bg-card/90 text-foreground">
                        {project.project_type}
                      </Badge>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {project.synopsis}
                      </p>
                      {project.location && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3 mr-1" />
                          {project.location}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="max-w-lg mx-auto text-center p-12">
              <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum projeto ainda</h3>
              <p className="text-muted-foreground mb-6">
                Seja o primeiro a cadastrar um projeto cultural!
              </p>
              <Link to={user ? "/dashboard" : "/auth"}>
                <Button>Cadastrar Projeto</Button>
              </Link>
            </Card>
          )}

          {projects.length > 0 && (
            <div className="text-center mt-10">
              <Button variant="outline" size="lg">
                Ver Todos os Projetos
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">Nossa Missão</h2>
            <p className="text-lg text-muted-foreground">
              Acreditamos no poder transformador da cultura e criamos pontes entre quem sonha e quem investe, fortalecendo o ecossistema cultural brasileiro.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="mb-3">Para Criadores</CardTitle>
              <CardDescription>
                Dê visibilidade ao seu projeto cultural e conecte-se com investidores interessados em apoiar a cultura.
              </CardDescription>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="mb-3">Para Investidores</CardTitle>
              <CardDescription>
                Encontre projetos culturais alinhados aos seus valores e maximize o impacto social do seu investimento.
              </CardDescription>
            </Card>

            <Card className="text-center p-8 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="mb-3">Para Todos</CardTitle>
              <CardDescription>
                Contribua para um ecossistema cultural mais forte, diverso e acessível para toda a sociedade.
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Um Ecossistema de Conexões
              </h2>
              <p className="text-primary-foreground/80 mb-8">
                Nossa plataforma foi criada para facilitar a conexão entre produtores culturais e investidores, gerando valor para todos os envolvidos.
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">Projetos Verificados</h4>
                    <p className="text-sm text-primary-foreground/70">
                      Todos os projetos passam por uma curadoria antes de serem publicados.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <TrendingUp className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">Leis de Incentivo</h4>
                    <p className="text-sm text-primary-foreground/70">
                      Suporte especializado para projetos com incentivo fiscal.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Shield className="w-6 h-6 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold mb-1">Conexões Seguras</h4>
                    <p className="text-sm text-primary-foreground/70">
                      Ambiente seguro para negociações entre criadores e investidores.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 text-center bg-primary-foreground/10 border-primary-foreground/20">
                <div className="text-4xl font-bold text-accent mb-2">150+</div>
                <p className="text-sm text-primary-foreground/80">Projetos Cadastrados</p>
              </Card>
              <Card className="p-6 text-center bg-primary-foreground/10 border-primary-foreground/20">
                <div className="text-4xl font-bold text-accent mb-2">85</div>
                <p className="text-sm text-primary-foreground/80">Empresas Parceiras</p>
              </Card>
              <Card className="p-6 text-center bg-primary-foreground/10 border-primary-foreground/20">
                <div className="text-4xl font-bold text-accent mb-2">R$ 10M</div>
                <p className="text-sm text-primary-foreground/80">Em Investimentos</p>
              </Card>
              <Card className="p-6 text-center bg-primary-foreground/10 border-primary-foreground/20">
                <div className="text-4xl font-bold text-accent mb-2">92%</div>
                <p className="text-sm text-primary-foreground/80">Taxa de Satisfação</p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-accent text-accent-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para Transformar o Investimento Cultural?
          </h2>
          <p className="text-lg text-accent-foreground/90 mb-8 max-w-2xl mx-auto">
            Faça parte dessa comunidade e conecte seu projeto com investidores que acreditam no poder da cultura.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={user ? "/dashboard" : "/auth"}>
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Cadastrar um Projeto agora
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-accent-foreground/20 text-accent-foreground hover:bg-accent-foreground/10">
              Procurando Projetos para Investir
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Porto de Ideias</h3>
              <p className="text-sm text-muted-foreground">
                Conectando cultura e investimento para transformar o Brasil.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Navegação</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
                <li><Link to="/auth" className="hover:text-foreground transition-colors">Entrar</Link></li>
                <li><Link to="/auth" className="hover:text-foreground transition-colors">Cadastrar</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Termos de Uso</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>contato@portodeideias.com.br</li>
                <li>(11) 99999-9999</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2024 Porto de Ideias. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
