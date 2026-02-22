import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Rocket, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function PortfolioHeaderEditor() {
  const { toast } = useToast();
  const [title, setTitle] = useState("Projetos em Andamento");
  const [description, setDescription] = useState("Acompanhe nosso portfólio de projetos culturais");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "portfolio_header")
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
      .eq("key", "portfolio_header")
      .maybeSingle();
    
    let error;
    if (existing) {
      const result = await supabase
        .from("settings")
        .update({ value: contentToSave })
        .eq("key", "portfolio_header");
      error = result.error;
    } else {
      const result = await supabase
        .from("settings")
        .insert([{ key: "portfolio_header", value: contentToSave }]);
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
        description: "Título e descrição da página Portfólio atualizados com sucesso.",
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
          <Rocket className="w-5 h-5" />
          Título e Descrição da Página Portfólio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Edite o título e a descrição que aparecem no topo da página de Portfólio (Projetos em Andamento).
        </p>

        <div className="space-y-2">
          <Label htmlFor="portfolio-title">Título da Seção</Label>
          <Input
            id="portfolio-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Projetos em Andamento"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="portfolio-description">Descrição</Label>
          <Textarea
            id="portfolio-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Acompanhe nosso portfólio de projetos culturais"
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
