import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import jsPDF from "jspdf";
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
  FileText
} from "lucide-react";

interface NewsItem {
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
  budget: string | null;
  location: string | null;
  created_at: string;
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
    website?: string;
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
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [contactButtons, setContactButtons] = useState<ContactButton[]>([]);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [contrapartidas, setContrapartidas] = useState<Contrapartida[]>([]);

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
      // Fetch awards and news from projects table (not in public view)
      const { data: extraData } = await supabase
        .from("projects")
        .select("awards, news")
        .eq("id", id)
        .maybeSingle();
      
      const projectData = {
        ...data,
        awards: extraData?.awards || [],
        news: (extraData?.news as unknown as NewsItem[]) || [],
      } as unknown as Project;
      
      setProject(projectData);
    }
    setLoading(false);
  };

  const fetchMembers = async () => {
    const { data } = await supabase
      .from("project_members")
      .select("id, nome, funcao, email, telefone, photo_url, curriculum_url, social_links, detalhes")
      .eq("project_id", id);
    
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
    if (!project) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let yPos = 20;

    // Title
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    const titleLines = doc.splitTextToSize(project.title, contentWidth);
    doc.text(titleLines, margin, yPos);
    yPos += titleLines.length * 10 + 5;

    // Project type and location
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    let subInfo = project.project_type;
    if (project.location) subInfo += ` | ${project.location}`;
    doc.text(subInfo, margin, yPos);
    yPos += 10;

    // Incentive law badge
    if (project.has_incentive_law) {
      doc.setTextColor(128, 0, 128);
      doc.text("✓ Projeto com Lei de Incentivo", margin, yPos);
      yPos += 8;
    }

    doc.setTextColor(0);
    yPos += 5;

    // Synopsis
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Sinopse", margin, yPos);
    yPos += 8;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const synopsisLines = doc.splitTextToSize(project.synopsis, contentWidth);
    doc.text(synopsisLines, margin, yPos);
    yPos += synopsisLines.length * 6 + 10;

    // Description
    if (project.description) {
      if (yPos > 250) { doc.addPage(); yPos = 20; }
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Descrição Completa", margin, yPos);
      yPos += 8;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const descLines = doc.splitTextToSize(project.description, contentWidth);
      descLines.forEach((line: string) => {
        if (yPos > 280) { doc.addPage(); yPos = 20; }
        doc.text(line, margin, yPos);
        yPos += 6;
      });
      yPos += 10;
    }

    // Budget
    if (project.valor_sugerido || project.budget) {
      if (yPos > 260) { doc.addPage(); yPos = 20; }
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Orçamento", margin, yPos);
      yPos += 8;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const budgetText = project.valor_sugerido 
        ? formatBudget(project.valor_sugerido) 
        : (project.budget || "Não informado");
      doc.text(budgetText, margin, yPos);
      yPos += 12;
    }

    // Impact sections
    const impacts = [
      { title: "Impacto Cultural", content: project.impacto_cultural },
      { title: "Impacto Social", content: project.impacto_social },
      { title: "Público-Alvo", content: project.publico_alvo },
      { title: "Diferenciais", content: project.diferenciais },
    ].filter(i => i.content);

    impacts.forEach(({ title, content }) => {
      if (yPos > 250) { doc.addPage(); yPos = 20; }
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(title, margin, yPos);
      yPos += 8;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(content!, contentWidth);
      lines.forEach((line: string) => {
        if (yPos > 280) { doc.addPage(); yPos = 20; }
        doc.text(line, margin, yPos);
        yPos += 6;
      });
      yPos += 10;
    });

    // Incentive law details
    if (project.has_incentive_law && project.incentive_law_details) {
      if (yPos > 250) { doc.addPage(); yPos = 20; }
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Detalhes da Lei de Incentivo", margin, yPos);
      yPos += 8;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      const lawLines = doc.splitTextToSize(project.incentive_law_details, contentWidth);
      lawLines.forEach((line: string) => {
        if (yPos > 280) { doc.addPage(); yPos = 20; }
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
    doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")} | Porto Bello Filmes`, margin, 285);

    // Download
    const fileName = `${project.title.replace(/[^a-zA-Z0-9]/g, '_')}_apresentacao.pdf`;
    doc.save(fileName);
    
    toast({
      title: "PDF gerado com sucesso",
      description: "O download foi iniciado automaticamente.",
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
          <p className="text-muted-foreground">Carregando projeto...</p>
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
          <h1 className="text-2xl font-serif font-bold mb-2">Projeto não encontrado</h1>
          <p className="text-muted-foreground mb-6">
            Este projeto pode não existir ou não estar aprovado ainda.
          </p>
          <Link to="/porto-de-ideias">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Projetos
            </Button>
          </Link>
        </main>
      </div>
    );
  }

  const embedUrl = getVideoEmbedUrl(project.link_video);

  return (
    <div className="min-h-screen bg-background">
      {/* Standard Navbar */}
      <Navbar showNav={false} rightContent={
        <Link to="/porto-de-ideias" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Link>
      } />
      <div className="h-20" />

      {/* Hero Section */}
      <section className="relative">
        <div className="w-full h-96 overflow-hidden">
          {project.image_url ? (
            <img 
              src={project.image_url}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 flex items-center justify-center">
              <span className="text-8xl font-handwritten text-primary/30">{project.title.charAt(0)}</span>
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4">{project.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-white/90 mb-6">
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">{project.project_type}</Badge>
                {project.location && (
                  <span className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 mr-1" />{project.location}
                  </span>
                )}
                {project.has_incentive_law && (
                  <Badge className="bg-violet-500/80 hover:bg-violet-500 text-white border-0">
                    <Shield className="w-3 h-3 mr-1" />Lei de Incentivo
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
                    Baixar apresentação em PDF
                  </Button>
                </a>
              ) : (
                <Button variant="secondary" className="rounded-full" onClick={handleDownloadPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar apresentação em PDF
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
                  Vídeo de Apresentação
                </h2>
                <div className="relative w-full h-0 pb-[56.25%] rounded-2xl overflow-hidden shadow-lg">
                  <iframe
                    src={embedUrl}
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    title="Vídeo de apresentação do projeto"
                  ></iframe>
                </div>
              </section>
            )}

            {/* Synopsis and Description */}
            <section>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-6">Sobre o Projeto</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Sinopse</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">{project.synopsis}</p>
                </div>
                {project.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">Descrição Completa</h3>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{project.description}</p>
                  </div>
                )}
              </div>
            </section>

            {/* Team */}
            {members.length > 0 && (
              <section>
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6 flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  Ficha Técnica
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {members.map((member) => (
                    <div key={member.id} className="p-4 bg-muted/50 rounded-xl border border-border/50">
                      <div className="flex items-start space-x-3">
                        {/* Foto */}
                        {member.photo_url ? (
                          <img 
                            src={member.photo_url} 
                            alt={member.nome}
                            className="w-14 h-14 rounded-full object-cover flex-shrink-0 border-2 border-primary/20"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-foreground text-sm font-semibold">
                              {getInitials(member.nome)}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-foreground text-sm">{member.nome}</h4>
                          {member.funcao && (
                            <p className="text-xs text-muted-foreground">{member.funcao}</p>
                          )}
                          
                          {/* Detalhes */}
                          {member.detalhes && (
                            <p className="text-xs text-muted-foreground mt-1">{member.detalhes}</p>
                          )}
                          
                          {/* Social Links e CV */}
                          <div className="flex items-center gap-2 mt-2">
                            {member.social_links?.instagram && (
                              <a href={member.social_links.instagram.startsWith('http') ? member.social_links.instagram : `https://instagram.com/${member.social_links.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full bg-pink-500/10 flex items-center justify-center hover:bg-pink-500/20 transition-colors">
                                <Instagram className="w-3 h-3 text-pink-500" />
                              </a>
                            )}
                            {member.social_links?.linkedin && (
                              <a href={member.social_links.linkedin.startsWith('http') ? member.social_links.linkedin : `https://linkedin.com/in/${member.social_links.linkedin}`} target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full bg-blue-600/10 flex items-center justify-center hover:bg-blue-600/20 transition-colors">
                                <Linkedin className="w-3 h-3 text-blue-600" />
                              </a>
                            )}
                            {member.social_links?.facebook && (
                              <a href={member.social_links.facebook.startsWith('http') ? member.social_links.facebook : `https://facebook.com/${member.social_links.facebook}`} target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center hover:bg-blue-500/20 transition-colors">
                                <Facebook className="w-3 h-3 text-blue-500" />
                              </a>
                            )}
                            {member.social_links?.youtube && (
                              <a href={member.social_links.youtube.startsWith('http') ? member.social_links.youtube : `https://youtube.com/${member.social_links.youtube}`} target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors">
                                <Youtube className="w-3 h-3 text-red-500" />
                              </a>
                            )}
                            {member.social_links?.website && (
                              <a href={member.social_links.website.startsWith('http') ? member.social_links.website : `https://${member.social_links.website}`} target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center hover:bg-emerald-500/20 transition-colors">
                                <Globe className="w-3 h-3 text-emerald-500" />
                              </a>
                            )}
                            {member.curriculum_url && (
                              <a href={member.curriculum_url} target="_blank" rel="noopener noreferrer" className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center hover:bg-orange-500/20 transition-colors" title="Baixar Currículo">
                                <FileText className="w-3 h-3 text-orange-500" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Impact */}
            {(project.impacto_cultural || project.impacto_social || project.publico_alvo || project.diferenciais) && (
              <section>
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6 flex items-center gap-2">
                  <Target className="w-6 h-6 text-primary" />
                  Impacto do Projeto
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {project.impacto_cultural && (
                    <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center">
                        <Sparkles className="w-5 h-5 text-primary mr-2" />
                        Impacto Cultural
                      </h3>
                      <p className="text-muted-foreground">{project.impacto_cultural}</p>
                    </div>
                  )}
                  {project.impacto_social && (
                    <div className="bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/10">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center">
                        <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mr-2" />
                        Impacto Social
                      </h3>
                      <p className="text-muted-foreground">{project.impacto_social}</p>
                    </div>
                  )}
                  {project.publico_alvo && (
                    <div className="bg-violet-500/5 p-6 rounded-2xl border border-violet-500/10">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center">
                        <Users className="w-5 h-5 text-violet-600 dark:text-violet-400 mr-2" />
                        Público-Alvo
                      </h3>
                      <p className="text-muted-foreground">{project.publico_alvo}</p>
                    </div>
                  )}
                  {project.diferenciais && (
                    <div className="bg-amber-500/5 p-6 rounded-2xl border border-amber-500/10">
                      <h3 className="font-semibold text-foreground mb-3 flex items-center">
                        <Star className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2" />
                        Diferenciais
                      </h3>
                      <p className="text-muted-foreground">{project.diferenciais}</p>
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
                  Contrapartidas para Investidores
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {contrapartidas.map((contrapartida) => {
                    // Format value as Brazilian currency
                    const formatCurrency = (value: string) => {
                      const numericValue = value.replace(/[^\d,.-]/g, '').replace(',', '.');
                      const number = parseFloat(numericValue);
                      
                      if (isNaN(number)) {
                        return value.startsWith('R$') ? value : `R$ ${value}`;
                      }
                      
                      return new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      }).format(number);
                    };

                    // Map indice to display label
                    const getIndiceLabel = (indice?: string) => {
                      const labels: Record<string, string> = {
                        'por_episodio': 'por episódio',
                        'por_temporada': 'por temporada',
                        'por_projeto': 'por projeto',
                        'por_evento': 'por evento',
                        'por_mes': 'por mês',
                        'por_ano': 'por ano',
                      };
                      return indice && indice !== 'none' ? labels[indice] : null;
                    };

                    const indiceLabel = getIndiceLabel(contrapartida.indice);

                    return (
                      <div 
                        key={contrapartida.id} 
                        className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
                      >
                        {/* Nível label */}
                        <p className="text-sm italic text-muted-foreground mb-1">Nível</p>
                        
                        {/* Título do nível (se existir) */}
                        {contrapartida.titulo && (
                          <p className="text-lg font-semibold text-foreground mb-2">{contrapartida.titulo}</p>
                        )}
                        
                        {/* Value with index */}
                        <div className="mb-4">
                          <span className="text-2xl font-bold text-foreground">
                            {formatCurrency(contrapartida.valor)}
                          </span>
                          {indiceLabel && (
                            <span className="text-lg text-foreground ml-2">
                              {indiceLabel}
                            </span>
                          )}
                        </div>
                        
                        {/* Benefits section */}
                        <div>
                          <p className="text-sm font-medium text-foreground border-b border-foreground/30 pb-1 mb-3">
                            Benefícios
                          </p>
                          <ul className="space-y-2">
                            {contrapartida.beneficios.map((beneficio, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-muted-foreground leading-relaxed">{beneficio}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Recognition and Media */}
            {((project.awards && project.awards.length > 0) || (project.news && project.news.length > 0)) && (
              <section>
                <h2 className="text-2xl font-serif font-bold text-foreground mb-6">
                  Reconhecimentos e Mídia
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {project.awards && project.awards.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-4 flex items-center">
                        <Award className="w-5 h-5 text-amber-500 mr-2" />
                        Prêmios e Reconhecimentos
                      </h3>
                      <ul className="space-y-3">
                        {project.awards.map((award, index) => (
                          <li key={index}>
                            <div className="block p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                              <h4 className="font-medium text-foreground">{award}</h4>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {project.news && project.news.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-4 flex items-center">
                        <Newspaper className="w-5 h-5 text-primary mr-2" />
                        Na Mídia
                      </h3>
                      <ul className="space-y-3">
                        {project.news.map((item, index) => (
                          <li key={index}>
                            {item.url ? (
                              <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="block p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                              >
                                <h4 className="font-medium text-foreground mb-1">{item.title}</h4>
                                {item.date && <p className="text-sm text-muted-foreground">{item.date}</p>}
                              </a>
                            ) : (
                              <div className="block p-3 bg-muted/50 rounded-lg">
                                <h4 className="font-medium text-foreground mb-1">{item.title}</h4>
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
                <h3 className="font-serif font-bold text-xl text-foreground mb-4">Informações do Projeto</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Título</span>
                    <div className="font-semibold text-foreground">{project.title}</div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Tipo do Projeto</span>
                    <div className="font-medium text-foreground">{project.project_type}</div>
                  </div>
                  {project.stages && project.stages.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Estágio do Projeto</span>
                      <div className="font-medium text-foreground">
                        {project.stages.map(stage => {
                          const stageTranslations: Record<string, string> = {
                            'development': 'Desenvolvimento',
                            'production': 'Produção',
                            'distribution': 'Distribuição',
                            'Ideia inicial': 'Ideia inicial',
                            'Desenvolvimento': 'Desenvolvimento',
                            'Captação de recursos': 'Captação de recursos',
                            'Pré-produção': 'Pré-produção',
                            'Pós-produção': 'Pós-produção',
                            'Finalizado': 'Finalizado',
                            'Em exibição': 'Em exibição',
                            'Distribuição': 'Distribuição'
                          };
                          return stageTranslations[stage] || stage;
                        }).join(", ")}
                      </div>
                    </div>
                  )}
                  {project.location && (
                    <div>
                      <span className="text-sm text-muted-foreground">Localização</span>
                      <div className="font-medium text-foreground flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {project.location}
                      </div>
                    </div>
                  )}
                  {project.categorias_tags && project.categorias_tags.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground">Categorias</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {project.categorias_tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="rounded-full">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {project.additional_info && (
                    <div>
                      <span className="text-sm text-muted-foreground">Informações Adicionais</span>
                      <p className="font-medium text-foreground text-sm mt-1">{project.additional_info}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Incentive Law Card */}
              {project.has_incentive_law && project.incentive_law_details && (
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h3 className="font-serif font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-violet-500" />
                    Lei de Incentivo
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.incentive_law_details.split(',').map((law, index) => (
                      <Badge key={index} variant="secondary" className="rounded-full">
                        {law.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Button */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-lg text-foreground mb-4">Contato</h3>
                <Button className="w-full rounded-full" size="lg" onClick={handleContactClick}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Fale conosco
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
            <DialogTitle className="font-serif">Escolha um contato</DialogTitle>
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
