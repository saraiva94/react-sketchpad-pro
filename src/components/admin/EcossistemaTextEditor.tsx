import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, Network } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const EcossistemaTextEditor = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState("Um Ecossistema de Conexões");
  const [subtitle, setSubtitle] = useState("Mais que uma vitrine, somos um porto seguro onde as ideias atracam, ganham força e partem para o mundo.");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "ecossistema_text")
      .maybeSingle();

    if (data) {
      const settings = data.value as { title?: string; subtitle?: string };
      if (settings.title) setTitle(settings.title);
      if (settings.subtitle) setSubtitle(settings.subtitle);
    }
    setLoading(false);
  };

  const saveSettings = async () => {
    setSaving(true);

    const settingsValue = { title, subtitle };

    const { data: existing } = await supabase
      .from("settings")
      .select("id")
      .eq("key", "ecossistema_text")
      .maybeSingle();

    let error;
    if (existing) {
      const result = await supabase
        .from("settings")
        .update({ value: settingsValue })
        .eq("key", "ecossistema_text");
      error = result.error;
    } else {
      const result = await supabase
        .from("settings")
        .insert({ key: "ecossistema_text", value: settingsValue });
      error = result.error;
    }

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Salvo!",
        description: "Configurações atualizadas com sucesso.",
      });
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-muted-foreground" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-primary" />
            <h4 className="font-medium text-sm">Texto "Ecossistema de Conexões"</h4>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Edite o título e subtítulo da seção de projetos em destaque.
        </p>

        <div className="space-y-2">
          <Label htmlFor="ecossistema-title" className="text-xs">Título</Label>
          <Input
            id="ecossistema-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Um Ecossistema de Conexões"
            className="text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ecossistema-subtitle" className="text-xs">Subtítulo</Label>
          <Textarea
            id="ecossistema-subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Descrição da seção..."
            rows={2}
            className="text-sm resize-none"
          />
        </div>

        <Button onClick={saveSettings} disabled={saving} size="sm" className="w-full">
          <Save className="w-3 h-3 mr-2" />
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </CardContent>
    </Card>
  );
};
