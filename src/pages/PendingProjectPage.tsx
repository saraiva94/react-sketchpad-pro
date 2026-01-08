import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, Home, MapPin, Users, Phone, Mail, Calendar, DollarSign, Shield, FileText, Film, Pencil, Upload, Link as LinkIcon, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Footer } from "@/components/Footer";
import { LazyArtisticBackground } from "@/components/LazyArtisticBackground";
import { getCategoryLabel } from "@/components/admin/CategoriesMultiSelect";
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
  stages: string[] | null;
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
  
  // Media editing states
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [isEditingVideo, setIsEditingVideo] = useState(false);
  const [isEditingPdf, setIsEditingPdf] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const { user, loading: authLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    if (!isAdmin) {
      navigate("/login");
      return;
    }

    if (id) {
      fetchProject();
      fetchTeamMembers();
    }
  }, [authLoading, isAdmin, id, navigate]);

  useEffect(() => {
    if (project) {
      setImageUrl(project.image_url || "");
      setVideoUrl(project.link_video || "");
      setPdfUrl(project.media_url || "");
    }
  }, [project]);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !project) return;

    setUploadingImage(true);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${project.id}-${Date.now()}.${fileExt}`;
    const filePath = `project-images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('project-media')
      .upload(filePath, file);

    if (uploadError) {
      toast({
        title: "Erro",
        description: "Não foi possível fazer upload da imagem.",
        variant: "destructive",
      });
      setUploadingImage(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('project-media')
      .getPublicUrl(filePath);

    const newUrl = urlData.publicUrl;
    
    const { error: updateError } = await supabase
      .from("projects")
      .update({ image_url: newUrl })
      .eq("id", project.id);

    if (updateError) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a imagem.",
        variant: "destructive",
      });
    } else {
      setProject({ ...project, image_url: newUrl });
      setImageUrl(newUrl);
      toast({
        title: "Sucesso",
        description: "Imagem atualizada com sucesso.",
      });
    }
    
    setUploadingImage(false);
    setIsEditingImage(false);
  };

  const handleImageUrlSave = async () => {
    if (!project) return;
    
    setUploadingImage(true);
    
    const { error } = await supabase
      .from("projects")
      .update({ image_url: imageUrl || null })
      .eq("id", project.id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a URL da imagem.",
        variant: "destructive",
      });
    } else {
      setProject({ ...project, image_url: imageUrl || null });
      toast({
        title: "Sucesso",
        description: "URL da imagem atualizada com sucesso.",
      });
    }
    
    setUploadingImage(false);
    setIsEditingImage(false);
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !project) return;

    setUploadingVideo(true);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${project.id}-video-${Date.now()}.${fileExt}`;
    const filePath = `project-videos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('project-media')
      .upload(filePath, file);

    if (uploadError) {
      toast({
        title: "Erro",
        description: "Não foi possível fazer upload do vídeo.",
        variant: "destructive",
      });
      setUploadingVideo(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('project-media')
      .getPublicUrl(filePath);

    const newUrl = urlData.publicUrl;
    
    const { error: updateError } = await supabase
      .from("projects")
      .update({ link_video: newUrl })
      .eq("id", project.id);

    if (updateError) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o vídeo.",
        variant: "destructive",
      });
    } else {
      setProject({ ...project, link_video: newUrl });
      setVideoUrl(newUrl);
      toast({
        title: "Sucesso",
        description: "Vídeo atualizado com sucesso.",
      });
    }
    
    setUploadingVideo(false);
    setIsEditingVideo(false);
  };

  const handleVideoUrlSave = async () => {
    if (!project) return;
    
    setUploadingVideo(true);
    
    const { error } = await supabase
      .from("projects")
      .update({ link_video: videoUrl || null })
      .eq("id", project.id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o link do vídeo.",
        variant: "destructive",
      });
    } else {
      setProject({ ...project, link_video: videoUrl || null });
      toast({
        title: "Sucesso",
        description: "Link do vídeo atualizado com sucesso.",
      });
    }
    
    setUploadingVideo(false);
    setIsEditingVideo(false);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !project) return;

    setUploadingPdf(true);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${project.id}-pdf-${Date.now()}.${fileExt}`;
    const filePath = `project-pdfs/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('project-media')
      .upload(filePath, file);

    if (uploadError) {
      toast({
        title: "Erro",
        description: "Não foi possível fazer upload do PDF.",
        variant: "destructive",
      });
      setUploadingPdf(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from('project-media')
      .getPublicUrl(filePath);

    const newUrl = urlData.publicUrl;
    
    const { error: updateError } = await supabase
      .from("projects")
      .update({ media_url: newUrl })
      .eq("id", project.id);

    if (updateError) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o PDF.",
        variant: "destructive",
      });
    } else {
      setProject({ ...project, media_url: newUrl });
      setPdfUrl(newUrl);
      toast({
        title: "Sucesso",
        description: "PDF atualizado com sucesso.",
      });
    }
    
    setUploadingPdf(false);
    setIsEditingPdf(false);
  };

  const handlePdfUrlSave = async () => {
    if (!project) return;
    
    setUploadingPdf(true);
    
    const { error } = await supabase
      .from("projects")
      .update({ media_url: pdfUrl || null })
      .eq("id", project.id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a URL do PDF.",
        variant: "destructive",
      });
    } else {
      setProject({ ...project, media_url: pdfUrl || null });
      toast({
        title: "Sucesso",
        description: "URL do PDF atualizada com sucesso.",
      });
    }
    
    setUploadingPdf(false);
    setIsEditingPdf(false);
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

  const isVideoUrl = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com');
  };

  const getYoutubeEmbedUrl = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
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
      <LazyArtisticBackground />

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

          {/* Project Header with Editable Image */}
          <Card className="mb-6">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Image Section with Edit */}
                <div className="relative group">
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
                  
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setIsEditingImage(true)}
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                </div>
                
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-foreground mb-3">{project.title}</h1>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">{project.project_type}</Badge>
                    {(project.stages && project.stages.length > 0) && (
                      project.stages.slice(0, 2).map((stg, idx) => (
                        <Badge key={idx} variant="secondary">{getStageLabel(stg)}</Badge>
                      ))
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

          {/* Image Edit Modal */}
          {isEditingImage && (
            <Card className="mb-6 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Editar Imagem do Projeto</span>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingImage(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="url" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="url">
                      <LinkIcon className="w-4 h-4 mr-2" />
                      URL
                    </TabsTrigger>
                    <TabsTrigger value="upload">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="url" className="space-y-4">
                    <div>
                      <Label>URL da Imagem</Label>
                      <Input
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://exemplo.com/imagem.jpg"
                      />
                    </div>
                    {imageUrl && (
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Pré-visualização:</p>
                        <img src={imageUrl} alt="Preview" className="max-h-48 rounded-lg object-cover" />
                      </div>
                    )}
                    <Button onClick={handleImageUrlSave} disabled={uploadingImage}>
                      <Save className="w-4 h-4 mr-2" />
                      {uploadingImage ? "Salvando..." : "Salvar URL"}
                    </Button>
                  </TabsContent>
                  <TabsContent value="upload" className="space-y-4">
                    <div>
                      <Label>Upload de Imagem</Label>
                      <Input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Formatos aceitos: JPG, PNG, GIF, WebP
                      </p>
                    </div>
                    {uploadingImage && (
                      <p className="text-sm text-muted-foreground animate-pulse">
                        Fazendo upload...
                      </p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

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
                      <Badge key={i} variant="outline">{getCategoryLabel(tag)}</Badge>
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

          {/* Media Section with Editable Video and PDF */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Film className="w-5 h-5" />
                  Mídia
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingVideo(true)}
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    Editar Vídeo
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditingPdf(true)}
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    Editar PDF
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Video Preview */}
              {project.link_video && (
                <div className="space-y-2">
                  <h4 className="font-medium">Vídeo do Projeto</h4>
                  {isVideoUrl(project.link_video) ? (
                    <div className="aspect-video rounded-lg overflow-hidden bg-black">
                      {getYoutubeEmbedUrl(project.link_video) ? (
                        <iframe
                          src={getYoutubeEmbedUrl(project.link_video)!}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={project.link_video}
                          controls
                          className="w-full h-full"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="aspect-video rounded-lg overflow-hidden bg-black">
                      <video
                        src={project.link_video}
                        controls
                        className="w-full h-full"
                      />
                    </div>
                  )}
                  <a 
                    href={project.link_video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <LinkIcon className="w-3 h-3" />
                    {project.link_video}
                  </a>
                </div>
              )}
              
              {!project.link_video && (
                <p className="text-muted-foreground text-sm">Nenhum vídeo anexado ao projeto.</p>
              )}
              
              {/* PDF Preview */}
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Apresentação em PDF</h4>
                {project.media_url ? (
                  <a 
                    href={project.media_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Baixar Apresentação PDF
                  </a>
                ) : (
                  <p className="text-muted-foreground text-sm">Nenhum PDF anexado ao projeto.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* PDF Edit Modal */}
          {isEditingPdf && (
            <Card className="mb-6 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Editar PDF do Projeto</span>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingPdf(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </TabsTrigger>
                    <TabsTrigger value="url">
                      <LinkIcon className="w-4 h-4 mr-2" />
                      URL
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="space-y-4">
                    <div>
                      <Label>Upload de PDF</Label>
                      <Input
                        ref={pdfInputRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handlePdfUpload}
                        disabled={uploadingPdf}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Formato aceito: PDF
                      </p>
                    </div>
                    {uploadingPdf && (
                      <p className="text-sm text-muted-foreground animate-pulse">
                        Fazendo upload...
                      </p>
                    )}
                    {project.media_url && (
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">PDF atual:</p>
                        <a 
                          href={project.media_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-2"
                        >
                          <FileText className="w-4 h-4" />
                          Ver PDF atual
                        </a>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="url" className="space-y-4">
                    <div>
                      <Label>URL do PDF</Label>
                      <Input
                        value={pdfUrl}
                        onChange={(e) => setPdfUrl(e.target.value)}
                        placeholder="https://exemplo.com/apresentacao.pdf"
                      />
                    </div>
                    <Button onClick={handlePdfUrlSave} disabled={uploadingPdf}>
                      <Save className="w-4 h-4 mr-2" />
                      {uploadingPdf ? "Salvando..." : "Salvar URL"}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Video Edit Modal */}
          {isEditingVideo && (
            <Card className="mb-6 border-primary">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Editar Vídeo do Projeto</span>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingVideo(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="url" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="url">
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Link (YouTube, Vimeo)
                    </TabsTrigger>
                    <TabsTrigger value="upload">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="url" className="space-y-4">
                    <div>
                      <Label>URL do Vídeo</Label>
                      <Input
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Suporta links do YouTube, Vimeo ou URL direta de vídeo
                      </p>
                    </div>
                    {videoUrl && getYoutubeEmbedUrl(videoUrl) && (
                      <div className="p-4 border rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">Pré-visualização:</p>
                        <div className="aspect-video rounded-lg overflow-hidden bg-black">
                          <iframe
                            src={getYoutubeEmbedUrl(videoUrl)!}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )}
                    <Button onClick={handleVideoUrlSave} disabled={uploadingVideo}>
                      <Save className="w-4 h-4 mr-2" />
                      {uploadingVideo ? "Salvando..." : "Salvar Link"}
                    </Button>
                  </TabsContent>
                  <TabsContent value="upload" className="space-y-4">
                    <div>
                      <Label>Upload de Vídeo</Label>
                      <Input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        disabled={uploadingVideo}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Formatos aceitos: MP4, MOV, AVI, WebM (máximo recomendado: 100MB)
                      </p>
                    </div>
                    {uploadingVideo && (
                      <p className="text-sm text-muted-foreground animate-pulse">
                        Fazendo upload... (isso pode demorar para arquivos grandes)
                      </p>
                    )}
                  </TabsContent>
                </Tabs>
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
