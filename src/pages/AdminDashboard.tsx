import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { FeaturedProjectsManager } from "@/components/admin/FeaturedProjectsManager";
import { PortoIdeiasCardsManager } from "@/components/admin/PortoIdeiasCardsManager";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Edit,
  Trash2,
  LogOut,
  ExternalLink,
  Plus,
  Users,
  Star,
  StarOff,
  Home,
  BarChart3,
  Download,
  FileText,
  Phone,
  Mail,
  MessageSquare,
  Upload,
  Video,
  X,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Globe,
  Settings2,
  Save,
  Lightbulb
} from "lucide-react";

interface Project {
  id: string;
  title: string;
  synopsis: string;
  description: string | null;
  project_type: string;
  status: string;
  media_url: string | null;
  has_incentive_law: boolean;
  incentive_law_details: string | null;
  image_url: string | null;
  budget: string | null;
  location: string | null;
  admin_notes: string | null;
  created_at: string;
  user_id: string;
  responsavel_nome: string | null;
  responsavel_email: string | null;
  responsavel_telefone: string | null;
  responsavel_genero: string | null;
  categorias_tags: string[] | null;
  link_video: string | null;
  valor_sugerido: number | null;
  link_pagamento: string | null;
  impacto_cultural: string | null;
  impacto_social: string | null;
  publico_alvo: string | null;
  diferenciais: string | null;
  featured_on_homepage: boolean;
}

interface AccessRequest {
  id: string;
  nome: string;
  telefone: string;
  interesse: string;
  project_title: string | null;
  status: string;
  created_at: string;
}

interface ProjectMember {
  id: string;
  nome: string;
  funcao: string | null;
  email: string | null;
  telefone: string | null;
  project_id: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [activeSection, setActiveSection] = useState<"projects" | "requests" | "contacts" | "homepage">("homepage");
  const [statsVisible, setStatsVisible] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [featuredRefreshKey, setFeaturedRefreshKey] = useState(0);
  
  // Vídeos institucionais (até 5)
  interface VideoItem {
    url: string;
    title?: string;
  }
  const [institutionalVideos, setInstitutionalVideos] = useState<VideoItem[]>([
    { url: "", title: "" },
    { url: "", title: "" },
    { url: "", title: "" },
    { url: "", title: "" },
    { url: "", title: "" }
  ]);
  const [uploadingVideoIndex, setUploadingVideoIndex] = useState<number | null>(null);
  const [savingVideos, setSavingVideos] = useState(false);
  
  // Carousel display count (1, 3, or 5)
  const [carouselDisplayCount, setCarouselDisplayCount] = useState<1 | 3 | 5>(5);
  
  // Porto de Ideias slots control
  const [portoIdeiasSlots, setPortoIdeiasSlots] = useState(5);

  // Footer content control
  const [footerTagline, setFooterTagline] = useState("Uma plataforma criada para aproximar cultura e investimento.");
  const [footerEmails, setFooterEmails] = useState<string[]>(["portobellofilmes@gmail.com"]);
  const [footerPhones, setFooterPhones] = useState<string[]>(["(21) 96726-4730"]);
  const [savingFooterContent, setSavingFooterContent] = useState(false);

  // Social links control
  interface SocialLink {
    enabled: boolean;
    url: string;
  }
  interface SocialLinksConfig {
    facebook: SocialLink;
    instagram: SocialLink;
    linkedin: SocialLink;
    youtube: SocialLink;
    website: SocialLink;
  }
  const [socialLinks, setSocialLinks] = useState<SocialLinksConfig>({
    facebook: { enabled: false, url: "" },
    instagram: { enabled: true, url: "https://www.instagram.com/portobellofilmes/" },
    linkedin: { enabled: false, url: "" },
    youtube: { enabled: false, url: "" },
    website: { enabled: false, url: "" }
  });
  const [savingSocialLinks, setSavingSocialLinks] = useState(false);

  const [editImageUrl, setEditImageUrl] = useState("");
  const [editBudget, setEditBudget] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editAdminNotes, setEditAdminNotes] = useState("");

  // Contacts filters
  const [contactFilterGender, setContactFilterGender] = useState<string>("all");
  const [contactFilterStatus, setContactFilterStatus] = useState<string>("all");
  const [contactFilterDateFrom, setContactFilterDateFrom] = useState<string>("");
  const [contactFilterDateTo, setContactFilterDateTo] = useState<string>("");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (!isLoggedIn) {
      navigate("/auth");
    } else {
      fetchProjects();
      fetchProjectMembers();
      fetchAccessRequests();
      fetchStatsVisibility();
    }
  }, [navigate]);

  const fetchStatsVisibility = async () => {
    const { data: statsData } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "stats_visible")
      .maybeSingle();
    
    if (statsData) {
      setStatsVisible((statsData.value as { enabled: boolean }).enabled);
    }

    // Fetch institutional videos
    const { data: videoData } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "institutional_videos")
      .maybeSingle();
    
    if (videoData) {
      const videos = (videoData.value as unknown as { videos: VideoItem[] }).videos || [];
      // Pad to 5 items
      const paddedVideos: VideoItem[] = [...videos];
      while (paddedVideos.length < 5) {
        paddedVideos.push({ url: "", title: "" });
      }
      setInstitutionalVideos(paddedVideos.slice(0, 5));
    }

    // Fetch Porto de Ideias slots
    const { data: slotsData } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "porto_ideias_slots")
      .maybeSingle();
    
    if (slotsData) {
      setPortoIdeiasSlots((slotsData.value as { count: number }).count || 5);
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
      }
    }

    // Fetch footer content
    const { data: footerData } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "footer_content")
      .maybeSingle();
    
    if (footerData) {
      const content = footerData.value as { tagline?: string; emails?: string[]; phones?: string[] };
      if (content.tagline) setFooterTagline(content.tagline);
      if (content.emails && content.emails.length > 0) setFooterEmails(content.emails);
      if (content.phones && content.phones.length > 0) setFooterPhones(content.phones);
    }

    // Fetch social links
    const { data: socialData } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "social_links")
      .maybeSingle();
    
    if (socialData) {
      setSocialLinks(socialData.value as unknown as SocialLinksConfig);
    }
    
    setLoadingSettings(false);
  };

  const saveSocialLinks = async () => {
    setSavingSocialLinks(true);
    
    const { data: existing } = await supabase
      .from("settings")
      .select("id")
      .eq("key", "social_links")
      .maybeSingle();
    
    const jsonValue = JSON.parse(JSON.stringify(socialLinks));
    
    let error;
    if (existing) {
      const result = await supabase
        .from("settings")
        .update({ value: jsonValue })
        .eq("key", "social_links");
      error = result.error;
    } else {
      const result = await supabase
        .from("settings")
        .insert([{ key: "social_links", value: jsonValue }]);
      error = result.error;
    }

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar os links sociais.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Salvo!",
        description: "Links sociais atualizados com sucesso.",
      });
    }
    
    setSavingSocialLinks(false);
  };

  const toggleStatsVisibility = async () => {
    const newValue = !statsVisible;
    
    const { error } = await supabase
      .from("settings")
      .update({ value: { enabled: newValue } })
      .eq("key", "stats_visible");

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a configuração.",
        variant: "destructive",
      });
    } else {
      setStatsVisible(newValue);
      toast({
        title: newValue ? "Estatísticas públicas" : "Estatísticas privadas",
        description: newValue 
          ? "O painel de números está visível na homepage." 
          : "O painel de números foi ocultado da homepage.",
      });
    }
  };

  const updatePortoIdeiasSlots = async (newCount: number) => {
    // First try to update, if no rows affected, insert
    const { data: existingData } = await supabase
      .from("settings")
      .select("id")
      .eq("key", "porto_ideias_slots")
      .maybeSingle();

    let error;
    if (existingData) {
      const result = await supabase
        .from("settings")
        .update({ value: { count: newCount } })
        .eq("key", "porto_ideias_slots");
      error = result.error;
    } else {
      const result = await supabase
        .from("settings")
        .insert({ key: "porto_ideias_slots", value: { count: newCount } });
      error = result.error;
    }

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a quantidade de slots.",
        variant: "destructive",
      });
    } else {
      setPortoIdeiasSlots(newCount);
      toast({
        title: "Slots atualizados",
        description: `Agora serão exibidos ${newCount} projetos na Porto de Ideias.`,
      });
    }
  };

  const updateCarouselDisplayCount = async (count: 1 | 3 | 5) => {
    const { data: existingData } = await supabase
      .from("settings")
      .select("id")
      .eq("key", "carousel_display_count")
      .maybeSingle();

    let error;
    if (existingData) {
      const result = await supabase
        .from("settings")
        .update({ value: { count } })
        .eq("key", "carousel_display_count");
      error = result.error;
    } else {
      const result = await supabase
        .from("settings")
        .insert({ key: "carousel_display_count", value: { count } });
      error = result.error;
    }

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a exibição do carrossel.",
        variant: "destructive",
      });
    } else {
      setCarouselDisplayCount(count);
      toast({
        title: "Carrossel atualizado",
        description: count === 1 ? "Exibindo apenas o vídeo central." : `Exibindo ${count} vídeos no carrossel.`,
      });
    }
  };

  const saveFooterContent = async () => {
    setSavingFooterContent(true);
    
    const contentToSave = {
      tagline: footerTagline,
      emails: footerEmails.filter(e => e.trim()),
      phones: footerPhones.filter(p => p.trim())
    };
    
    const { data: existing } = await supabase
      .from("settings")
      .select("id")
      .eq("key", "footer_content")
      .maybeSingle();
    
    const jsonValue = JSON.parse(JSON.stringify(contentToSave));
    
    let error;
    if (existing) {
      const result = await supabase
        .from("settings")
        .update({ value: jsonValue })
        .eq("key", "footer_content");
      error = result.error;
    } else {
      const result = await supabase
        .from("settings")
        .insert([{ key: "footer_content", value: jsonValue }]);
      error = result.error;
    }

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o conteúdo do footer.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Salvo!",
        description: "Conteúdo do footer atualizado com sucesso.",
      });
    }
    
    setSavingFooterContent(false);
  };

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProjects(data as Project[]);
    }
    setLoadingProjects(false);
  };

  const fetchProjectMembers = async () => {
    const { data, error } = await supabase
      .from("project_members")
      .select("*");

    if (!error && data) {
      setProjectMembers(data as ProjectMember[]);
    }
  };

  const fetchAccessRequests = async () => {
    const { data, error } = await supabase
      .from("access_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setAccessRequests(data as AccessRequest[]);
    }
    setLoadingRequests(false);
  };

  const updateProjectStatus = async (projectId: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("projects")
      .update({ status })
      .eq("id", projectId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do projeto.",
        variant: "destructive",
      });
    } else {
      toast({
        title: status === "approved" ? "Projeto aprovado!" : "Projeto rejeitado",
        description: status === "approved" 
          ? "O projeto está agora visível no portfólio." 
          : "O projeto foi marcado como não aprovado.",
      });
      fetchProjects();
      setShowDetails(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: "approved" | "rejected") => {
    const { error } = await supabase
      .from("access_requests")
      .update({ status })
      .eq("id", requestId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da solicitação.",
        variant: "destructive",
      });
    } else {
      toast({
        title: status === "approved" ? "Solicitação aprovada!" : "Solicitação rejeitada",
      });
      fetchAccessRequests();
    }
  };

  const deleteAccessRequest = async (requestId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta solicitação?")) return;

    const { error } = await supabase
      .from("access_requests")
      .delete()
      .eq("id", requestId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir a solicitação.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Excluída",
        description: "A solicitação foi excluída com sucesso.",
      });
      fetchAccessRequests();
    }
  };

  const toggleFeatured = async (projectId: string, currentValue: boolean) => {
    const { error } = await supabase
      .from("projects")
      .update({ featured_on_homepage: !currentValue })
      .eq("id", projectId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o destaque.",
        variant: "destructive",
      });
    } else {
      toast({
        title: !currentValue ? "Adicionado à homepage!" : "Removido da homepage",
        description: !currentValue 
          ? "O projeto agora aparece na página inicial." 
          : "O projeto foi removido dos destaques.",
      });
      fetchProjects();
    }
  };

  const openEditDialog = (project: Project) => {
    setSelectedProject(project);
    setEditImageUrl(project.image_url || "");
    setEditBudget(project.budget || "");
    setEditLocation(project.location || "");
    setEditAdminNotes(project.admin_notes || "");
    setShowEditDialog(true);
  };

  const saveProjectEdit = async () => {
    if (!selectedProject) return;

    const { error } = await supabase
      .from("projects")
      .update({
        image_url: editImageUrl || null,
        budget: editBudget || null,
        location: editLocation || null,
        admin_notes: editAdminNotes || null,
      })
      .eq("id", selectedProject.id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Salvo!",
        description: "As alterações foram salvas com sucesso.",
      });
      fetchProjects();
      setShowEditDialog(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm("Tem certeza que deseja excluir este projeto?")) return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o projeto.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Excluído",
        description: "O projeto foi excluído com sucesso.",
      });
      fetchProjects();
    }
  };

  const downloadContactsCSV = () => {
    // Export all contacts (not just filtered) - including integrantes
    const getGeneroLabelCSV = (genero: string | null): string => {
      switch (genero) {
        case 'masculino': return 'Masculino';
        case 'feminino': return 'Feminino';
        case 'outro': return 'Outro';
        case 'prefiro_nao_informar': return 'Prefiro não informar';
        default: return 'Não informado';
      }
    };
    
    // Responsáveis
    const responsavelContacts = projects
      .filter(p => p.responsavel_nome || p.responsavel_email || p.responsavel_telefone)
      .map(p => ({
        nome: p.responsavel_nome || "",
        telefone: p.responsavel_telefone || "",
        email: p.responsavel_email || "",
        genero: getGeneroLabelCSV(p.responsavel_genero),
        funcao: "Responsável pelo Projeto",
        tipo: "Responsável",
        projeto: p.title,
        status: p.status
      }));

    // Integrantes
    const memberContactsCSV = projectMembers
      .filter(m => m.nome || m.email || m.telefone)
      .map(m => {
        const project = projects.find(p => p.id === m.project_id);
        return {
          nome: m.nome || "",
          telefone: m.telefone || "",
          email: m.email || "",
          genero: "N/A",
          funcao: m.funcao || "Integrante",
          tipo: "Integrante",
          projeto: project?.title || "Projeto não encontrado",
          status: project?.status || "pending"
        };
      });

    const contactsToExport = [...responsavelContacts, ...memberContactsCSV];

    if (contactsToExport.length === 0) {
      toast({
        title: "Nenhum cadastro",
        description: "Não há cadastros para exportar.",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Nome", "Telefone", "Email", "Gênero", "Função", "Tipo", "Projeto", "Status"];
    const csvContent = [
      headers.join(";"),
      ...contactsToExport.map(c => 
        [c.nome, c.telefone, c.email, c.genero, c.funcao, c.tipo, c.projeto, c.status].join(";")
      )
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cadastros_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "CSV exportado!",
      description: `${contactsToExport.length} cadastros exportados com sucesso (${responsavelContacts.length} responsáveis + ${memberContactsCSV.length} integrantes).`,
    });
  };

  const handleSignOut = () => {
    localStorage.removeItem("isAdminLoggedIn");
    navigate("/");
  };

  const filteredProjects = projects.filter((p) => {
    if (activeTab === "pending") return p.status === "pending";
    if (activeTab === "approved") return p.status === "approved";
    if (activeTab === "rejected") return p.status === "rejected";
    return true;
  });

  const featuredProjects = projects
    .filter(p => p.featured_on_homepage && p.status === "approved")
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  // Collect all contacts from projects (pending, approved, rejected) + integrantes
  const responsavelContacts = projects.map(p => ({
    id: `resp-${p.id}`,
    nome: p.responsavel_nome,
    telefone: p.responsavel_telefone,
    email: p.responsavel_email,
    genero: p.responsavel_genero,
    projeto: p.title,
    status: p.status,
    created_at: p.created_at,
    tipo: 'Responsável' as const,
    funcao: 'Responsável pelo Projeto',
  })).filter(c => c.nome || c.email || c.telefone);

  // Add project members (integrantes) to contacts
  const memberContacts = projectMembers.map(m => {
    const project = projects.find(p => p.id === m.project_id);
    return {
      id: `member-${m.id}`,
      nome: m.nome,
      telefone: m.telefone,
      email: m.email,
      genero: null as string | null,
      projeto: project?.title || 'Projeto não encontrado',
      status: project?.status || 'pending',
      created_at: project?.created_at || new Date().toISOString(),
      tipo: 'Integrante' as const,
      funcao: m.funcao || 'Integrante',
    };
  }).filter(c => c.nome || c.email || c.telefone);

  const allContacts = [...responsavelContacts, ...memberContacts];

  // Filter contacts based on filters
  const contacts = allContacts.filter(c => {
    // Gender filter
    if (contactFilterGender !== "all" && c.genero !== contactFilterGender) {
      return false;
    }
    // Status filter
    if (contactFilterStatus !== "all" && c.status !== contactFilterStatus) {
      return false;
    }
    // Date from filter
    if (contactFilterDateFrom) {
      const projectDate = new Date(c.created_at);
      const filterDate = new Date(contactFilterDateFrom);
      if (projectDate < filterDate) return false;
    }
    // Date to filter
    if (contactFilterDateTo) {
      const projectDate = new Date(c.created_at);
      const filterDate = new Date(contactFilterDateTo);
      filterDate.setHours(23, 59, 59, 999);
      if (projectDate > filterDate) return false;
    }
    return true;
  });

  const getGeneroLabel = (genero: string | null): string => {
    switch (genero) {
      case 'masculino': return 'Masculino';
      case 'feminino': return 'Feminino';
      case 'outro': return 'Outro';
      case 'prefiro_nao_informar': return 'Prefiro não informar';
      default: return 'Não informado';
    }
  };

  const pendingRequests = accessRequests.filter(r => r.status === "pending");
  const pendingProjects = projects.filter(p => p.status === "pending");

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        showNav={false} 
        rightContent={
          <div className="flex items-center gap-4">
            <Link to="/porto-de-ideias">
              <Button 
                variant="outline" 
                size="sm" 
                className="rainbow-border-glow"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Porto de Ideias
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        }
      />

      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 p-2 bg-muted rounded-lg justify-center items-center">
          <Button 
            type="button"
            variant={activeSection === "homepage" ? "default" : "ghost"}
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveSection("homepage");
            }}
            className="rounded-md"
          >
            <Home className="w-4 h-4 mr-2" />
            Editar Páginas
          </Button>
          <Button 
            type="button"
            variant={activeSection === "projects" ? "default" : "ghost"}
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveSection("projects");
            }}
            className="rounded-md"
          >
            <FileText className="w-4 h-4 mr-2" />
            Projetos
            {pendingProjects.length > 0 && (
              <Badge variant="destructive" className="ml-2">{pendingProjects.length}</Badge>
            )}
          </Button>
          <Button 
            type="button"
            variant={activeSection === "requests" ? "default" : "ghost"}
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveSection("requests");
            }}
            className="rounded-md"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Solicitações
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2">{pendingRequests.length}</Badge>
            )}
          </Button>
          <Button 
            type="button"
            variant={activeSection === "contacts" ? "default" : "ghost"}
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveSection("contacts");
            }}
            className="rounded-md"
          >
            <Users className="w-4 h-4 mr-2" />
            Cadastros
          </Button>
        </div>

        {/* Homepage Section (formerly Settings + Featured) */}
        {activeSection === "homepage" && (
          <div className="space-y-6">
            {/* Detalhamento Geral - FIRST */}
            <Card>
              <CardHeader>
                <CardTitle>Detalhamento Geral</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Estatísticas Públicas</h4>
                    <p className="text-sm text-muted-foreground">Mostrar painel de números na homepage</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch 
                      checked={statsVisible} 
                      onCheckedChange={toggleStatsVisibility}
                      disabled={loadingSettings}
                    />
                    <Badge variant={statsVisible ? "default" : "secondary"}>
                      {statsVisible ? "Público" : "Privado"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Projetos em Destaque na Homepage - Now using the new component */}
            <FeaturedProjectsManager 
              key={`featured-${featuredRefreshKey}`}
              projects={projects} 
              onProjectUpdate={fetchProjects}
            />

            {/* Controle e Edição - Cards Porto de Ideias */}
            <PortoIdeiasCardsManager 
              projects={projects.filter(p => p.status === "approved")}
              onFeaturedChange={() => setFeaturedRefreshKey(prev => prev + 1)}
            />

            {/* Vídeos Institucionais (até 5) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Vídeos Institucionais (Carrossel)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Configure os vídeos para o carrossel na seção principal da homepage.
                </p>

                {/* Carousel Display Count Selector */}
                <div className="p-4 border rounded-lg bg-muted/30">
                  <Label className="text-base font-medium mb-3 block">Quantidade de vídeos visíveis</Label>
                  <div className="flex gap-3">
                    {([1, 3, 5] as const).map((count) => (
                      <Button
                        key={count}
                        variant={carouselDisplayCount === count ? "default" : "outline"}
                        onClick={() => updateCarouselDisplayCount(count)}
                        className="w-12 h-12 text-lg font-bold"
                      >
                        {count}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {institutionalVideos.slice(0, carouselDisplayCount).map((video, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Vídeo {index + 1}</h4>
                      {video.url && (
                        <Badge variant="secondary" className="text-xs">Ativo</Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>URL do Vídeo</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="https://exemplo.com/video.mp4"
                          value={video.url}
                          onChange={(e) => {
                            const newVideos = [...institutionalVideos];
                            newVideos[index] = { ...newVideos[index], url: e.target.value };
                            setInstitutionalVideos(newVideos);
                          }}
                          className="flex-1"
                        />
                        {video.url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newVideos = [...institutionalVideos];
                              newVideos[index] = { url: "", title: "" };
                              setInstitutionalVideos(newVideos);
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Label
                        htmlFor={`video-upload-${index}`}
                        className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                      >
                        <Upload className="w-4 h-4" />
                        {uploadingVideoIndex === index ? "Enviando..." : "Upload"}
                      </Label>
                      <input
                        id={`video-upload-${index}`}
                        type="file"
                        accept="video/*"
                        className="hidden"
                        disabled={uploadingVideoIndex === index}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          setUploadingVideoIndex(index);
                          const fileName = `institutional-${index}-${Date.now()}.${file.name.split('.').pop()}`;
                          
                          const { data, error } = await supabase.storage
                            .from("project-media")
                            .upload(fileName, file);
                          
                          if (error) {
                            toast({
                              title: "Erro no upload",
                              description: error.message,
                              variant: "destructive",
                            });
                          } else {
                            const { data: urlData } = supabase.storage
                              .from("project-media")
                              .getPublicUrl(fileName);
                            
                            const newVideos = [...institutionalVideos];
                            newVideos[index] = { ...newVideos[index], url: urlData.publicUrl };
                            setInstitutionalVideos(newVideos);
                            
                            toast({
                              title: "Upload concluído!",
                              description: `Vídeo ${index + 1} enviado com sucesso.`,
                            });
                          }
                          
                          setUploadingVideoIndex(null);
                        }}
                      />
                    </div>

                    {video.url && (
                      <div className="mt-2 rounded-lg overflow-hidden border">
                        <video
                          src={video.url}
                          controls
                          className="w-full max-h-40 object-contain bg-black"
                        />
                      </div>
                    )}
                  </div>
                ))}

                <Button 
                  onClick={async () => {
                    setSavingVideos(true);
                    
                    const videosToSave = institutionalVideos.filter(v => v.url);
                    
                    const { data: existing } = await supabase
                      .from("settings")
                      .select("id")
                      .eq("key", "institutional_videos")
                      .maybeSingle();
                    
                    const jsonValue = JSON.parse(JSON.stringify({ videos: institutionalVideos }));
                    
                    if (existing) {
                      await supabase
                        .from("settings")
                        .update({ value: jsonValue })
                        .eq("key", "institutional_videos");
                    } else {
                      await supabase
                        .from("settings")
                        .insert([{ key: "institutional_videos", value: jsonValue }]);
                    }
                    
                    setSavingVideos(false);
                    toast({
                      title: "Salvo!",
                      description: `${videosToSave.length} vídeo(s) configurado(s) no carrossel.`,
                    });
                  }}
                  disabled={savingVideos}
                  className="w-full"
                >
                  {savingVideos ? "Salvando..." : "Salvar Todos os Vídeos"}
                </Button>
              </CardContent>
            </Card>

            {/* Controle e Edição - Conteúdo do Footer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Controle e Edição - Conteúdo do Footer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Edite o texto e informações de contato exibidos no footer do site.
                </p>

                {/* Tagline */}
                <div className="space-y-2">
                  <Label>Tagline / Descrição</Label>
                  <Textarea
                    value={footerTagline}
                    onChange={(e) => setFooterTagline(e.target.value)}
                    placeholder="Uma plataforma criada para aproximar cultura e investimento."
                    rows={2}
                  />
                </div>

                {/* Emails */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Emails de Contato</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFooterEmails([...footerEmails, ""])}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                  {footerEmails.map((email, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <Mail className="w-4 h-4 text-accent flex-shrink-0" />
                        <Input
                          type="email"
                          placeholder="email@exemplo.com"
                          value={email}
                          onChange={(e) => {
                            const newEmails = [...footerEmails];
                            newEmails[index] = e.target.value;
                            setFooterEmails(newEmails);
                          }}
                        />
                      </div>
                      {footerEmails.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newEmails = footerEmails.filter((_, i) => i !== index);
                            setFooterEmails(newEmails);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Phones */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Telefones de Contato</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFooterPhones([...footerPhones, ""])}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                  {footerPhones.map((phone, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <Phone className="w-4 h-4 text-accent flex-shrink-0" />
                        <Input
                          placeholder="(00) 00000-0000"
                          value={phone}
                          onChange={(e) => {
                            const newPhones = [...footerPhones];
                            newPhones[index] = e.target.value;
                            setFooterPhones(newPhones);
                          }}
                        />
                      </div>
                      {footerPhones.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newPhones = footerPhones.filter((_, i) => i !== index);
                            setFooterPhones(newPhones);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <Button onClick={saveFooterContent} disabled={savingFooterContent} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  {savingFooterContent ? "Salvando..." : "Salvar Conteúdo do Footer"}
                </Button>
              </CardContent>
            </Card>

            {/* Controle e Edição - Links Sociais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5" />
                  Controle e Edição - Links do Footer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Gerencie os links das redes sociais exibidos no footer do site.
                </p>

                {/* Instagram */}
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] flex items-center justify-center">
                        <Instagram className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium">Instagram</span>
                    </div>
                    <Switch
                      checked={socialLinks.instagram.enabled}
                      onCheckedChange={(checked) => 
                        setSocialLinks(prev => ({ ...prev, instagram: { ...prev.instagram, enabled: checked } }))
                      }
                    />
                  </div>
                  {socialLinks.instagram.enabled && (
                    <Input
                      placeholder="https://www.instagram.com/seuusuario/"
                      value={socialLinks.instagram.url}
                      onChange={(e) => 
                        setSocialLinks(prev => ({ ...prev, instagram: { ...prev.instagram, url: e.target.value } }))
                      }
                    />
                  )}
                </div>

                {/* Facebook */}
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center">
                        <Facebook className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium">Facebook</span>
                    </div>
                    <Switch
                      checked={socialLinks.facebook.enabled}
                      onCheckedChange={(checked) => 
                        setSocialLinks(prev => ({ ...prev, facebook: { ...prev.facebook, enabled: checked } }))
                      }
                    />
                  </div>
                  {socialLinks.facebook.enabled && (
                    <Input
                      placeholder="https://www.facebook.com/suapagina/"
                      value={socialLinks.facebook.url}
                      onChange={(e) => 
                        setSocialLinks(prev => ({ ...prev, facebook: { ...prev.facebook, url: e.target.value } }))
                      }
                    />
                  )}
                </div>

                {/* LinkedIn */}
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0A66C2] flex items-center justify-center">
                        <Linkedin className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium">LinkedIn</span>
                    </div>
                    <Switch
                      checked={socialLinks.linkedin.enabled}
                      onCheckedChange={(checked) => 
                        setSocialLinks(prev => ({ ...prev, linkedin: { ...prev.linkedin, enabled: checked } }))
                      }
                    />
                  </div>
                  {socialLinks.linkedin.enabled && (
                    <Input
                      placeholder="https://www.linkedin.com/company/suaempresa/"
                      value={socialLinks.linkedin.url}
                      onChange={(e) => 
                        setSocialLinks(prev => ({ ...prev, linkedin: { ...prev.linkedin, url: e.target.value } }))
                      }
                    />
                  )}
                </div>

                {/* YouTube */}
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FF0000] flex items-center justify-center">
                        <Youtube className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium">YouTube</span>
                    </div>
                    <Switch
                      checked={socialLinks.youtube.enabled}
                      onCheckedChange={(checked) => 
                        setSocialLinks(prev => ({ ...prev, youtube: { ...prev.youtube, enabled: checked } }))
                      }
                    />
                  </div>
                  {socialLinks.youtube.enabled && (
                    <Input
                      placeholder="https://www.youtube.com/@seucanal/"
                      value={socialLinks.youtube.url}
                      onChange={(e) => 
                        setSocialLinks(prev => ({ ...prev, youtube: { ...prev.youtube, url: e.target.value } }))
                      }
                    />
                  )}
                </div>

                {/* Site Pessoal */}
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                        <Globe className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium">Site Pessoal</span>
                    </div>
                    <Switch
                      checked={socialLinks.website.enabled}
                      onCheckedChange={(checked) => 
                        setSocialLinks(prev => ({ ...prev, website: { ...prev.website, enabled: checked } }))
                      }
                    />
                  </div>
                  {socialLinks.website.enabled && (
                    <Input
                      placeholder="https://www.seusite.com/"
                      value={socialLinks.website.url}
                      onChange={(e) => 
                        setSocialLinks(prev => ({ ...prev, website: { ...prev.website, url: e.target.value } }))
                      }
                    />
                  )}
                </div>

                <Button onClick={saveSocialLinks} disabled={savingSocialLinks} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  {savingSocialLinks ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Projects Requests Section (Solicitações de Projetos) */}
        {activeSection === "requests" && (
          <Card>
            <CardHeader>
              <CardTitle>Solicitações de Projetos Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingProjects ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse p-4 border rounded-lg">
                      <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : pendingProjects.length > 0 ? (
                <div className="space-y-4">
                  {pendingProjects.map((project) => (
                    <div key={project.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-lg">{project.title}</h4>
                            <Badge variant="secondary">Pendente</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{project.synopsis}</p>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p className="flex items-center gap-2">
                              <Users className="w-3 h-3" />
                              Responsável: {project.responsavel_nome || "Não informado"}
                            </p>
                            {project.responsavel_telefone && (
                              <p className="flex items-center gap-2">
                                <Phone className="w-3 h-3" />
                                {project.responsavel_telefone}
                              </p>
                            )}
                            <p className="text-xs mt-2">
                              Enviado em {new Date(project.created_at).toLocaleDateString("pt-BR")} às {new Date(project.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link to={`/admin/pending/${project.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Ver Projeto
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            onClick={() => updateProjectStatus(project.id, "approved")}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aprovar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => updateProjectStatus(project.id, "rejected")}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Rejeitar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma solicitação de projeto pendente.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Contacts Section */}
        {activeSection === "contacts" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Cadastros - Banco de Dados de Contatos</CardTitle>
              <Button variant="outline" size="sm" onClick={downloadContactsCSV} className="bg-green-600 hover:bg-green-700 text-white border-green-600">
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Lista de todas as pessoas que fizeram cadastro ao submeter projetos (pendentes, aprovados ou rejeitados).
              </p>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 border rounded-lg bg-muted/30">
                <div className="space-y-2">
                  <Label className="text-sm">Gênero</Label>
                  <Select value={contactFilterGender} onValueChange={setContactFilterGender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                      <SelectItem value="prefiro_nao_informar">Prefiro não informar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Status do Projeto</Label>
                  <Select value={contactFilterStatus} onValueChange={setContactFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="approved">Aprovado</SelectItem>
                      <SelectItem value="rejected">Rejeitado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Data de Cadastro (De)</Label>
                  <Input 
                    type="date" 
                    value={contactFilterDateFrom}
                    onChange={(e) => setContactFilterDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Data de Cadastro (Até)</Label>
                  <Input 
                    type="date" 
                    value={contactFilterDateTo}
                    onChange={(e) => setContactFilterDateTo(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground">
                  Exibindo {contacts.length} de {allContacts.length} cadastros
                </p>
                {(contactFilterGender !== "all" || contactFilterStatus !== "all" || contactFilterDateFrom || contactFilterDateTo) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setContactFilterGender("all");
                      setContactFilterStatus("all");
                      setContactFilterDateFrom("");
                      setContactFilterDateTo("");
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Limpar Filtros
                  </Button>
                )}
              </div>

              {contacts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Tipo</th>
                        <th className="text-left py-3 px-4 font-medium">Nome</th>
                        <th className="text-left py-3 px-4 font-medium">Função</th>
                        <th className="text-left py-3 px-4 font-medium">Telefone</th>
                        <th className="text-left py-3 px-4 font-medium">Email</th>
                        <th className="text-left py-3 px-4 font-medium">Gênero</th>
                        <th className="text-left py-3 px-4 font-medium">Projeto</th>
                        <th className="text-left py-3 px-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.map((contact) => (
                        <tr key={contact.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <Badge variant={contact.tipo === 'Responsável' ? 'default' : 'secondary'}>
                              {contact.tipo}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">{contact.nome || "-"}</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">{contact.funcao}</td>
                          <td className="py-3 px-4">{contact.telefone || "-"}</td>
                          <td className="py-3 px-4">{contact.email || "-"}</td>
                          <td className="py-3 px-4">{contact.tipo === 'Responsável' ? getGeneroLabel(contact.genero) : 'N/A'}</td>
                          <td className="py-3 px-4">{contact.projeto}</td>
                          <td className="py-3 px-4">
                            <Badge variant={
                              contact.status === "approved" ? "default" :
                              contact.status === "rejected" ? "destructive" : "secondary"
                            }>
                              {contact.status === "approved" ? "Aprovado" :
                               contact.status === "rejected" ? "Rejeitado" : "Pendente"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum cadastro encontrado.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Projects Section */}
        {activeSection === "projects" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {projects.filter((p) => p.status === "pending").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {projects.filter((p) => p.status === "approved").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Aprovados</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {projects.filter((p) => p.status === "rejected").length}
                  </div>
                  <p className="text-sm text-muted-foreground">Rejeitados</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-foreground">
                    {projects.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Total</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <TabsList>
                  <TabsTrigger value="pending" className="gap-2">
                    <Clock className="w-4 h-4" />
                    Pendentes
                  </TabsTrigger>
                  <TabsTrigger value="approved" className="gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Aprovados
                  </TabsTrigger>
                  <TabsTrigger value="rejected" className="gap-2">
                    <XCircle className="w-4 h-4" />
                    Rejeitados
                  </TabsTrigger>
                  <TabsTrigger value="all">Todos</TabsTrigger>
                </TabsList>
                
                <Link to="/admin/add-project">
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Projeto
                  </Button>
                </Link>
              </div>

              <TabsContent value={activeTab}>
                {loadingProjects ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                          <div className="h-6 bg-muted rounded w-1/4 mb-2" />
                          <div className="h-4 bg-muted rounded w-3/4" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredProjects.length > 0 ? (
                  <div className="space-y-4">
                    {filteredProjects.map((project) => (
                      <Card key={project.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-foreground">
                                  {project.title}
                                </h3>
                                <Badge variant={
                                  project.status === "approved" ? "default" :
                                  project.status === "rejected" ? "destructive" : "secondary"
                                }>
                                  {project.status === "approved" ? "Aprovado" :
                                   project.status === "rejected" ? "Rejeitado" : "Pendente"}
                                </Badge>
                                {project.featured_on_homepage && (
                                  <Badge className="bg-yellow-500">
                                    <Star className="w-3 h-3 mr-1" />
                                    Destaque
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                {project.synopsis}
                              </p>
                              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                <Badge variant="outline">{project.project_type}</Badge>
                                <span>
                                  Por: {project.responsavel_nome || "Não informado"}
                                </span>
                                <span>
                                  {new Date(project.created_at).toLocaleDateString("pt-BR")}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedProject(project);
                                  setShowDetails(true);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Ver
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(project)}
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Editar
                              </Button>
                              {project.status === "approved" && !project.featured_on_homepage && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => toggleFeatured(project.id, false)}
                                  title="Adicionar aos destaques"
                                  className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-950"
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              )}
                              {project.status === "approved" && project.featured_on_homepage && (
                                <Badge className="bg-yellow-500 gap-1">
                                  <Star className="w-3 h-3" />
                                  Destaque
                                </Badge>
                              )}
                              {project.status === "pending" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => updateProjectStatus(project.id, "approved")}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Aprovar
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => updateProjectStatus(project.id, "rejected")}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Rejeitar
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteProject(project.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="text-center py-16">
                    <CardContent>
                      <p className="text-muted-foreground">
                        Nenhum projeto {activeTab === "pending" ? "pendente" : 
                                       activeTab === "approved" ? "aprovado" : 
                                       activeTab === "rejected" ? "rejeitado" : ""} encontrado.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedProject && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  {selectedProject.status === "pending" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => updateProjectStatus(selectedProject.id, "approved")}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Aprovar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => updateProjectStatus(selectedProject.id, "rejected")}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Rejeitar
                      </Button>
                    </div>
                  )}
                </div>
                <DialogTitle>{selectedProject.title}</DialogTitle>
                <DialogDescription>
                  {selectedProject.project_type} • Enviado em {new Date(selectedProject.created_at).toLocaleDateString("pt-BR")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div>
                  <h4 className="font-semibold mb-1">Responsável</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedProject.responsavel_nome || "Não informado"}<br />
                    {selectedProject.responsavel_email && `Email: ${selectedProject.responsavel_email}`}<br />
                    {selectedProject.responsavel_telefone && `Tel: ${selectedProject.responsavel_telefone}`}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-1">Sinopse</h4>
                  <p className="text-sm text-muted-foreground">{selectedProject.synopsis}</p>
                </div>

                {selectedProject.description && (
                  <div>
                    <h4 className="font-semibold mb-1">Descrição Completa</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedProject.description}
                    </p>
                  </div>
                )}

                {selectedProject.categorias_tags && selectedProject.categorias_tags.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-1">Categorias</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.categorias_tags.map((tag, i) => (
                        <Badge key={i} variant="outline">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedProject.link_video || selectedProject.media_url) && (
                  <div>
                    <h4 className="font-semibold mb-1">Mídia</h4>
                    {selectedProject.link_video && (
                      <a 
                        href={selectedProject.link_video} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        Link de vídeo <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {selectedProject.media_url && (
                      <a 
                        href={selectedProject.media_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        Material de apoio <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                {(selectedProject.valor_sugerido || selectedProject.link_pagamento) && (
                  <div>
                    <h4 className="font-semibold mb-1">Financiamento</h4>
                    {selectedProject.valor_sugerido && (
                      <p className="text-sm text-muted-foreground">
                        Valor sugerido: R$ {selectedProject.valor_sugerido.toFixed(2)}
                      </p>
                    )}
                    {selectedProject.link_pagamento && (
                      <a 
                        href={selectedProject.link_pagamento} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        Link de pagamento <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                {(selectedProject.impacto_cultural || selectedProject.impacto_social) && (
                  <div>
                    <h4 className="font-semibold mb-1">Impacto</h4>
                    {selectedProject.impacto_cultural && (
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong>Cultural:</strong> {selectedProject.impacto_cultural}
                      </p>
                    )}
                    {selectedProject.impacto_social && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Social:</strong> {selectedProject.impacto_social}
                      </p>
                    )}
                  </div>
                )}

                {selectedProject.publico_alvo && (
                  <div>
                    <h4 className="font-semibold mb-1">Público-Alvo</h4>
                    <p className="text-sm text-muted-foreground">{selectedProject.publico_alvo}</p>
                  </div>
                )}

                {selectedProject.diferenciais && (
                  <div>
                    <h4 className="font-semibold mb-1">Diferenciais</h4>
                    <p className="text-sm text-muted-foreground">{selectedProject.diferenciais}</p>
                  </div>
                )}

                {selectedProject.has_incentive_law && (
                  <div>
                    <h4 className="font-semibold mb-1">Lei de Incentivo</h4>
                    <Badge className="bg-green-600">Possui Lei de Incentivo</Badge>
                    {selectedProject.incentive_law_details && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {selectedProject.incentive_law_details}
                      </p>
                    )}
                  </div>
                )}

                {selectedProject.admin_notes && (
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-1">Notas do Admin</h4>
                    <p className="text-sm">{selectedProject.admin_notes}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  Fechar
                </Button>
                <Button onClick={() => {
                  setShowDetails(false);
                  openEditDialog(selectedProject);
                }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Projeto
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Projeto</DialogTitle>
            <DialogDescription>
              Atualize as informações do projeto.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-image">URL da Imagem de Capa</Label>
              <Input
                id="edit-image"
                placeholder="https://..."
                value={editImageUrl}
                onChange={(e) => setEditImageUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-budget">Orçamento</Label>
              <Input
                id="edit-budget"
                placeholder="Ex: R$ 500.000"
                value={editBudget}
                onChange={(e) => setEditBudget(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location">Localização</Label>
              <Input
                id="edit-location"
                placeholder="Ex: São Paulo, SP"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notas do Administrador</Label>
              <Textarea
                id="edit-notes"
                placeholder="Adicione observações internas sobre este projeto..."
                value={editAdminNotes}
                onChange={(e) => setEditAdminNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={saveProjectEdit}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
