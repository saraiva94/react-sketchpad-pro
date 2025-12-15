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
  Heart,
  MessageCircle,
  Download,
  Users,
  Target,
  Globe,
  Star,
  Shield,
  CheckCircle,
  Play,
  Mail,
  Phone,
  ExternalLink,
  Check,
  Gift
} from "lucide-react";

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
}

interface ProjectMember {
  id: string;
  nome: string;
  funcao: string | null;
  email: string | null;
}

interface ContactButton {
  id: string;
  name: string;
  link: string;
}

interface CreatorInfo {
  nome: string | null;
  email: string | null;
  telefone: string | null;
}

interface Contrapartida {
  id: string;
  valor: string;
  beneficios: string[];
  ativo: boolean;
  ordem: number;
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
  const [showCreatorPopup, setShowCreatorPopup] = useState(false);
  const [creatorInfo, setCreatorInfo] = useState<CreatorInfo | null>(null);
  const [contrapartidas, setContrapartidas] = useState<Contrapartida[]>([]);

  useEffect(() => {
    if (id) {
      fetchProject();
      fetchMembers();
      fetchContactButtons();
      fetchCreatorInfo();
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
      setProject(data as unknown as Project);
    }
    setLoading(false);
  };

  const fetchMembers = async () => {
    const { data } = await supabase
      .from("project_members")
      .select("id, nome, funcao, email")
      .eq("project_id", id);
    
    if (data) {
      setMembers(data);
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

  const fetchCreatorInfo = async () => {
    const { data } = await supabase
      .from("projects")
      .select("responsavel_nome, responsavel_email, responsavel_telefone")
      .eq("id", id)
      .maybeSingle();

    if (data) {
      setCreatorInfo({
        nome: data.responsavel_nome,
        email: data.responsavel_email,
        telefone: data.responsavel_telefone
      });
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
        : (project.budget || "A definir");
      doc.text(budgetText, margin, yPos);
      yPos += 12;
    }

    // Impact sections
    const impacts = [
      { title: "Impacto Cultural", content: project.impacto_cultural },
      { title: "Impacto Social", content: project.impacto_social },
      { title: "Público Estimado", content: project.publico_alvo },
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

    // Creator/Responsible contact info
    if (creatorInfo && (creatorInfo.nome || creatorInfo.email || creatorInfo.telefone)) {
      if (yPos > 240) { doc.addPage(); yPos = 20; }
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0);
      doc.text("Contato do Responsável", margin, yPos);
      yPos += 8;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      if (creatorInfo.nome) {
        doc.text(`Nome: ${creatorInfo.nome}`, margin, yPos);
        yPos += 6;
      }
      if (creatorInfo.email) {
        doc.text(`E-mail: ${creatorInfo.email}`, margin, yPos);
        yPos += 6;
      }
      if (creatorInfo.telefone) {
        doc.text(`Telefone: ${creatorInfo.telefone}`, margin, yPos);
        yPos += 6;
      }
      yPos += 10;
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
    if (!value) return "A definir";
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
                    <div key={member.id} className="flex items-center space-x-3 p-4 bg-muted/50 rounded-xl border border-border/50">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-foreground text-sm font-semibold">
                          {getInitials(member.nome)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-foreground text-sm">{member.nome}</h4>
                        {member.funcao && (
                          <p className="text-xs text-muted-foreground">{member.funcao}</p>
                        )}
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
                        Público Estimado
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
                <div className="grid gap-4">
                  {contrapartidas.map((contrapartida) => (
                    <div 
                      key={contrapartida.id} 
                      className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="mb-4">
                        <span className="text-xl font-bold text-foreground">
                          {contrapartida.valor}
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {contrapartida.beneficios.map((beneficio, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{beneficio}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
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
                    <span className="text-sm text-muted-foreground">Orçamento Total</span>
                    <div className="text-2xl font-bold text-foreground">
                      {project.valor_sugerido ? formatBudget(project.valor_sugerido) : (project.budget || "A definir")}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Publicado em</span>
                    <div className="font-medium text-foreground">
                      {new Date(project.created_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                  {project.categorias_tags && project.categorias_tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {project.categorias_tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="rounded-full">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Button */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-lg text-foreground mb-4">Contato</h3>
                <Button className="w-full rounded-full" size="lg" onClick={handleContactClick}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contato
                </Button>
              </div>

              {/* Creator Info */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="font-serif font-bold text-lg text-foreground mb-4">Criador do Projeto</h3>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-lg font-semibold">
                      {project.responsavel_primeiro_nome ? getInitials(project.responsavel_primeiro_nome) : 'PC'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground flex items-center">
                      {project.responsavel_primeiro_nome || "Produtor Cultural"}
                      <CheckCircle className="w-4 h-4 text-primary ml-2" />
                    </h4>
                    <p className="text-sm text-muted-foreground">Produtor(a) Cultural</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full rounded-full" onClick={() => setShowCreatorPopup(true)}>
                  Ver Informações de Contato
                </Button>
              </div>

              {/* Incentive Law Card */}
              {project.has_incentive_law && project.incentive_law_details && (
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                  <h3 className="font-serif font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-violet-500" />
                    Lei de Incentivo
                  </h3>
                  <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                    <p className="text-sm text-muted-foreground">{project.incentive_law_details}</p>
                  </div>
                </div>
              )}
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

      {/* Creator Info Popup */}
      <Dialog open={showCreatorPopup} onOpenChange={setShowCreatorPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Informações do Criador</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {creatorInfo ? (
              <>
                {creatorInfo.nome && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Nome</p>
                      <p className="font-medium">{creatorInfo.nome}</p>
                    </div>
                  </div>
                )}
                {creatorInfo.telefone && (
                  <a 
                    href={`https://wa.me/55${creatorInfo.telefone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-emerald-500/20 transition-colors cursor-pointer"
                  >
                    <Phone className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Telefone</p>
                      <p className="font-medium text-emerald-500 hover:underline">{creatorInfo.telefone}</p>
                    </div>
                  </a>
                )}
                {creatorInfo.email && (
                  <a 
                    href={`mailto:${creatorInfo.email}`}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{creatorInfo.email}</p>
                    </div>
                  </a>
                )}
              </>
            ) : (
              <p className="text-muted-foreground text-center py-4">Informações de contato não disponíveis.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ProjectPage;
