import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Lightbulb, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function PortoIdeiasHeaderEditor() {
  const { toast } = useToast();
  const [title, setTitle] = useState("Conheça os Projetos da Porto de Ideias");
  const [description, setDescription] = useState("Selecionamos projetos com potencial de impacto. Conheça as ideias que já fazem parte da nossa rede.");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "porto_ideias_header")
      .maybeSingle();
    
    if (data) {
      const content = data.value as { title?: string; description?: string };
      if (content.title) setTitle(content.title);
      if (content.description) setDescription(content.description);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    
    const contentToSave = { title, description };
    
    const { data: existing } = await supabase
      .from("settings")
      .select("id")
      .eq("key", "porto_ideias_header")
      .maybeSingle();
    
    let error;
    if (existing) {
      const result = await supabase
        .from("settings")
        .update({ value: contentToSave })
        .eq("key", "porto_ideias_header");
      error = result.error;
    } else {
      const result = await supabase
        .from("settings")
        .insert([{ key: "porto_ideias_header", value: contentToSave }]);
      error = result.error;
    }

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar o conteúdo.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Salvo!",
        description: "Título e descrição atualizados com sucesso.",
      });
    }
    
    setSaving(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5" />
          Título e Descrição da Página
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Edite o título e a descrição que aparecem no topo da página Porto de Ideias.
        </p>

        <div className="space-y-2">
          <Label htmlFor="header-title">Título da Seção</Label>
          <Input
            id="header-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Conheça os Projetos da Porto de Ideias"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="header-description">Descrição</Label>
          <Textarea
            id="header-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Selecionamos projetos com potencial de impacto..."
            rows={3}
          />
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </CardContent>
    </Card>
  );
}