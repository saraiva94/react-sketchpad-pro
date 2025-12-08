import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { 
  Lightbulb, 
  Handshake, 
  TrendingUp,
  Presentation,
  Shield,
  BarChart3,
  Search,
  FileText,
  Heart,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Anchor
} from "lucide-react";

const PortoDeIdeiasPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar currentPage="porto-de-ideias" />

      {/* Hero Section */}
      <section id="home" className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-foreground mb-6 leading-tight">
              Onde a Cultura Encontra o <span className="text-primary">Investimento</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Conectando o setor cultural com empreendedores e investidores, criando um espaço onde projetos ganham visibilidade e se conectam com os parceiros certos.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link to="/auth">
                <Button size="lg" className="px-8 py-6 rounded-full text-lg font-semibold shadow-lg hover:shadow-glow transition-all">
                  Cadastre seu Projeto Agora
                </Button>
              </Link>
              <Link to="/projetos">
                <Button size="lg" variant="outline" className="px-8 py-6 rounded-full text-lg font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                  Descubra Projetos para Apoiar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Preview */}
      <section id="projects" className="py-20 bg-card">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6">Projetos Culturais em Destaque</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Descubra iniciativas culturais inovadoras que buscam oportunidades de investimento e parceria.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Project Card 1 */}
            <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <span className="text-6xl">🎨</span>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full">Artes Visuais</span>
                  <span className="text-muted-foreground text-sm">São Paulo</span>
                </div>
                <h3 className="font-bold text-xl text-foreground mb-3">Galeria de Arte Contemporânea</h3>
                <p className="text-muted-foreground mb-4">Um espaço de galeria moderna dedicado a artistas contemporâneos emergentes, oferecendo oportunidades de exposição.</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-primary text-sm font-bold">MS</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Maria Santos</span>
                  </div>
                  <span className="text-primary font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Ver Detalhes <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>

            {/* Project Card 2 */}
            <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
              <div className="h-48 bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                <span className="text-6xl">🎭</span>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-violet-500/10 text-violet-600 dark:text-violet-400 text-sm font-medium px-3 py-1 rounded-full">Teatro</span>
                  <span className="text-muted-foreground text-sm">Rio de Janeiro</span>
                </div>
                <h3 className="font-bold text-xl text-foreground mb-3">Iniciativa de Teatro Comunitário</h3>
                <p className="text-muted-foreground mb-4">Construindo um espaço teatral comunitário que reúne talentos locais e oferece entretenimento cultural acessível.</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-violet-500/20 rounded-full flex items-center justify-center">
                      <span className="text-violet-600 dark:text-violet-400 text-sm font-bold">JS</span>
                    </div>
                    <span className="text-sm text-muted-foreground">João Silva</span>
                  </div>
                  <span className="text-primary font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Ver Detalhes <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>

            {/* Project Card 3 */}
            <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
              <div className="h-48 bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
                <span className="text-6xl">🎵</span>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-medium px-3 py-1 rounded-full">Música</span>
                  <span className="text-muted-foreground text-sm">Belo Horizonte</span>
                </div>
                <h3 className="font-bold text-xl text-foreground mb-3">Festival Cultural de Música</h3>
                <p className="text-muted-foreground mb-4">Festival anual celebrando tradições musicais regionais enquanto promove artistas emergentes e diversidade cultural.</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <span className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">AC</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Ana Costa</span>
                  </div>
                  <span className="text-primary font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Ver Detalhes <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link to="/projetos">
              <Button variant="outline" size="lg" className="rounded-full px-8 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Ver Todos os Projetos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="about" className="py-20 bg-muted/50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-8">Nossa Missão</h2>
            <p className="text-xl text-muted-foreground leading-relaxed mb-12">
              Nossa missão é simples, mas transformadora: garantir que as iniciativas culturais recebam a atenção que merecem, aproximando criadores daqueles que podem apoiar, financiar e fortalecer a cultura.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-background p-8 rounded-2xl shadow-sm border border-border hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lightbulb className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Para Criadores</h3>
                <p className="text-muted-foreground">
                  Mostre seu projeto para quem pode investir de verdade. Não mais apresentações perdidas ou projetos esquecidos em gavetas.
                </p>
              </div>

              <div className="bg-background p-8 rounded-2xl shadow-sm border border-border hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Handshake className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Para Investidores</h3>
                <p className="text-muted-foreground">
                  💰 Encontre oportunidades culturais seguras e bem estruturadas. Projetos curados, sérios e prontos para decolar.
                </p>
              </div>

              <div className="bg-background p-8 rounded-2xl shadow-sm border border-border hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-violet-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Para Todos</h3>
                <p className="text-muted-foreground">
                  🌟 Criamos um ciclo virtuoso: cultura ganha força, investidores encontram propósito, e a sociedade se beneficia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section id="platform" className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6">Um Ecossistema de Conexões</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Mais que uma vitrine, somos um porto seguro onde as ideias atracam, ganham força e partem para o mundo.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
              {/* For Producers */}
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-6">Para Produtores Culturais</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Presentation className="text-primary-foreground w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Vitrine de Projetos</h4>
                      <p className="text-muted-foreground">Apresente suas iniciativas culturais com visibilidade profissional e informações detalhadas do projeto.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="text-primary-foreground w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Credibilidade e Confiança</h4>
                      <p className="text-muted-foreground">Construa confiança com perfis verificados e documentação abrangente do projeto.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="text-primary-foreground w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Dashboard Completo</h4>
                      <p className="text-muted-foreground">Acompanhe visualizações, favoritos e conexões solicitadas em tempo real.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="w-full h-80 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 rounded-2xl shadow-xl flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-8xl">🎨</span>
                    <p className="mt-4 text-muted-foreground font-medium">Produtores Culturais</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="lg:order-2">
                <h3 className="text-2xl font-bold text-foreground mb-6">Para Empreendedores e Investidores</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Search className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Seleção Curada</h4>
                      <p className="text-muted-foreground">Acesso a uma seleção cuidadosamente curada de propostas culturais sérias, criativas e bem estruturadas.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <FileText className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Marco Legal</h4>
                      <p className="text-muted-foreground">Projetos prontos para financiamento através de leis de incentivo cultural ou patrocínio direto.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Heart className="text-white w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Dashboard Personalizado</h4>
                      <p className="text-muted-foreground">Gerencie projetos salvos, histórico de contatos e relatórios de impacto das iniciativas apoiadas.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:order-1 relative">
                <div className="w-full h-80 bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-emerald-500/5 rounded-2xl shadow-xl flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-8xl">💼</span>
                    <p className="mt-4 text-muted-foreground font-medium">Investidores</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center text-primary-foreground">
            <div>
              <div className="text-4xl font-bold mb-2">150+</div>
              <div className="text-primary-foreground/80">Projetos Culturais</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">85</div>
              <div className="text-primary-foreground/80">Investidores Ativos</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">R$ 10M</div>
              <div className="text-primary-foreground/80">Total Financiado</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">92%</div>
              <div className="text-primary-foreground/80">Taxa de Sucesso</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-6">
              Pronto para Transformar o Investimento Cultural?
            </h2>
            <p className="text-xl text-primary-foreground/90 mb-8">
              Entre no Porto de Ideias hoje e faça parte de um ecossistema onde a cultura encontra o investimento, e o investimento encontra propósito.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link to="/auth">
                <Button size="lg" variant="secondary" className="px-8 py-6 rounded-full text-lg font-semibold shadow-lg">
                  Cadastre seu Projeto Agora
                </Button>
              </Link>
              <Link to="/projetos">
                <Button size="lg" variant="outline" className="px-8 py-6 rounded-full text-lg font-semibold border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  Descubra Projetos para Apoiar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-foreground text-background py-16">
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
              <p className="text-background/70 mb-6 text-sm">
                Onde a cultura encontra o investimento, e o investimento encontra propósito.
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
                <li><a href="#" className="hover:text-background transition-colors cursor-pointer">Como Funciona</a></li>
                <li><a href="#" className="hover:text-background transition-colors cursor-pointer">Enviar Projeto</a></li>
                <li><a href="#" className="hover:text-background transition-colors cursor-pointer">Encontrar Investidores</a></li>
                <li><a href="#" className="hover:text-background transition-colors cursor-pointer">Histórias de Sucesso</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4 text-background">Suporte</h3>
              <ul className="space-y-2 text-background/70">
                <li><a href="#" className="hover:text-background transition-colors cursor-pointer">FAQ</a></li>
                <li><a href="#" className="hover:text-background transition-colors cursor-pointer">Ajuda</a></li>
                <li><a href="#" className="hover:text-background transition-colors cursor-pointer">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-background transition-colors cursor-pointer">Privacidade</a></li>
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
                <li className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>São Paulo, Brasil</span>
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
