import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, Home, MapPin, Users, Phone, Mail, Calendar, DollarSign, Shield, FileText, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";
import { ArtisticBackground } from "@/components/ArtisticBackground";
import portobelloLogo from "@/assets/portobello-logo.png";

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
  stage: string | null;
}

interface TeamMember {
  id: string;
  nome: string;
  funcao: string | null;
  email: string | null;
  telefone: string | null;
}

const PendingProjectPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    // Check if admin is logged in
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (!isLoggedIn) {
      navigate("/auth");
      return;
    }

    if (id) {
      fetchProject();
      fetchTeamMembers();
    }
  }, [id, navigate]);

  const fetchProject = async () => {
    if (!id) return;
    
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      toast({
        title: "Erro",
        description: "Projeto não encontrado.",
        variant: "destructive",
      });
      navigate("/admin");
      return;
    }

    setProject(data as Project);
    setLoading(false);
  };

  const fetchTeamMembers = async () => {
    if (!id) return;
    
    const { data } = await supabase
      .from("project_members")
      .select("*")
      .eq("project_id", id);

    if (data) {
      setTeamMembers(data as TeamMember[]);
    }
  };

  const updateProjectStatus = async (status: "approved" | "rejected") => {
    if (!project) return;
    
    setUpdating(true);
    
    const { error } = await supabase
      .from("projects")
      .update({ status })
      .eq("id", project.id);

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
      navigate("/admin");
    }
    
    setUpdating(false);
  };

  const getStageLabel = (stage: string | null): string => {
    switch (stage) {
      case 'development': return 'Desenvolvimento';
      case 'production': return 'Produção';
      case 'distribution': return 'Difusão';
      default: return 'Desenvolvimento';
    }
  };

  const getGeneroLabel = (genero: string | null): string => {
    switch (genero) {
      case 'masculino': return 'Masculino';
      case 'feminino': return 'Feminino';
      case 'outro': return 'Outro';
      case 'prefiro_nao_informar': return 'Prefiro não informar';
      default: return 'Não informado';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando projeto...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Projeto não encontrado.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <ArtisticBackground />

      {/* Custom Navbar for pending project */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <nav className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Painel
            </Button>
            
            <Link to="/" className="flex items-center gap-0 -ml-4">
              <img 
                src={portobelloLogo} 
                alt="Porto Bello Filmes" 
                className="h-16 md:h-20 w-auto"
              />
            </Link>

            <Badge variant="secondary" className="text-sm">
              Visualização de Solicitação
            </Badge>
          </div>
        </nav>
      </header>

      <main className="pt-32 pb-16 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Status Banner */}
          <Card className="mb-6 bg-amber-500/10 border-amber-500/30">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-amber-500 mb-1">Projeto Pendente</h2>
                  <p className="text-sm text-muted-foreground">
                    Este projeto está aguardando aprovação. Analise as informações abaixo e decida.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => updateProjectStatus("approved")}
                    disabled={updating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprovar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => updateProjectStatus("rejected")}
                    disabled={updating}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeitar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Header */}
          <Card className="mb-6">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6">
                {project.image_url ? (
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="w-full md:w-48 h-48 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full md:w-48 h-48 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center">
                    <Film className="w-16 h-16 text-primary/50" />
                  </div>
                )}
                
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-foreground mb-3">{project.title}</h1>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">{project.project_type}</Badge>
                    {project.stage && (
                      <Badge variant="secondary">{getStageLabel(project.stage)}</Badge>
                    )}
                    {project.has_incentive_law && (
                      <Badge className="bg-green-600">
                        <Shield className="w-3 h-3 mr-1" />
                        Lei de Incentivo
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {project.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {project.location}
                      </span>
                    )}
                    {project.valor_sugerido && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        R$ {project.valor_sugerido.toLocaleString('pt-BR')}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(project.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Responsável */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Responsável pelo Projeto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{project.responsavel_nome || "Não informado"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gênero</p>
                  <p className="font-medium">{getGeneroLabel(project.responsavel_genero)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <p>{project.responsavel_email || "Não informado"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <p>{project.responsavel_telefone || "Não informado"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Descrição do Projeto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Sinopse</h4>
                <p className="text-muted-foreground">{project.synopsis}</p>
              </div>
              
              {project.description && (
                <div>
                  <h4 className="font-medium mb-2">Descrição Completa</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{project.description}</p>
                </div>
              )}

              {project.categorias_tags && project.categorias_tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Categorias</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.categorias_tags.map((tag, i) => (
                      <Badge key={i} variant="outline">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Impact */}
          {(project.impacto_cultural || project.impacto_social || project.publico_alvo || project.diferenciais) && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Impacto e Diferenciação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.impacto_cultural && (
                  <div>
                    <h4 className="font-medium mb-1">Impacto Cultural</h4>
                    <p className="text-muted-foreground">{project.impacto_cultural}</p>
                  </div>
                )}
                {project.impacto_social && (
                  <div>
                    <h4 className="font-medium mb-1">Impacto Social</h4>
                    <p className="text-muted-foreground">{project.impacto_social}</p>
                  </div>
                )}
                {project.publico_alvo && (
                  <div>
                    <h4 className="font-medium mb-1">Público-Alvo</h4>
                    <p className="text-muted-foreground">{project.publico_alvo}</p>
                  </div>
                )}
                {project.diferenciais && (
                  <div>
                    <h4 className="font-medium mb-1">Diferenciais</h4>
                    <p className="text-muted-foreground">{project.diferenciais}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Incentive Law Details */}
          {project.has_incentive_law && project.incentive_law_details && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  Lei de Incentivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{project.incentive_law_details}</p>
              </CardContent>
            </Card>
          )}

          {/* Team Members */}
          {teamMembers.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Ficha Técnica / Integrantes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{member.nome}</p>
                          {member.funcao && (
                            <p className="text-sm text-muted-foreground">{member.funcao}</p>
                          )}
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          {member.email && <p>{member.email}</p>}
                          {member.telefone && <p>{member.telefone}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Media */}
          {(project.link_video || project.media_url) && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Mídia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {project.link_video && (
                  <a 
                    href={project.link_video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-2"
                  >
                    <Film className="w-4 h-4" />
                    Link de Vídeo
                  </a>
                )}
                {project.media_url && (
                  <a 
                    href={project.media_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Material de Apoio
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Bottom Action Buttons */}
          <Card className="bg-muted/30">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-muted-foreground">
                  Analise todas as informações acima antes de tomar uma decisão.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => updateProjectStatus("approved")}
                    disabled={updating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprovar Projeto
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => updateProjectStatus("rejected")}
                    disabled={updating}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeitar Projeto
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PendingProjectPage;
