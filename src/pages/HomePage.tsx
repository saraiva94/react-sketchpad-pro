import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { AnimatedStats } from "@/components/AnimatedStats";
import { LazyArtisticBackground } from "@/components/LazyArtisticBackground";
import { LazyFloatingOrbs } from "@/components/LazyFloatingOrbs";
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
  ArrowRight,
  Play,
  Star,
  Camera,
  Music,
  Palette,
  Pen,
  Rocket,
  Smile,
  Sparkles,
  Sun,
  Zap,
  Globe,
  BookOpen,
  Compass,
  Crown,
  Diamond,
  Eye,
  Flame,
  Gift,
  Handshake,
  Key,
  Leaf,
  MessageCircle,
  Mountain,
  Puzzle,
  Rainbow,
  Telescope,
  Trophy,
  Umbrella,
  Waves,
  Wind,
  LucideIcon
} from "lucide-react";

// Icon map for dynamic Quem Somos cards and Nossos Serviços
const iconMap: Record<string, LucideIcon> = {
  Lightbulb,
  Target,
  Heart,
  Users,
  Star,
  Award,
  Briefcase,
  Camera,
  Film,
  Music,
  Palette,
  Pen,
  Rocket,
  Shield,
  Smile,
  Sparkles,
  Sun,
  Zap,
  Globe,
  BookOpen,
  Compass,
  Crown,
  Diamond,
  Eye,
  Flame,
  Gift,
  Handshake,
  Key,
  Leaf,
  MessageCircle,
  Mountain,
  Puzzle,
  Rainbow,
  Telescope,
  Trophy,
  Umbrella,
  Waves,
  Wind,
  Settings,
  FileText,
  DollarSign,
  Calendar,
  Megaphone,
  Mic,
  HelpCircle,
};

interface Project {
  id: string;
  title: string;
  synopsis: string;
  project_type: string;
  image_url: string | null;
  location: string | null;
  categorias_tags: string[] | null;
  responsavel_primeiro_nome: string | null;  // Only first name from public view
  link_pagamento: string | null;
  valor_sugerido: number | null;
  has_incentive_law: boolean;
  incentive_law_details: string | null;
  stage: string | null;
  impacto_cultural: string | null;
  impacto_social: string | null;
  featured_on_homepage: boolean;
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
  const [carouselDisplayCount, setCarouselDisplayCount] = useState<1 | 3 | 5 | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [heroReady, setHeroReady] = useState(false);
  const [featuredVisibility, setFeaturedVisibility] = useState<Record<string, boolean>>({});
  const [featuredOrder, setFeaturedOrder] = useState<string[]>([]);
  const [featuredExampleCards, setFeaturedExampleCards] = useState<Record<string, boolean>>({});
  const [ecossistemaTitle, setEcossistemaTitle] = useState("Um Ecossistema de Conexões");
  const [ecossistemaSubtitle, setEcossistemaSubtitle] = useState("Mais que uma vitrine, somos um porto seguro onde as ideias atracam, ganham força e partem para o mundo.");
  
  // Quem Somos content
  interface QuemSomosCard {
    icon: string;
    title: string;
    description: string;
    color: string;
  }
  interface QuemSomosContent {
    paragraphs: string[];
    cards: QuemSomosCard[];
  }
  const [quemSomosContent, setQuemSomosContent] = useState<QuemSomosContent>({
    paragraphs: [
      "A Porto Bello Filmes é uma produtora audiovisual que nasce da vontade de realização que pulsa em cada uma de nós. Às vezes as coisas que a gente sonha realmente acontecem, o que a gente precisa é correr atrás na prática cotidiana e acreditar que o nosso movimento também movimenta a vida. A nossa equipe une a capacidade de colocar a mão na massa com a sensibilidade de transformar vivências em narrativas para compartilhar com o mundo.",
      "Nossos projetos nascem de uma escuta atenta e são atravessados por experiências pessoais e profissionais diversas. Contamos com um time de parceiros que somam seus repertórios e especialidades em cada etapa. Isso fortalece nossas trocas e a forma como organizamos o trabalho para criar, produzir, finalizar e fazer acontecer.",
      "Desenvolvemos projetos autorais e também abraçamos histórias que chegam até nós com vontade de ganhar forma. A gente escuta, estrutura, soma e ajuda a colocar no mundo. Essas diferentes perspectivas ampliam nosso repertório e guiam nossas escolhas criativas. Acreditamos no valor do trabalho bem feito, realizado em conjunto com pessoas competentes e comprometidas. É assim que seguimos: com clareza, escuta e entrega."
    ],
    cards: [
      { icon: "Lightbulb", title: "Para Criadores", description: "Histórias potentes merecem estrutura sólida. Atuamos no desenvolvimento, organização e produção para tirar ideias do papel e transformá-las em obras realizadas.", color: "from-primary to-accent" },
      { icon: "Target", title: "Para Investidores", description: "Projetos prontos para investimento, com identidade, força de execução e potencial de retorno institucional.", color: "from-emerald-500 to-emerald-600" },
      { icon: "Heart", title: "Para a Sociedade", description: "Criamos experiências que atravessam. Conectamos narrativas a quem importa: as pessoas.", color: "from-violet-500 to-violet-600" }
    ]
  });

  // Nossos Serviços content
  interface ServiceItem {
    icon: string;
    text: string;
    hoverColor: string;
  }
  interface ServicosContent {
    title: string;
    services: ServiceItem[];
  }
  const [servicosContent, setServicosContent] = useState<ServicosContent>({
    title: "Nossos Serviços",
    services: [
      { icon: "Film", text: "Desenvolvimento de projetos culturais e audiovisuais", hoverColor: "group-hover:text-rose-500" },
      { icon: "Settings", text: "Produção executiva e gestão de equipe", hoverColor: "group-hover:text-amber-500" },
      { icon: "FileText", text: "Estruturação para leis de incentivo", hoverColor: "group-hover:text-emerald-500" },
      { icon: "DollarSign", text: "Captação de recursos públicos e privados", hoverColor: "group-hover:text-cyan-500" },
      { icon: "Calendar", text: "Produção de obras audiovisuais e eventos culturais", hoverColor: "group-hover:text-violet-500" },
      { icon: "Megaphone", text: "Distribuição, comunicação e lançamento de projetos", hoverColor: "group-hover:text-pink-500" },
      { icon: "Mic", text: "Criação e roteirização de videocasts e podcasts", hoverColor: "group-hover:text-orange-500" },
      { icon: "HelpCircle", text: "Consultoria para formatação de projetos", hoverColor: "group-hover:text-sky-500" },
    ]
  });

  useEffect(() => {
    fetchFeaturedProjects();
    fetchStats();
    fetchStatsVisibility();
    fetchInstitutionalVideo();
    fetchQuemSomosContent();
    fetchServicosContent();
    fetchEcossistemaTitle();

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
          } else if (record.key === 'carousel_display_count') {
            const count = record.value.count;
            if (count === 1 || count === 3 || count === 5) {
            setCarouselDisplayCount(count);
            }
          } else if (record.key === 'featured_projects_visibility' || record.key === 'featured_projects_order' || record.key === 'porto_ideias_featured_cards') {
            // Refetch featured projects when visibility, order, or featured cards change
            fetchFeaturedProjects();
          } else if (record.key === 'quem_somos_content') {
            // Update quem somos content in real-time
            setQuemSomosContent(record.value as unknown as QuemSomosContent);
          } else if (record.key === 'nossos_servicos_content') {
            // Update servicos content in real-time
            setServicosContent(record.value as unknown as ServicosContent);
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
    setLoadingSettings(true);
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "stats_visible")
      .maybeSingle();
    
    if (data) {
      setStatsVisible((data.value as { enabled: boolean }).enabled);
    } else {
      setStatsVisible(false);
    }
    setLoadingSettings(false);
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
    
    // Fetch carousel display count
    const { data: carouselData } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "carousel_display_count")
      .maybeSingle();
    
    if (carouselData) {
      const count = (carouselData.value as { count: number }).count;
      if (count === 1 || count === 3 || count === 5) {
        setCarouselDisplayCount(count);
      } else {
        setCarouselDisplayCount(5);
      }
    } else {
      setCarouselDisplayCount(5);
    }
    
    setLoadingVideo(false);
  };

  const fetchQuemSomosContent = async () => {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "quem_somos_content")
      .maybeSingle();
    
    if (data && data.value) {
      setQuemSomosContent(data.value as unknown as QuemSomosContent);
    }
  };

  const fetchServicosContent = async () => {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "nossos_servicos_content")
      .maybeSingle();
    
    if (data && data.value) {
      setServicosContent(data.value as unknown as ServicosContent);
    }
  };

  const fetchEcossistemaTitle = async () => {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "ecossistema_text")
      .maybeSingle();
    
    if (data && data.value) {
      const settings = data.value as { title?: string; subtitle?: string };
      if (settings.title) setEcossistemaTitle(settings.title);
      if (settings.subtitle) setEcossistemaSubtitle(settings.subtitle);
    }
  };

  const fetchStats = async () => {
    // Use projects_public for count (only approved projects)
    const { count: approvedCount } = await supabase
      .from("projects_public")
      .select("*", { count: "exact", head: true });

    // For stats, we count based on approved projects only (public view)
    setStats({
      totalProjects: approvedCount || 0,
      approvedProjects: approvedCount || 0,
      uniqueCreators: approvedCount || 0, // Simplified - we don't expose email counts
      successRate: 100 // All projects in public view are approved
    });
  };

  const fetchFeaturedProjects = async () => {
    // Use projects_public view to avoid exposing sensitive contact information
    const { data: projectsData } = await supabase
      .from("projects_public")
      .select("id, title, synopsis, project_type, image_url, location, categorias_tags, responsavel_primeiro_nome, link_pagamento, valor_sugerido, has_incentive_law, incentive_law_details, stage, impacto_cultural, impacto_social, featured_on_homepage")
      .eq("featured_on_homepage", true)
      .order("created_at", { ascending: true })
      .limit(6);
    
    // Fetch visibility and order settings
    const { data: orderData } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "featured_projects_order")
      .maybeSingle();
    
    const { data: visibilityData } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "featured_projects_visibility")
      .maybeSingle();
    
    const savedOrder: string[] = (orderData?.value as string[]) || [];
    const visibility: Record<string, boolean> = (visibilityData?.value as Record<string, boolean>) || {};
    
    // Fetch featured example cards settings
    const { data: featuredCardsData } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "porto_ideias_featured_cards")
      .maybeSingle();
    
    const featuredCards: Record<string, boolean> = (featuredCardsData?.value as Record<string, boolean>) || {};
    
    setFeaturedVisibility(visibility);
    setFeaturedOrder(savedOrder);
    setFeaturedExampleCards(featuredCards);
    
    // Filter projects based on visibility settings
    let filteredProjects = (projectsData || []).filter(p => {
      const key = `real-${p.id}`;
      return visibility[key] !== false; // Default to visible if not set
    });
    
    // Sort by saved order if available
    if (savedOrder.length > 0) {
      filteredProjects.sort((a, b) => {
        const indexA = savedOrder.indexOf(`real-${a.id}`);
        const indexB = savedOrder.indexOf(`real-${b.id}`);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    }
    
    setFeaturedProjects(filteredProjects);
    setLoadingProjects(false);
  };

  const formatBudget = (value: number | null): string => {
    if (!value) return "";
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}k`;
    }
    return `R$ ${value.toLocaleString('pt-BR')}`;
  };

  const getBudgetRange = (value: number | null): { label: string; color: string } => {
    if (!value) return { label: "", color: "" };
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
      title: "Sua Cultura, Seu Legado",
      synopsis: "Cada projeto cultural conta uma história única. Seja parte dessa rede de criadores que estão transformando o cenário cultural brasileiro.",
      project_type: "Audiovisual",
      image_url: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=600&fit=crop",
      location: "Rio de Janeiro",
      responsavel_primeiro_nome: "Maria",
      valor_sugerido: 250000,
      has_incentive_law: true,
      incentive_law_details: "Lei Rouanet",
      stage: "development" as const,
      impacto_cultural: "Preservação e difusão da cultura brasileira através de narrativas audiovisuais.",
      link: "/exemplo/cultura-legado",
    },
    {
      id: "exemplo-investidores-aguardam",
      title: "Investidores Aguardam",
      synopsis: "Investidores buscam projetos culturais de impacto. Apresente sua proposta para quem está pronto para apoiar a cultura.",
      project_type: "Produção Cultural",
      image_url: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop",
      location: "São Paulo",
      responsavel_primeiro_nome: "Carlos",
      valor_sugerido: 450000,
      has_incentive_law: true,
      incentive_law_details: "Lei Rouanet",
      stage: "development" as const,
      impacto_cultural: "Ponte entre investidores e projetos culturais de alto impacto.",
      link: "/exemplo/investidores-aguardam",
    },
    {
      id: "exemplo-historias-sucesso",
      title: "Histórias de Sucesso",
      synopsis: "Projetos que começaram aqui já impactaram milhares de pessoas. O próximo sucesso pode ser o seu!",
      project_type: "Teatro",
      image_url: "https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=800&h=600&fit=crop",
      location: "São Paulo",
      responsavel_primeiro_nome: "João",
      valor_sugerido: 180000,
      has_incentive_law: true,
      incentive_law_details: "PROAC",
      stage: "production" as const,
      impacto_cultural: "Conexão entre arte e comunidade através de experiências teatrais transformadoras.",
      link: "/exemplo/historias-sucesso",
    },
    {
      id: "exemplo-recursos-disponiveis",
      title: "Recursos Disponíveis",
      synopsis: "Conectamos projetos a recursos via Lei Rouanet, PROAC, e investimento direto. Encontre o modelo ideal para você.",
      project_type: "Música",
      image_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=600&fit=crop",
      location: "Belo Horizonte",
      responsavel_primeiro_nome: "Ana",
      valor_sugerido: 320000,
      has_incentive_law: true,
      incentive_law_details: "Lei do Audiovisual",
      stage: "distribution" as const,
      impacto_cultural: "Ampliação do acesso à música brasileira através de plataformas digitais e eventos presenciais.",
      link: "/exemplo/recursos-disponiveis",
    },
  ];

  // Construir lista de projetos combinando reais + exemplos respeitando a ordem global
  const buildDisplayProjects = () => {
    // Criar lista de todos os itens com seu tipo
    type DisplayItem = { type: 'real'; data: Project } | { type: 'example'; data: typeof exampleProjects[0] };
    
    const realItems: DisplayItem[] = featuredProjects.map(p => ({ type: 'real', data: p }));
    
    // Apenas incluir exemplos que estão marcados como destaque (estrela)
    const exampleItems: DisplayItem[] = exampleProjects
      .filter(e => featuredExampleCards[e.id] === true)
      .map(e => ({ type: 'example', data: e }));
    
    let allItems: DisplayItem[] = [...realItems, ...exampleItems];
    
    // Filtrar por visibilidade
    allItems = allItems.filter(item => {
      const itemId = item.type === 'real' ? `real-${item.data.id}` : item.data.id;
      return featuredVisibility[itemId] !== false;
    });
    
    // Ordenar pela ordem salva
    if (featuredOrder.length > 0) {
      allItems.sort((a, b) => {
        const idA = a.type === 'real' ? `real-${a.data.id}` : a.data.id;
        const idB = b.type === 'real' ? `real-${b.data.id}` : b.data.id;
        const indexA = featuredOrder.indexOf(idA);
        const indexB = featuredOrder.indexOf(idB);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    }
    
    return allItems.slice(0, 3);
  };
  
  const displayItems = buildDisplayProjects();

  // Intersection observers for animations - each section only animates when entering viewport
  const { ref: heroRef, isInView: heroInView } = useInView<HTMLElement>({ threshold: 0.1 });
  const { ref: quemSomosRef, isInView: quemSomosInView } = useInView<HTMLElement>({ threshold: 0.1, rootMargin: '-50px 0px' });
  const { ref: portoIdeiasRef, isInView: portoIdeiasInView } = useInView<HTMLElement>({ threshold: 0.1, rootMargin: '-50px 0px' });
  const { ref: servicosRef, isInView: servicosInView } = useInView<HTMLElement>({ threshold: 0.1, rootMargin: '-50px 0px' });

  // Fallback para heroReady após 2 segundos caso o carrossel não complete a animação
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!heroReady) {
        setHeroReady(true);
      }
    }, 2000);
    return () => clearTimeout(timeout);
  }, [heroReady]);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Lazy Artistic Background Animation - deferred loading */}
      <LazyArtisticBackground />
      
      {/* Lazy Floating Orbs - deferred loading */}
      <LazyFloatingOrbs />
      
      {/* Navbar */}
      <Navbar currentPage="home" />

      {/* Spacer for fixed navbar */}
      <div className="h-20" />

      {/* Hero Section - Institutional Video Carousel */}
      <section ref={heroRef} id="inicio" className="relative py-20 lg:py-32 overflow-hidden z-10">
        <div className="container mx-auto px-4 relative z-10">
          <div className={`max-w-5xl mx-auto transition-all duration-1000 ease-out ${heroInView ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            {carouselDisplayCount !== null ? (
              <VideoCarousel 
                videos={institutionalVideos} 
                loading={loadingVideo} 
                displayCount={carouselDisplayCount}
                onAnimationComplete={() => setHeroReady(true)}
              />
            ) : (
              <div className="aspect-video w-full flex items-center justify-center animate-fade-in">
                <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl border border-border bg-card card-solid">
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center border border-border shadow-lg animate-pulse">
                      <Play className="w-12 h-12 text-primary-foreground ml-1" />
                    </div>
                    <p className="text-muted-foreground text-sm animate-pulse">Carregando...</p>
                  </div>
                  {/* Decorative corners */}
                  <div className="absolute top-4 left-4 w-12 h-12 border-l-2 border-t-2 border-primary/50 rounded-tl-lg" />
                  <div className="absolute top-4 right-4 w-12 h-12 border-r-2 border-t-2 border-primary/50 rounded-tr-lg" />
                  <div className="absolute bottom-4 left-4 w-12 h-12 border-l-2 border-b-2 border-primary/50 rounded-bl-lg" />
                  <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-primary/50 rounded-br-lg" />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Animated Stats Section - conditionally rendered only after settings loaded */}
      {!loadingSettings && statsVisible && (
        <section className="relative">
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
          {stats.totalProjects === 0 && (
            <div className="text-center pb-8 -mt-8">
              <p className="text-sm text-muted-foreground/70 italic">
                Estatísticas de projetos reais cadastrados na plataforma
              </p>
            </div>
          )}
        </section>
      )}

      {/* Quem Somos Section - only animates after hero is ready AND in view */}
      <section ref={quemSomosRef} id="sobre" className="py-20 lg:py-28 relative z-10">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        
        <div className="mx-auto px-4 sm:px-[10%] lg:px-[20%] relative z-10">
          <div className={`text-center mb-12 transition-all duration-700 ${quemSomosInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <ShinyText className="inline-block" delay={200}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-foreground mb-6 decorative-line">
                Quem Somos
              </h2>
            </ShinyText>
          </div>
          
          <div className={`max-w-5xl mx-auto mb-20 transition-all duration-700 ${quemSomosInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '150ms' }}>
            <div className="text-base md:text-lg text-muted-foreground leading-relaxed space-y-6">
              {quemSomosContent.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {quemSomosContent.cards.map((card, index) => {
              const IconComponent = iconMap[card.icon] || Lightbulb;
              return (
                <Card 
                  key={card.title}
                  className={`text-center p-8 card-solid bg-card border-border card-hover group transition-all duration-700 ${quemSomosInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: quemSomosInView ? `${(index + 2) * 150}ms` : '0ms' }}
                >
                  <div className={`w-20 h-20 bg-gradient-to-br ${card.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-elegant group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                  <CardTitle className="text-xl font-serif mb-3">{card.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {card.description}
                  </CardDescription>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Porto de Ideias Section - Ecossistema de Conexões (Projetos em Destaque) */}
      <section ref={portoIdeiasRef} id="porto-de-ideias" className="py-20 lg:py-28 relative overflow-hidden z-10">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        
        <div className="mx-auto px-4 sm:px-[10%] lg:px-[20%] relative">
          {/* Header */}
          <div className={`text-center mb-16 transition-all duration-700 ${portoIdeiasInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <ShinyText className="inline-block" delay={300}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-foreground mb-4">
                {ecossistemaTitle}
              </h2>
            </ShinyText>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mt-6">
              {ecossistemaSubtitle}
            </p>
          </div>

          {/* Featured Projects - Alternating Layout with Cards */}
          {loadingProjects ? (
            <div className="space-y-16">
              {[1, 2].map((i) => (
                <div key={i} className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                  <div className={`animate-pulse space-y-4 ${i % 2 === 0 ? 'md:order-2' : ''}`}>
                    <div className="h-6 bg-muted rounded w-1/4" />
                    <div className="h-10 bg-muted rounded w-3/4" />
                    <div className="h-24 bg-muted rounded" />
                  </div>
                  <div className={`animate-pulse bg-card card-solid rounded-2xl overflow-hidden border border-border shadow-2xl h-80 ${i % 2 === 0 ? 'md:order-1' : ''}`}>
                    <div className="h-48 bg-muted" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-6 bg-muted rounded w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-16 md:space-y-24">
              {displayItems.map((item, index) => {
                const project = item.data;
                const isExample = item.type === 'example';
                const budgetInfo = getBudgetRange(project.valor_sugerido);
                const stageInfo = getStageInfo(project.stage);
                const linkUrl = isExample ? (project as typeof exampleProjects[0]).link : `/project/${project.id}`;
                const isEven = index % 2 === 1;
                
                return (
                  <div 
                    key={project.id}
                    className={`grid md:grid-cols-2 gap-8 md:gap-12 items-center transition-all duration-700 ease-out ${
                      heroReady && portoIdeiasInView 
                        ? 'opacity-100 translate-x-0' 
                        : `opacity-0 ${isEven ? 'translate-x-20' : '-translate-x-20'}`
                    }`}
                    style={{ transitionDelay: heroReady && portoIdeiasInView ? `${index * 150}ms` : '0ms' }}
                  >
                    {/* Text Content */}
                    <div className={`space-y-6 ${isEven ? 'md:order-2' : ''}`}>
                      <div className="flex flex-wrap gap-2">
                        <Badge className={stageInfo.color}>
                          {stageInfo.label}
                        </Badge>
                        {project.has_incentive_law && (
                          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                            {project.incentive_law_details || "Lei de Incentivo"}
                          </Badge>
                        )}
                        {project.valor_sugerido && budgetInfo.label && (
                          <Badge className={budgetInfo.color}>
                            {formatBudget(project.valor_sugerido)}
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif font-semibold text-foreground">
                        {project.title}
                      </h3>
                      
                      <p className="text-base md:text-lg text-muted-foreground leading-relaxed line-clamp-4">
                        {project.synopsis}
                      </p>
                      
                      {project.impacto_cultural && (
                        <p className="text-sm text-muted-foreground/80 italic line-clamp-2">
                          {project.impacto_cultural}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {project.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4" />
                            <span>{project.location}</span>
                          </div>
                        )}
                        {project.project_type && (
                          <div className="flex items-center gap-1.5">
                            <Film className="w-4 h-4" />
                            <span>{project.project_type}</span>
                          </div>
                        )}
                      </div>
                      
                      <Link 
                        to={linkUrl}
                        className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all duration-300 group"
                      >
                        Conhecer projeto
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                    
                    {/* Project Card */}
                    <div className={`${isEven ? 'md:order-1' : ''}`}>
                      <Link
                        to={linkUrl}
                        className="block group"
                      >
                        <div className="card-solid bg-card border border-border rounded-2xl overflow-hidden shadow-2xl group-hover:shadow-3xl group-hover:scale-[1.02] transition-all duration-300">
                          {/* Image */}
                          <div className="relative h-56 md:h-64 overflow-hidden">
                            {project.image_url ? (
                              <img
                                src={project.image_url}
                                alt={project.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                <span className="text-4xl font-serif font-bold text-primary/50">
                                  {getInitials(project.title)}
                                </span>
                              </div>
                            )}
                            {/* Overlay gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            {/* Type badge */}
                            <div className="absolute top-3 left-3">
                              <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm">
                                {project.project_type}
                              </Badge>
                            </div>
                            {/* Creator info */}
                            {project.responsavel_primeiro_nome && (
                              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/80 flex items-center justify-center text-primary-foreground text-xs font-medium">
                                  {getInitials(project.responsavel_primeiro_nome)}
                                </div>
                                <span className="text-white text-sm font-medium drop-shadow-lg">
                                  {project.responsavel_primeiro_nome}
                                </span>
                              </div>
                            )}
                          </div>
                          {/* Card Content */}
                          <div className="p-5">
                            <h4 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                              {project.title}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {project.synopsis}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Nossos Serviços Section */}
      <section ref={servicosRef} id="servicos" className="py-20 lg:py-28 relative z-10">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        
        <div className="mx-auto px-4 sm:px-[10%] lg:px-[20%] relative z-10">
          <div className={`text-center mb-16 transition-all duration-700 ${servicosInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <ShinyText className="inline-block" delay={200}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-foreground mb-4 decorative-line">
                {servicosContent.title}
              </h2>
            </ShinyText>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {servicosContent.services.map((service, index) => {
              const ServiceIcon = iconMap[service.icon] || Star;
              return (
                <Card 
                  key={index} 
                  className={`group relative overflow-visible card-solid bg-card border-border rainbow-card-glow ${servicosInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ 
                    transition: 'opacity 300ms ease-out, transform 300ms ease-out',
                    transitionDelay: servicosInView ? `${(index + 1) * 50}ms` : '0ms',
                  }}
                >
                  <div className="relative p-6 flex flex-col items-center text-center gap-4">
                    <div className="relative">
                      <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 border border-border shadow-lg" style={{ transition: 'transform 0ms' }}>
                        <ServiceIcon className={`w-8 h-8 text-black rainbow-icon-glow ${service.hoverColor}`} style={{ transition: 'color 0ms' }} />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium rainbow-text-glow">
                      {service.text}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
