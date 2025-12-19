import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Network, Save } from "lucide-react";

export const EcossistemaTextEditor = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState("Um Ecossistema de Conexões");
  const [subtitle, setSubtitle] = useState("Mais que uma vitrine, somos um porto seguro onde as ideias atracam, ganham força e partem para o mundo.");
  const [saving, setSaving] = useState(false);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="w-5 h-5" />
          Texto da Seção "Ecossistema de Conexões"
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Edite o título e subtítulo da seção de projetos em destaque na homepage.
        </p>

        <div className="space-y-2">
          <Label htmlFor="ecossistema-title">Título da Seção</Label>
          <Input
            id="ecossistema-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Um Ecossistema de Conexões"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ecossistema-subtitle">Subtítulo da Seção</Label>
          <Textarea
            id="ecossistema-subtitle"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Mais que uma vitrine, somos um porto seguro onde as ideias atracam, ganham força e partem para o mundo."
            rows={3}
          />
        </div>

        <Button onClick={saveSettings} disabled={saving} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Salvando..." : "Salvar Textos"}
        </Button>
      </CardContent>
    </Card>
  );
};
