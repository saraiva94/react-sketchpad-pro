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
import { Switch } from "@/components/ui/switch";
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
  MessageSquare,
  Upload,
  Video,
  X
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [activeSection, setActiveSection] = useState<"projects" | "requests" | "contacts" | "featured" | "settings">("projects");
  const [statsVisible, setStatsVisible] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [institutionalVideoUrl, setInstitutionalVideoUrl] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  
  // Mídias da seção Ecossistema
  const [ecossistemaProducerMedia, setEcossistemaProducerMedia] = useState<{ url: string; type: 'image' | 'video' }>({ url: "", type: "image" });
  const [ecossistemaInvestorMedia, setEcossistemaInvestorMedia] = useState<{ url: string; type: 'image' | 'video' }>({ url: "", type: "image" });
  const [uploadingProducerMedia, setUploadingProducerMedia] = useState(false);
  const [uploadingInvestorMedia, setUploadingInvestorMedia] = useState(false);
  
  // Porto de Ideias slots control
  const [portoIdeiasSlots, setPortoIdeiasSlots] = useState(5);

  // Edit form state
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editBudget, setEditBudget] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editAdminNotes, setEditAdminNotes] = useState("");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (!isLoggedIn) {
      navigate("/auth");
    } else {
      fetchProjects();
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

    const { data: videoData } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "institutional_video")
      .maybeSingle();
    
    if (videoData) {
      setInstitutionalVideoUrl((videoData.value as { url: string }).url || "");
    }

    // Fetch ecossistema producer media
    const { data: producerData } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "ecossistema_producer_media")
      .maybeSingle();
    
    if (producerData) {
      const mediaValue = producerData.value as { url: string; type: 'image' | 'video' };
      setEcossistemaProducerMedia({ url: mediaValue.url || "", type: mediaValue.type || "image" });
    }

    // Fetch ecossistema investor media
    const { data: investorData } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "ecossistema_investor_media")
      .maybeSingle();
    
    if (investorData) {
      const mediaValue = investorData.value as { url: string; type: 'image' | 'video' };
      setEcossistemaInvestorMedia({ url: mediaValue.url || "", type: mediaValue.type || "image" });
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
    
    setLoadingSettings(false);
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
    const csvContacts = projects
      .filter(p => p.responsavel_nome || p.responsavel_email || p.responsavel_telefone)
      .map(p => ({
        nome: p.responsavel_nome || "",
        email: p.responsavel_email || "",
        telefone: p.responsavel_telefone || "",
        projeto: p.title,
        status: p.status
      }));

    if (csvContacts.length === 0) {
      toast({
        title: "Nenhum cadastro",
        description: "Não há cadastros para exportar.",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Nome", "Email", "Telefone", "Projeto", "Status"];
    const csvContent = [
      headers.join(";"),
      ...csvContacts.map(c => 
        [c.nome, c.email, c.telefone, c.projeto, c.status].join(";")
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
      description: `${csvContacts.length} cadastros exportados com sucesso.`,
    });
  };

  const downloadAccessRequestsCSV = () => {
    if (accessRequests.length === 0) {
      toast({
        title: "Nenhuma solicitação",
        description: "Não há solicitações para exportar.",
        variant: "destructive",
      });
      return;
    }

    const headers = ["Nome", "Telefone", "Interesse", "Projeto", "Status", "Data"];
    const csvContent = [
      headers.join(";"),
      ...accessRequests.map(r => 
        [r.nome, r.telefone, r.interesse, r.project_title || "", r.status, new Date(r.created_at).toLocaleDateString("pt-BR")].join(";")
      )
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `solicitacoes_acesso_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "CSV exportado!",
      description: `${accessRequests.length} solicitações exportadas com sucesso.`,
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

  const contacts = projects.map(p => ({
    id: p.id,
    nome: p.responsavel_nome,
    email: p.responsavel_email,
    telefone: p.responsavel_telefone,
    projeto: p.title,
  })).filter(c => c.nome || c.email || c.telefone);

  const pendingRequests = accessRequests.filter(r => r.status === "pending");

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        showNav={false} 
        rightContent={
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        }
      />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-handwritten font-bold text-foreground">Painel Administrativo</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie projetos, solicitações e configurações da plataforma.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 p-1 bg-muted rounded-lg">
          <Button 
            variant={activeSection === "projects" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveSection("projects")}
            className="rounded-md"
          >
            <FileText className="w-4 h-4 mr-2" />
            Projetos
            <Badge variant="secondary" className="ml-2">{projects.length}</Badge>
          </Button>
          <Button 
            variant={activeSection === "requests" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveSection("requests")}
            className="rounded-md"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Solicitações
            {pendingRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2">{pendingRequests.length}</Badge>
            )}
          </Button>
          <Button 
            variant={activeSection === "contacts" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveSection("contacts")}
            className="rounded-md"
          >
            <Users className="w-4 h-4 mr-2" />
            Cadastros
          </Button>
          <Button 
            variant={activeSection === "featured" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveSection("featured")}
            className="rounded-md"
          >
            <Home className="w-4 h-4 mr-2" />
            Destaques
          </Button>
          <Button 
            variant={activeSection === "settings" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveSection("settings")}
            className="rounded-md"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Configurações
          </Button>
        </div>

        {/* Settings Section */}
        {activeSection === "settings" && (
          <div className="space-y-6">
            {/* Vídeo Institucional */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Vídeo Institucional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Configure o vídeo que será exibido na seção principal da homepage.
                </p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="video-url">URL do Vídeo</Label>
                    <div className="flex gap-2">
                      <Input
                        id="video-url"
                        placeholder="https://exemplo.com/video.mp4"
                        value={institutionalVideoUrl}
                        onChange={(e) => setInstitutionalVideoUrl(e.target.value)}
                        className="flex-1"
                      />
                      {institutionalVideoUrl && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setInstitutionalVideoUrl("")}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Cole a URL direta do vídeo (MP4, WebM) ou faça upload no storage.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button 
                      onClick={async () => {
                        setUploadingVideo(true);
                        // Check if setting exists
                        const { data: existing } = await supabase
                          .from("settings")
                          .select("id")
                          .eq("key", "institutional_video")
                          .single();
                        
                        if (existing) {
                          await supabase
                            .from("settings")
                            .update({ value: { url: institutionalVideoUrl } })
                            .eq("key", "institutional_video");
                        } else {
                          await supabase
                            .from("settings")
                            .insert({ key: "institutional_video", value: { url: institutionalVideoUrl } });
                        }
                        
                        setUploadingVideo(false);
                        toast({
                          title: "Salvo!",
                          description: institutionalVideoUrl 
                            ? "Vídeo institucional atualizado com sucesso." 
                            : "Vídeo institucional removido.",
                        });
                      }}
                      disabled={uploadingVideo}
                    >
                      {uploadingVideo ? "Salvando..." : "Salvar Vídeo"}
                    </Button>

                    <Label
                      htmlFor="video-upload"
                      className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload para Storage
                    </Label>
                    <input
                      id="video-upload"
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        setUploadingVideo(true);
                        const fileName = `institutional-${Date.now()}.${file.name.split('.').pop()}`;
                        
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
                          
                          setInstitutionalVideoUrl(urlData.publicUrl);
                          
                          // Save to settings
                          const { data: existing } = await supabase
                            .from("settings")
                            .select("id")
                            .eq("key", "institutional_video")
                            .single();
                          
                          if (existing) {
                            await supabase
                              .from("settings")
                              .update({ value: { url: urlData.publicUrl } })
                              .eq("key", "institutional_video");
                          } else {
                            await supabase
                              .from("settings")
                              .insert({ key: "institutional_video", value: { url: urlData.publicUrl } });
                          }
                          
                          toast({
                            title: "Upload concluído!",
                            description: "Vídeo enviado e salvo com sucesso.",
                          });
                        }
                        
                        setUploadingVideo(false);
                      }}
                    />
                  </div>

                  {institutionalVideoUrl && (
                    <div className="mt-4 rounded-lg overflow-hidden border">
                      <video
                        src={institutionalVideoUrl}
                        controls
                        className="w-full max-h-64 object-contain bg-black"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Mídias da Seção Ecossistema */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Mídias da Seção "Ecossistema de Conexões"
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Configure as imagens ou vídeos que serão exibidos na seção "Um Ecossistema de Conexões" da homepage.
                </p>
                
                {/* Para Produtores Culturais */}
                <div className="p-4 border rounded-lg space-y-4">
                  <h4 className="font-semibold">Para Produtores Culturais</h4>
                  
                  <div className="flex gap-4 items-center">
                    <Label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="producer-type"
                        checked={ecossistemaProducerMedia.type === "image"}
                        onChange={() => setEcossistemaProducerMedia(prev => ({ ...prev, type: "image" }))}
                      />
                      Imagem
                    </Label>
                    <Label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="producer-type"
                        checked={ecossistemaProducerMedia.type === "video"}
                        onChange={() => setEcossistemaProducerMedia(prev => ({ ...prev, type: "video" }))}
                      />
                      Vídeo
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label>URL da Mídia</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder={ecossistemaProducerMedia.type === "image" ? "https://exemplo.com/imagem.jpg" : "https://exemplo.com/video.mp4"}
                        value={ecossistemaProducerMedia.url}
                        onChange={(e) => setEcossistemaProducerMedia(prev => ({ ...prev, url: e.target.value }))}
                        className="flex-1"
                      />
                      {ecossistemaProducerMedia.url && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEcossistemaProducerMedia({ url: "", type: "image" })}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button 
                      onClick={async () => {
                        setUploadingProducerMedia(true);
                        const { data: existing } = await supabase
                          .from("settings")
                          .select("id")
                          .eq("key", "ecossistema_producer_media")
                          .single();
                        
                        if (existing) {
                          await supabase
                            .from("settings")
                            .update({ value: ecossistemaProducerMedia })
                            .eq("key", "ecossistema_producer_media");
                        } else {
                          await supabase
                            .from("settings")
                            .insert({ key: "ecossistema_producer_media", value: ecossistemaProducerMedia });
                        }
                        
                        setUploadingProducerMedia(false);
                        toast({
                          title: "Salvo!",
                          description: "Mídia de produtores atualizada com sucesso.",
                        });
                      }}
                      disabled={uploadingProducerMedia}
                    >
                      {uploadingProducerMedia ? "Salvando..." : "Salvar"}
                    </Button>

                    <Label
                      htmlFor="producer-media-upload"
                      className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </Label>
                    <input
                      id="producer-media-upload"
                      type="file"
                      accept={ecossistemaProducerMedia.type === "image" ? "image/*" : "video/*"}
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        setUploadingProducerMedia(true);
                        const fileName = `ecossistema-producer-${Date.now()}.${file.name.split('.').pop()}`;
                        
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
                          
                          const newMedia = { url: urlData.publicUrl, type: ecossistemaProducerMedia.type };
                          setEcossistemaProducerMedia(newMedia);
                          
                          const { data: existing } = await supabase
                            .from("settings")
                            .select("id")
                            .eq("key", "ecossistema_producer_media")
                            .single();
                          
                          if (existing) {
                            await supabase
                              .from("settings")
                              .update({ value: newMedia })
                              .eq("key", "ecossistema_producer_media");
                          } else {
                            await supabase
                              .from("settings")
                              .insert({ key: "ecossistema_producer_media", value: newMedia });
                          }
                          
                          toast({
                            title: "Upload concluído!",
                            description: "Mídia enviada e salva com sucesso.",
                          });
                        }
                        
                        setUploadingProducerMedia(false);
                      }}
                    />
                  </div>

                  {ecossistemaProducerMedia.url && (
                    <div className="mt-4 rounded-lg overflow-hidden border max-w-sm">
                      {ecossistemaProducerMedia.type === "video" ? (
                        <video
                          src={ecossistemaProducerMedia.url}
                          controls
                          className="w-full max-h-48 object-contain bg-black"
                        />
                      ) : (
                        <img
                          src={ecossistemaProducerMedia.url}
                          alt="Preview"
                          className="w-full max-h-48 object-cover"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Para Empreendedores e Investidores */}
                <div className="p-4 border rounded-lg space-y-4">
                  <h4 className="font-semibold">Para Empreendedores e Investidores</h4>
                  
                  <div className="flex gap-4 items-center">
                    <Label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="investor-type"
                        checked={ecossistemaInvestorMedia.type === "image"}
                        onChange={() => setEcossistemaInvestorMedia(prev => ({ ...prev, type: "image" }))}
                      />
                      Imagem
                    </Label>
                    <Label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="investor-type"
                        checked={ecossistemaInvestorMedia.type === "video"}
                        onChange={() => setEcossistemaInvestorMedia(prev => ({ ...prev, type: "video" }))}
                      />
                      Vídeo
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label>URL da Mídia</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder={ecossistemaInvestorMedia.type === "image" ? "https://exemplo.com/imagem.jpg" : "https://exemplo.com/video.mp4"}
                        value={ecossistemaInvestorMedia.url}
                        onChange={(e) => setEcossistemaInvestorMedia(prev => ({ ...prev, url: e.target.value }))}
                        className="flex-1"
                      />
                      {ecossistemaInvestorMedia.url && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEcossistemaInvestorMedia({ url: "", type: "image" })}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button 
                      onClick={async () => {
                        setUploadingInvestorMedia(true);
                        const { data: existing } = await supabase
                          .from("settings")
                          .select("id")
                          .eq("key", "ecossistema_investor_media")
                          .single();
                        
                        if (existing) {
                          await supabase
                            .from("settings")
                            .update({ value: ecossistemaInvestorMedia })
                            .eq("key", "ecossistema_investor_media");
                        } else {
                          await supabase
                            .from("settings")
                            .insert({ key: "ecossistema_investor_media", value: ecossistemaInvestorMedia });
                        }
                        
                        setUploadingInvestorMedia(false);
                        toast({
                          title: "Salvo!",
                          description: "Mídia de investidores atualizada com sucesso.",
                        });
                      }}
                      disabled={uploadingInvestorMedia}
                    >
                      {uploadingInvestorMedia ? "Salvando..." : "Salvar"}
                    </Button>

                    <Label
                      htmlFor="investor-media-upload"
                      className="cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </Label>
                    <input
                      id="investor-media-upload"
                      type="file"
                      accept={ecossistemaInvestorMedia.type === "image" ? "image/*" : "video/*"}
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        setUploadingInvestorMedia(true);
                        const fileName = `ecossistema-investor-${Date.now()}.${file.name.split('.').pop()}`;
                        
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
                          
                          const newMedia = { url: urlData.publicUrl, type: ecossistemaInvestorMedia.type };
                          setEcossistemaInvestorMedia(newMedia);
                          
                          const { data: existing } = await supabase
                            .from("settings")
                            .select("id")
                            .eq("key", "ecossistema_investor_media")
                            .single();
                          
                          if (existing) {
                            await supabase
                              .from("settings")
                              .update({ value: newMedia })
                              .eq("key", "ecossistema_investor_media");
                          } else {
                            await supabase
                              .from("settings")
                              .insert({ key: "ecossistema_investor_media", value: newMedia });
                          }
                          
                          toast({
                            title: "Upload concluído!",
                            description: "Mídia enviada e salva com sucesso.",
                          });
                        }
                        
                        setUploadingInvestorMedia(false);
                      }}
                    />
                  </div>

                  {ecossistemaInvestorMedia.url && (
                    <div className="mt-4 rounded-lg overflow-hidden border max-w-sm">
                      {ecossistemaInvestorMedia.type === "video" ? (
                        <video
                          src={ecossistemaInvestorMedia.url}
                          controls
                          className="w-full max-h-48 object-contain bg-black"
                        />
                      ) : (
                        <img
                          src={ecossistemaInvestorMedia.url}
                          alt="Preview"
                          className="w-full max-h-48 object-cover"
                        />
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurações da Homepage</CardTitle>
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

            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  <Link to="/admin/add-project">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Projeto
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={downloadContactsCSV}>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Cadastros
                  </Button>
                  <Button variant="outline" onClick={downloadAccessRequestsCSV}>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Solicitações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Access Requests Section */}
        {activeSection === "requests" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Solicitações de Acesso a Documentos</CardTitle>
              <Button variant="outline" size="sm" onClick={downloadAccessRequestsCSV} className="bg-green-600 hover:bg-green-700 text-white border-green-600">
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </CardHeader>
            <CardContent>
              {loadingRequests ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse p-4 border rounded-lg">
                      <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : accessRequests.length > 0 ? (
                <div className="space-y-4">
                  {accessRequests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{request.nome}</h4>
                            <Badge variant={
                              request.status === "approved" ? "default" :
                              request.status === "rejected" ? "destructive" : "secondary"
                            }>
                              {request.status === "approved" ? "Aprovado" :
                               request.status === "rejected" ? "Rejeitado" : "Pendente"}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p className="flex items-center gap-2">
                              <Phone className="w-3 h-3" />
                              {request.telefone}
                            </p>
                            {request.project_title && (
                              <p className="flex items-center gap-2">
                                <FileText className="w-3 h-3" />
                                Projeto: {request.project_title}
                              </p>
                            )}
                            <p className="mt-2 p-2 bg-muted rounded text-foreground">
                              <strong>Interesse:</strong> {request.interesse}
                            </p>
                            <p className="text-xs">
                              Enviado em {new Date(request.created_at).toLocaleDateString("pt-BR")} às {new Date(request.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {request.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateRequestStatus(request.id, "approved")}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Aprovar
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => updateRequestStatus(request.id, "rejected")}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Rejeitar
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteAccessRequest(request.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma solicitação de acesso recebida.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Contacts Section */}
        {activeSection === "contacts" && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Cadastros - Dados de Contato dos Projetos</CardTitle>
              <Button variant="outline" size="sm" onClick={downloadContactsCSV} className="bg-green-600 hover:bg-green-700 text-white border-green-600">
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </CardHeader>
            <CardContent>
              {contacts.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Nome</th>
                        <th className="text-left py-3 px-4 font-medium">Email</th>
                        <th className="text-left py-3 px-4 font-medium">Telefone</th>
                        <th className="text-left py-3 px-4 font-medium">Projeto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.map((contact) => (
                        <tr key={contact.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">{contact.nome || "-"}</td>
                          <td className="py-3 px-4">{contact.email || "-"}</td>
                          <td className="py-3 px-4">{contact.telefone || "-"}</td>
                          <td className="py-3 px-4">{contact.projeto}</td>
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

        {/* Featured Projects Section */}
        {activeSection === "featured" && (
          <div className="space-y-6">
            {/* Slots Control Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Controle de Exibição - Porto de Ideias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-2">
                      Quantidade de slots de projetos na página Porto de Ideias. 
                      Projetos reais substituem cards de exemplo automaticamente.
                    </p>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => portoIdeiasSlots > 1 && updatePortoIdeiasSlots(portoIdeiasSlots - 1)}
                        disabled={portoIdeiasSlots <= 1}
                      >
                        <span className="text-lg">−</span>
                      </Button>
                      <div className="w-16 text-center">
                        <span className="text-2xl font-bold">{portoIdeiasSlots}</span>
                        <p className="text-xs text-muted-foreground">slots</p>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updatePortoIdeiasSlots(portoIdeiasSlots + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <p><strong>Projetos aprovados:</strong> {projects.filter(p => p.status === "approved").length}</p>
                    <p><strong>Em destaque:</strong> {featuredProjects.length}</p>
                    <p><strong>Cards de exemplo:</strong> {Math.max(0, portoIdeiasSlots - projects.filter(p => p.status === "approved").length)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Featured Projects List */}
            <Card>
              <CardHeader>
                <CardTitle>Projetos em Destaque na Homepage</CardTitle>
              </CardHeader>
              <CardContent>
                {featuredProjects.length > 0 ? (
                  <div className="space-y-2">
                    {featuredProjects.map((project, index) => (
                      <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                          {project.image_url && (
                            <img 
                              src={project.image_url} 
                              alt={project.title}
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          <div>
                            <h4 className="font-medium">{project.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {project.project_type} • {project.location || "Sem localização"}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFeatured(project.id, true)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-60 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum projeto em destaque. Aprove projetos e marque-os como destaque.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Available Projects to Feature */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Adicionar Projeto em Destaque
                </CardTitle>
              </CardHeader>
              <CardContent>
                {projects.filter(p => p.status === "approved" && !p.featured_on_homepage).length > 0 ? (
                  <div className="space-y-2">
                    {projects
                      .filter(p => p.status === "approved" && !p.featured_on_homepage)
                      .map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors group">
                          <div className="flex items-center gap-4">
                            {project.image_url && (
                              <img 
                                src={project.image_url} 
                                alt={project.title}
                                className="w-12 h-12 rounded object-cover"
                              />
                            )}
                            <div>
                              <h4 className="font-medium">{project.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {project.project_type} • {project.location || "Sem localização"}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleFeatured(project.id, false)}
                            className="opacity-60 group-hover:opacity-100 transition-opacity"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Destacar
                          </Button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum projeto aprovado disponível para destacar.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
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
              </div>

              {selectedProject.status === "pending" && (
                <DialogFooter className="gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => updateProjectStatus(selectedProject.id, "rejected")}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Rejeitar
                  </Button>
                  <Button
                    onClick={() => updateProjectStatus(selectedProject.id, "approved")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Aprovar
                  </Button>
                </DialogFooter>
              )}
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
            <div>
              <Label htmlFor="editImageUrl">URL da Imagem</Label>
              <Input
                id="editImageUrl"
                value={editImageUrl}
                onChange={(e) => setEditImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label htmlFor="editBudget">Orçamento</Label>
              <Input
                id="editBudget"
                value={editBudget}
                onChange={(e) => setEditBudget(e.target.value)}
                placeholder="R$ 100.000,00"
              />
            </div>

            <div>
              <Label htmlFor="editLocation">Localização</Label>
              <Input
                id="editLocation"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                placeholder="São Paulo, SP"
              />
            </div>

            <div>
              <Label htmlFor="editAdminNotes">Notas do Admin</Label>
              <Textarea
                id="editAdminNotes"
                value={editAdminNotes}
                onChange={(e) => setEditAdminNotes(e.target.value)}
                placeholder="Anotações internas..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={saveProjectEdit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
