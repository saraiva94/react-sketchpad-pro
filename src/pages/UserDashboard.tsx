import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Clock, CheckCircle, XCircle, Sparkles, Settings, LogOut } from "lucide-react";

interface Project {
  id: string;
  title: string;
  synopsis: string;
  project_type: string;
  status: string;
  created_at: string;
}

const projectTypes = [
  "Artes Visuais",
  "Audiovisual",
  "Circo",
  "Dança",
  "Literatura",
  "Música",
  "Patrimônio Cultural",
  "Teatro",
  "Outros",
];

const UserDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAdmin, loading, signOut } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [projectType, setProjectType] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [description, setDescription] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [hasIncentiveLaw, setHasIncentiveLaw] = useState(false);
  const [incentiveLawDetails, setIncentiveLawDetails] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserProjects();
    }
  }, [user]);

  const fetchUserProjects = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("projects")
      .select("id, title, synopsis, project_type, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProjects(data);
    }
    setLoadingProjects(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    if (!title || !projectType || !synopsis) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("projects").insert({
      user_id: user.id,
      title,
      project_type: projectType,
      synopsis,
      description,
      media_url: mediaUrl || null,
      has_incentive_law: hasIncentiveLaw,
      incentive_law_details: hasIncentiveLaw ? incentiveLawDetails : null,
      status: "pending",
    });

    if (error) {
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar seu projeto. Tente novamente.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Projeto enviado!",
        description: "Seu projeto foi enviado para análise. Você será notificado quando for aprovado.",
      });
      clearForm();
      setShowForm(false);
      fetchUserProjects();
    }

    setSubmitting(false);
  };

  const clearForm = () => {
    setTitle("");
    setProjectType("");
    setSynopsis("");
    setDescription("");
    setMediaUrl("");
    setHasIncentiveLaw(false);
    setIncentiveLawDetails("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="w-3 h-3" />
            Em Análise
          </Badge>
        );
      case "approved":
        return (
          <Badge className="gap-1 bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle className="w-3 h-3" />
            Aprovado
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="w-3 h-3" />
            Não Aprovado
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

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
          <Link to="/" className="text-xl font-bold text-foreground">
            Porto de Ideias
          </Link>
          
          <nav className="flex items-center gap-4">
            {isAdmin && (
              <Link to="/admin">
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meus Projetos</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seus projetos culturais e acompanhe o status de aprovação.
            </p>
          </div>
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Projeto
          </Button>
        </div>

        {/* Projects List */}
        {loadingProjects ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-1/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : projects.length > 0 ? (
          <div className="grid gap-4">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {project.title}
                        </h3>
                        {getStatusBadge(project.status)}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {project.synopsis}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <Badge variant="outline">{project.project_type}</Badge>
                        <span>
                          Enviado em {new Date(project.created_at).toLocaleDateString("pt-BR")}
                        </span>
                      </div>
                    </div>
                    {project.status === "approved" && (
                      <Link to={`/project/${project.id}`}>
                        <Button variant="outline" size="sm">
                          Ver Página
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-16">
            <CardContent>
              <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum projeto ainda</h3>
              <p className="text-muted-foreground mb-6">
                Envie seu primeiro projeto cultural para análise!
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Projeto
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Submit Project Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enviar Projeto para Análise</DialogTitle>
            <DialogDescription>
              Preencha as informações do seu projeto cultural. Após o envio, nossa equipe irá analisar e você será notificado sobre a aprovação.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Nome do Projeto *</Label>
              <Input
                id="title"
                placeholder="Digite o nome do projeto"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo do Projeto *</Label>
              <Select value={projectType} onValueChange={setProjectType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="synopsis">Sinopse *</Label>
              <Textarea
                id="synopsis"
                placeholder="Descreva brevemente seu projeto"
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição Completa</Label>
              <Textarea
                id="description"
                placeholder="Conte mais sobre o projeto, objetivos, impacto esperado..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mediaUrl">Link de Vídeo ou PDF</Label>
              <Input
                id="mediaUrl"
                type="url"
                placeholder="https://..."
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="incentive"
                  checked={hasIncentiveLaw}
                  onCheckedChange={(checked) => setHasIncentiveLaw(checked === true)}
                />
                <Label htmlFor="incentive" className="cursor-pointer">
                  Possui lei de incentivo aprovada?
                </Label>
              </div>

              {hasIncentiveLaw && (
                <div className="space-y-2 pl-6">
                  <Label htmlFor="incentiveDetails">Detalhes da Lei de Incentivo</Label>
                  <Textarea
                    id="incentiveDetails"
                    placeholder="Informe a lei, número do processo, valor captado/a captar..."
                    value={incentiveLawDetails}
                    onChange={(e) => setIncentiveLawDetails(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  clearForm();
                  setShowForm(false);
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? "Enviando..." : "Enviar Projeto"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDashboard;
