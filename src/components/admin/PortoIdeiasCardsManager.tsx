import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { translationManager } from "@/lib/translationManager";
import { LayoutGrid, Eye, EyeOff, Save, GripVertical, Star } from "lucide-react";

type TargetLanguage = "en" | "es";

interface Project {
  id: string;
  title: string;
  image_url: string | null;
  status?: string;
  project_type?: string;
  location?: string;
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

interface CardOrder {
  [key: string]: number;
}

export function PortoIdeiasCardsManager({ projects, onFeaturedChange }: PortoIdeiasCardsManagerProps) {
  const { toast } = useToast();
  const [cardVisibility, setCardVisibility] = useState<CardVisibility>({});
  const [featuredCards, setFeaturedCards] = useState<FeaturedCards>({});
  const [cardOrder, setCardOrder] = useState<CardOrder>({});
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
    }

    // Fetch featured cards settings
    const { data: featuredData } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "porto_ideias_featured_cards")
      .maybeSingle();
    
    if (featuredData) {
      setFeaturedCards(featuredData.value as FeaturedCards);
    }

    // Fetch card order
    const { data: orderData } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "porto_ideias_order")
      .maybeSingle();
    
    if (orderData) {
      setCardOrder(orderData.value as CardOrder);
    }

    setLoading(false);
  };

  // Filter only approved projects
  const approvedProjects = projects.filter((p) => p.status === "approved" || !p.status);

  // Build list of all project cards
  const allCards = approvedProjects.map(p => ({
    id: p.id,
    title: p.title,
    subtitle: `${p.project_type || 'Projeto'} • ${p.location || 'Brasil'}`,
    image_url: p.image_url,
    canFeature: true,
  }));

  // Sort by order if available
  const sortedCards = [...allCards].sort((a, b) => {
    const orderA = cardOrder[a.id] ?? 999;
    const orderB = cardOrder[b.id] ?? 999;
    return orderA - orderB;
  });

  const toggleCardVisibility = (cardId: string) => {
    setCardVisibility(prev => ({
      ...prev,
      [cardId]: prev[cardId] === false ? true : false
    }));
  };

  const warmProjectTranslations = async (projectId: string) => {
    // Busca os campos reais usados no card de destaque (inclui synopsis)
    const { data, error } = await supabase
      .from("projects")
      .select("id, title, synopsis, project_type")
      .eq("id", projectId)
      .maybeSingle();

    if (error || !data) {
      throw new Error("Não foi possível carregar o projeto para aquecer traduções.");
    }

    const langs: TargetLanguage[] = ["en", "es"];

    // Aquece traduções por-campo: isso popula o banco e evita chamadas ao gateway na navegação do usuário.
    for (const lang of langs) {
      await translationManager.getTranslation(`project_title_${data.id}`, data.title, lang);
      await translationManager.getTranslation(`project_synopsis_${data.id}`, data.synopsis, lang);
      await translationManager.getTranslation(`project_type_${data.id}`, data.project_type, lang);
    }
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

    const willBeFeatured = !isCurrentlyFeatured;

    const newFeatured = {
      ...featuredCards,
      [cardId]: willBeFeatured,
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

    // IMPORTANT: ao adicionar destaque, aquecer traduções EN/ES agora (evita que um card fique diferente por rate-limit)
    if (willBeFeatured) {
      toast({
        title: "Preparando traduções",
        description: "Aquecendo EN/ES para este destaque (pode levar alguns segundos).",
      });

      try {
        await warmProjectTranslations(cardId);
        toast({
          title: "Traduções prontas",
          description: "EN/ES foram armazenados em cache para este destaque.",
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Não foi possível aquecer traduções agora.";
        toast({
          title: "Tradução pendente",
          description: msg + " (se houver limite de requisições, tente novamente em instantes).",
          variant: "destructive",
        });
      }
    }

    // Notify parent to refresh
    onFeaturedChange?.();
  };

  const saveVisibility = async () => {
    setSaving(true);
    
    const jsonValue = JSON.parse(JSON.stringify(cardVisibility));

    const { error } = await supabase
      .from("settings")
      .upsert({ key: "porto_ideias_card_visibility", value: jsonValue }, { onConflict: "key" });

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
          Gerencie a visibilidade e destaque dos projetos na página Porto de Ideias. Projetos aprovados podem ser ocultados ou destacados na homepage (máx. 3).
        </p>

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

        {/* Approved Projects */}
        {sortedCards.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              Projetos Aprovados
              <Badge variant="secondary">{sortedCards.length}</Badge>
            </h4>
            <p className="text-sm text-muted-foreground">
              Clique na estrela para destacar na homepage. Use o toggle para controlar visibilidade no Porto de Ideias.
            </p>
            <div className="space-y-2">
              {sortedCards.map((card) => {
                const isVisible = cardVisibility[card.id] !== false;
                const isFeatured = featuredCards[card.id] === true;
                
                return (
                  <div 
                    key={card.id} 
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                      isVisible ? 'bg-card' : 'bg-muted/50 opacity-60'
                    } ${isFeatured ? 'border-yellow-500/50 bg-yellow-500/5' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                      
                      {/* Star for Featured */}
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
                      
                      {card.image_url ? (
                        <img src={card.image_url} alt={card.title} className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <span className="text-sm text-primary-foreground font-semibold">
                            {card.title.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="font-medium">{card.title}</span>
                        <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isFeatured && (
                        <Badge variant="default" className="bg-yellow-600">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          Destaque
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
        ) : (
          <div className="p-4 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum projeto aprovado ainda. Projetos aprovados aparecerão aqui com opções de controle.
            </p>
          </div>
        )}

        <Button onClick={saveVisibility} disabled={saving} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Salvando..." : "Salvar Configurações de Visibilidade"}
        </Button>
      </CardContent>
    </Card>
  );
}
