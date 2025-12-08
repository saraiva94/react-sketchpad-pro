import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";
import { AnimatedStats, defaultStats } from "@/components/AnimatedStats";
import { ArtisticBackground } from "@/components/ArtisticBackground";
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
  Anchor,
  Briefcase,
  Award,
  TrendingUp
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

interface ProjectStats {
  totalProjects: number;
  approvedProjects: number;
  uniqueCreators: number;
  successRate: number;
}

const HomePage = () => {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [stats, setStats] = useState<ProjectStats>({
    totalProjects: 0,
    approvedProjects: 0,
    uniqueCreators: 0,
    successRate: 0
  });
  const [statsVisible, setStatsVisible] = useState(true);

  useEffect(() => {
    fetchFeaturedProjects();
    fetchStats();
    fetchStatsVisibility();

    // Subscribe to settings changes for real-time sync
    const channel = supabase
      .channel('settings-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'settings',
          filter: 'key=eq.stats_visible'
        },
        (payload) => {
          const newValue = (payload.new as { value: { enabled: boolean } }).value;
          setStatsVisible(newValue.enabled);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchStatsVisibility = async () => {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "stats_visible")
      .single();
    
    if (data) {
      setStatsVisible((data.value as { enabled: boolean }).enabled);
    }
  };

  const fetchStats = async () => {
    // Fetch total projects count
    const { count: totalCount } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true });

    // Fetch approved projects count
    const { count: approvedCount } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved");

    // Fetch unique creators (distinct responsavel_nome or responsavel_email)
    const { data: creatorsData } = await supabase
      .from("projects")
      .select("responsavel_email")
      .not("responsavel_email", "is", null);
    
    const uniqueCreators = new Set(creatorsData?.map(p => p.responsavel_email)).size;

    // Calculate success rate
    const successRate = totalCount && totalCount > 0 
      ? Math.round((approvedCount || 0) / totalCount * 100) 
      : 0;

    setStats({
      totalProjects: totalCount || 0,
      approvedProjects: approvedCount || 0,
      uniqueCreators: uniqueCreators || 0,
      successRate: successRate
    });
  };

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
    <div className="min-h-screen bg-background relative">
      {/* Artistic Background Animation */}
      <ArtisticBackground />
      
      {/* Navbar removed for cleaner responsiveness */}

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
            
            <div className="animate-fade-in-up delay-300 flex justify-center">
              <Link to="/porto-de-ideias" className="group">
                <div className="flex items-center gap-4 px-8 py-5 rounded-full border-2 border-accent/30 bg-background/60 backdrop-blur-sm hover:border-accent hover:bg-accent/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow">
                  {/* Animated Lightbulb Container */}
                  <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center group-hover:from-accent group-hover:to-primary transition-all duration-500 flex-shrink-0">
                    {/* Flickering glow effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/0 to-yellow-300/0 group-hover:from-amber-400/60 group-hover:to-yellow-300/40 blur-sm transition-all duration-300" />
                    
                    {/* Lightbulb icon with flicker animation */}
                    <Lightbulb className="w-6 h-6 text-muted-foreground/60 group-hover:text-white animate-flicker group-hover:animate-none transition-colors duration-300 relative z-10" />
                    
                    {/* Light rays on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-0.5 h-3 bg-gradient-to-t from-amber-400 to-transparent" />
                      <div className="absolute top-1 right-0 translate-x-1 w-3 h-0.5 bg-gradient-to-r from-amber-400 to-transparent rotate-45" />
                      <div className="absolute top-1 left-0 -translate-x-1 w-3 h-0.5 bg-gradient-to-l from-amber-400 to-transparent -rotate-45" />
                    </div>
                  </div>
                  
                  <span className="text-4xl md:text-5xl font-handwritten font-bold text-foreground group-hover:text-accent transition-colors duration-300 whitespace-nowrap">
                    Porto de Idéias
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Animated Stats Section - conditionally rendered */}
      {statsVisible && (
        <AnimatedStats stats={[
          {
            label: "Projetos Cadastrados",
            value: stats.totalProjects,
            icon: <Briefcase className="w-8 h-8 text-white" />,
            color: "bg-gradient-to-br from-primary to-blue-600"
          },
          {
            label: "Criadores Culturais",
            value: stats.uniqueCreators,
            icon: <Users className="w-8 h-8 text-white" />,
            color: "bg-gradient-to-br from-emerald-500 to-emerald-600"
          },
          {
            label: "Projetos Aprovados",
            value: stats.approvedProjects,
            icon: <Award className="w-8 h-8 text-white" />,
            color: "bg-gradient-to-br from-violet-500 to-violet-600"
          },
          {
            label: "Taxa de Sucesso",
            value: stats.successRate,
            suffix: "%",
            icon: <TrendingUp className="w-8 h-8 text-white" />,
            color: "bg-gradient-to-br from-amber-500 to-orange-500"
          }
        ]} />
      )}

      {/* Mission Section */}
      <section id="sobre" className="py-20 lg:py-28 relative z-10">
        <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px]" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
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

      <Footer />
    </div>
  );
};

export default HomePage;
