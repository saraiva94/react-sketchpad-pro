import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Save,
  Plus,
  Trash2,
  Wrench,
  Film,
  Settings,
  FileText,
  DollarSign,
  Calendar,
  Megaphone,
  Mic,
  HelpCircle,
  Users,
  Star,
  Award,
  Briefcase,
  Camera,
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
  Lightbulb,
  Target,
  Heart
} from "lucide-react";

// Map of available icons
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Film,
  Settings,
  FileText,
  DollarSign,
  Calendar,
  Megaphone,
  Mic,
  HelpCircle,
  Users,
  Star,
  Award,
  Briefcase,
  Camera,
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
  Lightbulb,
  Target,
  Heart
};

const iconOptions = Object.keys(iconMap);

const colorOptions = [
  { value: "group-hover:text-rose-500", label: "Rosa", preview: "bg-rose-500" },
  { value: "group-hover:text-amber-500", label: "Âmbar", preview: "bg-amber-500" },
  { value: "group-hover:text-emerald-500", label: "Esmeralda", preview: "bg-emerald-500" },
  { value: "group-hover:text-cyan-500", label: "Ciano", preview: "bg-cyan-500" },
  { value: "group-hover:text-violet-500", label: "Violeta", preview: "bg-violet-500" },
  { value: "group-hover:text-pink-500", label: "Pink", preview: "bg-pink-500" },
  { value: "group-hover:text-orange-500", label: "Laranja", preview: "bg-orange-500" },
  { value: "group-hover:text-sky-500", label: "Azul Céu", preview: "bg-sky-500" },
  { value: "group-hover:text-teal-500", label: "Teal", preview: "bg-teal-500" },
  { value: "group-hover:text-indigo-500", label: "Índigo", preview: "bg-indigo-500" },
  { value: "group-hover:text-lime-500", label: "Limão", preview: "bg-lime-500" },
  { value: "group-hover:text-fuchsia-500", label: "Fúcsia", preview: "bg-fuchsia-500" },
];

interface ServiceItem {
  icon: string;
  text: string;
  hoverColor: string;
}

interface ServicosContent {
  title: string;
  services: ServiceItem[];
}

const defaultContent: ServicosContent = {
  title: "Nossos Serviços",
  services: [
    { icon: "Film", text: "Desenvolvimento de projetos culturais e audiovisuais", hoverColor: "group-hover:text-rose-500" },
    { icon: "Settings", text: "Produção executiva e gestão de equipe", hoverColor: "group-hover:text-amber-500" },
    { icon: "FileText", text: "Estruturação para leis de incentivo", hoverColor: "group-hover:text-emerald-500" },
    { icon: "DollarSign", text: "Captação de recursos públicos e privados", hoverColor: "group-hover:text-cyan-500" },
    { icon: "Calendar", text: "Produção de obras audiovisuais e eventos culturais", hoverColor: "group-hover:text-violet-500" },
    { icon: "Megaphone", text: "Distribuição, comunicação e lançamento de projetos", hoverColor: "group-hover:text-pink-500" },
    { icon: "Mic", text: "Criação e roteirização de videocasts e podcasts", hoverColor: "group-hover:text-orange-500" },
    { icon: "HelpCircle", text: "Consultoria para formatação de projetos", hoverColor: "group-hover:text-sky-500" },
  ]
};

export const NossosServicosEditor = () => {
  const { toast } = useToast();
  const [content, setContent] = useState<ServicosContent>(defaultContent);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "nossos_servicos_content")
      .maybeSingle();
    
    if (data && data.value) {
      setContent(data.value as unknown as ServicosContent);
    }
    setLoading(false);
  };

  const saveContent = async () => {
    setSaving(true);
    
    const { data: existing } = await supabase
      .from("settings")
      .select("id")
      .eq("key", "nossos_servicos_content")
      .maybeSingle();
    
    const jsonValue = JSON.parse(JSON.stringify(content));
    
    if (existing) {
      await supabase
        .from("settings")
        .update({ value: jsonValue })
        .eq("key", "nossos_servicos_content");
    } else {
      await supabase
        .from("settings")
        .insert([{ key: "nossos_servicos_content", value: jsonValue }]);
    }
    
    setSaving(false);
    toast({
      title: "Salvo!",
      description: "Conteúdo da seção 'Nossos Serviços' atualizado com sucesso.",
    });
  };

  const updateService = (index: number, field: keyof ServiceItem, value: string) => {
    const newServices = [...content.services];
    newServices[index] = { ...newServices[index], [field]: value };
    setContent({ ...content, services: newServices });
  };

  const addService = () => {
    const newService: ServiceItem = {
      icon: "Star",
      text: "Novo serviço",
      hoverColor: "group-hover:text-rose-500"
    };
    setContent({ ...content, services: [...content.services, newService] });
  };

  const removeService = (index: number) => {
    if (content.services.length <= 1) {
      toast({
        title: "Ação não permitida",
        description: "É necessário manter pelo menos 1 serviço.",
        variant: "destructive"
      });
      return;
    }
    const newServices = content.services.filter((_, i) => i !== index);
    setContent({ ...content, services: newServices });
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
            <Wrench className="w-5 h-5" />
            Controle e Edição - Nossos Serviços
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
          <Wrench className="w-5 h-5" />
          Controle e Edição - Nossos Serviços
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <p className="text-sm text-muted-foreground">
          Edite os serviços exibidos na seção "Nossos Serviços" da homepage.
        </p>

        {/* Title */}
        <div className="space-y-2">
          <Label>Título da Seção</Label>
          <Input
            value={content.title}
            onChange={(e) => setContent({ ...content, title: e.target.value })}
            placeholder="Nossos Serviços"
          />
        </div>

        {/* Services */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Serviços ({content.services.length})</h3>
            <Button onClick={addService} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Adicionar Serviço
            </Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {content.services.map((service, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3 bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white">
                      <IconComponent iconName={service.icon} />
                    </div>
                    <span className="font-medium text-xs">Serviço {index + 1}</span>
                  </div>
                  <Button 
                    onClick={() => removeService(index)} 
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
                    value={service.icon} 
                    onValueChange={(value) => updateService(index, "icon", value)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <IconComponent iconName={service.icon} />
                          <span className="text-xs">{service.icon}</span>
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
                  <Label className="text-xs">Cor (hover)</Label>
                  <Select 
                    value={service.hoverColor} 
                    onValueChange={(value) => updateService(index, "hoverColor", value)}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${colorOptions.find(c => c.value === service.hoverColor)?.preview || 'bg-muted'}`} />
                          <span className="text-xs">{colorOptions.find(c => c.value === service.hoverColor)?.label || "Selecione"}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${color.preview}`} />
                            <span>{color.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Text */}
                <div className="space-y-1">
                  <Label className="text-xs">Texto</Label>
                  <Input
                    value={service.text}
                    onChange={(e) => updateService(index, "text", e.target.value)}
                    placeholder="Descrição do serviço"
                    className="h-9 text-sm"
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
