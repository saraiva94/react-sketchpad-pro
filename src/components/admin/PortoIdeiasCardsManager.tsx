import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LayoutGrid, Eye, EyeOff, Save, GripVertical, Star } from "lucide-react";

// Example card IDs matching PortoDeIdeiasPage
const EXAMPLE_CARDS = [
  { id: "exemplo-cultura-legado", title: "Sua Cultura, Seu Legado", emoji: "🎭", subtitle: "Audiovisual • Rio de Janeiro", canFeature: true },
  { id: "exemplo-investidores-aguardam", title: "Investidores Aguardam", emoji: "🤝", subtitle: "Produção Cultural • São Paulo", canFeature: true },
  { id: "exemplo-historias-sucesso", title: "Histórias de Sucesso", emoji: "🏆", subtitle: "Teatro • São Paulo", canFeature: true },
  { id: "exemplo-recursos-disponiveis", title: "Recursos Disponíveis", emoji: "💰", subtitle: "Música • Belo Horizonte", canFeature: true },
  { id: "exemplo-novo-projeto", title: "Adicione seu Projeto", emoji: "✨", subtitle: "Seu projeto aqui", canFeature: false },
];

interface Project {
  id: string;
  title: string;
  image_url: string | null;
}

interface PortoIdeiasCardsManagerProps {
  projects: Project[];
  onFeaturedChange?: () => void;
}

interface CardVisibility {
  [key: string]: boolean;
}

interface FeaturedCards {
  [key: string]: boolean;
}

export function PortoIdeiasCardsManager({ projects, onFeaturedChange }: PortoIdeiasCardsManagerProps) {
  const { toast } = useToast();
  const [cardVisibility, setCardVisibility] = useState<CardVisibility>({});
  const [featuredCards, setFeaturedCards] = useState<FeaturedCards>({});
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

    // Fetch featured cards settings
    const { data: featuredData } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "porto_ideias_featured_cards")
      .maybeSingle();
    
    if (featuredData) {
      setFeaturedCards(featuredData.value as FeaturedCards);
    } else {
      // Default: first 3 are featured
      const defaultFeatured: FeaturedCards = {};
      EXAMPLE_CARDS.slice(0, 3).forEach(card => {
        defaultFeatured[card.id] = true;
      });
      setFeaturedCards(defaultFeatured);
    }

    setLoading(false);
  };

  const toggleCardVisibility = (cardId: string) => {
    setCardVisibility(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const toggleFeatured = async (cardId: string) => {
    const currentFeaturedCount = Object.values(featuredCards).filter(Boolean).length;
    const isCurrentlyFeatured = featuredCards[cardId];
    
    // Can't add more than 3 featured
    if (!isCurrentlyFeatured && currentFeaturedCount >= 3) {
      toast({
        title: "Limite atingido",
        description: "Você pode destacar no máximo 3 projetos. Remova um antes de adicionar outro.",
        variant: "destructive",
      });
      return;
    }

    const newFeatured = {
      ...featuredCards,
      [cardId]: !isCurrentlyFeatured
    };

    setFeaturedCards(newFeatured);

    // Save immediately
    const jsonValue = JSON.parse(JSON.stringify(newFeatured));
    await supabase
      .from("settings")
      .upsert({ key: "porto_ideias_featured_cards", value: jsonValue }, { onConflict: "key" });

    toast({
      title: isCurrentlyFeatured ? "Removido dos destaques" : "Adicionado aos destaques",
      description: isCurrentlyFeatured 
        ? "O projeto foi removido dos destaques da homepage."
        : "O projeto foi adicionado aos destaques da homepage.",
    });

    // Notify parent to refresh
    onFeaturedChange?.();
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

  const featuredCount = Object.values(featuredCards).filter(Boolean).length;
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

        {/* Featured Count Indicator */}
        <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-sm">
            <strong>{featuredCount}</strong> de 3 slots de destaque preenchidos
          </span>
          {featuredCount < 3 && (
            <Badge variant="outline" className="ml-2 text-xs text-muted-foreground">
              {3 - featuredCount} disponíveis
            </Badge>
          )}
        </div>

        {/* Example Cards Visibility */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            Cards de Exemplo (Placeholder)
            <Badge variant="outline">
              {Object.values(cardVisibility).filter(Boolean).length} visíveis
            </Badge>
          </h4>
          <p className="text-sm text-muted-foreground">
            Clique na estrela para destacar na homepage (máx. 3). Use o toggle para controlar visibilidade no Porto de Ideias.
          </p>
          <div className="space-y-2">
            {EXAMPLE_CARDS.map((card) => {
              const isVisible = cardVisibility[card.id] !== false;
              const isFeatured = featuredCards[card.id] === true;
              const canFeature = card.canFeature;
              
              return (
                <div 
                  key={card.id} 
                  className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                    isVisible ? 'bg-card' : 'bg-muted/50 opacity-60'
                  } ${isFeatured ? 'border-yellow-500/50 bg-yellow-500/5' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    {canFeature ? (
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <div className="w-4 h-4" />
                    )}
                    
                    {/* Star for Featured - only show for featurable cards */}
                    {canFeature ? (
                      <button
                        onClick={() => toggleFeatured(card.id)}
                        className={`p-1.5 rounded-full transition-all ${
                          isFeatured 
                            ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30' 
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                        title={isFeatured ? "Remover dos destaques" : "Adicionar aos destaques da homepage"}
                      >
                        <Star className={`w-5 h-5 ${isFeatured ? 'fill-yellow-500' : ''}`} />
                      </button>
                    ) : (
                      <div className="p-1.5 rounded-full bg-muted/30 text-muted-foreground/50" title="Este card não pode ser destacado">
                        <Star className="w-5 h-5" />
                      </div>
                    )}
                    
                    <div className="w-10 h-10 rounded bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                      <span className="text-lg">{card.emoji}</span>
                    </div>
                    <div>
                      <span className="font-medium">{card.title}</span>
                      <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isFeatured && canFeature && (
                      <Badge variant="default" className="bg-yellow-600">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        Destaque
                      </Badge>
                    )}
                    {!canFeature && (
                      <Badge variant="outline" className="text-muted-foreground text-xs">
                        Fixo no final
                      </Badge>
                    )}
                    {isVisible ? (
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
                      checked={isVisible}
                      onCheckedChange={() => toggleCardVisibility(card.id)}
                    />
                  </div>
                </div>
              );
            })}
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
