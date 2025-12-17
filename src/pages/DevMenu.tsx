import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import ContrapartidasEditor from "@/components/admin/ContrapartidasEditor";
import { useNavigate } from "react-router-dom";
import { Trash2, Eye, Edit, Check, X, Home } from "lucide-react";

interface Contrapartida {
  id: string;
  titulo?: string;
  valor: string;
  beneficios: string[];
  ativo: boolean;
  ordem: number;
  indice?: string;
}

interface TestProject {
  id: string;
  title: string;
  synopsis: string;
  project_type: string;
  status: string;
  contrapartidas?: Contrapartida[];
}

const DevMenu = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<TestProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "Projeto Teste Contrapartidas",
    synopsis: "Sinopse do projeto de teste para validar contrapartidas",
    project_type: "Documentário"
  });
  const [contrapartidas, setContrapartidas] = useState<Contrapartida[]>([]);
  const [editingProject, setEditingProject] = useState<TestProject | null>(null);
  const [editContrapartidas, setEditContrapartidas] = useState<Contrapartida[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("id, title, synopsis, project_type, status")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      toast.error("Erro ao carregar projetos");
      return;
    }

    const projectsWithContrapartidas = await Promise.all(
      (data || []).map(async (project) => {
        const { data: contras } = await supabase
          .from("contrapartidas")
          .select("*")
          .eq("project_id", project.id)
          .order("ordem", { ascending: true });
        return { ...project, contrapartidas: contras || [] };
      })
    );

    setProjects(projectsWithContrapartidas);
  };

  const createTestProject = async () => {
    setLoading(true);
    try {
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          title: newProject.title,
          synopsis: newProject.synopsis,
          project_type: newProject.project_type,
          status: "pending"
        })
        .select()
        .single();

      if (projectError) throw projectError;

      if (contrapartidas.length > 0) {
        const contrapartidasToInsert = contrapartidas.map((c, index) => ({
          project_id: project.id,
          valor: c.valor,
          beneficios: c.beneficios,
          ativo: c.ativo,
          ordem: index
        }));

        const { error: contrasError } = await supabase
          .from("contrapartidas")
          .insert(contrapartidasToInsert);

        if (contrasError) throw contrasError;
      }

      toast.success("Projeto de teste criado!");
      setContrapartidas([]);
      fetchProjects();
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const approveProject = async (projectId: string) => {
    const { error } = await supabase
      .from("projects")
      .update({ status: "approved" })
      .eq("id", projectId);

    if (error) {
      toast.error("Erro ao aprovar");
      return;
    }
    toast.success("Projeto aprovado!");
    fetchProjects();
  };

  const rejectProject = async (projectId: string) => {
    const { error } = await supabase
      .from("projects")
      .update({ status: "rejected" })
      .eq("id", projectId);

    if (error) {
      toast.error("Erro ao rejeitar");
      return;
    }
    toast.success("Projeto rejeitado!");
    fetchProjects();
  };

  const deleteProject = async (projectId: string) => {
    await supabase.from("contrapartidas").delete().eq("project_id", projectId);
    const { error } = await supabase.from("projects").delete().eq("id", projectId);

    if (error) {
      toast.error("Erro ao deletar");
      return;
    }
    toast.success("Projeto deletado!");
    fetchProjects();
  };

  const startEditing = (project: TestProject) => {
    setEditingProject(project);
    setEditContrapartidas(project.contrapartidas || []);
  };

  const saveEditing = async () => {
    if (!editingProject) return;

    try {
      await supabase.from("contrapartidas").delete().eq("project_id", editingProject.id);

      if (editContrapartidas.length > 0) {
        const contrapartidasToInsert = editContrapartidas.map((c, index) => ({
          project_id: editingProject.id,
          titulo: c.titulo || null,
          valor: c.valor,
          beneficios: c.beneficios,
          ativo: c.ativo,
          ordem: index,
          indice: c.indice || null,
        }));

        const { error } = await supabase.from("contrapartidas").insert(contrapartidasToInsert);
        if (error) throw error;
      }

      toast.success("Contrapartidas atualizadas!");
      setEditingProject(null);
      fetchProjects();
    } catch (error: any) {
      toast.error("Erro: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">🧪 Teste de Contrapartidas</h1>
          <Button variant="outline" onClick={() => navigate("/")}>
            <Home className="w-4 h-4 mr-2" /> Início
          </Button>
        </div>

        {/* Create */}
        <Card>
          <CardHeader>
            <CardTitle>1. Criar Projeto de Teste</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Título</Label>
                <Input
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Tipo</Label>
                <Input
                  value={newProject.project_type}
                  onChange={(e) => setNewProject({ ...newProject, project_type: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Sinopse</Label>
              <Textarea
                value={newProject.synopsis}
                onChange={(e) => setNewProject({ ...newProject, synopsis: e.target.value })}
              />
            </div>

            <ContrapartidasEditor contrapartidas={contrapartidas} onChange={setContrapartidas} />

            <Button onClick={createTestProject} disabled={loading}>
              {loading ? "Criando..." : "Criar Projeto"}
            </Button>
          </CardContent>
        </Card>

        {/* List */}
        <Card>
          <CardHeader>
            <CardTitle>2. Projetos (Últimos 10)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="font-semibold">{project.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {project.project_type} | 
                      <span className={`ml-1 font-medium ${
                        project.status === "approved" ? "text-green-500" :
                        project.status === "rejected" ? "text-red-500" : "text-yellow-500"
                      }`}>
                        {project.status}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {project.status === "pending" && (
                      <>
                        <Button size="sm" variant="outline" onClick={() => approveProject(project.id)}>
                          <Check className="w-4 h-4 mr-1" /> Aprovar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => rejectProject(project.id)}>
                          <X className="w-4 h-4 mr-1" /> Rejeitar
                        </Button>
                      </>
                    )}
                    {project.status === "approved" && (
                      <Button size="sm" variant="outline" onClick={() => navigate(`/project/${project.id}`)}>
                        <Eye className="w-4 h-4 mr-1" /> Ver Página
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => startEditing(project)}>
                      <Edit className="w-4 h-4 mr-1" /> Editar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteProject(project.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {project.contrapartidas && project.contrapartidas.length > 0 && (
                  <div className="mt-2 pl-4 border-l-2 border-primary/20">
                    <p className="text-sm font-medium mb-2">
                      Contrapartidas ({project.contrapartidas.length}):
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {project.contrapartidas.map((c) => (
                        <div key={c.id} className={`text-xs p-2 rounded ${c.ativo ? "bg-green-100 dark:bg-green-900/20" : "bg-muted"}`}>
                          <span className="font-semibold">{c.valor}</span>
                          <span className="ml-2 text-muted-foreground">({c.beneficios.length} benefícios)</span>
                          {!c.ativo && <span className="ml-1 text-red-500">(inativo)</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {projects.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhum projeto. Crie um acima.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Edit */}
        {editingProject && (
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle>Editando: {editingProject.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ContrapartidasEditor contrapartidas={editContrapartidas} onChange={setEditContrapartidas} />
              <div className="flex gap-2">
                <Button onClick={saveEditing}>Salvar</Button>
                <Button variant="outline" onClick={() => setEditingProject(null)}>Cancelar</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DevMenu;
