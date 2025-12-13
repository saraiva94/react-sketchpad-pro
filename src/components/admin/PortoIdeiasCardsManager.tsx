import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LayoutGrid, Eye, EyeOff, Save, GripVertical } from "lucide-react";

// Example card IDs matching PortoDeIdeiasPage
const EXAMPLE_CARDS = [
  { id: "exemplo-cultura-legado", title: "Sua Cultura, Seu Legado", emoji: "🎭" },
  { id: "exemplo-investidores-aguardam", title: "Investidores Aguardam", emoji: "🤝" },
  { id: "exemplo-historias-sucesso", title: "Histórias de Sucesso", emoji: "🏆" },
  { id: "exemplo-recursos-disponiveis", title: "Recursos Disponíveis", emoji: "💰" },
  { id: "exemplo-novo-projeto", title: "Adicione seu Projeto", emoji: "✨" },
];

interface Project {
  id: string;
  title: string;
  image_url: string | null;
}

interface PortoIdeiasCardsManagerProps {
  projects: Project[];
}

interface CardVisibility {
  [key: string]: boolean;
}

export function PortoIdeiasCardsManager({ projects }: PortoIdeiasCardsManagerProps) {
  const { toast } = useToast();
  const [cardVisibility, setCardVisibility] = useState<CardVisibility>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    // Fetch visibility settings
    const { data: visibilityData } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "porto_ideias_card_visibility")
      .maybeSingle();
    
    if (visibilityData) {
      setCardVisibility(visibilityData.value as CardVisibility);
    } else {
      // Default: all cards visible
      const defaultVisibility: CardVisibility = {};
      EXAMPLE_CARDS.forEach(card => {
        defaultVisibility[card.id] = true;
      });
      setCardVisibility(defaultVisibility);
    }

    setLoading(false);
  };

  const toggleCardVisibility = (cardId: string) => {
    setCardVisibility(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const saveVisibility = async () => {
    setSaving(true);
    
    const { data: existing } = await supabase
      .from("settings")
      .select("id")
      .eq("key", "porto_ideias_card_visibility")
      .maybeSingle();

    const jsonValue = JSON.parse(JSON.stringify(cardVisibility));

    let error;
    if (existing) {
      const result = await supabase
        .from("settings")
        .update({ value: jsonValue })
        .eq("key", "porto_ideias_card_visibility");
      error = result.error;
    } else {
      const result = await supabase
        .from("settings")
        .insert({ key: "porto_ideias_card_visibility", value: jsonValue });
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
        description: "Configurações de visibilidade atualizadas.",
      });
    }

    setSaving(false);
  };

  const visibleCount = Object.values(cardVisibility).filter(Boolean).length + projects.length;
  const approvedProjects = projects.filter((p: any) => p.status === "approved" || !p.status);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3" />
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
          <LayoutGrid className="w-5 h-5" />
          Controle e Edição - Cards Porto de Ideias
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Gerencie a visibilidade dos cards na página Porto de Ideias. A grade se ajusta automaticamente em linhas de 3 cards.
        </p>

        {/* Real Projects (always visible if approved) */}
        {approvedProjects.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              Projetos Reais Aprovados
              <Badge variant="secondary">{approvedProjects.length}</Badge>
            </h4>
            <div className="space-y-2">
              {approvedProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    {project.image_url ? (
                      <img src={project.image_url} alt={project.title} className="w-10 h-10 rounded object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <span className="text-sm text-primary-foreground font-semibold">
                          {project.title.charAt(0)}
                        </span>
                      </div>
                    )}
                    <span className="font-medium">{project.title}</span>
                  </div>
                  <Badge variant="default" className="bg-green-600">
                    <Eye className="w-3 h-3 mr-1" />
                    Sempre Visível
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Example Cards Visibility */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            Cards de Exemplo (Placeholder)
            <Badge variant="outline">
              {Object.values(cardVisibility).filter(Boolean).length} visíveis
            </Badge>
          </h4>
          <p className="text-sm text-muted-foreground">
            Cards de exemplo são exibidos quando não há projetos reais suficientes para preencher a grade.
          </p>
          <div className="space-y-2">
            {EXAMPLE_CARDS.map((card) => (
              <div 
                key={card.id} 
                className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                  cardVisibility[card.id] !== false ? 'bg-card' : 'bg-muted/50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <div className="w-10 h-10 rounded bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                    <span className="text-lg">{card.emoji}</span>
                  </div>
                  <span className="font-medium">{card.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  {cardVisibility[card.id] !== false ? (
                    <Badge variant="secondary" className="text-green-600">
                      <Eye className="w-3 h-3 mr-1" />
                      Visível
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      <EyeOff className="w-3 h-3 mr-1" />
                      Oculto
                    </Badge>
                  )}
                  <Switch
                    checked={cardVisibility[card.id] !== false}
                    onCheckedChange={() => toggleCardVisibility(card.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button onClick={saveVisibility} disabled={saving} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Salvando..." : "Salvar Configurações de Visibilidade"}
        </Button>
      </CardContent>
    </Card>
  );
}
