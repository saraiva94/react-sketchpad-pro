import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Save,
  Plus,
  Trash2,
  Lightbulb,
  Target,
  Heart,
  Users,
  Star,
  Award,
  Briefcase,
  Camera,
  Film,
  Music,
  Palette,
  Pen,
  Rocket,
  Shield,
  Smile,
  Sparkles,
  Sun,
  Zap,
  Globe,
  BookOpen,
  Compass,
  Crown,
  Diamond,
  Eye,
  Flame,
  Gift,
  Handshake,
  Key,
  Leaf,
  MessageCircle,
  Mountain,
  Puzzle,
  Rainbow,
  Telescope,
  Trophy,
  Umbrella,
  Waves,
  Wind,
  FileText
} from "lucide-react";

// Map of available icons
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Lightbulb,
  Target,
  Heart,
  Users,
  Star,
  Award,
  Briefcase,
  Camera,
  Film,
  Music,
  Palette,
  Pen,
  Rocket,
  Shield,
  Smile,
  Sparkles,
  Sun,
  Zap,
  Globe,
  BookOpen,
  Compass,
  Crown,
  Diamond,
  Eye,
  Flame,
  Gift,
  Handshake,
  Key,
  Leaf,
  MessageCircle,
  Mountain,
  Puzzle,
  Rainbow,
  Telescope,
  Trophy,
  Umbrella,
  Waves,
  Wind,
};

const iconOptions = Object.keys(iconMap);

const colorOptions = [
  { value: "from-primary to-accent", label: "Primário → Accent", preview: "bg-gradient-to-br from-primary to-accent" },
  { value: "from-emerald-500 to-emerald-600", label: "Verde", preview: "bg-gradient-to-br from-emerald-500 to-emerald-600" },
  { value: "from-violet-500 to-violet-600", label: "Violeta", preview: "bg-gradient-to-br from-violet-500 to-violet-600" },
  { value: "from-rose-500 to-rose-600", label: "Rosa", preview: "bg-gradient-to-br from-rose-500 to-rose-600" },
  { value: "from-amber-500 to-orange-500", label: "Laranja", preview: "bg-gradient-to-br from-amber-500 to-orange-500" },
  { value: "from-cyan-500 to-blue-500", label: "Azul", preview: "bg-gradient-to-br from-cyan-500 to-blue-500" },
  { value: "from-pink-500 to-fuchsia-500", label: "Fúcsia", preview: "bg-gradient-to-br from-pink-500 to-fuchsia-500" },
  { value: "from-teal-500 to-cyan-500", label: "Teal", preview: "bg-gradient-to-br from-teal-500 to-cyan-500" },
];

interface QuemSomosCard {
  icon: string;
  title: string;
  description: string;
  color: string;
}

interface QuemSomosContent {
  paragraphs: string[];
  cards: QuemSomosCard[];
}

const defaultContent: QuemSomosContent = {
  paragraphs: [
    "A Porto Bello Filmes é uma produtora audiovisual que nasce da vontade de realização que pulsa em cada uma de nós. Às vezes as coisas que a gente sonha realmente acontecem, o que a gente precisa é correr atrás na prática cotidiana e acreditar que o nosso movimento também movimenta a vida. A nossa equipe une a capacidade de colocar a mão na massa com a sensibilidade de transformar vivências em narrativas para compartilhar com o mundo.",
    "Nossos projetos nascem de uma escuta atenta e são atravessados por experiências pessoais e profissionais diversas. Contamos com um time de parceiros que somam seus repertórios e especialidades em cada etapa. Isso fortalece nossas trocas e a forma como organizamos o trabalho para criar, produzir, finalizar e fazer acontecer.",
    "Desenvolvemos projetos autorais e também abraçamos histórias que chegam até nós com vontade de ganhar forma. A gente escuta, estrutura, soma e ajuda a colocar no mundo. Essas diferentes perspectivas ampliam nosso repertório e guiam nossas escolhas criativas. Acreditamos no valor do trabalho bem feito, realizado em conjunto com pessoas competentes e comprometidas. É assim que seguimos: com clareza, escuta e entrega."
  ],
  cards: [
    { 
      icon: "Lightbulb", 
      title: "Para Criadores", 
      description: "Histórias potentes merecem estrutura sólida. Atuamos no desenvolvimento, organização e produção para tirar ideias do papel e transformá-las em obras realizadas.",
      color: "from-primary to-accent"
    },
    { 
      icon: "Target", 
      title: "Para Investidores", 
      description: "Projetos prontos para investimento, com identidade, força de execução e potencial de retorno institucional.",
      color: "from-emerald-500 to-emerald-600"
    },
    { 
      icon: "Heart", 
      title: "Para a Sociedade", 
      description: "Criamos experiências que atravessam. Conectamos narrativas a quem importa: as pessoas.",
      color: "from-violet-500 to-violet-600"
    }
  ]
};

export const QuemSomosEditor = () => {
  const { toast } = useToast();
  const [content, setContent] = useState<QuemSomosContent>(defaultContent);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "quem_somos_content")
      .maybeSingle();
    
    if (data && data.value) {
      setContent(data.value as unknown as QuemSomosContent);
    }
    setLoading(false);
  };

  const saveContent = async () => {
    setSaving(true);
    
    const { data: existing } = await supabase
      .from("settings")
      .select("id")
      .eq("key", "quem_somos_content")
      .maybeSingle();
    
    const jsonValue = JSON.parse(JSON.stringify(content));
    
    if (existing) {
      await supabase
        .from("settings")
        .update({ value: jsonValue })
        .eq("key", "quem_somos_content");
    } else {
      await supabase
        .from("settings")
        .insert([{ key: "quem_somos_content", value: jsonValue }]);
    }
    
    setSaving(false);
    toast({
      title: "Salvo!",
      description: "Conteúdo da seção 'Quem Somos' atualizado com sucesso.",
    });
  };

  const updateParagraph = (index: number, value: string) => {
    const newParagraphs = [...content.paragraphs];
    newParagraphs[index] = value;
    setContent({ ...content, paragraphs: newParagraphs });
  };

  const addParagraph = () => {
    setContent({ ...content, paragraphs: [...content.paragraphs, "Novo parágrafo..."] });
  };

  const removeParagraph = (index: number) => {
    if (content.paragraphs.length <= 1) {
      toast({
        title: "Ação não permitida",
        description: "É necessário manter pelo menos 1 parágrafo.",
        variant: "destructive"
      });
      return;
    }
    const newParagraphs = content.paragraphs.filter((_, i) => i !== index);
    setContent({ ...content, paragraphs: newParagraphs });
  };

  const updateCard = (index: number, field: keyof QuemSomosCard, value: string) => {
    const newCards = [...content.cards];
    newCards[index] = { ...newCards[index], [field]: value };
    setContent({ ...content, cards: newCards });
  };

  const addCard = () => {
    const newCard: QuemSomosCard = {
      icon: "Star",
      title: "Novo Card",
      description: "Descrição do novo card",
      color: "from-primary to-accent"
    };
    setContent({ ...content, cards: [...content.cards, newCard] });
  };

  const removeCard = (index: number) => {
    if (content.cards.length <= 1) {
      toast({
        title: "Ação não permitida",
        description: "É necessário manter pelo menos 1 card.",
        variant: "destructive"
      });
      return;
    }
    const newCards = content.cards.filter((_, i) => i !== index);
    setContent({ ...content, cards: newCards });
  };

  const IconComponent = ({ iconName }: { iconName: string }) => {
    const Icon = iconMap[iconName];
    return Icon ? <Icon className="w-5 h-5" /> : null;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Controle e Edição - Quem Somos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Controle e Edição - Quem Somos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <p className="text-sm text-muted-foreground">
          Edite o texto e os cards da seção "Quem Somos" exibida na homepage.
        </p>

        {/* Paragraphs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Texto Principal ({content.paragraphs.length} parágrafos)</h3>
            <Button onClick={addParagraph} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Parágrafo
            </Button>
          </div>
          {content.paragraphs.map((paragraph, index) => (
            <div key={index} className="space-y-2 p-3 border rounded-lg bg-muted/10">
              <div className="flex items-center justify-between">
                <Label>Parágrafo {index + 1}</Label>
                <Button 
                  onClick={() => removeParagraph(index)} 
                  size="sm" 
                  variant="ghost" 
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <Textarea
                value={paragraph}
                onChange={(e) => updateParagraph(index, e.target.value)}
                rows={4}
                className="resize-y"
              />
            </div>
          ))}
        </div>

        {/* Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Cards ({content.cards.length})</h3>
            <Button onClick={addCard} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Card
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.cards.map((card, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3 bg-muted/20 relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center text-white`}>
                      <IconComponent iconName={card.icon} />
                    </div>
                    <h4 className="font-medium text-sm">Card {index + 1}</h4>
                  </div>
                  <Button 
                    onClick={() => removeCard(index)} 
                    size="sm" 
                    variant="ghost" 
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Icon Selector */}
                <div className="space-y-1">
                  <Label className="text-xs">Ícone</Label>
                  <Select 
                    value={card.icon} 
                    onValueChange={(value) => updateCard(index, "icon", value)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <IconComponent iconName={card.icon} />
                          <span>{card.icon}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {iconOptions.map((iconName) => (
                        <SelectItem key={iconName} value={iconName}>
                          <div className="flex items-center gap-2">
                            <IconComponent iconName={iconName} />
                            <span>{iconName}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Color Selector */}
                <div className="space-y-1">
                  <Label className="text-xs">Cor</Label>
                  <Select 
                    value={card.color} 
                    onValueChange={(value) => updateCard(index, "color", value)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded ${colorOptions.find(c => c.value === card.color)?.preview || 'bg-muted'}`} />
                          <span>{colorOptions.find(c => c.value === card.color)?.label || "Selecione"}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded ${color.preview}`} />
                            <span>{color.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Title */}
                <div className="space-y-1">
                  <Label className="text-xs">Título</Label>
                  <Input
                    value={card.title}
                    onChange={(e) => updateCard(index, "title", e.target.value)}
                    placeholder="Título do card"
                    className="h-9 text-sm"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <Label className="text-xs">Descrição</Label>
                  <Textarea
                    value={card.description}
                    onChange={(e) => updateCard(index, "description", e.target.value)}
                    rows={2}
                    placeholder="Descrição"
                    className="text-sm resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button 
          onClick={saveContent}
          disabled={saving}
          className="w-full"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </CardContent>
    </Card>
  );
};
