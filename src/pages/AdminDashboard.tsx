import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Edit,
  Trash2,
  LogOut,
  ExternalLink
} from "lucide-react";

interface Profile {
  full_name: string | null;
  email: string | null;
}

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
  profile?: Profile;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, loading, signOut } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");

  // Edit form state
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editBudget, setEditBudget] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editAdminNotes, setEditAdminNotes] = useState("");

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/");
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (user && isAdmin) {
      fetchProjects();
    }
  }, [user, isAdmin]);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Fetch profiles for each project
      const projectsWithProfiles = await Promise.all(
        data.map(async (project) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("user_id", project.user_id)
            .maybeSingle();
          
          return {
            ...project,
            profile: profileData || undefined,
          } as Project;
        })
      );
      setProjects(projectsWithProfiles);
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
          ? "O projeto está agora visível na página inicial." 
          : "O projeto foi marcado como não aprovado.",
      });
      fetchProjects();
      setShowDetails(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-handwritten font-bold text-primary">
            Porto de Ideias
          </Link>
          
          <nav className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-handwritten font-bold text-foreground">Painel Administrativo</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os projetos submetidos à plataforma.
          </p>
        </div>

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
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {project.synopsis}
                          </p>
                          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                            <Badge variant="outline">{project.project_type}</Badge>
                            <span>
                              Por: {project.profile?.full_name || project.profile?.email || "Usuário"}
                            </span>
                            <span>
                              {new Date(project.created_at).toLocaleDateString("pt-BR")}
                            </span>
                            {project.has_incentive_law && (
                              <Badge className="bg-accent/10 text-accent border-accent/20">
                                Lei de Incentivo
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
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

                {selectedProject.media_url && (
                  <div>
                    <h4 className="font-semibold mb-1">Material de Apoio</h4>
                    <a 
                      href={selectedProject.media_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-accent hover:underline flex items-center gap-1"
                    >
                      {selectedProject.media_url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {selectedProject.has_incentive_law && (
                  <div>
                    <h4 className="font-semibold mb-1">Lei de Incentivo</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedProject.incentive_law_details || "Sim, possui lei de incentivo aprovada."}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-1">Enviado por</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedProject.profile?.full_name || "Nome não informado"} 
                    {selectedProject.profile?.email && ` (${selectedProject.profile.email})`}
                  </p>
                </div>
              </div>

              {selectedProject.status === "pending" && (
                <DialogFooter className="gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => updateProjectStatus(selectedProject.id, "rejected")}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeitar
                  </Button>
                  <Button
                    onClick={() => updateProjectStatus(selectedProject.id, "approved")}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Projeto</DialogTitle>
            <DialogDescription>
              Adicione informações extras ao projeto para exibição na plataforma.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="editImageUrl">URL da Imagem de Capa</Label>
              <Input
                id="editImageUrl"
                placeholder="https://..."
                value={editImageUrl}
                onChange={(e) => setEditImageUrl(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editBudget">Orçamento / Valor</Label>
              <Input
                id="editBudget"
                placeholder="R$ 100.000,00"
                value={editBudget}
                onChange={(e) => setEditBudget(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editLocation">Localização</Label>
              <Input
                id="editLocation"
                placeholder="São Paulo, SP"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editAdminNotes">Notas do Admin (internas)</Label>
              <Textarea
                id="editAdminNotes"
                placeholder="Observações internas..."
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
