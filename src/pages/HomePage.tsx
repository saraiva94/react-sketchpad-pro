import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { AnimatedStats } from "@/components/AnimatedStats";
import { ArtisticBackground } from "@/components/ArtisticBackground";
import { FloatingOrbs } from "@/components/FloatingOrbs";
import { ShinyText } from "@/components/ShinyText";
import { VideoCarousel } from "@/components/VideoCarousel";
import { useInView } from "@/hooks/useInView";
import { 
  Users, 
  Target, 
  Heart, 
  Lightbulb,
  Briefcase,
  Award,
  TrendingUp,
  Film,
  Settings,
  FileText,
  DollarSign,
  Calendar,
  Megaphone,
  Mic,
  HelpCircle,
  MapPin,
  Shield,
  ArrowRight
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
  valor_sugerido: number | null;
  has_incentive_law: boolean;
  incentive_law_details: string | null;
  stage: string | null;
  impacto_cultural: string | null;
  impacto_social: string | null;
}

interface ProjectStats {
  totalProjects: number;
  approvedProjects: number;
  uniqueCreators: number;
  successRate: number;
}

interface VideoItem {
  url: string;
  title?: string;
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
  const [institutionalVideos, setInstitutionalVideos] = useState<VideoItem[]>([]);
  const [loadingVideo, setLoadingVideo] = useState(true);

  useEffect(() => {
    fetchFeaturedProjects();
    fetchStats();
    fetchStatsVisibility();
    fetchInstitutionalVideo();

    // Subscribe to settings changes for real-time sync
    const channel = supabase
      .channel('settings-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'settings'
        },
        (payload) => {
          const record = payload.new as { key: string; value: any };
          if (record.key === 'stats_visible') {
            setStatsVisible(record.value.enabled);
          } else if (record.key === 'institutional_videos') {
            setInstitutionalVideos(record.value.videos || []);
          }
        }
      )
      .subscribe();

    // Subscribe to projects changes for real-time featured projects sync
    const projectsChannel = supabase
      .channel('projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        () => {
          fetchFeaturedProjects();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(projectsChannel);
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

  const fetchInstitutionalVideo = async () => {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "institutional_videos")
      .maybeSingle();
    
    if (data) {
      const videos = (data.value as unknown as { videos: VideoItem[] }).videos || [];
      setInstitutionalVideos(videos);
    }
    setLoadingVideo(false);
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
      .select("id, title, synopsis, project_type, image_url, location, categorias_tags, responsavel_nome, link_pagamento, valor_sugerido, has_incentive_law, incentive_law_details, stage, impacto_cultural, impacto_social")
      .eq("status", "approved")
      .eq("featured_on_homepage", true)
      .order("created_at", { ascending: true })
      .limit(6);
    
    setFeaturedProjects(data || []);
    setLoadingProjects(false);
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

  const getStageInfo = (stage: string | null): { label: string; color: string } => {
    switch (stage) {
      case 'development':
        return { label: "Desenvolvimento", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" };
      case 'production':
        return { label: "Produção", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" };
      case 'distribution':
        return { label: "Difusão", color: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400" };
      default:
        return { label: "Desenvolvimento", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" };
    }
  };

  const getInitials = (name: string | null): string => {
    if (!name) return "PC";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Projetos de exemplo para exibir quando não há projetos reais em destaque
  const exampleProjects = [
    {
      id: "exemplo-cultura-legado",
      title: "Cultura como Legado",
      synopsis: "Cada projeto cultural conta uma história única. Seja parte dessa rede de criadores que estão transformando o cenário cultural brasileiro.",
      project_type: "Audiovisual",
      image_url: null,
      location: "Rio de Janeiro",
      responsavel_nome: "Maria Silva",
      valor_sugerido: 250000,
      has_incentive_law: true,
      incentive_law_details: "Lei Rouanet",
      stage: "development" as const,
      impacto_cultural: "Preservação e difusão da cultura brasileira através de narrativas audiovisuais.",
      link: "/exemplo/cultura-legado",
    },
    {
      id: "exemplo-historias-sucesso",
      title: "Histórias de Sucesso",
      synopsis: "Projetos que começaram aqui já impactaram milhares de pessoas. O próximo sucesso pode ser o seu!",
      project_type: "Teatro",
      image_url: null,
      location: "São Paulo",
      responsavel_nome: "João Santos",
      valor_sugerido: 180000,
      has_incentive_law: true,
      incentive_law_details: "PROAC",
      stage: "production" as const,
      impacto_cultural: "Conexão entre arte e comunidade através de experiências teatrais transformadoras.",
      link: "/exemplo/historias-sucesso",
    },
  ];

  const services = [
    { icon: Film, text: "Desenvolvimento de projetos culturais e audiovisuais", hoverColor: "group-hover:text-rose-500" },
    { icon: Settings, text: "Produção executiva e gestão de equipe", hoverColor: "group-hover:text-amber-500" },
    { icon: FileText, text: "Estruturação para leis de incentivo", hoverColor: "group-hover:text-emerald-500" },
    { icon: DollarSign, text: "Captação de recursos públicos e privados", hoverColor: "group-hover:text-cyan-500" },
    { icon: Calendar, text: "Produção de obras audiovisuais e eventos culturais", hoverColor: "group-hover:text-violet-500" },
    { icon: Megaphone, text: "Distribuição, comunicação e lançamento de projetos", hoverColor: "group-hover:text-pink-500" },
    { icon: Mic, text: "Criação e roteirização de videocasts e podcasts", hoverColor: "group-hover:text-orange-500" },
    { icon: HelpCircle, text: "Consultoria para formatação de projetos", hoverColor: "group-hover:text-sky-500" },
  ];

  // Intersection observers for animations
  const { ref: heroRef, isInView: heroInView } = useInView<HTMLElement>();
  const { ref: quemSomosRef, isInView: quemSomosInView } = useInView<HTMLElement>();
  const { ref: servicosRef, isInView: servicosInView } = useInView<HTMLElement>();
  const { ref: portoIdeiasRef, isInView: portoIdeiasInView } = useInView<HTMLElement>();

  return (
    <div className="min-h-screen bg-background relative">
      {/* Artistic Background Animation */}
      <ArtisticBackground />
      
      {/* Floating Orbs */}
      <FloatingOrbs />
      
      {/* Navbar */}
      <Navbar currentPage="home" />

      {/* Hero Section - Institutional Video Carousel */}
      <section ref={heroRef} id="inicio" className="relative py-20 lg:py-32 overflow-hidden z-10">
        <div className="container mx-auto px-4 relative z-10">
          <div className={`max-w-5xl mx-auto transition-all duration-1000 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <VideoCarousel videos={institutionalVideos} loading={loadingVideo} />
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

      {/* Quem Somos Section */}
      <section ref={quemSomosRef} id="sobre" className="py-20 lg:py-28 relative z-10">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className={`text-center mb-12 transition-all duration-700 ${quemSomosInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <ShinyText className="inline-block" delay={200}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-foreground mb-6 decorative-line">
                Quem Somos
              </h2>
            </ShinyText>
          </div>
          
          <div className={`max-w-5xl mx-auto mb-20 transition-all duration-700 ${quemSomosInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '150ms' }}>
            <div className="text-base md:text-lg text-muted-foreground leading-relaxed space-y-6">
              <p>
                A Porto Bello Filmes é uma produtora audiovisual que nasce da vontade de realização que pulsa em cada uma de nós. Às vezes as coisas que a gente sonha realmente acontecem, o que a gente precisa é correr atrás na prática cotidiana e acreditar que o nosso movimento também movimenta a vida. A nossa equipe une a capacidade de colocar a mão na massa com a sensibilidade de transformar vivências em narrativas para compartilhar com o mundo.
              </p>
              <p>
                Nossos projetos nascem de uma escuta atenta e são atravessados por experiências pessoais e profissionais diversas. Contamos com um time de parceiros que somam seus repertórios e especialidades em cada etapa. Isso fortalece nossas trocas e a forma como organizamos o trabalho para criar, produzir, finalizar e fazer acontecer.
              </p>
              <p>
                Desenvolvemos projetos autorais e também abraçamos histórias que chegam até nós com vontade de ganhar forma. A gente escuta, estrutura, soma e ajuda a colocar no mundo. Essas diferentes perspectivas ampliam nosso repertório e guiam nossas escolhas criativas. Acreditamos no valor do trabalho bem feito, realizado em conjunto com pessoas competentes e comprometidas. É assim que seguimos: com clareza, escuta e entrega.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Lightbulb, title: "Para Criadores", description: "Histórias potentes merecem estrutura sólida. Atuamos no desenvolvimento, organização e produção para tirar ideias do papel e transformá-las em obras realizadas.", color: "from-primary to-accent", textColor: "text-primary-foreground" },
              { icon: Target, title: "Para Investidores", description: "Projetos prontos para investimento, com identidade, força de execução e potencial de retorno institucional.", color: "from-emerald-500 to-emerald-600", textColor: "text-white" },
              { icon: Heart, title: "Para a Sociedade", description: "Criamos experiências que atravessam. Conectamos narrativas a quem importa: as pessoas.", color: "from-violet-500 to-violet-600", textColor: "text-white" },
            ].map((card, index) => (
              <Card 
                key={card.title}
                className={`text-center p-8 card-solid bg-card border-border card-hover group transition-all duration-700 ${quemSomosInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: quemSomosInView ? `${(index + 2) * 150}ms` : '0ms' }}
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${card.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-elegant group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className={`w-10 h-10 ${card.textColor}`} />
                </div>
                <CardTitle className="text-xl font-serif mb-3">{card.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {card.description}
                </CardDescription>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Porto de Ideias Section - Ecossistema de Conexões (Projetos em Destaque) */}
      <section ref={portoIdeiasRef} id="porto-de-ideias" className="py-20 lg:py-28 relative overflow-hidden z-10">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        
        <div className="container mx-auto px-4 relative">
          {/* Header */}
          <div className={`text-center mb-16 transition-all duration-700 ${portoIdeiasInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <ShinyText className="inline-block" delay={300}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-foreground mb-4">
                Um Ecossistema de Conexões
              </h2>
            </ShinyText>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mt-6">
              Mais que uma vitrine, somos um porto seguro onde as ideias atracam, ganham força e partem para o mundo.
            </p>
          </div>

          {/* Featured Projects Grid */}
          {loadingProjects ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse bg-card card-solid rounded-2xl overflow-hidden border border-border shadow-2xl">
                  <div className="h-48 bg-muted" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-16 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Show real featured projects if available, otherwise show example projects */}
              {(featuredProjects.length > 0 ? featuredProjects : exampleProjects).slice(0, 2).map((project, index) => {
                const budgetInfo = getBudgetRange(project.valor_sugerido);
                const stageInfo = getStageInfo(project.stage);
                const isExample = !('categorias_tags' in project);
                
                return (
                  <Link 
                    key={project.id}
                    to={isExample ? (project as typeof exampleProjects[0]).link : `/project/${project.id}`}
                    className={`block group transition-all duration-700 ${portoIdeiasInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                    style={{ transitionDelay: portoIdeiasInView ? `${(index + 1) * 150}ms` : '0ms' }}
                  >
                    <div className="card-solid bg-card border border-border rounded-2xl overflow-hidden shadow-2xl h-full hover:-translate-y-2 transition-transform duration-300">
                      {/* Image */}
                      <div className="relative overflow-hidden h-48">
                        {project.image_url ? (
                          <img
                            src={project.image_url}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center min-h-[192px]">
                            <span className="text-4xl font-handwritten text-primary-foreground">{project.title.charAt(0)}</span>
                          </div>
                        )}
                        {isExample && (
                          <div className="absolute top-3 right-3">
                            <Badge className="bg-amber-500 text-white text-xs">Exemplo</Badge>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 md:p-5 flex-1">
                        {/* Category, Budget Range, Location */}
                        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
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

                        {/* Impact Info */}
                        {project.impacto_cultural && (
                          <div className="mb-3 text-xs text-muted-foreground line-clamp-2">
                            {project.impacto_cultural}
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
                            <span className="text-sm text-muted-foreground truncate max-w-[120px]">
                              {project.responsavel_nome || "Produtor Cultural"}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {isExample ? "Ver Exemplo" : "Ver Detalhes"}
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Nossos Serviços Section */}
      <section ref={servicosRef} id="servicos" className="py-20 lg:py-28 relative z-10">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className={`text-center mb-16 transition-all duration-700 ${servicosInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <ShinyText className="inline-block" delay={200}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-foreground mb-4 decorative-line">
                Nossos Serviços
              </h2>
            </ShinyText>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <Card 
                key={index} 
                className={`group relative overflow-hidden card-solid bg-card border-border transition-all duration-500 hover:-translate-y-1 ${servicosInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ 
                  transitionDelay: servicosInView ? `${(index + 1) * 100}ms` : '0ms',
                }}
              >
                {/* Hover glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 blur-xl" />
                </div>
                
                <div className="relative p-6 flex flex-col items-center text-center gap-4">
                  <div className="relative">
                    <div className={`relative w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-border shadow-lg`}>
                      <service.icon className={`w-8 h-8 text-black ${service.hoverColor} transition-colors duration-300`} />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-foreground/80 transition-colors duration-300 font-medium">
                    {service.text}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
