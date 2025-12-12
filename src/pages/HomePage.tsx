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
import { ShinyText } from "@/components/ShinyText";
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
  Play,
  LayoutGrid,
  ShieldCheck,
  BarChart3,
  Search,
  FileCheck,
  HeartHandshake
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
  const [institutionalVideoUrl, setInstitutionalVideoUrl] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(true);
  
  // Mídias da seção Ecossistema
  const [ecossistemaProducerMedia, setEcossistemaProducerMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);
  const [ecossistemaInvestorMedia, setEcossistemaInvestorMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);

  useEffect(() => {
    fetchFeaturedProjects();
    fetchStats();
    fetchStatsVisibility();
    fetchInstitutionalVideo();
    fetchEcossistemaMedia();

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
          } else if (record.key === 'institutional_video') {
            setInstitutionalVideoUrl(record.value.url);
          } else if (record.key === 'ecossistema_producer_media') {
            setEcossistemaProducerMedia(record.value);
          } else if (record.key === 'ecossistema_investor_media') {
            setEcossistemaInvestorMedia(record.value);
          }
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

  const fetchInstitutionalVideo = async () => {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "institutional_video")
      .single();
    
    if (data) {
      setInstitutionalVideoUrl((data.value as { url: string }).url || null);
    }
    setLoadingVideo(false);
  };

  const fetchEcossistemaMedia = async () => {
    const { data: producerData } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "ecossistema_producer_media")
      .single();
    
    if (producerData) {
      setEcossistemaProducerMedia(producerData.value as { url: string; type: 'image' | 'video' });
    }

    const { data: investorData } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "ecossistema_investor_media")
      .single();
    
    if (investorData) {
      setEcossistemaInvestorMedia(investorData.value as { url: string; type: 'image' | 'video' });
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

  const services = [
    { icon: Film, text: "Desenvolvimento de projetos culturais e audiovisuais", hoverColor: "group-hover:text-rose-500", glowColor: "group-hover:bg-rose-500/20", borderColor: "group-hover:border-rose-500/30" },
    { icon: Settings, text: "Produção executiva e gestão de equipe", hoverColor: "group-hover:text-amber-500", glowColor: "group-hover:bg-amber-500/20", borderColor: "group-hover:border-amber-500/30" },
    { icon: FileText, text: "Estruturação para leis de incentivo", hoverColor: "group-hover:text-emerald-500", glowColor: "group-hover:bg-emerald-500/20", borderColor: "group-hover:border-emerald-500/30" },
    { icon: DollarSign, text: "Captação de recursos públicos e privados", hoverColor: "group-hover:text-cyan-500", glowColor: "group-hover:bg-cyan-500/20", borderColor: "group-hover:border-cyan-500/30" },
    { icon: Calendar, text: "Produção de obras audiovisuais e eventos culturais", hoverColor: "group-hover:text-violet-500", glowColor: "group-hover:bg-violet-500/20", borderColor: "group-hover:border-violet-500/30" },
    { icon: Megaphone, text: "Distribuição, comunicação e lançamento de projetos", hoverColor: "group-hover:text-pink-500", glowColor: "group-hover:bg-pink-500/20", borderColor: "group-hover:border-pink-500/30" },
    { icon: Mic, text: "Criação e roteirização de videocasts e podcasts", hoverColor: "group-hover:text-orange-500", glowColor: "group-hover:bg-orange-500/20", borderColor: "group-hover:border-orange-500/30" },
    { icon: HelpCircle, text: "Consultoria para formatação de projetos", hoverColor: "group-hover:text-sky-500", glowColor: "group-hover:bg-sky-500/20", borderColor: "group-hover:border-sky-500/30" },
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
      
      {/* Navbar */}
      <Navbar currentPage="home" />

      {/* Hero Section - Institutional Video */}
      <section ref={heroRef} id="inicio" className="relative py-20 lg:py-32 overflow-hidden z-10">
        {/* Semi-transparent background to let particles show through */}
        <div className="absolute inset-0 bg-background/60" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className={`max-w-5xl mx-auto transition-all duration-1000 ${heroInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Video Container */}
            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-border/30 bg-gradient-to-br from-card via-card/95 to-card/90">
              {loadingVideo ? (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                  <Skeleton className="absolute inset-0 w-full h-full" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center backdrop-blur-sm border border-primary/20 shadow-lg animate-pulse">
                      <Play className="w-12 h-12 text-primary ml-1" />
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground text-sm">Carregando...</p>
                    </div>
                  </div>
                </>
              ) : institutionalVideoUrl ? (
                <video
                  src={institutionalVideoUrl}
                  controls
                  className="w-full h-full object-cover"
                  poster=""
                >
                  Seu navegador não suporta vídeos.
                </video>
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                    <div className="relative">
                      <div className="absolute inset-0 w-28 h-28 rounded-full bg-primary/20 blur-xl animate-pulse" />
                      <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center backdrop-blur-sm border border-primary/30 shadow-2xl group hover:scale-105 transition-transform duration-300">
                        <Play className="w-12 h-12 text-primary ml-1 group-hover:scale-110 transition-transform" />
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-foreground/80 font-medium text-lg">Vídeo Institucional</p>
                      <p className="text-muted-foreground text-sm">Em breve</p>
                    </div>
                  </div>
                  {/* Decorative corners */}
                  <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-primary/30 rounded-tl-lg" />
                  <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-primary/30 rounded-tr-lg" />
                  <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-primary/30 rounded-bl-lg" />
                  <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-primary/30 rounded-br-lg" />
                </>
              )}
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

      {/* Quem Somos Section */}
      <section ref={quemSomosRef} id="sobre" className="py-20 lg:py-28 relative z-10">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px]" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className={`max-w-3xl mx-auto text-center mb-16 transition-all duration-700 ${quemSomosInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <ShinyText className="inline-block" delay={200}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-foreground mb-6 decorative-line">
                Quem Somos
              </h2>
            </ShinyText>
            <div className="text-base md:text-lg text-muted-foreground mt-8 leading-relaxed space-y-6 text-left">
              <p>
                A Porto Bello Filmes é uma produtora audiovisual que nasce da vontade de realização que pulsa em cada uma de nós. Às vezes as coisas que a gente sonha realmente acontecem, o que a gente precisa é correr atrás na prática cotidiana e acreditar que o nosso movimento também movimenta a vida. A nossa equipe une a capacidade de colocar a mão na massa com a sensibilidade de transformar vivências em narrativas para compartilhar com o mundo.
              </p>
              <p>
                Nossos projetos nascem de uma escuta atenta e são atravessados por experiências pessoais e profissionais diversas. Contamos com um time de parceiros que somam seus repertórios e especialidades em cada etapa. Isso fortalece nossas trocas e a forma como organizamos o trabalho para criar, produzir, finalizar e fazer acontecer.
              </p>
              <p>
                Desenvolvemos projetos autorais e também abraçamos histórias que chegam até nós com vontade de ganhar forma. A gente escuta, estrutura, soma e ajuda a colocar no mundo. Essas diferentes perspectivas ampliam nosso repertório e guiam nossas escolhas criativas.
              </p>
              <p>
                Acreditamos no valor do trabalho bem feito, realizado em conjunto com pessoas competentes e comprometidas. É assim que seguimos: com clareza, escuta e entrega.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Lightbulb, title: "Para Criadores", description: "Histórias potentes merecem estrutura sólida. Atuamos no desenvolvimento, organização e produção para tirar ideias do papel e transformá-las em obras realizadas.", color: "from-primary to-primary/80", textColor: "text-primary-foreground" },
              { icon: Target, title: "Para Investidores", description: "Projetos prontos para investimento, com identidade, força de execução e potencial de retorno institucional.", color: "from-emerald-500 to-emerald-600", textColor: "text-white" },
              { icon: Heart, title: "Para a Sociedade", description: "Criamos experiências que atravessam. Conectamos narrativas a quem importa: as pessoas.", color: "from-violet-500 to-violet-600", textColor: "text-white" },
            ].map((card, index) => (
              <Card 
                key={card.title}
                className={`text-center p-8 bg-card/80 backdrop-blur-sm border-border/50 card-hover group transition-all duration-700 ${quemSomosInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: quemSomosInView ? `${(index + 1) * 150}ms` : '0ms' }}
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

      {/* Nossos Serviços Section */}
      <section ref={servicosRef} className="py-20 lg:py-28 relative z-10">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px]" />
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
                className={`group relative overflow-hidden bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm border-border/50 ${service.borderColor} transition-all duration-500 hover:shadow-xl ${servicosInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                style={{ transitionDelay: servicosInView ? `${(index + 1) * 100}ms` : '0ms' }}
              >
                {/* Hover gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent ${service.glowColor} opacity-0 group-hover:opacity-30 transition-opacity duration-500`} />
                
                <div className="relative p-6 flex flex-col items-center text-center gap-4">
                  <div className="relative">
                    {/* Glow effect */}
                    <div className={`absolute inset-0 w-16 h-16 bg-primary/20 ${service.glowColor} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    <div className={`relative w-16 h-16 bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-primary/10 ${service.borderColor} shadow-lg`}>
                      <service.icon className={`w-8 h-8 text-primary ${service.hoverColor} transition-colors duration-300`} />
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

      {/* Porto de Ideias Section - Ecossistema de Conexões */}
      <section ref={portoIdeiasRef} id="porto-de-ideias" className="py-20 lg:py-28 relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px]" />
        
        <div className="container mx-auto px-4 relative">
          {/* Header */}
          <div className={`text-center mb-20 transition-all duration-700 ${portoIdeiasInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <ShinyText className="inline-block" delay={300}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-foreground mb-4">
                Um Ecossistema de Conexões
              </h2>
            </ShinyText>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mt-6">
              Mais que uma vitrine, somos um porto seguro onde as ideias atracam, ganham força e partem para o mundo.
            </p>
          </div>

          {/* Para Produtores Culturais */}
          <div className={`grid lg:grid-cols-2 gap-12 items-center mb-24 transition-all duration-700 ${portoIdeiasInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '200ms' }}>
            <div className="space-y-8">
              <ShinyText delay={400}>
                <h3 className="text-2xl md:text-3xl font-serif font-semibold text-foreground">
                  Para Produtores Culturais
                </h3>
              </ShinyText>
              
              <div className="space-y-6">
                {[
                  { icon: LayoutGrid, title: "Vitrine de Projetos", description: "Apresente suas iniciativas culturais com visibilidade profissional e informações detalhadas do projeto.", color: "bg-primary" },
                  { icon: ShieldCheck, title: "Credibilidade e Confiança", description: "Construa confiança com perfis verificados e documentação abrangente do projeto.", color: "bg-primary" },
                  { icon: BarChart3, title: "Dashboard Completo", description: "Acompanhe visualizações, favoritos e conexões solicitadas em tempo real.", color: "bg-primary" },
                ].map((item, index) => (
                  <div 
                    key={item.title} 
                    className={`flex gap-4 items-start transition-all duration-500 ${portoIdeiasInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
                    style={{ transitionDelay: portoIdeiasInView ? `${(index + 3) * 150}ms` : '0ms' }}
                  >
                    <div className={`${item.color} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <item.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className={`relative transition-all duration-700 ${portoIdeiasInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{ transitionDelay: '500ms' }}>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-border/30 bg-gradient-to-br from-primary/10 to-accent/10">
                {ecossistemaProducerMedia?.url ? (
                  ecossistemaProducerMedia.type === 'video' ? (
                    <video
                      src={ecossistemaProducerMedia.url}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={ecossistemaProducerMedia.url}
                      alt="Para Produtores Culturais"
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center p-8">
                      <Film className="w-16 h-16 text-primary/40 mx-auto mb-4" />
                      <p className="text-muted-foreground">Imagem ilustrativa</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Para Empreendedores e Investidores */}
          <div className={`grid lg:grid-cols-2 gap-12 items-center transition-all duration-700 ${portoIdeiasInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '600ms' }}>
            <div className={`relative order-2 lg:order-1 transition-all duration-700 ${portoIdeiasInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{ transitionDelay: '700ms' }}>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-border/30 bg-gradient-to-br from-emerald-500/10 to-primary/10">
                {ecossistemaInvestorMedia?.url ? (
                  ecossistemaInvestorMedia.type === 'video' ? (
                    <video
                      src={ecossistemaInvestorMedia.url}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={ecossistemaInvestorMedia.url}
                      alt="Para Empreendedores e Investidores"
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center p-8">
                      <Users className="w-16 h-16 text-emerald-500/40 mx-auto mb-4" />
                      <p className="text-muted-foreground">Imagem ilustrativa</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-8 order-1 lg:order-2">
              <ShinyText delay={700}>
                <h3 className="text-2xl md:text-3xl font-serif font-semibold text-foreground">
                  Para Empreendedores e Investidores
                </h3>
              </ShinyText>
              
              <div className="space-y-6">
                {[
                  { icon: Search, title: "Seleção Curada", description: "Acesso a uma seleção cuidadosamente curada de propostas culturais sérias, criativas e bem estruturadas.", color: "bg-emerald-500" },
                  { icon: FileCheck, title: "Marco Legal", description: "Projetos prontos para financiamento através de leis de incentivo cultural ou patrocínio direto.", color: "bg-emerald-500" },
                  { icon: HeartHandshake, title: "Dashboard Personalizado", description: "Gerencie projetos salvos, histórico de contatos e relatórios de impacto das iniciativas apoiadas.", color: "bg-emerald-500" },
                ].map((item, index) => (
                  <div 
                    key={item.title} 
                    className={`flex gap-4 items-start transition-all duration-500 ${portoIdeiasInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
                    style={{ transitionDelay: portoIdeiasInView ? `${(index + 6) * 150}ms` : '0ms' }}
                  >
                    <div className={`${item.color} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className={`text-center mt-16 transition-all duration-700 ${portoIdeiasInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '900ms' }}>
            <Link 
              to="/porto-de-ideias" 
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 text-lg font-medium"
            >
              Explorar Porto de Ideias
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
