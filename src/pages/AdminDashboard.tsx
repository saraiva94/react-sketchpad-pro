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
  BarChart3
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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [activeSection, setActiveSection] = useState<"projects" | "contacts" | "featured">("projects");
  const [statsVisible, setStatsVisible] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(true);

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
      fetchStatsVisibility();
    }
  }, [navigate]);

  const fetchStatsVisibility = async () => {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "stats_visible")
      .single();
    
    if (data) {
      setStatsVisible((data.value as { enabled: boolean }).enabled);
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
            Gerencie os projetos submetidos à plataforma.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Link to="/admin/add-project">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Projeto
            </Button>
          </Link>
          <Button 
            variant={activeSection === "contacts" ? "default" : "outline"}
            onClick={() => setActiveSection(activeSection === "contacts" ? "projects" : "contacts")}
          >
            <Users className="w-4 h-4 mr-2" />
            Cadastros
          </Button>
          <Button 
            variant={activeSection === "featured" ? "default" : "outline"}
            onClick={() => setActiveSection(activeSection === "featured" ? "projects" : "featured")}
          >
            <Home className="w-4 h-4 mr-2" />
            Destaques Homepage
          </Button>
          
          {/* Stats Visibility Toggle */}
          <div className="flex items-center gap-3 ml-auto px-4 py-2 rounded-lg border border-border bg-card">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Estatísticas</span>
            <Switch 
              checked={statsVisible} 
              onCheckedChange={toggleStatsVisibility}
              disabled={loadingSettings}
            />
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statsVisible ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
              {statsVisible ? "Público" : "Privado"}
            </span>
          </div>
        </div>

        {/* Contacts Section */}
        {activeSection === "contacts" && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Cadastros - Dados de Contato</CardTitle>
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
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Projetos em Destaque na Homepage</CardTitle>
            </CardHeader>
            <CardContent>
              {featuredProjects.length > 0 ? (
                <div className="space-y-4">
                  {featuredProjects.map((project, index) => (
                    <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground w-8">{index + 1}.</span>
                        <div>
                          <h4 className="font-medium">{project.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Adicionado em {new Date(project.created_at).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFeatured(project.id, true)}
                      >
                        <StarOff className="w-4 h-4 mr-1" />
                        Remover
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
              <TabsList className="mb-6">
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
                                  size="sm"
                                  onClick={() => toggleFeatured(project.id, project.featured_on_homepage)}
                                >
                                  {project.featured_on_homepage ? (
                                    <>
                                      <StarOff className="w-4 h-4 mr-1" />
                                      Remover Destaque
                                    </>
                                  ) : (
                                    <>
                                      <Star className="w-4 h-4 mr-1" />
                                      Destacar
                                    </>
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