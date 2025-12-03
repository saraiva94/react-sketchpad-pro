import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Send, ArrowLeft, Plus, X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TeamMember {
  nome: string;
  funcao: string;
  email: string;
  telefone: string;
}

const AdminAddProjectPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Responsável
  const [responsavelNome, setResponsavelNome] = useState("");
  const [responsavelEmail, setResponsavelEmail] = useState("");
  const [responsavelTelefone, setResponsavelTelefone] = useState("");
  
  // Projeto básico
  const [titulo, setTitulo] = useState("");
  const [categoriasTags, setCategoriasTags] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [location, setLocation] = useState("");
  
  // Mídia
  const [linkVideo, setLinkVideo] = useState("");
  
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
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isAdminLoggedIn");
    if (!isLoggedIn) {
      navigate("/auth");
    }
  }, [navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!titulo.trim()) newErrors.titulo = "Título é obrigatório";
    if (!descricao.trim()) newErrors.descricao = "Descrição é obrigatória";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const tags = categoriasTags.split(",").map(t => t.trim()).filter(t => t);

      // Insert project directly as approved (admin adding)
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          title: titulo,
          synopsis: descricao.substring(0, 300),
          description: descricao,
          project_type: tags[0] || "Cultura",
          responsavel_nome: responsavelNome || null,
          responsavel_email: responsavelEmail || null,
          responsavel_telefone: responsavelTelefone || null,
          categorias_tags: tags.length > 0 ? tags : null,
          link_video: linkVideo || null,
          image_url: imageUrl || null,
          location: location || null,
          valor_sugerido: valorSugerido ? parseFloat(valorSugerido) : null,
          link_pagamento: linkPagamento || null,
          impacto_cultural: impactoCultural || null,
          impacto_social: impactoSocial || null,
          publico_alvo: publicoAlvo || null,
          diferenciais: diferenciais || null,
          status: "approved", // Admin adds directly as approved
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
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-handwritten font-bold text-primary">
            Porto de Ideias
          </Link>
        </div>
      </header>

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
                      <Label htmlFor="responsavelTelefone">Telefone</Label>
                      <Input
                        id="responsavelTelefone"
                        value={responsavelTelefone}
                        onChange={(e) => setResponsavelTelefone(e.target.value)}
                        placeholder="(00) 00000-0000"
                      />
                    </div>
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
                    <div>
                      <Label htmlFor="categoriasTags">Categorias/Tags</Label>
                      <Input
                        id="categoriasTags"
                        value={categoriasTags}
                        onChange={(e) => setCategoriasTags(e.target.value)}
                        placeholder="Cinema, Teatro, Música"
                      />
                    </div>

                    <div>
                      <Label htmlFor="location">Localização</Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="São Paulo, SP"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="imageUrl">URL da Imagem</Label>
                    <Input
                      id="imageUrl"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="descricao">Descrição Completa *</Label>
                    <Textarea
                      id="descricao"
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      placeholder="Descreva o projeto em detalhes..."
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
                    <Label htmlFor="linkVideo">Link de Vídeo</Label>
                    <Input
                      id="linkVideo"
                      type="url"
                      value={linkVideo}
                      onChange={(e) => setLinkVideo(e.target.value)}
                      placeholder="https://youtube.com/..."
                    />
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
                            placeholder="Nome"
                          />
                        </div>
                        <div>
                          <Label>Função</Label>
                          <Input
                            value={member.funcao}
                            onChange={(e) => updateTeamMember(index, "funcao", e.target.value)}
                            placeholder="Função"
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
                </div>

                {/* Financiamento */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                    Financiamento
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
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

                {/* Submit */}
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