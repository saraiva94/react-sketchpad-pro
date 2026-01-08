import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { useLanguage } from "@/hooks/useLanguage";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import { usePreloadTranslations, createTranslationItems } from "@/hooks/usePreloadTranslations";
import { TranslatedText } from "@/components/TranslatedText";
import { TranslatedBadge } from "@/components/TranslatedBadge";
import { getCategoryLabel } from "@/components/admin/CategoriesMultiSelect";
import { getIncentiveLawLabel } from "@/components/admin/IncentiveLawsMultiSelect";
import { getStageLabel } from "@/components/admin/StagesMultiSelect";
import jsPDF from "jspdf";
import imdbLogo from "@/assets/imdb-logo.png";
import { TranslatedMemberCard } from "@/components/TranslatedMemberCard";
import { SmartTeamGrid } from "@/components/SmartTeamGrid";
import { SortableTeamGrid } from "@/components/SortableTeamGrid";
import { TranslatedContrapartidaCard } from "@/components/TranslatedContrapartidaCard";
import { WavesBackground } from "@/components/WavesBackground";
import { useAuth } from "@/hooks/useAuth";
import { 
  ArrowLeft, 
  MapPin, 
  Sparkles,
  MessageCircle,
  Download,
  Users,
  Target,
  Globe,
  Star,
  Shield,
  Play,
  ExternalLink,
  Check,
  Gift,
  Award,
  Newspaper,
  Instagram,
  Linkedin,
  Facebook,
  Youtube,
  FileText,
  Twitter
} from "lucide-react";

interface NewsItem {
  title: string;
  url?: string;
  date?: string;
}

interface FestivalItem {
  title: string;
  url?: string;
  date?: string;
}

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
  hero_image_url: string | null;
  card_image_url: string | null;
  budget: string | null;
  location: string | null;
  created_at: string;
  updated_at: string | null;
  categorias_tags: string[] | null;
  responsavel_primeiro_nome: string | null;
  link_video: string | null;
  link_pagamento: string | null;
  impacto_cultural: string | null;
  impacto_social: string | null;
  publico_alvo: string | null;
  diferenciais: string | null;
  valor_sugerido: number | null;
  presentation_document_url: string | null;
  stages: string[] | null;
  awards: string[] | null;
  news: NewsItem[] | null;
  festivals_exhibitions: FestivalItem[] | null;
  additional_info: string | null;
}

interface ProjectMember {
  id: string;
  nome: string;
  funcao: string | null;
  email: string | null;
  telefone: string | null;
  photo_url: string | null;
  curriculum_url: string | null;
  social_links: {
    instagram?: string;
    linkedin?: string;
    facebook?: string;
    youtube?: string;
    twitter?: string;
    website?: string;
    imdb?: string;
    whatsapp?: string;
  } | null;
  detalhes?: string | null;
}

interface ContactButton {
  id: string;
  name: string;
  link: string;
}

interface Contrapartida {
  id: string;
  titulo?: string;
  valor: string;
  beneficios: string[];
  ativo: boolean;
  ordem: number;
  indice?: string;
}

const ProjectPage = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const { isAdmin } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [contactButtons, setContactButtons] = useState<ContactButton[]>([]);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [contrapartidas, setContrapartidas] = useState<Contrapartida[]>([]);

  // Auto-tradução de campos individuais do projeto (strings do banco estão em PT)
  // Traduzir campos individuais ao invés do objeto completo para melhor cache e reuso
  const { translated: translatedTitle } = useAutoTranslate(
    `project_full_${id ?? "unknown"}_title`,
    project?.title
  );
  const { translated: translatedSynopsis } = useAutoTranslate(
    `project_full_${id ?? "unknown"}_synopsis`,
    project?.synopsis
  );
  const { translated: translatedDescription } = useAutoTranslate(
    `project_full_${id ?? "unknown"}_description`,
    project?.description
  );
  const { translated: translatedProjectType } = useAutoTranslate(
    `project_type`,
    project?.project_type
  );
  const { translated: translatedImpactoCultural } = useAutoTranslate(
    `project_full_${id ?? "unknown"}_impacto_cultural`,
    project?.impacto_cultural
  );
  const { translated: translatedImpactoSocial } = useAutoTranslate(
    `project_full_${id ?? "unknown"}_impacto_social`,
    project?.impacto_social
  );
  const { translated: translatedPublicoAlvo } = useAutoTranslate(
    `project_full_${id ?? "unknown"}_publico_alvo`,
    project?.publico_alvo
  );
  const { translated: translatedDiferenciais } = useAutoTranslate(
    `project_full_${id ?? "unknown"}_diferenciais`,
    project?.diferenciais
  );
  const { translated: translatedAdditionalInfo } = useAutoTranslate(
    `project_full_${id ?? "unknown"}_additional_info`,
    project?.additional_info
  );

  // Construir displayProject com campos traduzidos individualmente
  const displayProject = project ? {
    ...project,
    title: language === "pt" ? project.title : (translatedTitle || project.title),
    synopsis: language === "pt" ? project.synopsis : (translatedSynopsis || project.synopsis),
    description: language === "pt" ? project.description : (translatedDescription || project.description),
    project_type: language === "pt" ? project.project_type : (translatedProjectType || project.project_type),
    impacto_cultural: language === "pt" ? project.impacto_cultural : (translatedImpactoCultural || project.impacto_cultural),
    impacto_social: language === "pt" ? project.impacto_social : (translatedImpactoSocial || project.impacto_social),
    publico_alvo: language === "pt" ? project.publico_alvo : (translatedPublicoAlvo || project.publico_alvo),
    diferenciais: language === "pt" ? project.diferenciais : (translatedDiferenciais || project.diferenciais),
    additional_info: language === "pt" ? project.additional_info : (translatedAdditionalInfo || project.additional_info),
  } : null;

  // Preload de traduções quando dados carregarem
  const preloadItems = [
    ...createTranslationItems.forProject(id ?? "", project),
    ...createTranslationItems.forMembers(id ?? "", members),
    ...createTranslationItems.forContrapartidas(contrapartidas),
  ];
  usePreloadTranslations(preloadItems, !loading && !!project);

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchMembers();
      fetchContactButtons();
      fetchContrapartidas();
    }
  }, [id]);

  const fetchProject = async () => {
    const { data, error } = await supabase
      .from("projects_public")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!error && data) {
      // Fetch awards, news and festivals from projects table (not in public view)
      const { data: extraData } = await supabase
        .from("projects")
        .select("awards, news, festivals_exhibitions")
        .eq("id", id)
        .maybeSingle();
      
      const projectData = {
        ...data,
        awards: extraData?.awards || [],
        news: (extraData?.news as unknown as NewsItem[]) || [],
        festivals_exhibitions: (extraData?.festivals_exhibitions as unknown as FestivalItem[]) || [],
      } as unknown as Project;
      
      setProject(projectData);
    }
    setLoading(false);
  };

  const fetchMembers = async () => {
    const { data } = await supabase
      .from("project_members")
      .select("id, nome, funcao, email, telefone, photo_url, curriculum_url, social_links, detalhes, order_index")
      .eq("project_id", id)
      .order("order_index", { ascending: true, nullsFirst: false });
    
    if (data) {
      setMembers(data.map(m => ({
        ...m,
        social_links: m.social_links as ProjectMember['social_links'],
        detalhes: m.detalhes
      })));
    }
  };

  const fetchContactButtons = async () => {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "contact_buttons")
      .maybeSingle();

    if (data) {
      const value = data.value as unknown as { contacts: ContactButton[] };
      setContactButtons(value.contacts || []);
    } else {
      setContactButtons([{
        id: "default",
        name: "WhatsApp Porto Bello",
        link: "https://wa.me/5521967264730"
      }]);
    }
  };

  const fetchContrapartidas = async () => {
    const { data } = await supabase
      .from("contrapartidas")
      .select("*")
      .eq("project_id", id)
      .eq("ativo", true)
      .order("ordem", { ascending: true });

    if (data) {
      setContrapartidas(data as Contrapartida[]);
    }
  };

  const handleContactClick = () => {
    if (contactButtons.length === 1) {
      window.open(contactButtons[0].link, "_blank");
    } else if (contactButtons.length > 1) {
      setShowContactPopup(true);
    }
  };

  const handleDownloadPDF = () => {
    if (!project || !displayProject) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let yPos = 20;

    // Title
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    const titleLines = doc.splitTextToSize(displayProject.title, contentWidth);
    doc.text(titleLines, margin, yPos);
    yPos += titleLines.length * 10 + 5;

    // Project type and location
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    let subInfo = displayProject.project_type;
    if (displayProject.location) subInfo += ` | ${displayProject.location}`;
    doc.text(subInfo, margin, yPos);
    yPos += 10;

    // Incentive law badge
    if (displayProject.has_incentive_law) {
      doc.setTextColor(128, 0, 128);
      doc.text(`✓ ${t.projectDetails.incentiveLawTitle}`, margin, yPos);
      yPos += 8;
    }

    doc.setTextColor(0);
    yPos += 5;

    // Synopsis
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(t.projectDetails.synopsis, margin, yPos);
    yPos += 8;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const synopsisLines = doc.splitTextToSize(displayProject.synopsis, contentWidth);
    doc.text(synopsisLines, margin, yPos);
    yPos += synopsisLines.length * 6 + 10;

    // Description
    if (displayProject.description) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(t.projectDetails.description, margin, yPos);
      yPos += 8;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const descLines = doc.splitTextToSize(displayProject.description, contentWidth);
      descLines.forEach((line: string) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, margin, yPos);
        yPos += 6;
      });
      yPos += 10;
    }

    // Budget
    if (displayProject.valor_sugerido || displayProject.budget) {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(t.projectDetails.budget, margin, yPos);
      yPos += 8;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const budgetText = displayProject.valor_sugerido
        ? formatBudget(displayProject.valor_sugerido)
        : (displayProject.budget || "");
      doc.text(budgetText || t.common.notAvailable, margin, yPos);
      yPos += 12;
    }

    // Impact sections
    const impacts = [
      { title: t.projectDetails.culturalImpact, content: displayProject.impacto_cultural },
      { title: t.projectDetails.socialImpact, content: displayProject.impacto_social },
      { title: t.projectDetails.targetAudience, content: displayProject.publico_alvo },
      { title: t.projectDetails.differentials, content: displayProject.diferenciais },
    ].filter((i) => i.content);

    impacts.forEach(({ title, content }) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(title, margin, yPos);
      yPos += 8;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(content!, contentWidth);
      lines.forEach((line: string) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, margin, yPos);
        yPos += 6;
      });
      yPos += 10;
    });

    // Incentive law details
    if (displayProject.has_incentive_law && displayProject.incentive_law_details) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(t.projectDetails.incentiveLawDetails, margin, yPos);
      yPos += 8;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const lawLines = doc.splitTextToSize(displayProject.incentive_law_details, contentWidth);
      lawLines.forEach((line: string) => {
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, margin, yPos);
        yPos += 6;
      });
      yPos += 10;
    }

    // Team members
    if (members.length > 0) {
      if (yPos > 240) { doc.addPage(); yPos = 20; }
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Ficha Técnica", margin, yPos);
      yPos += 8;
      doc.setFontSize(11);
      members.forEach((member) => {
        if (yPos > 280) { doc.addPage(); yPos = 20; }
        doc.setFont("helvetica", "bold");
        doc.text(`• ${member.nome}`, margin, yPos);
        if (member.funcao) {
          doc.setFont("helvetica", "normal");
          doc.text(` - ${member.funcao}`, margin + doc.getTextWidth(`• ${member.nome}`), yPos);
        }
        yPos += 7;
      });
    }


    // Footer
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(
      `${t.common.generatedOn} ${new Date().toLocaleDateString("pt-BR")} | Porto Bello Filmes`,
      margin,
      285
    );

    // Download
    const fileName = `${displayProject.title.replace(/[^a-zA-Z0-9]/g, "_")}_apresentacao.pdf`;
    doc.save(fileName);

    toast({
      title: t.projectDetails.generatePdf,
      description: t.common.downloadStarted,
    });
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
          <p className="text-muted-foreground">{t.projectDetails.loadingProject}</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar showNav={false} />
        <div className="h-20" />
        <main className="container mx-auto px-4 py-16 text-center">
          <Sparkles className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-bold mb-2">{t.projectDetails.projectNotFound}</h1>
          <p className="text-muted-foreground mb-6">
            {t.projectDetails.projectNotFoundDesc}
          </p>
          <Link to="/porto-de-ideias">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.projectDetails.backToProjects}
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  const embedUrl = getVideoEmbedUrl(project.link_video);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Animated Waves Background */}
      <WavesBackground />
      {/* Standard Navbar */}
      <Navbar showNav={false} rightContent={
        <Link to="/porto-de-ideias" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.common.back}
        </Link>
      } />
      <div className="h-20" />

      {/* Hero Section */}
      <section className="relative">
        <div className="w-full aspect-[21/4] max-h-96 overflow-hidden">
          {(project.hero_image_url || project.image_url) ? (
            <img 
              src={`${project.hero_image_url || project.image_url}${project.updated_at ? `?v=${encodeURIComponent(project.updated_at)}` : ''}`}
              alt={displayProject?.title || project.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 flex items-center justify-center">
              <span className="text-8xl font-handwritten text-primary/30">{displayProject?.title?.charAt(0) || project.title.charAt(0)}</span>
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">{displayProject?.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-white/90 mb-6">
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">{displayProject?.project_type}</Badge>
                {displayProject?.location && (
                  <span className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-1" />{displayProject.location}
                  </span>
                )}
                {project.has_incentive_law && (
                  <Badge className="bg-violet-500/80 hover:bg-violet-500 text-white border-0">
                    <Shield className="w-3 h-3 mr-1" />{t.projects.incentiveLaw}
                  </Badge>
                )}
              </div>
              {project.presentation_document_url ? (
                <a 
                  href={project.presentation_document_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary" className="rounded-full">
                    <Download className="w-4 h-4 mr-2" />
                    {t.projectDetails.downloadPdf}
                  </Button>
                </a>
              ) : (
                <Button variant="secondary" className="rounded-full" onClick={handleDownloadPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  {t.projectDetails.generatePdf}
                </Button>
              )}
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
                  {t.projectDetails.presentationVideo}
                </h2>
                <div className="relative w-full h-0 pb-[56.25%] rounded-2xl overflow-hidden shadow-lg">
                  <iframe
                    src={embedUrl}
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    title={t.projectDetails.presentationVideo}
                  ></iframe>
                </div>
              </section>
            )}

            {/* Synopsis and Description */}
            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-6">{t.projectDetails.description}</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">{t.projectDetails.synopsis}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">{displayProject?.synopsis}</p>
                </div>
                {displayProject?.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">{t.projectDetails.description}</h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{displayProject.description}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Team */}
            {members.length > 0 && (() => {
              // Separate members: cast (elenco) vs other roles
              const isCastRole = (funcao?: string | null) => {
                if (!funcao) return false;
                const lower = funcao.toLowerCase().trim();
                return lower.startsWith('elenco') || 
                       lower === 'ator' || 
                       lower === 'atriz' ||
                       lower.startsWith('ator ') ||
                       lower.startsWith('atriz ');
              };
              
              const castMembers = members.filter(m => isCastRole(m.funcao));
              const otherMembers = members.filter(m => !isCastRole(m.funcao));

              return (
                <section>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-6 flex items-center gap-2">
                    <Users className="w-6 h-6 text-primary" />
                    {t.projectDetails.technicalSheet}
                  </h2>
                  
                  {/* Equipe técnica com drag-and-drop para admin */}
                  {otherMembers.length > 0 && (
                    <SortableTeamGrid 
                      members={otherMembers} 
                      getInitials={getInitials}
                      projectId={id!}
                      isAdmin={isAdmin}
                      onMembersReordered={(newMembers) => {
                        // Atualiza a lista local combinando com castMembers
                        setMembers([...newMembers, ...castMembers]);
                      }}
                    />
                  )}
                  
                  {/* Divider between crew and cast */}
                  {otherMembers.length > 0 && castMembers.length > 0 && (
                    <div className="my-8 flex items-center gap-4">
                      <div className="flex-1 h-px bg-border/50" />
                      <span className="text-sm text-muted-foreground font-medium">{t.projectDetails.cast}</span>
                      <div className="flex-1 h-px bg-border/50" />
                    </div>
                  )}
                  
                  {/* Elenco com drag-and-drop para admin */}
                  {castMembers.length > 0 && (
                    <SortableTeamGrid 
                      members={castMembers} 
                      getInitials={getInitials}
                      projectId={id!}
                      isAdmin={isAdmin}
                      onMembersReordered={(newMembers) => {
                        // Atualiza a lista local combinando com otherMembers
                        setMembers([...otherMembers, ...newMembers]);
                      }}
                    />
                  )}
                </section>
              );
            })()}

            {/* Impact */}
            {(displayProject?.impacto_cultural || displayProject?.impacto_social || displayProject?.publico_alvo || displayProject?.diferenciais) && (
              <section>
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6 flex items-center gap-2">
                  <Target className="w-6 h-6 text-primary" />
                  {t.projectDetails.projectImpact}
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {displayProject?.impacto_cultural && (
                    <div className="group bg-primary/5 p-6 rounded-2xl border border-primary/10 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center">
                        <Sparkles className="w-5 h-5 text-primary mr-2" />
                        {t.projectDetails.culturalImpact}
                      </h3>
                      <p className="text-muted-foreground">{displayProject.impacto_cultural}</p>
                    </div>
                  )}
                  {displayProject?.impacto_social && (
                    <div className="group bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/10 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center">
                        <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-2" />
                        {t.projectDetails.socialImpact}
                      </h3>
                      <p className="text-muted-foreground">{displayProject.impacto_social}</p>
                    </div>
                  )}
                  {displayProject?.publico_alvo && (
                    <div className="group bg-violet-500/5 p-6 rounded-2xl border border-violet-500/10 transition-all duration-300 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-1">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center">
                        <Users className="w-5 h-5 text-violet-600 dark:text-violet-400 mr-2" />
                        {t.projectDetails.targetAudience}
                      </h3>
                      <p className="text-muted-foreground">{displayProject.publico_alvo}</p>
                    </div>
                  )}
                  {displayProject?.diferenciais && (
                    <div className="group bg-amber-500/5 p-6 rounded-2xl border border-amber-500/10 transition-all duration-300 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-1">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center">
                        <Star className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2" />
                        {t.projectDetails.differentials}
                      </h3>
                      <p className="text-muted-foreground">{displayProject.diferenciais}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Contrapartidas */}
            {contrapartidas.length > 0 && (
              <section>
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6 flex items-center gap-2">
                  <Gift className="w-6 h-6 text-primary" />
                  {t.projectDetails.investorRewards}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {contrapartidas.map((contrapartida) => (
                    <TranslatedContrapartidaCard
                      key={contrapartida.id}
                      contrapartida={contrapartida}
                      levelLabel={t.projectDetails.level}
                      benefitsLabel={t.projectDetails.benefits}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Recognition and Media */}
            {((displayProject?.awards && displayProject.awards.length > 0) || (displayProject?.news && displayProject.news.length > 0) || (displayProject?.festivals_exhibitions && displayProject.festivals_exhibitions.length > 0)) && (
              <section>
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6">
                  {t.projectDetails.recognitionMedia}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayProject?.awards && displayProject.awards.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-4 flex items-center">
                        <Award className="w-5 h-5 text-amber-500 mr-2" />
                        {t.projectDetails.awardsTitle}
                      </h3>
                      <ul className="space-y-3">
                        {displayProject.awards.map((award, index) => (
                          <li key={index}>
                            <div className="block p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                              <TranslatedText 
                                namespace={`award_${id}_${index}`}
                                value={award}
                                as="h4"
                                className="font-medium text-foreground"
                                showSkeleton={false}
                              />
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {displayProject?.festivals_exhibitions && displayProject.festivals_exhibitions.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-4 flex items-center">
                        <Play className="w-5 h-5 text-violet-500 mr-2" />
                        {t.projectDetails.festivalsExhibitions}
                      </h3>
                      <ul className="space-y-3">
                        {displayProject.festivals_exhibitions.map((item, index) => (
                          <li key={index}>
                            {item.url ? (
                              <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                              >
                                <TranslatedText 
                                  namespace={`festival_${id}_${index}`}
                                  value={item.title}
                                  as="h4"
                                  className="font-medium text-foreground mb-1"
                                  showSkeleton={false}
                                />
                                {item.date && <p className="text-sm text-muted-foreground">{item.date}</p>}
                              </a>
                            ) : (
                              <div className="block p-3 bg-muted/50 rounded-lg">
                                <TranslatedText 
                                  namespace={`festival_${id}_${index}`}
                                  value={item.title}
                                  as="h4"
                                  className="font-medium text-foreground mb-1"
                                  showSkeleton={false}
                                />
                                {item.date && <p className="text-sm text-muted-foreground">{item.date}</p>}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {displayProject?.news && displayProject.news.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-4 flex items-center">
                        <Newspaper className="w-5 h-5 text-primary mr-2" />
                        {t.projectDetails.inTheMedia}
                      </h3>
                      <ul className="space-y-3">
                        {displayProject.news.map((item, index) => (
                          <li key={index}>
                            {item.url ? (
                              <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                              >
                                <TranslatedText 
                                  namespace={`news_${id}_${index}`}
                                  value={item.title}
                                  as="h4"
                                  className="font-medium text-foreground mb-1"
                                  showSkeleton={false}
                                />
                                {item.date && <p className="text-sm text-muted-foreground">{item.date}</p>}
                              </a>
                            ) : (
                              <div className="block p-3 bg-muted/50 rounded-lg">
                                <TranslatedText 
                                  namespace={`news_${id}_${index}`}
                                  value={item.title}
                                  as="h4"
                                  className="font-medium text-foreground mb-1"
                                  showSkeleton={false}
                                />
                                {item.date && <p className="text-sm text-muted-foreground">{item.date}</p>}
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Project Info */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="font-serif font-bold text-xl text-foreground mb-4">{t.projectDetails.projectInfo}</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-muted-foreground">{t.projectDetails.titleLabel}</span>
                    <div className="font-semibold text-foreground">{displayProject?.title}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">{t.projectDetails.projectTypeLabel}</span>
                    <div className="font-medium text-foreground">{displayProject?.project_type}</div>
                  </div>
                  {displayProject?.stages && displayProject.stages.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">{t.projectDetails.projectStage}</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {[...new Set(displayProject.stages)].map((stage, index) => (
                          <TranslatedBadge 
                            key={index} 
                            namespace={`stage_${stage}`}
                            value={getStageLabel(stage)}
                            variant="outline"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {displayProject?.location && (
                    <div>
                      <span className="text-sm text-muted-foreground">{t.projectDetails.locationLabel}</span>
                      <div className="font-medium text-foreground flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {displayProject.location}
                      </div>
                    </div>
                  )}
                  {displayProject?.categorias_tags && displayProject.categorias_tags.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">{t.projectDetails.categoriesLabel}</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {displayProject.categorias_tags.map((tag, index) => (
                          <TranslatedBadge 
                            key={index} 
                            namespace={`category_${tag}`}
                            value={getCategoryLabel(tag)}
                            variant="secondary"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {displayProject?.additional_info && (
                    <div>
                      <span className="text-sm text-muted-foreground">{t.projectDetails.additionalInfo}</span>
                      <p className="font-medium text-foreground text-sm mt-1">{displayProject.additional_info}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Incentive Law Card */}
              {displayProject?.has_incentive_law && displayProject?.incentive_law_details && (
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h3 className="font-serif font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-violet-500" />
                    {t.projectDetails.incentiveLawTitle}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {displayProject.incentive_law_details.split(',').map((law, index) => (
                      <TranslatedBadge 
                        key={index} 
                        namespace={`law_${law.trim()}`}
                        value={getIncentiveLawLabel(law.trim())}
                        variant="secondary"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Button */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-lg text-foreground mb-4">{t.projectDetails.contact}</h3>
                <Button className="w-full rounded-full" size="lg" onClick={handleContactClick}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {t.projectDetails.contactUs}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Popup - for multiple contacts */}
      <Dialog open={showContactPopup} onOpenChange={setShowContactPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">{t.projectDetails.chooseContact}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {contactButtons.map((contact) => (
              <a
                key={contact.id}
                href={contact.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors"
              >
                <span className="font-medium">{contact.name}</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </a>
            ))}
          </div>
        </DialogContent>
      </Dialog>


      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ProjectPage;
