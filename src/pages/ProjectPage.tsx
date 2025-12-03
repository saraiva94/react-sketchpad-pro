import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  ArrowLeft, 
  MapPin, 
  DollarSign, 
  ExternalLink,
  User,
  Calendar,
  Sparkles,
  LogOut,
  Settings
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
  profiles?: {
    full_name: string | null;
  };
}

const ProjectPage = () => {
  const { id } = useParams();
  const { user, isAdmin, signOut } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .eq("status", "approved")
      .maybeSingle();

    if (!error && data) {
      // Fetch profile separately
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", data.user_id)
        .maybeSingle();
      
      setProject({
        ...data,
        profiles: profileData || undefined,
      } as Project);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 h-16 flex items-center">
            <Link to="/" className="text-xl font-bold text-foreground">
              Porto de Ideias
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-16 text-center">
          <Sparkles className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Projeto não encontrado</h1>
          <p className="text-muted-foreground mb-6">
            Este projeto pode não existir ou não estar aprovado ainda.
          </p>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Início
            </Button>
          </Link>
        </main>
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
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Meus Projetos
                  </Button>
                </Link>
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
              </>
            ) : (
              <>
                <Link to="/auth">
                  <Button variant="ghost" size="sm">Entrar</Button>
                </Link>
                <Link to="/auth">
                  <Button size="sm">Cadastrar</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Image */}
      <div className="relative h-64 md:h-96 overflow-hidden bg-muted">
        {project.image_url ? (
          <img
            src={project.image_url}
            alt={project.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <Sparkles className="w-24 h-24 text-muted-foreground/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto -mt-24 relative z-10">
          <Card className="shadow-lg">
            <CardContent className="p-8">
              {/* Header */}
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge>{project.project_type}</Badge>
                  {project.has_incentive_law && (
                    <Badge className="bg-accent/10 text-accent border-accent/20">
                      Lei de Incentivo
                    </Badge>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {project.title}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {project.synopsis}
                </p>
              </div>

              {/* Meta Info */}
              <div className="grid md:grid-cols-3 gap-4 mb-8 p-4 bg-muted/50 rounded-lg">
                {project.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Localização</p>
                      <p className="font-medium">{project.location}</p>
                    </div>
                  </div>
                )}
                {project.budget && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Orçamento</p>
                      <p className="font-medium">{project.budget}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Publicado em</p>
                    <p className="font-medium">
                      {new Date(project.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {project.description && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Sobre o Projeto</h2>
                  <div className="prose prose-neutral max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {project.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Incentive Law */}
              {project.has_incentive_law && project.incentive_law_details && (
                <div className="mb-8 p-4 bg-accent/5 border border-accent/20 rounded-lg">
                  <h3 className="font-semibold mb-2 text-accent">Lei de Incentivo</h3>
                  <p className="text-sm text-muted-foreground">
                    {project.incentive_law_details}
                  </p>
                </div>
              )}

              {/* Media Link */}
              {project.media_url && (
                <div className="mb-8">
                  <h3 className="font-semibold mb-2">Material de Apoio</h3>
                  <a
                    href={project.media_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-accent hover:underline"
                  >
                    Acessar material
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}

              {/* Creator */}
              {project.profiles?.full_name && (
                <div className="pt-6 border-t">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Criado por</p>
                      <p className="font-medium">{project.profiles.full_name}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="mt-8 pt-6 border-t flex flex-wrap gap-4">
                <Link to="/">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                  </Button>
                </Link>
                <Button>
                  Entrar em Contato
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProjectPage;
