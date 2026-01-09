import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { DualImageCropper } from "@/components/DualImageCropper";
import { FeaturedProjectsManager } from "@/components/admin/FeaturedProjectsManager";

import { PortoIdeiasHeaderEditor } from "@/components/admin/PortoIdeiasHeaderEditor";
import { QuemSomosEditor } from "@/components/admin/QuemSomosEditor";

import { NossosServicosEditor } from "@/components/admin/NossosServicosEditor";
import { ContactButtonsEditor } from "@/components/admin/ContactButtonsEditor";
import ContrapartidasEditor, { Contrapartida } from "@/components/admin/ContrapartidasEditor";
import { RecognitionEditor, NewsItem } from "@/components/admin/RecognitionEditor";
import { StagesMultiSelect, getStageLabel } from "@/components/admin/StagesMultiSelect";
import { CategoriesMultiSelect, getCategoryLabel } from "@/components/admin/CategoriesMultiSelect";
import { IncentiveLawsMultiSelect, getIncentiveLawLabel, normalizeIncentiveLawValue } from "@/components/admin/IncentiveLawsMultiSelect";
import { TeamMemberEditor, TeamMemberData } from "@/components/admin/TeamMemberEditor";
import { DynamicProjectTypeSelect } from "@/components/admin/DynamicProjectTypeSelect";
import { DynamicLocationSelect } from "@/components/admin/DynamicLocationSelect";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  EyeOff,
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
  Lightbulb,
  Twitter,
  Briefcase,
  ChevronDown,
  Rocket,
  FolderOpen
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  hero_image_url: string | null;
  card_image_url: string | null;
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
  show_on_captacao?: boolean;
  show_on_portfolio?: boolean;
  stage: string | null;
  stages: string[] | null;
  is_hidden: boolean;
  presentation_document_url: string | null;
  additional_info: string | null;
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
  photo_url: string | null;
  curriculum_url: string | null;
  social_links: Record<string, string> | null;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [activeSection, setActiveSection] = useState<"projects" | "requests" | "contacts" | "homepage" | "captacao" | "portfolio">("homepage");
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
    twitter: SocialLink;
    imdb: SocialLink;
    website: SocialLink;
    whatsapp?: SocialLink;
  }
  const [socialLinks, setSocialLinks] = useState<SocialLinksConfig>({
    facebook: { enabled: false, url: "" },
    instagram: { enabled: true, url: "https://www.instagram.com/portobellofilmes/" },
    linkedin: { enabled: false, url: "" },
    youtube: { enabled: false, url: "" },
    twitter: { enabled: false, url: "" },
    imdb: { enabled: false, url: "" },
    website: { enabled: false, url: "" },
    whatsapp: { enabled: false, url: "" }
  });
  const [savingSocialLinks, setSavingSocialLinks] = useState(false);

  const [editImageUrl, setEditImageUrl] = useState("");
  const [editBudget, setEditBudget] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editAdminNotes, setEditAdminNotes] = useState("");
  
  // Extended edit fields
  const [editTitle, setEditTitle] = useState("");
  const [editSynopsis, setEditSynopsis] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editProjectType, setEditProjectType] = useState("");
  const [editStages, setEditStages] = useState<string[]>([]);
  const [editCategoriasTags, setEditCategoriasTags] = useState<string[]>([]);
  const [editIncentiveLaws, setEditIncentiveLaws] = useState<string[]>([]);
  const [editHasIncentiveLaw, setEditHasIncentiveLaw] = useState(false);
  const [editIncentiveLawDetails, setEditIncentiveLawDetails] = useState("");
  const [editLinkVideo, setEditLinkVideo] = useState("");
  const [editValorSugerido, setEditValorSugerido] = useState("");
  const [editLinkPagamento, setEditLinkPagamento] = useState("");
  const [editImpactoCultural, setEditImpactoCultural] = useState("");
  const [editImpactoSocial, setEditImpactoSocial] = useState("");
  const [editPublicoAlvo, setEditPublicoAlvo] = useState("");
  const [editDiferenciais, setEditDiferenciais] = useState("");
  const [editResponsavelNome, setEditResponsavelNome] = useState("");
  const [editResponsavelEmail, setEditResponsavelEmail] = useState("");
  const [editResponsavelTelefone, setEditResponsavelTelefone] = useState("");
  const [editResponsavelGenero, setEditResponsavelGenero] = useState("");
  const [editContrapartidas, setEditContrapartidas] = useState<Contrapartida[]>([]);
  const [editAwards, setEditAwards] = useState<string[]>([]);
  const [editNews, setEditNews] = useState<NewsItem[]>([]);
  const [editFestivals, setEditFestivals] = useState<{ title: string; url?: string; date?: string }[]>([]);
  const [editTeamMembers, setEditTeamMembers] = useState<TeamMemberData[]>([]);
  const [editAdditionalInfo, setEditAdditionalInfo] = useState("");
  
  // Image cropper states for edit (dual images)
  const [editHeroBlob, setEditHeroBlob] = useState<Blob | null>(null);
  const [editCardBlob, setEditCardBlob] = useState<Blob | null>(null);
  const [editHeroPreview, setEditHeroPreview] = useState<string | null>(null);
  const [editCardPreview, setEditCardPreview] = useState<string | null>(null);
  const [editOriginalBlob, setEditOriginalBlob] = useState<Blob | null>(null);
  
  // Presentation document states for edit
  const [editPresentationDocUrl, setEditPresentationDocUrl] = useState("");
  const [uploadingEditDoc, setUploadingEditDoc] = useState(false);

  // Contacts filters
  const [contactFilterGender, setContactFilterGender] = useState<string>("all");
  const [contactFilterStatus, setContactFilterStatus] = useState<string>("all");
  const [contactFilterDateFrom, setContactFilterDateFrom] = useState<string>("");
  const [contactFilterDateTo, setContactFilterDateTo] = useState<string>("");

  // Delete confirmation dialog
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  
  // Delete contacts confirmation dialog
  const [showDeleteContactsConfirm, setShowDeleteContactsConfirm] = useState(false);
  const [contactsProjectToDelete, setContactsProjectToDelete] = useState<string | null>(null);

  const { user, loading: authLoading, isAdmin, signOut } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    if (!isAdmin) {
      navigate("/login");
      return;
    }

    fetchProjects();
    fetchProjectMembers();
    fetchAccessRequests();
    fetchStatsVisibility();
  }, [authLoading, isAdmin, navigate]);

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

    console.log("fetchProjects - data:", data, "error:", error);

    if (error) {
      console.error("Erro ao buscar projetos:", error);
    }
    
    if (data) {
      setProjects(data as Project[]);
    }
    setLoadingProjects(false);
  };

  const fetchProjectMembers = async () => {
    const { data, error } = await supabase
      .from("project_members")
      .select("*");

    console.log("fetchProjectMembers - data:", data, "error:", error);

    if (error) {
      console.error("Erro ao buscar membros:", error);
    }
    
    if (data) {
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

  const toggleHidden = async (projectId: string, currentValue: boolean) => {
    const { error } = await supabase
      .from("projects")
      .update({ is_hidden: !currentValue })
      .eq("id", projectId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a visibilidade.",
        variant: "destructive",
      });
    } else {
      toast({
        title: !currentValue ? "Projeto oculto" : "Projeto visível",
        description: !currentValue 
          ? "O projeto foi ocultado do site público." 
          : "O projeto agora está visível no site.",
      });
      fetchProjects();
    }
  };

  const handleEditImagesCropped = (
    heroBlob: Blob | null, 
    heroUrl: string | null, 
    cardBlob: Blob | null, 
    cardUrl: string | null,
    originalBlob?: Blob | null,
    originalUrl?: string | null
  ) => {
    setEditHeroBlob(heroBlob);
    setEditCardBlob(cardBlob);
    setEditHeroPreview(heroUrl);
    setEditCardPreview(cardUrl);
    if (originalBlob) {
      setEditOriginalBlob(originalBlob);
    }
  };

  const handleEditClearImage = () => {
    setEditHeroBlob(null);
    setEditCardBlob(null);
    setEditHeroPreview(null);
    setEditCardPreview(null);
    setEditOriginalBlob(null);
    setEditImageUrl("");
  };

  const handleEditDocUpload = async (file: File) => {
    setUploadingEditDoc(true);
    
    const fileName = `presentation-${Date.now()}.${file.name.split('.').pop()}`;
    
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
      
      setEditPresentationDocUrl(urlData.publicUrl);
      
      toast({
        title: "Documento enviado!",
        description: "O documento de apresentação foi carregado.",
      });
    }
    
    setUploadingEditDoc(false);
  };

  const openEditDialog = (project: Project) => {
    setSelectedProject(project);
    setEditImageUrl(project.image_url || "");
    setEditHeroBlob(null);
    setEditCardBlob(null);
    setEditOriginalBlob(null);
    setEditHeroPreview(project.hero_image_url || project.image_url || null);
    setEditCardPreview(project.card_image_url || project.image_url || null);
    setEditPresentationDocUrl(project.presentation_document_url || "");
    setEditBudget(project.budget || "");
    setEditLocation(project.location || "");
    setEditAdminNotes(project.admin_notes || "");
    setEditTitle(project.title || "");
    setEditSynopsis(project.synopsis || "");
    setEditDescription(project.description || "");
    setEditProjectType(project.project_type || "");
    setEditStages(project.stages || []);
    setEditCategoriasTags(project.categorias_tags || []);
    // Parse incentive laws from comma-separated string (normalize legacy values)
    const parsedIncentiveLaws = (project.incentive_law_details
      ? project.incentive_law_details
          .split(",")
          .map((law) => normalizeIncentiveLawValue(law))
          .filter(Boolean)
      : []) as string[];

    const uniqueIncentiveLaws = Array.from(new Set(parsedIncentiveLaws));
    setEditIncentiveLaws(uniqueIncentiveLaws);
    setEditHasIncentiveLaw(project.has_incentive_law || false);
    setEditIncentiveLawDetails(project.incentive_law_details || "");
    setEditLinkVideo(project.link_video || "");
    setEditValorSugerido(project.valor_sugerido?.toString() || "");
    setEditLinkPagamento(project.link_pagamento || "");
    setEditImpactoCultural(project.impacto_cultural || "");
    setEditImpactoSocial(project.impacto_social || "");
    setEditPublicoAlvo(project.publico_alvo || "");
    setEditDiferenciais(project.diferenciais || "");
    setEditResponsavelNome(project.responsavel_nome || "");
    setEditResponsavelEmail(project.responsavel_email || "");
    setEditResponsavelTelefone(project.responsavel_telefone || "");
    setEditResponsavelGenero(project.responsavel_genero || "");
    setEditAdditionalInfo(project.additional_info || "");
    
    // Fetch contrapartidas for this project
    supabase
      .from("contrapartidas")
      .select("*")
      .eq("project_id", project.id)
      .order("ordem", { ascending: true })
      .then(({ data }) => {
        if (data) {
          setEditContrapartidas(data as Contrapartida[]);
        } else {
          setEditContrapartidas([]);
        }
      });
    
    // Fetch awards, news and festivals from project
    supabase
      .from("projects")
      .select("awards, news, festivals_exhibitions")
      .eq("id", project.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setEditAwards((data.awards as string[]) || []);
          setEditNews((data.news as unknown as NewsItem[]) || []);
          setEditFestivals((data.festivals_exhibitions as unknown as { title: string; url?: string; date?: string }[]) || []);
        } else {
          setEditAwards([]);
          setEditNews([]);
          setEditFestivals([]);
        }
      });
    
    // Fetch team members for this project
    supabase
      .from("project_members")
      .select("*")
      .eq("project_id", project.id)
      .then(({ data }) => {
        if (data) {
          const members: TeamMemberData[] = data.map((m: any) => ({
            nome: m.nome || "",
            funcao: m.funcao || "",
            email: m.email || "",
            telefone: m.telefone || "",
            photo_url: m.photo_url || "",
            social_links: m.social_links || {},
            curriculum_url: m.curriculum_url || "",
            detalhes: m.detalhes || "",
          }));
          setEditTeamMembers(members);
        } else {
          setEditTeamMembers([]);
        }
      });
    
    setShowEditDialog(true);
  };

  const saveProjectEdit = async () => {
    if (!selectedProject) return;

    let finalHeroUrl = editHeroPreview;
    let finalCardUrl = editCardPreview;
    let finalOriginalUrl = editImageUrl; // Keep existing original URL
    
    // Upload original image if new blob
    if (editOriginalBlob) {
      const timestamp = Date.now();
      const path = `originals/${timestamp}_original.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from("project-media")
        .upload(path, editOriginalBlob);
      
      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from("project-media")
          .getPublicUrl(path);
        
        finalOriginalUrl = urlData.publicUrl;
      }
    }
    
    // Upload hero image if new blob
    if (editHeroBlob) {
      const timestamp = Date.now();
      const path = `thumbnails/${timestamp}_hero.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from("project-media")
        .upload(path, editHeroBlob);
      
      if (uploadError) {
        toast({
          title: "Erro no upload da imagem do banner",
          description: uploadError.message,
          variant: "destructive",
        });
        return;
      }
      
      const { data: urlData } = supabase.storage
        .from("project-media")
        .getPublicUrl(path);
      
      finalHeroUrl = urlData.publicUrl;
    }
    
    // Upload card image if new blob
    if (editCardBlob) {
      const timestamp = Date.now();
      const path = `thumbnails/${timestamp}_card.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from("project-media")
        .upload(path, editCardBlob);
      
      if (uploadError) {
        toast({
          title: "Erro no upload da imagem do card",
          description: uploadError.message,
          variant: "destructive",
        });
        return;
      }
      
      const { data: urlData } = supabase.storage
        .from("project-media")
        .getPublicUrl(path);
      
      finalCardUrl = urlData.publicUrl;
    }

    const { error } = await supabase
      .from("projects")
      .update({
        title: editTitle || null,
        synopsis: editSynopsis || null,
        description: editDescription || null,
        project_type: editProjectType || null,
        stages: editStages.length > 0 ? editStages : null,
        image_url: finalOriginalUrl || finalHeroUrl || finalCardUrl || null,
        hero_image_url: finalHeroUrl || null,
        card_image_url: finalCardUrl || null,
        budget: editBudget || null,
        location: editLocation || null,
        admin_notes: editAdminNotes || null,
        categorias_tags: editCategoriasTags.length > 0 ? editCategoriasTags : null,
        has_incentive_law: editIncentiveLaws.length > 0,
        incentive_law_details: editIncentiveLaws.length > 0 ? editIncentiveLaws.join(', ') : null,
        link_video: editLinkVideo || null,
        valor_sugerido: editValorSugerido ? parseFloat(editValorSugerido) : null,
        link_pagamento: editLinkPagamento || null,
        impacto_cultural: editImpactoCultural || null,
        impacto_social: editImpactoSocial || null,
        publico_alvo: editPublicoAlvo || null,
        diferenciais: editDiferenciais || null,
        responsavel_nome: editResponsavelNome || null,
        responsavel_email: editResponsavelEmail || null,
        responsavel_telefone: editResponsavelTelefone || null,
        responsavel_genero: editResponsavelGenero || null,
        awards: editAwards.length > 0 ? editAwards : [],
        news: editNews.length > 0 ? editNews : [],
        festivals_exhibitions: editFestivals.length > 0 ? editFestivals : [],
        presentation_document_url: editPresentationDocUrl || null,
        additional_info: editAdditionalInfo || null,
      } as any)
      .eq("id", selectedProject.id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } else {
      // Save contrapartidas
      // First delete existing ones
      await supabase
        .from("contrapartidas")
        .delete()
        .eq("project_id", selectedProject.id);
      
      // Then insert new ones
      if (editContrapartidas.length > 0) {
        const contrapartidasData = editContrapartidas.map((c, index) => ({
          project_id: selectedProject.id,
          titulo: c.titulo || null,
          valor: c.valor,
          beneficios: c.beneficios,
          ativo: c.ativo,
          ordem: index,
          indice: c.indice || null,
        }));
        
        await supabase.from("contrapartidas").insert(contrapartidasData);
      }
      
      // Save team members
      // First delete existing ones
      await supabase
        .from("project_members")
        .delete()
        .eq("project_id", selectedProject.id);
      
      // Then insert new ones
      if (editTeamMembers.length > 0) {
        const membersData = editTeamMembers.map(member => ({
          project_id: selectedProject.id,
          nome: member.nome,
          funcao: member.funcao || null,
          email: member.email || null,
          telefone: member.telefone || null,
          photo_url: member.photo_url || null,
          social_links: member.social_links || {},
          curriculum_url: member.curriculum_url || null,
          detalhes: member.detalhes || null,
        }));
        
        await supabase.from("project_members").insert(membersData);
      }
      
      toast({
        title: "Salvo!",
        description: "As alterações foram salvas com sucesso.",
      });
      
      // Invalidar cache do React Query para forçar refetch em outras páginas
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', selectedProject.id] });
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      
      fetchProjects();
      fetchProjectMembers();
      setShowEditDialog(false);
    }
  };

  const openDeleteConfirm = (projectId: string) => {
    setProjectToDelete(projectId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectToDelete);

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
      fetchProjectMembers();
      setFeaturedRefreshKey(prev => prev + 1);
    }
    
    setShowDeleteConfirm(false);
    setProjectToDelete(null);
  };

  const openDeleteContactsConfirm = (projectId: string) => {
    setContactsProjectToDelete(projectId);
    setShowDeleteContactsConfirm(true);
  };

  const confirmDeleteContacts = async () => {
    if (!contactsProjectToDelete) return;

    // Clear responsible party contact data
    const { error: projectError } = await supabase
      .from("projects")
      .update({
        responsavel_nome: null,
        responsavel_email: null,
        responsavel_telefone: null,
        responsavel_genero: null,
      })
      .eq("id", contactsProjectToDelete);

    // Delete all project members
    const { error: membersError } = await supabase
      .from("project_members")
      .delete()
      .eq("project_id", contactsProjectToDelete);

    if (projectError || membersError) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir os cadastros.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Cadastros excluídos",
        description: "Os dados de contato foram removidos com sucesso.",
      });
      fetchProjects();
      fetchProjectMembers();
    }
    
    setShowDeleteContactsConfirm(false);
    setContactsProjectToDelete(null);
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

  const handleSignOut = async () => {
    await signOut();
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
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rainbow-border-glow"
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Projetos
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-3 bg-card border-border shadow-xl" align="end">
                <div className="grid gap-2">
                  <Link
                    to="/porto-de-ideias"
                    className="group flex items-center gap-3 p-3 rounded-lg hover:bg-yellow-500/10 transition-colors"
                  >
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    <div>
                      <h3 className="text-sm font-medium text-foreground">Projetos em Captação</h3>
                      <p className="text-xs text-muted-foreground">Apoie projetos culturais</p>
                    </div>
                  </Link>
                  <Link
                    to="/projetos"
                    className="group flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    <Rocket className="w-5 h-5 text-primary" />
                    <div>
                      <h3 className="text-sm font-medium text-foreground">Portfólio</h3>
                      <p className="text-xs text-muted-foreground">Nossos projetos realizados</p>
                    </div>
                  </Link>
                </div>
              </PopoverContent>
            </Popover>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logoff
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
            Homepage
          </Button>
          <Button 
            type="button"
            variant={activeSection === "captacao" ? "default" : "ghost"}
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveSection("captacao");
            }}
            className="rounded-md"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            Projetos em Captação
          </Button>
          <Button 
            type="button"
            variant={activeSection === "portfolio" ? "default" : "ghost"}
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setActiveSection("portfolio");
            }}
            className="rounded-md"
          >
            <Rocket className="w-4 h-4 mr-2" />
            Portfólio
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
            Formulários de Projetos
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

        {/* Homepage Section - Reorganized with sections in display order */}
        {activeSection === "homepage" && (
          <div className="space-y-8">
            {/* Section 1: Configurações Gerais */}
            <div>
              <div className="text-lg font-semibold text-foreground border-b pb-2 mb-4 flex items-center gap-2">
                <Settings2 className="w-5 h-5" />
                Configurações Gerais
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Estatísticas Públicas</h4>
                        <p className="text-sm text-muted-foreground">Mostrar painel de números</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch 
                          checked={statsVisible} 
                          onCheckedChange={toggleStatsVisibility}
                          disabled={loadingSettings}
                        />
                        <Badge variant={statsVisible ? "default" : "secondary"}>
                          {statsVisible ? "Visível" : "Oculto"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Vídeos no Carrossel</h4>
                        <p className="text-sm text-muted-foreground">Quantidade de vídeos visíveis</p>
                      </div>
                      <div className="flex gap-2">
                        {([1, 3, 5] as const).map((count) => (
                          <Button
                            key={count}
                            variant={carouselDisplayCount === count ? "default" : "outline"}
                            onClick={() => updateCarouselDisplayCount(count)}
                            size="sm"
                            className="w-10 h-10 font-bold"
                          >
                            {count}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Section 2: Hero - Vídeos Institucionais */}
            <div>
              <div className="text-lg font-semibold text-foreground border-b pb-2 mb-4 flex items-center gap-2">
                <Video className="w-5 h-5" />
                Seção Hero - Vídeos Institucionais
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {institutionalVideos.slice(0, carouselDisplayCount).map((video, index) => {
                  // Helpers para detectar YouTube
                  const isYouTubeUrl = (url: string) => url.includes('youtube.com') || url.includes('youtu.be');
                  const extractYouTubeId = (url: string): string | null => {
                    const patterns = [
                      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
                      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
                      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
                      /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
                    ];
                    for (const pattern of patterns) {
                      const match = url.match(pattern);
                      if (match && match[1]) return match[1];
                    }
                    return null;
                  };
                  
                  const youtubeId = video.url ? extractYouTubeId(video.url) : null;
                  const isYouTube = video.url && isYouTubeUrl(video.url);
                  
                  return (
                    <Card key={index} className="overflow-hidden">
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">Vídeo {index + 1}</h4>
                          <div className="flex items-center gap-2">
                            {video.url && isYouTube && (
                              <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200">
                                <Youtube className="w-3 h-3 mr-1" />
                                YouTube
                              </Badge>
                            )}
                            {video.url && !isYouTube && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 border-blue-200">
                                <Video className="w-3 h-3 mr-1" />
                                Arquivo
                              </Badge>
                            )}
                            {video.url && <Badge variant="secondary" className="text-xs">Ativo</Badge>}
                          </div>
                        </div>
                        
                        {/* Preview do vídeo - YouTube ou arquivo */}
                        {video.url && (
                          <div className="rounded-lg overflow-hidden border aspect-video bg-muted">
                            {isYouTube && youtubeId ? (
                              <iframe
                                src={`https://www.youtube.com/embed/${youtubeId}?modestbranding=1&rel=0`}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title={`Preview Vídeo ${index + 1}`}
                              />
                            ) : (
                              <video src={video.url} controls className="w-full h-full object-cover" />
                            )}
                          </div>
                        )}
                        
                        {/* Indicador de tipo detectado */}
                        {video.url && !youtubeId && isYouTube && (
                          <p className="text-xs text-amber-600 flex items-center gap-1">
                            ⚠️ URL do YouTube inválida - verifique o link
                          </p>
                        )}
                        
                        <div className="flex gap-2">
                          <Input
                            placeholder="URL do YouTube ou arquivo de vídeo"
                            value={video.url}
                            onChange={(e) => {
                              const newVideos = [...institutionalVideos];
                              newVideos[index] = { ...newVideos[index], url: e.target.value };
                              setInstitutionalVideos(newVideos);
                            }}
                            className="flex-1 text-sm"
                          />
                          <Label
                            htmlFor={`video-upload-${index}`}
                            className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-3"
                            title="Upload de arquivo de vídeo"
                          >
                            <Upload className="w-4 h-4" />
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
                                toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
                              } else {
                                const { data: urlData } = supabase.storage.from("project-media").getPublicUrl(fileName);
                                const newVideos = [...institutionalVideos];
                                newVideos[index] = { ...newVideos[index], url: urlData.publicUrl };
                                setInstitutionalVideos(newVideos);
                                toast({ title: "Upload concluído!", description: `Vídeo ${index + 1} enviado.` });
                              }
                              setUploadingVideoIndex(null);
                            }}
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
                              title="Remover vídeo"
                            >
                              <X className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          Suporta: YouTube (youtube.com, youtu.be) ou arquivos .mp4/.webm
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <Button 
                onClick={async () => {
                  setSavingVideos(true);
                  const videosToSave = institutionalVideos.filter(v => v.url);
                  const { data: existing } = await supabase.from("settings").select("id").eq("key", "institutional_videos").maybeSingle();
                  const jsonValue = JSON.parse(JSON.stringify({ videos: institutionalVideos }));
                  if (existing) {
                    await supabase.from("settings").update({ value: jsonValue }).eq("key", "institutional_videos");
                  } else {
                    await supabase.from("settings").insert([{ key: "institutional_videos", value: jsonValue }]);
                  }
                  setSavingVideos(false);
                  toast({ title: "Salvo!", description: `${videosToSave.length} vídeo(s) configurado(s).` });
                }}
                disabled={savingVideos}
                className="mt-4"
              >
                <Save className="w-4 h-4 mr-2" />
                {savingVideos ? "Salvando..." : "Salvar Vídeos"}
              </Button>
            </div>

            {/* Section 3: Quem Somos */}
            <div>
              <div className="text-lg font-semibold text-foreground border-b pb-2 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Seção Quem Somos
              </div>
              <QuemSomosEditor />
            </div>

            {/* Section 4: Ecossistema + Projetos em Destaque */}
            <div>
              <div className="text-lg font-semibold text-foreground border-b pb-2 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Seção Porto de Ideias (Projetos em Destaque)
              </div>
              <FeaturedProjectsManager 
                key={`featured-${featuredRefreshKey}`}
                projects={projects} 
                onProjectUpdate={fetchProjects}
              />
            </div>

            {/* Section 5: Nossos Serviços */}
            <div>
              <div className="text-lg font-semibold text-foreground border-b pb-2 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Seção Nossos Serviços
              </div>
              <NossosServicosEditor />
            </div>

            {/* Section 6: Footer */}
            <div>
              <div className="text-lg font-semibold text-foreground border-b pb-2 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Seção Footer
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Footer Content */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Conteúdo do Footer</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm">Tagline</Label>
                      <Textarea
                        value={footerTagline}
                        onChange={(e) => setFooterTagline(e.target.value)}
                        placeholder="Uma plataforma criada para..."
                        rows={2}
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Emails</Label>
                        <Button variant="ghost" size="sm" onClick={() => setFooterEmails([...footerEmails, ""])}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      {footerEmails.map((email, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            type="email"
                            placeholder="email@exemplo.com"
                            value={email}
                            onChange={(e) => {
                              const newEmails = [...footerEmails];
                              newEmails[index] = e.target.value;
                              setFooterEmails(newEmails);
                            }}
                            className="text-sm"
                          />
                          {footerEmails.length > 1 && (
                            <Button variant="ghost" size="icon" onClick={() => setFooterEmails(footerEmails.filter((_, i) => i !== index))}>
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Telefones</Label>
                        <Button variant="ghost" size="sm" onClick={() => setFooterPhones([...footerPhones, ""])}>
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      {footerPhones.map((phone, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder="(00) 00000-0000"
                            value={phone}
                            onChange={(e) => {
                              const newPhones = [...footerPhones];
                              newPhones[index] = e.target.value;
                              setFooterPhones(newPhones);
                            }}
                            className="text-sm"
                          />
                          {footerPhones.length > 1 && (
                            <Button variant="ghost" size="icon" onClick={() => setFooterPhones(footerPhones.filter((_, i) => i !== index))}>
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    <Button onClick={saveFooterContent} disabled={savingFooterContent} className="w-full" size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      {savingFooterContent ? "Salvando..." : "Salvar Conteúdo"}
                    </Button>
                  </CardContent>
                </Card>

                {/* Social Links */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Redes Sociais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Instagram */}
                    <div className="flex items-center gap-3 p-2 border rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] flex items-center justify-center flex-shrink-0">
                        <Instagram className="w-4 h-4 text-white" />
                      </div>
                      <Input
                        placeholder="URL do Instagram"
                        value={socialLinks.instagram.url}
                        onChange={(e) => setSocialLinks(prev => ({ ...prev, instagram: { ...prev.instagram, url: e.target.value } }))}
                        className="flex-1 text-sm"
                        disabled={!socialLinks.instagram.enabled}
                      />
                      <Switch
                        checked={socialLinks.instagram.enabled}
                        onCheckedChange={(checked) => setSocialLinks(prev => ({ ...prev, instagram: { ...prev.instagram, enabled: checked } }))}
                      />
                    </div>

                    {/* Facebook */}
                    <div className="flex items-center gap-3 p-2 border rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center flex-shrink-0">
                        <Facebook className="w-4 h-4 text-white" />
                      </div>
                      <Input
                        placeholder="URL do Facebook"
                        value={socialLinks.facebook.url}
                        onChange={(e) => setSocialLinks(prev => ({ ...prev, facebook: { ...prev.facebook, url: e.target.value } }))}
                        className="flex-1 text-sm"
                        disabled={!socialLinks.facebook.enabled}
                      />
                      <Switch
                        checked={socialLinks.facebook.enabled}
                        onCheckedChange={(checked) => setSocialLinks(prev => ({ ...prev, facebook: { ...prev.facebook, enabled: checked } }))}
                      />
                    </div>

                    {/* LinkedIn */}
                    <div className="flex items-center gap-3 p-2 border rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-[#0A66C2] flex items-center justify-center flex-shrink-0">
                        <Linkedin className="w-4 h-4 text-white" />
                      </div>
                      <Input
                        placeholder="URL do LinkedIn"
                        value={socialLinks.linkedin.url}
                        onChange={(e) => setSocialLinks(prev => ({ ...prev, linkedin: { ...prev.linkedin, url: e.target.value } }))}
                        className="flex-1 text-sm"
                        disabled={!socialLinks.linkedin.enabled}
                      />
                      <Switch
                        checked={socialLinks.linkedin.enabled}
                        onCheckedChange={(checked) => setSocialLinks(prev => ({ ...prev, linkedin: { ...prev.linkedin, enabled: checked } }))}
                      />
                    </div>

                    {/* YouTube */}
                    <div className="flex items-center gap-3 p-2 border rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-[#FF0000] flex items-center justify-center flex-shrink-0">
                        <Youtube className="w-4 h-4 text-white" />
                      </div>
                      <Input
                        placeholder="URL do YouTube"
                        value={socialLinks.youtube.url}
                        onChange={(e) => setSocialLinks(prev => ({ ...prev, youtube: { ...prev.youtube, url: e.target.value } }))}
                        className="flex-1 text-sm"
                        disabled={!socialLinks.youtube.enabled}
                      />
                      <Switch
                        checked={socialLinks.youtube.enabled}
                        onCheckedChange={(checked) => setSocialLinks(prev => ({ ...prev, youtube: { ...prev.youtube, enabled: checked } }))}
                      />
                    </div>

                    {/* Twitter/X */}
                    <div className="flex items-center gap-3 p-2 border rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                        <Twitter className="w-4 h-4 text-white" />
                      </div>
                      <Input
                        placeholder="URL do X/Twitter"
                        value={socialLinks.twitter?.url || ""}
                        onChange={(e) => setSocialLinks(prev => ({ ...prev, twitter: { ...prev.twitter, url: e.target.value } }))}
                        className="flex-1 text-sm"
                        disabled={!socialLinks.twitter?.enabled}
                      />
                      <Switch
                        checked={socialLinks.twitter?.enabled || false}
                        onCheckedChange={(checked) => setSocialLinks(prev => ({ ...prev, twitter: { ...prev.twitter, enabled: checked } }))}
                      />
                    </div>

                    {/* IMDB */}
                    <div className="flex items-center gap-3 p-2 border rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-[#F5C518] flex items-center justify-center flex-shrink-0">
                        <span className="text-black font-bold text-xs">IMDb</span>
                      </div>
                      <Input
                        placeholder="URL do IMDb"
                        value={socialLinks.imdb?.url || ""}
                        onChange={(e) => setSocialLinks(prev => ({ ...prev, imdb: { ...prev.imdb, url: e.target.value } }))}
                        className="flex-1 text-sm"
                        disabled={!socialLinks.imdb?.enabled}
                      />
                      <Switch
                        checked={socialLinks.imdb?.enabled || false}
                        onCheckedChange={(checked) => setSocialLinks(prev => ({ ...prev, imdb: { ...prev.imdb, enabled: checked } }))}
                      />
                    </div>

                    {/* Website */}
                    <div className="flex items-center gap-3 p-2 border rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <Globe className="w-4 h-4 text-white" />
                      </div>
                      <Input
                        placeholder="URL do Site"
                        value={socialLinks.website.url}
                        onChange={(e) => setSocialLinks(prev => ({ ...prev, website: { ...prev.website, url: e.target.value } }))}
                        className="flex-1 text-sm"
                        disabled={!socialLinks.website.enabled}
                      />
                      <Switch
                        checked={socialLinks.website.enabled}
                        onCheckedChange={(checked) => setSocialLinks(prev => ({ ...prev, website: { ...prev.website, enabled: checked } }))}
                      />
                    </div>

                    {/* WhatsApp */}
                    <div className="flex items-center gap-3 p-2 border rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 flex items-center gap-1">
                        <span className="text-sm text-muted-foreground font-medium">+55</span>
                        <Input
                          placeholder="(21) 99999-9999"
                          value={(() => {
                            const raw = (socialLinks.whatsapp?.url || "").replace(/^55/, "").replace(/\D/g, "");
                            if (raw.length === 0) return "";
                            if (raw.length <= 2) return `(${raw}`;
                            if (raw.length <= 7) return `(${raw.slice(0, 2)}) ${raw.slice(2)}`;
                            return `(${raw.slice(0, 2)}) ${raw.slice(2, 7)}-${raw.slice(7, 11)}`;
                          })()}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
                            const fullNumber = digits ? `55${digits}` : "";
                            setSocialLinks(prev => ({ 
                              ...prev, 
                              whatsapp: { ...(prev.whatsapp || { enabled: false, url: '' }), url: fullNumber } 
                            }));
                          }}
                          className="flex-1 text-sm"
                          disabled={!socialLinks.whatsapp?.enabled}
                          maxLength={16}
                        />
                      </div>
                      <Switch
                        checked={socialLinks.whatsapp?.enabled || false}
                        onCheckedChange={(checked) => setSocialLinks(prev => ({ ...prev, whatsapp: { ...(prev.whatsapp || { enabled: false, url: '' }), enabled: checked } }))}
                      />
                    </div>

                    <Button onClick={saveSocialLinks} disabled={savingSocialLinks} className="w-full" size="sm">
                      <Save className="w-4 h-4 mr-2" />
                      {savingSocialLinks ? "Salvando..." : "Salvar Redes Sociais"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Captação Section - Página Porto de Ideias */}
        {activeSection === "captacao" && (
          <div className="space-y-6">
            <div className="text-lg font-semibold text-muted-foreground border-b pb-2 mb-4">
              💡 Página Projetos em Captação (Porto de Ideias)
            </div>

            {/* Porto de Ideias Header Editor */}
            <PortoIdeiasHeaderEditor />
          </div>
        )}

        {/* Portfolio Section - Página Portfólio */}
        {activeSection === "portfolio" && (
          <div className="space-y-6">
            <div className="text-lg font-semibold text-muted-foreground border-b pb-2 mb-4">
              🚀 Página Portfólio
            </div>

            {/* Contact Buttons Editor */}
            <ContactButtonsEditor />

            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">
                  A página de Portfólio exibe projetos marcados como "Portfólio" na lista de projetos.
                  Use a aba <strong>Projetos</strong> para gerenciar quais projetos aparecem nesta página.
                </p>
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

        {/* Contacts Section - Grouped by Project */}
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
                Lista de todas as pessoas que fizeram cadastro ao submeter projetos (pendentes, aprovados ou rejeitados), agrupados por projeto.
              </p>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 border rounded-lg bg-muted/30">
                <div className="space-y-2">
                  <Label className="text-sm">Gênero do Responsável</Label>
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
                  Exibindo {(() => {
                    const filteredProjects = projects.filter(p => {
                      if (contactFilterGender !== "all" && p.responsavel_genero !== contactFilterGender) return false;
                      if (contactFilterStatus !== "all" && p.status !== contactFilterStatus) return false;
                      if (contactFilterDateFrom) {
                        const projectDate = new Date(p.created_at);
                        const filterDate = new Date(contactFilterDateFrom);
                        if (projectDate < filterDate) return false;
                      }
                      if (contactFilterDateTo) {
                        const projectDate = new Date(p.created_at);
                        const filterDate = new Date(contactFilterDateTo);
                        filterDate.setHours(23, 59, 59, 999);
                        if (projectDate > filterDate) return false;
                      }
                      return p.responsavel_nome || p.responsavel_email || p.responsavel_telefone;
                    });
                    return filteredProjects.length;
                  })()} de {projects.filter(p => p.responsavel_nome || p.responsavel_email || p.responsavel_telefone).length} projetos com cadastros
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

              {/* Project Cards with Contacts */}
              {(() => {
                const filteredProjects = projects.filter(p => {
                  if (contactFilterGender !== "all" && p.responsavel_genero !== contactFilterGender) return false;
                  if (contactFilterStatus !== "all" && p.status !== contactFilterStatus) return false;
                  if (contactFilterDateFrom) {
                    const projectDate = new Date(p.created_at);
                    const filterDate = new Date(contactFilterDateFrom);
                    if (projectDate < filterDate) return false;
                  }
                  if (contactFilterDateTo) {
                    const projectDate = new Date(p.created_at);
                    const filterDate = new Date(contactFilterDateTo);
                    filterDate.setHours(23, 59, 59, 999);
                    if (projectDate > filterDate) return false;
                  }
                  return p.responsavel_nome || p.responsavel_email || p.responsavel_telefone;
                });

                return filteredProjects.length > 0 ? (
                  <div className="space-y-4">
                    {filteredProjects.map((project) => {
                      const members = projectMembers.filter(m => m.project_id === project.id);
                      
                      return (
                        <Card key={project.id} className="border">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-lg">{project.title}</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(project.created_at).toLocaleDateString("pt-BR")}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={
                                  project.status === "approved" ? "default" :
                                  project.status === "rejected" ? "destructive" : "secondary"
                                }>
                                  {project.status === "approved" ? "Aprovado" :
                                   project.status === "rejected" ? "Rejeitado" : "Pendente"}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openDeleteContactsConfirm(project.id)}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  title="Excluir cadastros deste projeto"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            {/* Responsável */}
                            <div className="mb-4">
                              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                <Badge variant="default" className="text-xs">Responsável</Badge>
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 bg-muted/30 rounded-lg">
                                <div>
                                  <p className="text-xs text-muted-foreground">Nome</p>
                                  <p className="text-sm font-medium">{project.responsavel_nome || "-"}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Telefone</p>
                                  <p className="text-sm">{project.responsavel_telefone || "-"}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Email</p>
                                  <p className="text-sm">{project.responsavel_email || "-"}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Gênero</p>
                                  <p className="text-sm">{getGeneroLabel(project.responsavel_genero)}</p>
                                </div>
                              </div>
                            </div>

                            {/* Integrantes */}
                            {members.length > 0 && (
                              <div>
                                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs">Integrantes ({members.length})</Badge>
                                </h4>
                                <div className="space-y-2">
                                  {members.map((member) => (
                                    <div key={member.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 bg-muted/20 rounded-lg border">
                                      <div>
                                        <p className="text-xs text-muted-foreground">Nome</p>
                                        <p className="text-sm font-medium">{member.nome || "-"}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-muted-foreground">Função</p>
                                        <p className="text-sm">{member.funcao || "-"}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-muted-foreground">Telefone</p>
                                        <p className="text-sm">{member.telefone || "-"}</p>
                                      </div>
                                      <div>
                                        <p className="text-xs text-muted-foreground">Email</p>
                                        <p className="text-sm">{member.email || "-"}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum cadastro encontrado.
                  </p>
                );
              })()}
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
                  <TabsTrigger value="all">Todos</TabsTrigger>
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
                              {project.status === "approved" && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => toggleFeatured(project.id, project.featured_on_homepage)}
                                  title={project.featured_on_homepage ? "Remover dos destaques" : "Adicionar aos destaques"}
                                  className={project.featured_on_homepage 
                                    ? "text-yellow-600 bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-950 dark:hover:bg-yellow-900" 
                                    : "text-muted-foreground hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-950"
                                  }
                                >
                                  {project.featured_on_homepage ? (
                                    <Star className="w-4 h-4 fill-current" />
                                  ) : (
                                    <StarOff className="w-4 h-4" />
                                  )}
                                </Button>
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
                                variant="outline"
                                size="icon"
                                onClick={() => toggleHidden(project.id, project.is_hidden || false)}
                                title={project.is_hidden ? "Tornar visível" : "Ocultar do site"}
                                className={project.is_hidden 
                                  ? "text-muted-foreground bg-muted" 
                                  : "text-foreground"
                                }
                              >
                                {project.is_hidden ? (
                                  <EyeOff className="w-4 h-4" />
                                ) : (
                                  <Eye className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteConfirm(project.id)}
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
                        <Badge key={i} variant="outline">{getCategoryLabel(tag)}</Badge>
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
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedProject.incentive_law_details.split(',').map((law, index) => (
                          <Badge key={index} variant="secondary">
                            {getIncentiveLawLabel(law.trim())}
                          </Badge>
                        ))}
                      </div>
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

      {/* Edit Dialog - Complete Form */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Projeto</DialogTitle>
            <DialogDescription>
              Atualize todas as informações do projeto.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Informações Básicas */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm border-b pb-2">Informações Básicas</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Título do Projeto *</Label>
                  <Input
                    id="edit-title"
                    placeholder="Nome do projeto"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                  />
                </div>

                <DynamicProjectTypeSelect
                  value={editProjectType}
                  onChange={setEditProjectType}
                  allowManage={true}
                  label="Tipo de Projeto"
                />
                {editProjectType === "Outro" && (
                  <div className="space-y-2">
                    <Label>Tipo Personalizado</Label>
                    <Input
                      placeholder="Digite o tipo de projeto"
                      onChange={(e) => setEditProjectType(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <StagesMultiSelect 
                    value={editStages} 
                    onChange={setEditStages}
                    label="Estágios do Projeto"
                    allowCustom={true}
                  />
                </div>

                <div className="space-y-2">
                  <CategoriesMultiSelect 
                    value={editCategoriasTags} 
                    onChange={setEditCategoriasTags}
                    allowCustom={true}
                  />
                </div>

                <DynamicLocationSelect
                  value={editLocation}
                  onChange={setEditLocation}
                  allowManage={true}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-synopsis">Sinopse *</Label>
                <Textarea
                  id="edit-synopsis"
                  placeholder="Breve descrição do projeto"
                  value={editSynopsis}
                  onChange={(e) => setEditSynopsis(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição Completa</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Descrição detalhada do projeto"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-additional-info">Informações Adicionais</Label>
                <Textarea
                  id="edit-additional-info"
                  placeholder="Informações adicionais sobre o projeto (máx. 100 caracteres)"
                  value={editAdditionalInfo}
                  onChange={(e) => setEditAdditionalInfo(e.target.value.slice(0, 100))}
                  rows={2}
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">{editAdditionalInfo.length}/100 caracteres</p>
              </div>
            </div>

            {/* Mídia */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm border-b pb-2">Mídia e Imagens</h4>
              
              {/* Dual Image Cropper */}
              <div className="space-y-2">
                <Label>Imagens de Capa do Projeto</Label>
                <DualImageCropper
                  onImagesCropped={handleEditImagesCropped}
                  currentHeroImage={editHeroPreview}
                  currentCardImage={editCardPreview}
                  originalImageUrl={editImageUrl || selectedProject?.image_url || selectedProject?.hero_image_url || selectedProject?.card_image_url}
                  onClear={handleEditClearImage}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-link-video">Link do Vídeo</Label>
                <Input
                  id="edit-link-video"
                  placeholder="https://youtube.com/..."
                  value={editLinkVideo}
                  onChange={(e) => setEditLinkVideo(e.target.value)}
                />
              </div>

              {/* Presentation Document Upload */}
              <div className="space-y-2">
                <Label>Documento de Apresentação (PDF)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="URL do documento..."
                    value={editPresentationDocUrl}
                    onChange={(e) => setEditPresentationDocUrl(e.target.value)}
                    className="flex-1"
                  />
                  <input
                    type="file"
                    id="edit-doc-upload"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    disabled={uploadingEditDoc}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleEditDocUpload(file);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploadingEditDoc}
                    onClick={() => document.getElementById("edit-doc-upload")?.click()}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    {uploadingEditDoc ? "Enviando..." : "Upload"}
                  </Button>
                </div>
                {editPresentationDocUrl && (
                  <a 
                    href={editPresentationDocUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" />
                    Ver documento atual
                  </a>
                )}
              </div>
            </div>

            {/* Financeiro */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm border-b pb-2">Informações Financeiras</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <Label htmlFor="edit-valor">Valor Sugerido (R$)</Label>
                  <Input
                    id="edit-valor"
                    type="number"
                    placeholder="50000"
                    value={editValorSugerido}
                    onChange={(e) => setEditValorSugerido(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-link-pagamento">Link de Pagamento</Label>
                  <Input
                    id="edit-link-pagamento"
                    placeholder="https://..."
                    value={editLinkPagamento}
                    onChange={(e) => setEditLinkPagamento(e.target.value)}
                  />
                </div>
              </div>

              <IncentiveLawsMultiSelect 
                key={`incentive-laws-${selectedProject?.id}`}
                value={editIncentiveLaws}
                onChange={setEditIncentiveLaws}
                allowCustom={true}
              />
            </div>

            {/* Impacto */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm border-b pb-2">Impacto e Diferenciação</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-impacto-cultural">Impacto Cultural</Label>
                  <Textarea
                    id="edit-impacto-cultural"
                    placeholder="Descreva o impacto cultural do projeto"
                    value={editImpactoCultural}
                    onChange={(e) => setEditImpactoCultural(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-impacto-social">Impacto Social</Label>
                  <Textarea
                    id="edit-impacto-social"
                    placeholder="Descreva o impacto social do projeto"
                    value={editImpactoSocial}
                    onChange={(e) => setEditImpactoSocial(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-publico">Público-Alvo</Label>
                  <Textarea
                    id="edit-publico"
                    placeholder="Descreva o público-alvo"
                    value={editPublicoAlvo}
                    onChange={(e) => setEditPublicoAlvo(e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-diferenciais">Diferenciais</Label>
                  <Textarea
                    id="edit-diferenciais"
                    placeholder="Descreva os diferenciais do projeto"
                    value={editDiferenciais}
                    onChange={(e) => setEditDiferenciais(e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            {/* Responsável */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm border-b pb-2">Dados do Responsável</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-resp-nome">Nome do Responsável</Label>
                  <Input
                    id="edit-resp-nome"
                    placeholder="Nome completo"
                    value={editResponsavelNome}
                    onChange={(e) => setEditResponsavelNome(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-resp-genero">Gênero</Label>
                  <Select value={editResponsavelGenero} onValueChange={setEditResponsavelGenero}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                      <SelectItem value="prefiro_nao_informar">Prefiro não informar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-resp-email">Email</Label>
                  <Input
                    id="edit-resp-email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={editResponsavelEmail}
                    onChange={(e) => setEditResponsavelEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-resp-telefone">Telefone</Label>
                  <Input
                    id="edit-resp-telefone"
                    placeholder="(00) 00000-0000"
                    value={editResponsavelTelefone}
                    onChange={(e) => setEditResponsavelTelefone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Ficha Técnica / Integrantes */}
            <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
              <TeamMemberEditor 
                members={editTeamMembers} 
                onChange={setEditTeamMembers} 
              />
            </div>

            {/* Contrapartidas */}
            <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
              <ContrapartidasEditor 
                contrapartidas={editContrapartidas} 
                onChange={setEditContrapartidas} 
              />
            </div>

            {/* Reconhecimentos e Mídia */}
            <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
              <RecognitionEditor
                awards={editAwards}
                news={editNews}
                festivals={editFestivals}
                onAwardsChange={setEditAwards}
                onNewsChange={setEditNews}
                onFestivalsChange={setEditFestivals}
              />
            </div>

            {/* Notas Admin */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm border-b pb-2">Notas Internas</h4>
              
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notas do Administrador</Label>
                <Textarea
                  id="edit-notes"
                  placeholder="Adicione observações internas sobre este projeto..."
                  value={editAdminNotes}
                  onChange={(e) => setEditAdminNotes(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">Estas notas são visíveis apenas para administradores.</p>
              </div>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão do Projeto</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => {
              setShowDeleteConfirm(false);
              setProjectToDelete(null);
            }}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteProject}>
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Projeto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Contacts Confirmation Dialog */}
      <Dialog open={showDeleteContactsConfirm} onOpenChange={setShowDeleteContactsConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão dos Cadastros</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir os dados de contato (responsável e integrantes) deste projeto? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => {
              setShowDeleteContactsConfirm(false);
              setContactsProjectToDelete(null);
            }}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteContacts}>
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir Cadastros
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
