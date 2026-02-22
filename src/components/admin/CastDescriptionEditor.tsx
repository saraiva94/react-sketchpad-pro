import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Users, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function CastDescriptionEditor() {
  const { toast } = useToast();
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDescription();
  }, []);

  const fetchDescription = async () => {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "cast_global_description")
      .maybeSingle();
    
    if (data) {
      const content = data.value as { description?: string };
      if (content.description) setDescription(content.description);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    
    const contentToSave = { description };
    
    const { data: existing } = await supabase
      .from("settings")
      .select("id")
      .eq("key", "cast_global_description")
      .maybeSingle();
    
    let error;
    if (existing) {
      const result = await supabase
        .from("settings")
        .update({ value: contentToSave })
        .eq("key", "cast_global_description");
      error = result.error;
    } else {
      const result = await supabase
        .from("settings")
        .insert([{ key: "cast_global_description", value: contentToSave }]);
      error = result.error;
    }

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar a descrição.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Salvo!",
        description: "Descrição do elenco atualizada em todos os projetos.",
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
          <Users className="w-5 h-5" />
          Descrição Global do Elenco
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Este texto aparecerá em TODOS os projetos após o divisor "Elenco" (quando houver elenco).
        </p>

        <div className="space-y-2">
          <Label htmlFor="cast-description">Descrição sobre o Elenco</Label>
          <Textarea
            id="cast-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Escreva uma descrição global sobre o elenco dos projetos..."
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            Exemplo: "Nosso elenco é cuidadosamente selecionado para trazer autenticidade e talento a cada projeto."
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Salvando..." : "Salvar Descrição Global"}
        </Button>
      </CardContent>
    </Card>
  );
}
