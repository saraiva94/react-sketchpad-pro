import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Plus, 
  Trash2, 
  Eye,
  Save,
  Upload,
  X,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { StagesMultiSelect, getStageLabel } from "@/components/admin/StagesMultiSelect";
import ContrapartidasEditor, { Contrapartida } from "@/components/admin/ContrapartidasEditor";

interface TeamMember {
  name: string;
  role: string;
}

const CreateProjectPage = () => {
  const [title, setTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [location, setLocation] = useState("");
  const [year, setYear] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([{ name: "", role: "" }]);
  const [contrapartidas, setContrapartidas] = useState<Contrapartida[]>([]);
  const [culturalImpact, setCulturalImpact] = useState("");
  const [socialImpact, setSocialImpact] = useState("");
  const [estimatedAudience, setEstimatedAudience] = useState("");
  const [differentials, setDifferentials] = useState("");
  const [metrics, setMetrics] = useState("");
  const [documents, setDocuments] = useState<FileList | null>(null);
  const [stages, setStages] = useState<string[]>([]);

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { name: "", role: "" }]);
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string) => {
    const updated = [...teamMembers];
    updated[index][field] = value;
    setTeamMembers(updated);
  };


  const handleSave = () => {
    const projectData = {
      title,
      shortDescription,
      synopsis,
      fullDescription,
      videoLink,
      mainImage: mainImage?.name,
      tags,
      totalBudget,
      location,
      year,
      teamMembers,
      contrapartidas,
      impact: {
        cultural: culturalImpact,
        social: socialImpact,
        audience: estimatedAudience,
        differentials,
      },
      metrics,
      documents: documents ? Array.from(documents).map(f => f.name) : [],
    };

    console.log("Dados do Projeto para Salvar:", projectData);
    alert("Projeto salvo! Confira o console para ver os dados.");
  };

  const PreviewModal = () => (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4">
      <div>
        <h3 className="font-semibold text-lg mb-2">{title || "Título do Projeto"}</h3>
        <p className="text-sm text-muted-foreground">{shortDescription || "Descrição curta..."}</p>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, i) => (
            <Badge key={i} variant="secondary">{tag}</Badge>
          ))}
        </div>
      )}
      <div>
        <h4 className="font-semibold mb-2">Detalhes</h4>
        <p className="text-sm text-muted-foreground">Orçamento: {totalBudget || "R$ 0,00"}</p>
        <p className="text-sm text-muted-foreground">Local: {location || "Não informado"}</p>
        <p className="text-sm text-muted-foreground">Ano: {year || "Não informado"}</p>
      </div>
      {teamMembers.some(m => m.name) && (
        <div>
          <h4 className="font-semibold mb-2">Equipe</h4>
          <ul className="space-y-1">
            {teamMembers.filter(m => m.name).map((member, i) => (
              <li key={i} className="text-sm text-muted-foreground">
                {member.name} - {member.role}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <h4 className="font-semibold mb-2">Sinopse</h4>
        <p className="text-sm text-muted-foreground whitespace-pre-line">{synopsis || "..."}</p>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Descrição Completa</h4>
        <p className="text-sm text-muted-foreground whitespace-pre-line">{fullDescription || "..."}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Back to DevMenu */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Menu
            </Button>
          </Link>
        </div>
      </div>

      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Criar Novo Projeto</h1>
            <p className="text-muted-foreground mt-1">Preencha os dados do seu projeto cultural</p>
          </div>
          <div className="flex gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg">
                  <Eye className="w-4 h-4 mr-2" />
                  Pré-visualizar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Pré-visualização do Projeto</DialogTitle>
                </DialogHeader>
                <PreviewModal />
              </DialogContent>
            </Dialog>
            <Button size="lg" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Salvar Projeto
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
        {/* Basic Info */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título do Projeto *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Festival Cultural Lorem Ipsum"
              />
            </div>
            <div>
              <Label htmlFor="shortDesc">Descrição Curta *</Label>
              <Input
                id="shortDesc"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Uma linha resumindo o projeto"
              />
            </div>
            <div>
              <Label htmlFor="synopsis">Sinopse *</Label>
              <Textarea
                id="synopsis"
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                placeholder="Sinopse do projeto (2-3 parágrafos)"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="fullDesc">Descrição Completa *</Label>
              <Textarea
                id="fullDesc"
                value={fullDescription}
                onChange={(e) => setFullDescription(e.target.value)}
                placeholder="Descrição detalhada do projeto"
                rows={8}
              />
            </div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Mídia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="video">Link do Vídeo de Apresentação</Label>
              <Input
                id="video"
                type="url"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                placeholder="https://youtube.com/..."
              />
            </div>
            <div>
              <Label htmlFor="mainImage">Imagem Principal *</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="mainImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setMainImage(e.target.files?.[0] || null)}
                />
                {mainImage && (
                  <span className="text-sm text-muted-foreground">{mainImage.name}</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tags & Categories */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Tags / Categorias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Digite uma tag e pressione Enter"
              />
              <Button onClick={addTag} type="button">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="pr-1">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estágios do Projeto */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Estágios do Projeto</CardTitle>
          </CardHeader>
          <CardContent>
            <StagesMultiSelect 
              value={stages} 
              onChange={setStages} 
              label=""
            />
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Financeiro e Localização</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="budget">Orçamento Total *</Label>
                <Input
                  id="budget"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  placeholder="R$ 150.000,00"
                />
              </div>
              <div>
                <Label htmlFor="location">Localização *</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="São Paulo, SP"
                />
              </div>
              <div>
                <Label htmlFor="year">Ano *</Label>
                <Input
                  id="year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2024"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Integrantes / Ficha Técnica</span>
              <Button onClick={addTeamMember} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <Input
                    value={member.name}
                    onChange={(e) => updateTeamMember(index, "name", e.target.value)}
                    placeholder="Nome"
                  />
                  <Input
                    value={member.role}
                    onChange={(e) => updateTeamMember(index, "role", e.target.value)}
                    placeholder="Função"
                  />
                </div>
                {teamMembers.length > 1 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeTeamMember(index)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Contrapartidas */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Contrapartidas para Investidores</CardTitle>
          </CardHeader>
          <CardContent>
            <ContrapartidasEditor 
              contrapartidas={contrapartidas} 
              onChange={setContrapartidas} 
            />
          </CardContent>
        </Card>

        {/* Impact */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Impacto do Projeto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="culturalImpact">Impacto Cultural</Label>
              <Textarea
                id="culturalImpact"
                value={culturalImpact}
                onChange={(e) => setCulturalImpact(e.target.value)}
                placeholder="Descreva o impacto cultural do projeto"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="socialImpact">Impacto Social</Label>
              <Textarea
                id="socialImpact"
                value={socialImpact}
                onChange={(e) => setSocialImpact(e.target.value)}
                placeholder="Descreva o impacto social do projeto"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="audience">Público-Alvo</Label>
              <Input
                id="audience"
                value={estimatedAudience}
                onChange={(e) => setEstimatedAudience(e.target.value)}
                placeholder="Ex: 50.000 pessoas em 6 meses"
              />
            </div>
            <div>
              <Label htmlFor="differentials">Diferenciais (um por linha)</Label>
              <Textarea
                id="differentials"
                value={differentials}
                onChange={(e) => setDifferentials(e.target.value)}
                placeholder="Liste os diferenciais do projeto"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Metrics */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Métricas e Indicadores</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="metrics">Métricas de Sucesso</Label>
            <Textarea
              id="metrics"
              value={metrics}
              onChange={(e) => setMetrics(e.target.value)}
              placeholder="Descreva as métricas e indicadores de sucesso do projeto"
              rows={5}
            />
          </CardContent>
        </Card>

        {/* Documents */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="docs">Anexar Documentos (PDFs, apresentações, etc.)</Label>
            <div className="flex items-center gap-4 mt-2">
              <Input
                id="docs"
                type="file"
                multiple
                onChange={(e) => setDocuments(e.target.files)}
              />
              <Upload className="w-5 h-5 text-muted-foreground" />
            </div>
            {documents && documents.length > 0 && (
              <div className="mt-4 space-y-2">
                {Array.from(documents).map((file, i) => (
                  <div key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span>📄</span>
                    <span>{file.name}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pb-8">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="lg">
                <Eye className="w-4 h-4 mr-2" />
                Pré-visualizar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Pré-visualização do Projeto</DialogTitle>
              </DialogHeader>
              <PreviewModal />
            </DialogContent>
          </Dialog>
          <Button size="lg" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Projeto
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectPage;
