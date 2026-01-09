import { useState, useEffect, useMemo } from "react";
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
import { TranslatedProjectCard } from "@/components/TranslatedProjectCard";
import { ContactModal } from "@/components/ContactModal";
import { TranslatedServiceCard } from "@/components/TranslatedServiceCard";
import { useInView } from "@/hooks/useInView";
import { useLanguage } from "@/hooks/useLanguage";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import { usePreloadTranslations, createTranslationItems } from "@/hooks/usePreloadTranslations";
import { useAuth } from "@/hooks/useAuth";
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDragSensors } from "@/hooks/useReorder";
import { toast } from "sonner";
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
  GripVertical,
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

// Type for display items (declared at module level for reuse)
type DisplayItem = { type: 'real'; data: Project } | { type: 'example'; data: { id: string; title: string; synopsis: string; project_type: string; image_url: string; link: string; [key: string]: any } };

// Sortable wrapper component for featured cards
function SortableFeaturedCard({
  item,
  children,
  isAdmin,
}: {
  item: DisplayItem;
  children: React.ReactNode;
  isAdmin: boolean;
}) {
  const itemId = item.type === 'real' ? `real-${item.data.id}` : item.data.id;
  
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: itemId, disabled: !isAdmin });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  if (!isAdmin) {
    return <>{children}</>;
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group/drag">
      {/* Drag handle */}
      <div
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/drag:opacity-100 transition-opacity cursor-grab active:cursor-grabbing bg-background/90 rounded-md p-1 border shadow-sm touch-none"
        title="Segure 0.5s para arrastar"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      {children}
    </div>
  );
}


const HomePage = () => {
  const { t, language } = useLanguage();
  const { isAdmin } = useAuth();
  const sensors = useDragSensors();
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
  const [carouselDisplayCount, setCarouselDisplayCount] = useState<1 | 3 | 5>(5); // Default to 5, will be updated by fetch
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [heroReady, setHeroReady] = useState(false);
  const [featuredVisibility, setFeaturedVisibility] = useState<Record<string, boolean>>({});
  const [featuredOrder, setFeaturedOrder] = useState<string[]>([]);
  const [featuredExampleCards, setFeaturedExampleCards] = useState<Record<string, boolean>>({});
  const [localDisplayItems, setLocalDisplayItems] = useState<DisplayItem[]>([]);
  
  // Ecossistema (Porto de Ideias section) dynamic text
  interface EcossistemaText {
    title: string;
    subtitle: string;
  }
  const [ecossistemaText, setEcossistemaText] = useState<EcossistemaText>({
    title: t.home.ecosystemTitle,
    subtitle: t.home.ecosystemSubtitle
  });
  
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
      { icon: "FileText", text: "Desenvolvimento de roteiros", hoverColor: "group-hover:text-rose-500" },
      { icon: "Film", text: "Produção de filmes, séries, curtas-metragens e documentários", hoverColor: "group-hover:text-amber-500" },
      { icon: "Megaphone", text: "Produção de obras teatrais e espetáculos", hoverColor: "group-hover:text-emerald-500" },
      { icon: "Mic", text: "Criação de videocasts e podcasts", hoverColor: "group-hover:text-cyan-500" },
      { icon: "Calendar", text: "Produção de conteúdo publicitário e institucional", hoverColor: "group-hover:text-violet-500" },
      { icon: "Rocket", text: "Elaboração de projetos para leis de incentivo", hoverColor: "group-hover:text-pink-500" },
      { icon: "DollarSign", text: "Captação de recursos públicos e privados", hoverColor: "group-hover:text-orange-500" },
      { icon: "Users", text: "Produção executiva e gestão de equipe", hoverColor: "group-hover:text-sky-500" },
      { icon: "HelpCircle", text: "Consultoria criativa para projetos culturais", hoverColor: "group-hover:text-teal-500" },
      { icon: "Waves", text: "Distribuição e estratégias de circulação", hoverColor: "group-hover:text-indigo-500" },
      { icon: "Lightbulb", text: "Criação de portfólios e materiais de apresentação", hoverColor: "group-hover:text-lime-500" },
      { icon: "Briefcase", text: "Consultoria para formatação e estruturação de projetos", hoverColor: "group-hover:text-rose-500" },
    ]
  });

  // Auto-tradução de conteúdos dinâmicos (do backend) quando idioma != pt
  const { translated: translatedQuemSomos } = useAutoTranslate('quem_somos', quemSomosContent);
  const { translated: translatedServicos } = useAutoTranslate('nossos_servicos', servicosContent);
  const { translated: translatedEcossistema } = useAutoTranslate('ecossistema_text', ecossistemaText);

  // Conteúdo final que será usado na renderização (com validação de estrutura)
  const isValidQuemSomos = (input: any): input is typeof quemSomosContent => {
    return (
      input &&
      Array.isArray(input.paragraphs) &&
      input.paragraphs.every((p: any) => typeof p === "string") &&
      Array.isArray(input.cards) &&
      input.cards.every(
        (c: any) =>
          c &&
          typeof c.icon === "string" &&
          typeof c.title === "string" &&
          typeof c.description === "string"
      )
    );
  };

  const isValidServicos = (input: any): input is typeof servicosContent => {
    return (
      input &&
      Array.isArray(input.services) &&
      input.services.every(
        (s: any) =>
          s &&
          typeof s.icon === "string" &&
          typeof s.text === "string" &&
          typeof s.hoverColor === "string"
      )
    );
  };

  const displayQuemSomos = language === "pt"
    ? quemSomosContent
    : (isValidQuemSomos(translatedQuemSomos) ? translatedQuemSomos : quemSomosContent);

  const displayServicos = language === "pt"
    ? servicosContent
    : (isValidServicos(translatedServicos) ? translatedServicos : servicosContent);

  // Ecossistema text validation and display
  const isValidEcossistema = (input: any): input is EcossistemaText => {
    return input && typeof input.title === "string" && typeof input.subtitle === "string";
  };

  const displayEcossistema = language === "pt"
    ? ecossistemaText
    : (isValidEcossistema(translatedEcossistema) ? translatedEcossistema : ecossistemaText);


  useEffect(() => {
    fetchFeaturedProjects();
    fetchStats();
    fetchStatsVisibility();
    fetchInstitutionalVideo();
    fetchQuemSomosContent();
    fetchServicosContent();
    fetchEcossistemaText();

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
          } else if (record.key === 'ecossistema_text') {
            // Update ecossistema text in real-time
            const text = record.value as { title?: string; subtitle?: string };
            setEcossistemaText({
              title: text.title || t.home.ecosystemTitle,
              subtitle: text.subtitle || t.home.ecosystemSubtitle
            });
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

  const fetchEcossistemaText = async () => {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "ecossistema_text")
      .maybeSingle();
    
    if (data && data.value) {
      const text = data.value as { title?: string; subtitle?: string };
      setEcossistemaText({
        title: text.title || t.home.ecosystemTitle,
        subtitle: text.subtitle || t.home.ecosystemSubtitle
      });
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


  const getInitials = (name: string | null): string => {
    if (!name) return "PC";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Projetos de exemplo para exibir quando não há projetos reais em destaque
  // CRITICAL: useMemo para evitar recriação e loop infinito no useAutoTranslate
  const exampleProjectsPt = useMemo(() => [
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
  ], []);

  // Auto-tradução dos projetos de exemplo
  const { translated: translatedExampleProjects } = useAutoTranslate('example_projects', exampleProjectsPt);
  const exampleProjects = language === 'pt' 
    ? exampleProjectsPt 
    : (Array.isArray(translatedExampleProjects) ? translatedExampleProjects : exampleProjectsPt);

  // Construir lista de projetos combinando reais + exemplos respeitando a ordem global
  // CRITICAL: useMemo para evitar recriação e loop infinito
  const displayItems = useMemo<DisplayItem[]>(() => {
    // Garantir que featuredProjects seja um array
    const safeProjects = Array.isArray(featuredProjects) ? featuredProjects : [];
    const safeExamples = Array.isArray(exampleProjects) ? exampleProjects : exampleProjectsPt;
    
    const realItems: DisplayItem[] = safeProjects.map(p => ({ type: 'real', data: p }));
    
    // Apenas incluir exemplos que estão marcados como destaque (estrela)
    const exampleItems: DisplayItem[] = safeExamples
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
    
    return allItems.slice(0, 4);
  }, [featuredProjects, exampleProjects, exampleProjectsPt, featuredExampleCards, featuredVisibility, featuredOrder]);

  // Sincronizar estado local com displayItems para drag & drop
  useEffect(() => {
    setLocalDisplayItems(displayItems);
  }, [displayItems]);

  // Handler de drag para projetos em destaque
  const handleFeaturedDragEnd = async (event: DragEndEvent) => {
    if (!isAdmin) return;
    
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = localDisplayItems.findIndex(item => {
        const itemId = item.type === 'real' ? `real-${item.data.id}` : item.data.id;
        return itemId === active.id;
      });
      const newIndex = localDisplayItems.findIndex(item => {
        const itemId = item.type === 'real' ? `real-${item.data.id}` : item.data.id;
        return itemId === over.id;
      });
      
      const newOrder = arrayMove(localDisplayItems, oldIndex, newIndex);
      setLocalDisplayItems(newOrder);
      
      // Salvar no banco
      try {
        const orderIds = newOrder.map(item => item.type === 'real' ? `real-${item.data.id}` : item.data.id);
        
        const { data: existing } = await supabase
          .from("settings")
          .select("id")
          .eq("key", "featured_projects_order")
          .maybeSingle();
        
        if (existing) {
          await supabase
            .from("settings")
            .update({ value: orderIds })
            .eq("key", "featured_projects_order");
        } else {
          await supabase
            .from("settings")
            .insert({ key: "featured_projects_order", value: orderIds });
        }
        
        setFeaturedOrder(orderIds);
        toast.success("Ordem dos projetos atualizada");
      } catch (error) {
        console.error("Erro ao salvar ordem:", error);
        toast.error("Erro ao salvar ordem");
      }
    }
  };

  // Tradução em lote dos cards de destaque (reduz rate-limit, melhora consistência EN/ES)
  // CRITICAL: useMemo para evitar recriação e loop infinito no useAutoTranslate
  type FeaturedCardPayload = { id: string; title: string; synopsis: string; project_type: string };
  const featuredCardsPayload = useMemo<FeaturedCardPayload[]>(() => {
    return (Array.isArray(displayItems) ? displayItems : []).map((it) => ({
      id: it.data.id,
      title: it.data.title,
      synopsis: it.data.synopsis,
      project_type: it.data.project_type,
    }));
  }, [displayItems]);

  const { translated: translatedFeaturedCards } = useAutoTranslate(
    "homepage_featured_cards",
    featuredCardsPayload
  );

  const isValidFeaturedCards = (input: any): input is FeaturedCardPayload[] => {
    return (
      Array.isArray(input) &&
      input.every(
        (c) =>
          c &&
          typeof c.id === "string" &&
          typeof c.title === "string" &&
          typeof c.synopsis === "string" &&
          typeof c.project_type === "string"
      )
    );
  };

  // Evita “travamento” quando a tradução em lote volta parcialmente em PT.
  // Ex.: se só o synopsis não traduziu, passamos apenas os campos realmente traduzidos
  // e deixamos o card completar o resto com tradução por-campo.
  const isSameText = (a: string, b: string) => a.trim() === b.trim();
  const originalsById = new Map(featuredCardsPayload.map((p) => [p.id, p] as const));

  const featuredCardsMap = new Map<
    string,
    { partial: Partial<Pick<FeaturedCardPayload, "title" | "synopsis" | "project_type">>; complete: boolean }
  >();

  if (language !== "pt" && isValidFeaturedCards(translatedFeaturedCards)) {
    translatedFeaturedCards.forEach((c) => {
      const original = originalsById.get(c.id);
      if (!original) return;

      const partial: Partial<Pick<FeaturedCardPayload, "title" | "synopsis" | "project_type">> = {};

      if (!isSameText(c.title, original.title)) partial.title = c.title;
      if (!isSameText(c.synopsis, original.synopsis)) partial.synopsis = c.synopsis;
      if (!isSameText(c.project_type, original.project_type)) partial.project_type = c.project_type;

      const complete = !!partial.title && !!partial.synopsis && !!partial.project_type;
      if (Object.keys(partial).length > 0) {
        featuredCardsMap.set(c.id, { partial, complete });
      }
    });
  }

  // Preload de traduções quando dados carregarem (inclui cards de destaque em lote)
  const preloadItems = [
    ...createTranslationItems.forSettings('quem_somos', quemSomosContent),
    ...createTranslationItems.forSettings('nossos_servicos', servicosContent),
    ...createTranslationItems.forSettings('ecossistema_text', ecossistemaText),
    { namespace: 'homepage_featured_cards', value: featuredCardsPayload },
  ];
  usePreloadTranslations(preloadItems, !loadingProjects);

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
            <VideoCarousel 
              videos={institutionalVideos} 
              loading={loadingVideo} 
              displayCount={carouselDisplayCount}
              onAnimationComplete={() => setHeroReady(true)}
            />
          </div>
        </div>
      </section>

      {/* Animated Stats Section - conditionally rendered only after settings loaded */}
      {!loadingSettings && statsVisible && (
        <section className="relative">
          <AnimatedStats stats={[
            {
              label: t.home.registeredProjects,
              value: stats.totalProjects,
              icon: <Briefcase className="w-8 h-8 text-white" />,
              color: "bg-gradient-to-br from-primary to-blue-600"
            },
            {
              label: t.home.culturalCreators,
              value: stats.uniqueCreators,
              icon: <Users className="w-8 h-8 text-white" />,
              color: "bg-gradient-to-br from-emerald-500 to-emerald-600"
            },
            {
              label: t.home.approvedProjects,
              value: stats.approvedProjects,
              icon: <Award className="w-8 h-8 text-white" />,
              color: "bg-gradient-to-br from-violet-500 to-violet-600"
            },
            {
              label: t.home.successRate,
              value: stats.successRate,
              suffix: "%",
              icon: <TrendingUp className="w-8 h-8 text-white" />,
              color: "bg-gradient-to-br from-amber-500 to-orange-500"
            }
          ]} />
          {stats.totalProjects === 0 && (
            <div className="text-center pb-8 -mt-8">
              <p className="text-sm text-muted-foreground/70 italic">
                {t.home.statsNote}
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
                {t.home.whoWeAre}
              </h2>
            </ShinyText>
          </div>
          
          <div className={`max-w-5xl mx-auto mb-20 transition-all duration-700 ${quemSomosInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '150ms' }}>
            <div className="text-base md:text-lg text-muted-foreground leading-relaxed space-y-6">
              {displayQuemSomos.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {displayQuemSomos.cards.map((card, index) => {
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

          {/* Botão Fale Conosco */}
          <div className={`mt-12 flex justify-center transition-all duration-700 ${quemSomosInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '600ms' }}>
            <ContactModal />
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
                {displayEcossistema.title}
              </h2>
            </ShinyText>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mt-6">
              {displayEcossistema.subtitle}
            </p>
          </div>

          {/* Featured Projects - Grid Layout with 4 Cards */}
          {loadingProjects ? (
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse bg-card card-solid rounded-2xl overflow-hidden border border-border shadow-2xl">
                  <div className="h-48 md:h-56 bg-muted" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-16 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : isAdmin ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleFeaturedDragEnd}
            >
              <SortableContext 
                items={localDisplayItems.map(item => item.type === 'real' ? `real-${item.data.id}` : item.data.id)} 
                strategy={rectSortingStrategy}
              >
                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                  {(Array.isArray(localDisplayItems) ? localDisplayItems : []).map((item, index) => {
                    const project = item.data;
                    const isExample = item.type === 'example';
                    const linkUrl = isExample ? (project as any).link : `/project/${project.id}`;
                    const isLeftCard = index % 2 === 0;

                    const translatedEntry = featuredCardsMap.get(project.id);
                    const translatedCard = translatedEntry?.partial;
                    const canSkipTranslation = translatedEntry?.complete === true;

                    return (
                      <SortableFeaturedCard key={project.id} item={item} isAdmin={isAdmin}>
                        <TranslatedProjectCard
                          project={{
                            id: project.id,
                            title: project.title,
                            synopsis: project.synopsis,
                            project_type: project.project_type,
                            image_url: project.image_url,
                          }}
                          translatedProject={translatedCard}
                          skipTranslation={canSkipTranslation}
                          linkUrl={linkUrl}
                          isLeftCard={isLeftCard}
                          heroReady={heroReady}
                          inView={portoIdeiasInView}
                          index={index}
                        />
                      </SortableFeaturedCard>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {(Array.isArray(displayItems) ? displayItems : []).map((item, index) => {
                const project = item.data;
                const isExample = item.type === 'example';
                const linkUrl = isExample ? (project as any).link : `/project/${project.id}`;
                const isLeftCard = index % 2 === 0;

                const translatedEntry = featuredCardsMap.get(project.id);
                const translatedCard = translatedEntry?.partial;
                const canSkipTranslation = translatedEntry?.complete === true;

                return (
                  <TranslatedProjectCard
                    key={project.id}
                    project={{
                      id: project.id,
                      title: project.title,
                      synopsis: project.synopsis,
                      project_type: project.project_type,
                      image_url: project.image_url,
                    }}
                    translatedProject={translatedCard}
                    skipTranslation={canSkipTranslation}
                    linkUrl={linkUrl}
                    isLeftCard={isLeftCard}
                    heroReady={heroReady}
                    inView={portoIdeiasInView}
                    index={index}
                  />
                );
              })}
            </div>
          )}

          {/* Botão "Conheça todos os projetos" */}
          <div className={`flex justify-center mt-12 transition-all duration-700 ${portoIdeiasInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '400ms' }}>
            <Link
              to="/porto-de-ideias"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              {t.home.viewAllProjects}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Nossos Serviços Section */}
      <section ref={servicosRef} id="servicos" className="py-20 lg:py-28 relative z-10">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        
        <div className="mx-auto px-4 sm:px-[10%] lg:px-[20%] relative z-10">
          <div className={`text-center mb-16 transition-all duration-700 ${servicosInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <ShinyText className="inline-block" delay={200}>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-foreground mb-4 decorative-line">
                {t.home.ourServices}
              </h2>
            </ShinyText>
          </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {displayServicos.services.map((service, index) => {
                const ServiceIcon = iconMap[service.icon] || Star;
                const skipTranslation = language !== "pt" && isValidServicos(translatedServicos);
                return (
                  <TranslatedServiceCard
                    key={index}
                    serviceId={`${index}`}
                    text={service.text}
                    icon={ServiceIcon}
                    hoverColor={service.hoverColor}
                    index={index}
                    inView={servicosInView}
                    skipTranslation={skipTranslation}
                  />
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
