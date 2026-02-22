import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Plus, X, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface CompanyLogo {
  id: string;
  image_url: string;
  name?: string;
}

interface CompaniesContent {
  title: string;
  description: string;
  logos: CompanyLogo[];
}

const DEFAULT_CONTENT: CompaniesContent = {
  title: "Empresas Parceiras",
  description: "Conheça as empresas e marcas que confiam no nosso trabalho",
  logos: [],
};

// Componente de Slot Sortável
function SortableLogoSlot({ 
  logo, 
  index, 
  onRemove, 
  onUpload, 
  onUrlAdd,
  isEmpty 
}: { 
  logo?: CompanyLogo; 
  index: number;
  onRemove: (id: string) => void;
  onUpload: (file: File, slotIndex: number) => void;
  onUrlAdd: (url: string, slotIndex: number) => void;
  isEmpty: boolean;
}) {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: logo?.id || `empty-${index}`, disabled: isEmpty });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file, index);
    }
  };

  const handleUrlSubmit = () => {
    if (urlValue.trim()) {
      onUrlAdd(urlValue.trim(), index);
      setUrlValue("");
      setShowUrlInput(false);
    }
  };

  // Slot vazio
  if (isEmpty) {
    return (
      <div className="relative">
        <div 
          className="w-40 h-28 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-accent/50 hover:bg-accent/5 transition-all"
          onClick={() => fileInputRef.current?.click()}
        >
          <Building2 className="w-8 h-8 text-muted-foreground/40" />
          <span className="text-xs text-muted-foreground/60">Slot {index + 1}</span>
          <span className="text-xs text-muted-foreground/40">Clique para adicionar</span>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Botão URL alternativo */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs"
          onClick={(e) => {
            e.stopPropagation();
            setShowUrlInput(!showUrlInput);
          }}
        >
          ou URL
        </Button>

        {showUrlInput && (
          <div className="absolute top-full mt-10 left-0 right-0 flex gap-1 z-10">
            <Input
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              placeholder="https://..."
              className="h-8 text-xs"
              onKeyPress={(e) => e.key === "Enter" && handleUrlSubmit()}
            />
            <Button size="sm" onClick={handleUrlSubmit} className="h-8 px-3">
              OK
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Slot preenchido
  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div className="w-40 h-28 border border-border rounded-lg overflow-hidden bg-card">
        <img 
          src={logo!.image_url} 
          alt={logo!.name || "Logo"} 
          className="w-full h-full object-contain p-2"
        />
      </div>
      
      {/* Grip para arrastar */}
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-1 left-1 p-1 bg-background/80 rounded opacity-0 group-hover:opacity-100 cursor-grab transition-opacity"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Botão remover */}
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onRemove(logo!.id)}
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
}

export function CompaniesCarouselEditor() {
  const [content, setContent] = useState<CompaniesContent>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  const MIN_SLOTS = 5; // Mínimo de slots visíveis

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const { data } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "companies_carousel")
        .maybeSingle();

      if (data?.value) {
        setContent(data.value as unknown as CompaniesContent);
      }
    } catch (error) {
      console.error("Erro ao carregar carrossel de empresas:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async (newContent: CompaniesContent) => {
    setSaving(true);
    try {
      const { data: existing } = await supabase
        .from("settings")
        .select("id")
        .eq("key", "companies_carousel")
        .maybeSingle();

      if (existing) {
        await supabase
          .from("settings")
          .update({ value: newContent })
          .eq("key", "companies_carousel");
      } else {
        await supabase
          .from("settings")
          .insert({ key: "companies_carousel", value: newContent });
      }

      setContent(newContent);
      toast.success("Alterações salvas!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (file: File, slotIndex: number) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Apenas imagens são aceitas");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem deve ter no máximo 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `company-logo-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("project-media")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("project-media")
        .getPublicUrl(fileName);

      const newLogo: CompanyLogo = {
        id: `logo-${Date.now()}`,
        image_url: publicUrl,
        name: file.name,
      };

      const newContent = {
        ...content,
        logos: [...content.logos, newLogo],
      };

      await saveContent(newContent);
      toast.success("Logo adicionado!");
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Erro no upload");
    } finally {
      setUploading(false);
    }
  };

  const handleUrlAdd = async (url: string, slotIndex: number) => {
    const newLogo: CompanyLogo = {
      id: `logo-${Date.now()}`,
      image_url: url,
      name: "Logo",
    };

    const newContent = {
      ...content,
      logos: [...content.logos, newLogo],
    };

    await saveContent(newContent);
  };

  const handleRemove = async (id: string) => {
    const newLogos = content.logos.filter((l) => l.id !== id);

    await saveContent({ ...content, logos: newLogos });
    toast.success("Logo removido");
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = content.logos.findIndex((l) => l.id === active.id);
    const newIndex = content.logos.findIndex((l) => l.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newLogos = arrayMove(content.logos, oldIndex, newIndex);

    await saveContent({ ...content, logos: newLogos });
    toast.success("Ordem atualizada");
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
            <Building2 className="w-5 h-5" />
            Carrossel de Empresas Parceiras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-muted rounded" />
            <div className="h-10 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Carrossel de Empresas Parceiras
        </CardTitle>
        <CardDescription>
          Configure a seção de logos das empresas que você trabalhou na homepage
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Título e Descrição */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Título da Seção</Label>
            <Input
              value={content.title}
              onChange={(e) => setContent({ ...content, title: e.target.value })}
              placeholder="Ex: Empresas Parceiras"
            />
          </div>
          <div className="space-y-2">
            <Label>Descrição da Seção</Label>
            <Input
              value={content.description}
              onChange={(e) => setContent({ ...content, description: e.target.value })}
              placeholder="Ex: Conheça as empresas que confiam no nosso trabalho"
            />
          </div>
        </div>

        {/* Grid de Slots */}
        <div className="space-y-3">
          <Label>Logos ({content.logos.length} adicionados)</Label>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={content.logos.map((l) => l.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex flex-wrap gap-4 p-4 bg-muted/20 rounded-lg min-h-[160px]">
                {/* Slots preenchidos */}
                {content.logos.map((logo, index) => (
                  <SortableLogoSlot
                    key={logo.id}
                    logo={logo}
                    index={index}
                    onRemove={handleRemove}
                    onUpload={handleUpload}
                    onUrlAdd={handleUrlAdd}
                    isEmpty={false}
                  />
                ))}

                {/* Slots vazios (até completar mínimo de 5) */}
                {Array.from({ length: Math.max(0, MIN_SLOTS - content.logos.length) }).map((_, i) => (
                  <SortableLogoSlot
                    key={`empty-${i}`}
                    index={content.logos.length + i}
                    onRemove={handleRemove}
                    onUpload={handleUpload}
                    onUrlAdd={handleUrlAdd}
                    isEmpty={true}
                  />
                ))}

                {/* Botão "Adicionar Mais" - SEMPRE VISÍVEL */}
                <div 
                  className="w-40 h-28 border-2 border-dashed border-accent/50 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-accent/10 transition-all"
                  onClick={() => addMoreInputRef.current?.click()}
                >
                  <Plus className="w-8 h-8 text-accent" />
                  <span className="text-xs text-accent font-medium">Adicionar Mais</span>
                </div>
                
                {/* Input file separado para adicionar mais */}
                <input
                  ref={addMoreInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleUpload(file, content.logos.length);
                      // Reset do input para permitir adicionar a mesma imagem novamente
                      e.target.value = '';
                    }
                  }}
                  className="hidden"
                />
              </div>
            </SortableContext>
          </DndContext>

          <p className="text-xs text-muted-foreground">
            💡 Arraste os logos para reordenar. Clique no slot vazio para adicionar uma imagem.
          </p>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2 pt-4 border-t">
          <Button 
            onClick={() => saveContent(content)} 
            disabled={saving || uploading}
            className="flex-1"
          >
            {saving ? "Salvando..." : uploading ? "Fazendo upload..." : "Salvar Alterações"}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
          >
            Restaurar Padrão
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
