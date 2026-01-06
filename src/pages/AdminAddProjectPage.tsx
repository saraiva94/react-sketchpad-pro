import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Send, ArrowLeft, Upload, FileText, ExternalLink, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { TeamMemberEditor, TeamMemberData } from "@/components/admin/TeamMemberEditor";
import { StagesMultiSelect } from "@/components/admin/StagesMultiSelect";
import ContrapartidasEditor, { Contrapartida } from "@/components/admin/ContrapartidasEditor";
import { RecognitionEditor, NewsItem } from "@/components/admin/RecognitionEditor";
import { ImageCropper } from "@/components/ImageCropper";
import { CategoriesMultiSelect } from "@/components/admin/CategoriesMultiSelect";
import { IncentiveLawsMultiSelect } from "@/components/admin/IncentiveLawsMultiSelect";
import { DynamicProjectTypeSelect } from "@/components/admin/DynamicProjectTypeSelect";
import { DynamicLocationSelect } from "@/components/admin/DynamicLocationSelect";

const AdminAddProjectPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Responsável
  const [responsavelNome, setResponsavelNome] = useState("");
  const [responsavelEmail, setResponsavelEmail] = useState("");
  const [responsavelTelefone, setResponsavelTelefone] = useState("");
  const [responsavelGenero, setResponsavelGenero] = useState("");
  
  // Imagem de Capa
  const [thumbnailBlob, setThumbnailBlob] = useState<Blob | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  
  // Projeto básico
  const [titulo, setTitulo] = useState("");
  const [sinopse, setSinopse] = useState("");
  const [categoriasTags, setCategoriasTags] = useState<string[]>([]);
  const [descricao, setDescricao] = useState("");
  const [location, setLocation] = useState("");
  const [projectType, setProjectType] = useState("");
  const [customProjectType, setCustomProjectType] = useState("");
  const [stages, setStages] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState("");
  // Mídia
  const [linkVideo, setLinkVideo] = useState("");
  const [presentationDocUrl, setPresentationDocUrl] = useState("");
  const [uploadingDoc, setUploadingDoc] = useState(false);
  
  // Integrantes
  const [teamMembers, setTeamMembers] = useState<TeamMemberData[]>([]);
  
  // Contrapartidas
  const [contrapartidas, setContrapartidas] = useState<Contrapartida[]>([]);
  
  // Reconhecimentos e Mídia
  const [awards, setAwards] = useState<string[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [festivals, setFestivals] = useState<{ title: string; url?: string; date?: string }[]>([]);
  
  // Financiamento
  const [valorSugerido, setValorSugerido] = useState("");
  const [linkPagamento, setLinkPagamento] = useState("");
  const [budget, setBudget] = useState("");
  
  // Impacto
  const [impactoCultural, setImpactoCultural] = useState("");
  const [impactoSocial, setImpactoSocial] = useState("");
  const [publicoAlvo, setPublicoAlvo] = useState("");
  const [diferenciais, setDiferenciais] = useState("");
  
  // Lei de Incentivo
  const [incentiveLaws, setIncentiveLaws] = useState<string[]>([]);
  
  // Admin Notes
  const [adminNotes, setAdminNotes] = useState("");
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const { user, loading: authLoading, isAdmin } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) navigate("/login");
  }, [authLoading, isAdmin, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!titulo.trim()) newErrors.titulo = "Título é obrigatório";
    if (!sinopse.trim()) newErrors.sinopse = "Sinopse é obrigatória";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDocUpload = async (file: File) => {
    setUploadingDoc(true);
    
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
      
      setPresentationDocUrl(urlData.publicUrl);
      
      toast({
        title: "Documento enviado!",
        description: "O documento de apresentação foi carregado.",
      });
    }
    
    setUploadingDoc(false);
  };

  const handleImageCropped = (blob: Blob, previewUrl: string) => {
    setThumbnailBlob(blob);
    setThumbnailPreview(previewUrl);
  };

  const handleClearImage = () => {
    setThumbnailBlob(null);
    setThumbnailPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      // Save values directly - labels will be formatted on display
      const finalProjectType = projectType === "Outro" ? customProjectType : projectType;
      
      // Upload thumbnail if provided
      let imageUrl = null;
      if (thumbnailBlob) {
        const timestamp = Date.now();
        const fileName = `thumbnails/${timestamp}_cover.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("project-media")
          .upload(fileName, thumbnailBlob);
        
        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from("project-media")
            .getPublicUrl(fileName);
          imageUrl = urlData.publicUrl;
        }
      }

      // Prepare incentive law details from multi-select - save values, not labels
      const hasIncentiveLaw = incentiveLaws.length > 0;
      const incentiveLawDetails = incentiveLaws.join(", ");

      // Insert project directly as approved (admin adding)
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          title: titulo,
          synopsis: sinopse,
          description: descricao || null,
          project_type: finalProjectType || categoriasTags[0] || "Cultura",
          stages: stages.length > 0 ? stages : ["development"],
          responsavel_nome: responsavelNome || null,
          responsavel_email: responsavelEmail || null,
          responsavel_telefone: responsavelTelefone || null,
          responsavel_genero: responsavelGenero || null,
          categorias_tags: categoriasTags.length > 0 ? categoriasTags : null,
          link_video: linkVideo || null,
          image_url: imageUrl,
          location: location || null,
          budget: budget || null,
          valor_sugerido: valorSugerido ? parseFloat(valorSugerido) : null,
          link_pagamento: linkPagamento || null,
          impacto_cultural: impactoCultural || null,
          impacto_social: impactoSocial || null,
          publico_alvo: publicoAlvo || null,
          diferenciais: diferenciais || null,
          has_incentive_law: hasIncentiveLaw,
          incentive_law_details: incentiveLawDetails || null,
          presentation_document_url: presentationDocUrl || null,
          awards: awards.length > 0 ? awards : [],
          news: news.length > 0 ? news : [],
          festivals_exhibitions: festivals.length > 0 ? festivals : [],
          additional_info: additionalInfo || null,
          admin_notes: adminNotes || null,
          status: "approved",
        } as any)
        .select()
        .single();

      if (projectError) throw projectError;

      // Insert team members
      if (teamMembers.length > 0 && project) {
        const membersData = teamMembers.map(member => ({
          project_id: project.id,
          nome: member.nome,
          funcao: member.funcao,
          email: member.email || null,
          telefone: member.telefone || null,
          photo_url: member.photo_url || null,
          social_links: member.social_links || {},
          curriculum_url: member.curriculum_url || null,
          detalhes: member.detalhes || null,
        }));

        await supabase.from("project_members").insert(membersData);
      }

      // Insert contrapartidas
      if (contrapartidas.length > 0 && project) {
        const contrapartidasData = contrapartidas.map(c => ({
          project_id: project.id,
          titulo: c.titulo || null,
          valor: c.valor,
          beneficios: c.beneficios,
          ativo: c.ativo,
          ordem: c.ordem,
          indice: c.indice || null,
        }));

        await supabase.from("contrapartidas").insert(contrapartidasData);
      }

      toast({
        title: "Projeto adicionado!",
        description: "O projeto foi adicionado com sucesso ao portfólio.",
      });
      
      navigate("/admin");
    } catch (error) {
      console.error("Error adding project:", error);
      toast({
        title: "Erro ao adicionar projeto",
        description: "Ocorreu um erro ao adicionar o projeto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar showNav={false} />

      <div className="py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <Link to="/admin" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Painel
          </Link>

          <Card className="shadow-lg">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-3xl font-bold text-foreground">
                Adicionar Projeto (Admin)
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Adicione um projeto diretamente ao portfólio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Imagem de Capa */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b pb-2 flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    Imagem de Capa do Projeto
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Adicione uma imagem que representará o projeto. Você pode ajustar o enquadramento antes de salvar.
                  </p>
                  <ImageCropper
                    onImageCropped={handleImageCropped}
                    currentImage={thumbnailPreview}
                    onClear={handleClearImage}
                    mode="both"
                  />
                </div>

                {/* Responsável */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                    Informações do Responsável
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="responsavelNome">Nome</Label>
                      <Input
                        id="responsavelNome"
                        value={responsavelNome}
                        onChange={(e) => setResponsavelNome(e.target.value)}
                        placeholder="Nome do responsável"
                      />
                    </div>

                    <div>
                      <Label htmlFor="responsavelGenero">Gênero</Label>
                      <Select value={responsavelGenero} onValueChange={setResponsavelGenero}>
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

                    <div>
                      <Label htmlFor="responsavelEmail">Email</Label>
                      <Input
                        id="responsavelEmail"
                        type="email"
                        value={responsavelEmail}
                        onChange={(e) => setResponsavelEmail(e.target.value)}
                        placeholder="email@exemplo.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="responsavelTelefone">Telefone</Label>
                      <Input
                        id="responsavelTelefone"
                        value={responsavelTelefone}
                        onChange={(e) => setResponsavelTelefone(e.target.value)}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
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
                      placeholder="Nome do projeto"
                      className={errors.titulo ? "border-destructive" : ""}
                    />
                    {errors.titulo && (
                      <p className="text-sm text-destructive mt-1">{errors.titulo}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <DynamicProjectTypeSelect
                      value={projectType}
                      onChange={setProjectType}
                      allowManage={true}
                    />
                    {projectType === "Outro" && (
                      <div>
                        <Label htmlFor="customProjectType">Tipo Personalizado</Label>
                        <Input
                          id="customProjectType"
                          placeholder="Digite o tipo de projeto"
                          value={customProjectType}
                          onChange={(e) => setCustomProjectType(e.target.value)}
                        />
                      </div>
                    )}

                    <DynamicLocationSelect
                      value={location}
                      onChange={setLocation}
                      allowManage={true}
                    />
                  </div>

                  <CategoriesMultiSelect
                    value={categoriasTags}
                    onChange={setCategoriasTags}
                    allowCustom={true}
                  />

                  {/* Stages Multi-Select */}
                  <StagesMultiSelect 
                    value={stages} 
                    onChange={setStages}
                    allowCustom={true}
                  />

                  <div>
                    <Label htmlFor="sinopse">Sinopse *</Label>
                    <Textarea
                      id="sinopse"
                      value={sinopse}
                      onChange={(e) => setSinopse(e.target.value)}
                      placeholder="Breve descrição do projeto (até 300 caracteres recomendado)"
                      rows={3}
                      className={errors.sinopse ? "border-destructive" : ""}
                    />
                    {errors.sinopse && (
                      <p className="text-sm text-destructive mt-1">{errors.sinopse}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="descricao">Descrição Completa</Label>
                    <Textarea
                      id="descricao"
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      placeholder="Descreva o projeto em detalhes..."
                      rows={6}
                    />
                  </div>

                  <div>
                    <Label htmlFor="additionalInfo">Informações Adicionais</Label>
                    <Textarea
                      id="additionalInfo"
                      value={additionalInfo}
                      onChange={(e) => setAdditionalInfo(e.target.value.slice(0, 100))}
                      placeholder="Informações adicionais sobre o projeto (máx. 100 caracteres)"
                      rows={2}
                      maxLength={100}
                    />
                    <p className="text-xs text-muted-foreground mt-1">{additionalInfo.length}/100 caracteres</p>
                  </div>
                </div>

                {/* Lei de Incentivo */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                    Lei de Incentivo
                  </h3>
                  
                  <IncentiveLawsMultiSelect
                    value={incentiveLaws}
                    onChange={setIncentiveLaws}
                    allowCustom={true}
                  />
                </div>

                {/* Mídia */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                    Mídia
                  </h3>
                  
                  <div>
                    <Label htmlFor="linkVideo">Link de Vídeo</Label>
                    <Input
                      id="linkVideo"
                      type="url"
                      value={linkVideo}
                      onChange={(e) => setLinkVideo(e.target.value)}
                      placeholder="https://youtube.com/..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Documento de Apresentação (PDF)</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        value={presentationDocUrl}
                        onChange={(e) => setPresentationDocUrl(e.target.value)}
                        placeholder="URL do documento ou faça upload"
                        className="flex-1"
                      />
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          disabled={uploadingDoc}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleDocUpload(file);
                          }}
                        />
                        <Button type="button" variant="outline" asChild>
                          <span>
                            <Upload className="w-4 h-4 mr-1" />
                            {uploadingDoc ? "Enviando..." : "Upload"}
                          </span>
                        </Button>
                      </label>
                      {presentationDocUrl && (
                        <a 
                          href={presentationDocUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Este documento será disponibilizado para download na página do projeto
                    </p>
                  </div>
                </div>

                {/* Integrantes */}
                <TeamMemberEditor 
                  members={teamMembers} 
                  onChange={setTeamMembers} 
                />

                {/* Financiamento */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                    Financiamento
                  </h3>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="budget">Orçamento</Label>
                      <Input
                        id="budget"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="Ex: R$ 500.000"
                      />
                    </div>

                    <div>
                      <Label htmlFor="valorSugerido">Valor Sugerido (R$)</Label>
                      <Input
                        id="valorSugerido"
                        type="number"
                        value={valorSugerido}
                        onChange={(e) => setValorSugerido(e.target.value)}
                        placeholder="100.00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="linkPagamento">Link de Pagamento</Label>
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
                        placeholder="Impacto cultural esperado..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="impactoSocial">Impacto Social</Label>
                      <Textarea
                        id="impactoSocial"
                        value={impactoSocial}
                        onChange={(e) => setImpactoSocial(e.target.value)}
                        placeholder="Impacto social esperado..."
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
                      placeholder="Público-alvo do projeto..."
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="diferenciais">Diferenciais</Label>
                    <Textarea
                      id="diferenciais"
                      value={diferenciais}
                      onChange={(e) => setDiferenciais(e.target.value)}
                      placeholder="O que torna este projeto único?"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Contrapartidas */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Contrapartidas para Investidores</CardTitle>
                    <CardDescription>
                      Adicione opções de contrapartidas com valores e benefícios
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ContrapartidasEditor 
                      contrapartidas={contrapartidas} 
                      onChange={setContrapartidas} 
                    />
                  </CardContent>
                </Card>

                {/* Reconhecimentos e Mídia */}
                <RecognitionEditor
                  awards={awards}
                  news={news}
                  festivals={festivals}
                  onAwardsChange={setAwards}
                  onNewsChange={setNews}
                  onFestivalsChange={setFestivals}
                />

                {/* Notas do Administrador */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                    Notas Internas
                  </h3>
                  
                  <div>
                    <Label htmlFor="adminNotes">Notas do Administrador</Label>
                    <Textarea
                      id="adminNotes"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Adicione observações internas sobre este projeto..."
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Estas notas são visíveis apenas para administradores.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => navigate("/admin")}>
                    Cancelar
                  </Button>
                  <Button type="submit" size="lg" disabled={submitting}>
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Adicionar Projeto
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminAddProjectPage;
