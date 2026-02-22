import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Anchor, Save } from "lucide-react";

interface CtaCardContent {
  question: string;
  headline: string;
  body: string;
  free: string;
  action: string;
}

const DEFAULT_CONTENT: CtaCardContent = {
  question: "Quer enviar seu projeto?",
  headline: "Faça Parte da Nossa Rede",
  body: "Se você tem uma ideia potente e bem estruturada, envie para nossa curadoria.",
  free: "✨ Gratuito",
  action: "Enviar projeto",
};

export function CtaCardEditor() {
  const [content, setContent] = useState<CtaCardContent>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "cta_card_content")
        .maybeSingle();

      if (data && data.value) {
        setContent(data.value as CtaCardContent);
      }
    } catch (error) {
      console.error("Erro ao carregar conteúdo do card CTA:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from("settings")
        .select("id")
        .eq("key", "cta_card_content")
        .maybeSingle();

      if (existing) {
        await supabase
          .from("settings")
          .update({ value: content })
          .eq("key", "cta_card_content");
      } else {
        await supabase
          .from("settings")
          .insert({ key: "cta_card_content", value: content });
      }

      toast.success("Card CTA atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar conteúdo");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setContent(DEFAULT_CONTENT);
    toast.info("Valores restaurados para o padrão");
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Anchor className="w-5 h-5" />
            Editor do Card "Quer Enviar Seu Projeto"
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded" />
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
          <Anchor className="w-5 h-5" />
          Editor do Card "Quer Enviar Seu Projeto"
        </CardTitle>
        <CardDescription>
          Configure o conteúdo do card colorido que aparece na página de projetos em captação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Preview */}
        <div className="p-6 rounded-xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-violet-50 to-blue-50 dark:from-violet-950/20 dark:to-blue-950/20">
          <h3 className="text-sm font-semibold text-muted-foreground mb-4">Preview</h3>
          <div className="card-rainbow border-0 rounded-2xl overflow-hidden shadow-2xl">
            <div className="relative h-48 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Anchor className="w-10 h-10 drop-shadow-lg" />
                </div>
                <div className="text-xl font-semibold drop-shadow-lg">{content.question}</div>
              </div>
            </div>
            <div className="p-6 bg-black/20 backdrop-blur-sm">
              <h3 className="text-xl font-serif font-bold mb-3 text-white drop-shadow">{content.headline}</h3>
              <p className="text-sm text-white/90 mb-4">{content.body}</p>
              <div className="flex items-center justify-between pt-4 border-t border-white/30">
                <span className="text-sm text-white/80 font-medium">{content.free}</span>
                <span className="text-sm font-bold flex items-center gap-2 text-white">
                  {content.action}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="question">Pergunta (título superior)</Label>
            <Input
              id="question"
              value={content.question}
              onChange={(e) => setContent({ ...content, question: e.target.value })}
              placeholder="Ex: Quer enviar seu projeto?"
            />
          </div>

          <div>
            <Label htmlFor="headline">Título principal</Label>
            <Input
              id="headline"
              value={content.headline}
              onChange={(e) => setContent({ ...content, headline: e.target.value })}
              placeholder="Ex: Faça Parte da Nossa Rede"
            />
          </div>

          <div>
            <Label htmlFor="body">Descrição</Label>
            <Textarea
              id="body"
              value={content.body}
              onChange={(e) => setContent({ ...content, body: e.target.value })}
              placeholder="Ex: Se você tem uma ideia potente e bem estruturada..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="free">Badge "Gratuito"</Label>
              <Input
                id="free"
                value={content.free}
                onChange={(e) => setContent({ ...content, free: e.target.value })}
                placeholder="Ex: ✨ Gratuito"
              />
            </div>

            <div>
              <Label htmlFor="action">Texto do botão</Label>
              <Input
                id="action"
                value={content.action}
                onChange={(e) => setContent({ ...content, action: e.target.value })}
                placeholder="Ex: Enviar projeto"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={handleSave} disabled={saving} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
          <Button onClick={handleReset} variant="outline">
            Restaurar Padrão
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
