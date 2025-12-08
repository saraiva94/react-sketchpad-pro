import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send, CheckCircle2, ArrowLeft, Plus, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Footer, SocialLinksDisplay } from "@/components/Footer";

interface TeamMember {
  nome: string;
  funcao: string;
  email: string;
  telefone: string;
}

const SubmitProjectPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Responsável
  const [responsavelNome, setResponsavelNome] = useState("");
  const [responsavelEmail, setResponsavelEmail] = useState("");
  const [responsavelTelefone, setResponsavelTelefone] = useState("");
  
  // Projeto básico
  const [titulo, setTitulo] = useState("");
  const [categoriasTags, setCategoriasTags] = useState("");
  const [descricao, setDescricao] = useState("");
  
  // Mídia
  const [linkVideo, setLinkVideo] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  
  // Integrantes
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  
  // Financiamento
  const [valorSugerido, setValorSugerido] = useState("");
  const [linkPagamento, setLinkPagamento] = useState("");
  
  // Impacto
  const [impactoCultural, setImpactoCultural] = useState("");
  const [impactoSocial, setImpactoSocial] = useState("");
  const [publicoAlvo, setPublicoAlvo] = useState("");
  const [diferenciais, setDiferenciais] = useState("");
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!responsavelNome.trim()) newErrors.responsavelNome = "Nome é obrigatório";
    if (!responsavelEmail.trim()) {
      newErrors.responsavelEmail = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(responsavelEmail)) {
      newErrors.responsavelEmail = "Email inválido";
    }
    if (!responsavelTelefone.trim()) newErrors.responsavelTelefone = "Telefone é obrigatório";
    if (!titulo.trim()) newErrors.titulo = "Título é obrigatório";
    if (!descricao.trim()) newErrors.descricao = "Descrição é obrigatória";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from("project-media")
      .upload(path, file);
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from("project-media")
      .getPublicUrl(path);
    
    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      let mediaUrl = linkVideo;
      
      // Upload video if provided
      if (videoFile) {
        const timestamp = Date.now();
        const path = `videos/${timestamp}_${videoFile.name}`;
        mediaUrl = await uploadFile(videoFile, path);
      }

      // Parse tags
      const tags = categoriasTags.split(",").map(t => t.trim()).filter(t => t);

      // Insert project
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          title: titulo,
          synopsis: descricao.substring(0, 300),
          description: descricao,
          project_type: tags[0] || "Cultura",
          responsavel_nome: responsavelNome,
          responsavel_email: responsavelEmail,
          responsavel_telefone: responsavelTelefone,
          categorias_tags: tags,
          link_video: linkVideo,
          media_url: mediaUrl,
          valor_sugerido: valorSugerido ? parseFloat(valorSugerido) : null,
          link_pagamento: linkPagamento || null,
          impacto_cultural: impactoCultural || null,
          impacto_social: impactoSocial || null,
          publico_alvo: publicoAlvo || null,
          diferenciais: diferenciais || null,
          status: "pending",
        })
        .select()
        .single();

      if (projectError) throw projectError;

      // Insert team members
      if (teamMembers.length > 0 && project) {
        const membersData = teamMembers.map(member => ({
          project_id: project.id,
          nome: member.nome,
          funcao: member.funcao,
          email: member.email,
          telefone: member.telefone,
        }));

        await supabase.from("project_members").insert(membersData);
      }

      setShowSuccessModal(true);
      clearForm();
    } catch (error) {
      console.error("Error submitting project:", error);
      toast({
        title: "Erro ao enviar projeto",
        description: "Ocorreu um erro ao enviar seu projeto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const clearForm = () => {
    setResponsavelNome("");
    setResponsavelEmail("");
    setResponsavelTelefone("");
    setTitulo("");
    setCategoriasTags("");
    setDescricao("");
    setLinkVideo("");
    setVideoFile(null);
    setDocumentFiles([]);
    setTeamMembers([]);
    setValorSugerido("");
    setLinkPagamento("");
    setImpactoCultural("");
    setImpactoSocial("");
    setPublicoAlvo("");
    setDiferenciais("");
    setErrors({});
  };

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { nome: "", funcao: "", email: "", telefone: "" }]);
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...teamMembers];
    updated[index][field] = value;
    setTeamMembers(updated);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar removed for cleaner responsiveness */}

      <div className="py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <button 
            onClick={() => navigate(-1)} 
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </button>

          <Card className="shadow-lg">
            <CardHeader className="text-center space-y-4">
              <CardTitle className="text-3xl font-bold text-foreground">
                Cadastrar Projeto Cultural
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Preencha o formulário abaixo para submeter seu projeto para análise
              </CardDescription>
              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-3">Siga-nos nas redes sociais</p>
                <SocialLinksDisplay />
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Responsável */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                    Informações do Responsável
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="responsavelNome">Nome Completo *</Label>
                      <Input
                        id="responsavelNome"
                        value={responsavelNome}
                        onChange={(e) => setResponsavelNome(e.target.value)}
                        placeholder="Nome do responsável"
                        className={errors.responsavelNome ? "border-destructive" : ""}
                      />
                      {errors.responsavelNome && (
                        <p className="text-sm text-destructive mt-1">{errors.responsavelNome}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="responsavelTelefone">Telefone *</Label>
                      <Input
                        id="responsavelTelefone"
                        value={responsavelTelefone}
                        onChange={(e) => setResponsavelTelefone(e.target.value)}
                        placeholder="(00) 00000-0000"
                        className={errors.responsavelTelefone ? "border-destructive" : ""}
                      />
                      {errors.responsavelTelefone && (
                        <p className="text-sm text-destructive mt-1">{errors.responsavelTelefone}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="responsavelEmail">Email *</Label>
                    <Input
                      id="responsavelEmail"
                      type="email"
                      value={responsavelEmail}
                      onChange={(e) => setResponsavelEmail(e.target.value)}
                      placeholder="email@exemplo.com"
                      className={errors.responsavelEmail ? "border-destructive" : ""}
                    />
                    {errors.responsavelEmail && (
                      <p className="text-sm text-destructive mt-1">{errors.responsavelEmail}</p>
                    )}
                  </div>
                </div>

                {/* Projeto Básico */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                    Informações do Projeto
                  </h3>
                  
                  <div>
                    <Label htmlFor="titulo">Título do Projeto *</Label>
                    <Input
                      id="titulo"
                      value={titulo}
                      onChange={(e) => setTitulo(e.target.value)}
                      placeholder="Nome do seu projeto"
                      className={errors.titulo ? "border-destructive" : ""}
                    />
                    {errors.titulo && (
                      <p className="text-sm text-destructive mt-1">{errors.titulo}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="categoriasTags">Categorias/Tags</Label>
                    <Input
                      id="categoriasTags"
                      value={categoriasTags}
                      onChange={(e) => setCategoriasTags(e.target.value)}
                      placeholder="Cinema, Teatro, Música (separados por vírgula)"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Separe as categorias por vírgula
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="descricao">Descrição Completa *</Label>
                    <Textarea
                      id="descricao"
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      placeholder="Descreva seu projeto em detalhes..."
                      rows={6}
                      className={errors.descricao ? "border-destructive" : ""}
                    />
                    {errors.descricao && (
                      <p className="text-sm text-destructive mt-1">{errors.descricao}</p>
                    )}
                  </div>
                </div>

                {/* Mídia */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                    Mídia
                  </h3>
                  
                  <div>
                    <Label htmlFor="linkVideo">Link de Vídeo (YouTube, Vimeo)</Label>
                    <Input
                      id="linkVideo"
                      type="url"
                      value={linkVideo}
                      onChange={(e) => setLinkVideo(e.target.value)}
                      placeholder="https://youtube.com/..."
                    />
                  </div>

                  <div>
                    <Label>Upload de Vídeo (MP4, WAV)</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept=".mp4,.wav,.mov,.avi"
                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                        className="hidden"
                        id="videoUpload"
                      />
                      <label htmlFor="videoUpload" className="cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {videoFile ? videoFile.name : "Clique para fazer upload de vídeo"}
                        </p>
                      </label>
                    </div>
                  </div>

                  <div>
                    <Label>Documentos (PDF)</Label>
                    <div className="border-2 border-dashed rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept=".pdf"
                        multiple
                        onChange={(e) => setDocumentFiles(Array.from(e.target.files || []))}
                        className="hidden"
                        id="documentUpload"
                      />
                      <label htmlFor="documentUpload" className="cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {documentFiles.length > 0 
                            ? `${documentFiles.length} arquivo(s) selecionado(s)` 
                            : "Clique para fazer upload de documentos"}
                        </p>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Integrantes */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      Ficha Técnica / Integrantes
                    </h3>
                    <Button type="button" variant="outline" size="sm" onClick={addTeamMember}>
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>

                  {teamMembers.map((member, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-sm font-medium">Integrante {index + 1}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeTeamMember(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Nome</Label>
                          <Input
                            value={member.nome}
                            onChange={(e) => updateTeamMember(index, "nome", e.target.value)}
                            placeholder="Nome do integrante"
                          />
                        </div>
                        <div>
                          <Label>Função</Label>
                          <Input
                            value={member.funcao}
                            onChange={(e) => updateTeamMember(index, "funcao", e.target.value)}
                            placeholder="Diretor, Produtor, etc."
                          />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={member.email}
                            onChange={(e) => updateTeamMember(index, "email", e.target.value)}
                            placeholder="email@exemplo.com"
                          />
                        </div>
                        <div>
                          <Label>Telefone</Label>
                          <Input
                            value={member.telefone}
                            onChange={(e) => updateTeamMember(index, "telefone", e.target.value)}
                            placeholder="(00) 00000-0000"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}

                  {teamMembers.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhum integrante adicionado. Clique em "Adicionar" para incluir membros da equipe.
                    </p>
                  )}
                </div>

                {/* Financiamento */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                    Financiamento
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="valorSugerido">Valor Sugerido de Apoio (R$)</Label>
                      <Input
                        id="valorSugerido"
                        type="number"
                        value={valorSugerido}
                        onChange={(e) => setValorSugerido(e.target.value)}
                        placeholder="100.00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="linkPagamento">Link de Pagamento/Doação</Label>
                      <Input
                        id="linkPagamento"
                        type="url"
                        value={linkPagamento}
                        onChange={(e) => setLinkPagamento(e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>

                {/* Impacto */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                    Impacto do Projeto
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="impactoCultural">Impacto Cultural</Label>
                      <Textarea
                        id="impactoCultural"
                        value={impactoCultural}
                        onChange={(e) => setImpactoCultural(e.target.value)}
                        placeholder="Descreva o impacto cultural esperado..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="impactoSocial">Impacto Social</Label>
                      <Textarea
                        id="impactoSocial"
                        value={impactoSocial}
                        onChange={(e) => setImpactoSocial(e.target.value)}
                        placeholder="Descreva o impacto social esperado..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="publicoAlvo">Público-Alvo</Label>
                    <Textarea
                      id="publicoAlvo"
                      value={publicoAlvo}
                      onChange={(e) => setPublicoAlvo(e.target.value)}
                      placeholder="Descreva o público-alvo do projeto..."
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="diferenciais">Diferenciais do Projeto</Label>
                    <Textarea
                      id="diferenciais"
                      value={diferenciais}
                      onChange={(e) => setDiferenciais(e.target.value)}
                      placeholder="O que torna seu projeto único?"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-4">
                  <Button type="submit" size="lg" className="min-w-[200px]" disabled={submitting}>
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Projeto
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <DialogTitle className="text-2xl">Projeto Enviado com Sucesso!</DialogTitle>
            <DialogDescription className="text-base pt-2">
              Sua solicitação foi recebida e será analisada em breve. Entraremos em contato
              através do email informado.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-4">
            <Button onClick={() => setShowSuccessModal(false)} size="lg">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default SubmitProjectPage;