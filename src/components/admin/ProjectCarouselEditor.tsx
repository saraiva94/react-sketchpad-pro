import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, Plus, X, GripVertical } from "lucide-react";
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

interface ProjectCarouselEditorProps {
  projectId: string;
  carouselImages: string[];
  onUpdate: (images: string[]) => void;
}

interface GalleryTitleContent {
  title: string;
}

// Componente de Slot Sortável
function SortableImageSlot({ 
  image, 
  index, 
  onRemove, 
  onUpload, 
  onUrlAdd,
  isEmpty 
}: { 
  image?: string; 
  index: number;
  onRemove: (index: number) => void;
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
  } = useSortable({ id: image || `empty-${index}`, disabled: isEmpty });

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
          <ImageIcon className="w-8 h-8 text-muted-foreground/40" />
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
          src={image!} 
          alt={`Imagem ${index + 1}`} 
          className="w-full h-full object-cover"
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
        onClick={() => onRemove(index)}
      >
        <X className="w-3 h-3" />
      </Button>
    </div>
  );
}

export function ProjectCarouselEditor({ projectId, carouselImages, onUpdate }: ProjectCarouselEditorProps) {
  const [images, setImages] = useState<string[]>(carouselImages || []);
  const [uploading, setUploading] = useState(false);
  const [galleryTitle, setGalleryTitle] = useState("Galeria de Imagens");
  const [loadingTitle, setLoadingTitle] = useState(false);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  const MIN_SLOTS = 1; // Apenas 1 slot vazio por padrão
  
  // Carregar imagens da galeria da tabela settings
  useEffect(() => {
    const fetchCarouselImages = async () => {
      const settingKey = `project_carousel_${projectId}`;
      const { data } = await supabase
        .from("settings")
        .select("value")
        .eq("key", settingKey)
        .maybeSingle();
      
      if (data?.value && (data.value as any).images) {
        const loadedImages = (data.value as any).images as string[];
        console.log("📥 Imagens carregadas da tabela settings:", loadedImages);
        setImages(loadedImages);
      }
    };
    fetchCarouselImages();
  }, [projectId]);
  
  // Carregar título da galeria
  useEffect(() => {
    const fetchGalleryTitle = async () => {
      const { data } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "gallery_title")
        .maybeSingle();
      
      if (data?.value) {
        setGalleryTitle((data.value as GalleryTitleContent).title || "Galeria de Imagens");
      }
    };
    fetchGalleryTitle();
  }, []);
  
  // Salvar título da galeria
  const handleSaveTitle = async () => {
    setLoadingTitle(true);
    try {
      const content: GalleryTitleContent = { title: galleryTitle };
      
      const { data: existing } = await supabase
        .from("settings")
        .select("id")
        .eq("key", "gallery_title")
        .maybeSingle();

      if (existing) {
        await supabase
          .from("settings")
          .update({ value: content })
          .eq("key", "gallery_title");
      } else {
        await supabase
          .from("settings")
          .insert({ key: "gallery_title", value: content });
      }
      
      toast.success("Título atualizado!");
    } catch (error) {
      console.error("Erro ao salvar título:", error);
      toast.error("Erro ao salvar título");
    } finally {
      setLoadingTitle(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleUpload = async (file: File, slotIndex: number) => {
    console.log("📤 [UPLOAD] Iniciando upload de imagem:", {
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      fileType: file.type,
      projectId: projectId,
      slotIndex: slotIndex,
      currentImagesCount: images.length
    });

    if (!file.type.startsWith("image/")) {
      console.error("❌ [UPLOAD] Tipo de arquivo inválido:", file.type);
      toast.error("Apenas imagens são aceitas");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      console.error("❌ [UPLOAD] Arquivo muito grande:", `${(file.size / 1024 / 1024).toFixed(2)} MB`);
      toast.error("Imagem deve ter no máximo 5MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `carousel-${projectId}-${Date.now()}.${fileExt}`;

      console.log("☁️ [STORAGE] Fazendo upload para Supabase Storage:", {
        bucket: "project-media",
        fileName: fileName,
        fullPath: `project-media/${fileName}`
      });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("project-media")
        .upload(fileName, file);

      console.log("☁️ [STORAGE] Resultado do upload:", { uploadData, uploadError });

      if (uploadError) {
        console.error("❌ [STORAGE] Erro no upload para bucket:", uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("project-media")
        .getPublicUrl(fileName);

      console.log("🔗 [STORAGE] URL pública gerada:", publicUrl);

      const updatedImages = [...images, publicUrl];
      console.log("📋 [STATE] Array de imagens atualizado:", {
        before: images.length,
        after: updatedImages.length,
        newImage: publicUrl,
        allImages: updatedImages
      });
      
      setImages(updatedImages);
      
      // NOVA SOLUÇÃO: Salvar na tabela settings ao invés da coluna carousel_images
      console.log("💾 Salvando na tabela settings:", {
        key: `project_carousel_${projectId}`,
        imageCount: updatedImages.length
      });

      const settingKey = `project_carousel_${projectId}`;
      const { data: existing } = await supabase
        .from("settings")
        .select("id")
        .eq("key", settingKey)
        .maybeSingle();

      if (existing) {
        const { error: updateError } = await supabase
          .from("settings")
          .update({ value: { images: updatedImages } })
          .eq("key", settingKey);
        
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("settings")
          .insert({ key: settingKey, value: { images: updatedImages } });
        
        if (insertError) throw insertError;
      }

      console.log("✅ [SETTINGS] Imagens salvas com sucesso na tabela settings!");

      onUpdate(updatedImages);
      toast.success("Imagem adicionada e salva!");
    } catch (error: any) {
      console.error("❌ Erro detalhado no upload:", error);
      toast.error(`Erro ao salvar: ${error?.message || "Veja o console (F12)"}`);
    } finally {
      setUploading(false);
    }
  };

  const handleUrlAdd = async (url: string, slotIndex: number) => {
    const updatedImages = [...images, url];
    setImages(updatedImages);
    
    // Auto-salvar após adicionar URL (usando settings)
    try {
      const settingKey = `project_carousel_${projectId}`;
      const { data: existing } = await supabase
        .from("settings")
        .select("id")
        .eq("key", settingKey)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("settings")
          .update({ value: { images: updatedImages } })
          .eq("key", settingKey);
      } else {
        await supabase
          .from("settings")
          .insert({ key: settingKey, value: { images: updatedImages } });
      }

      onUpdate(updatedImages);
      toast.success("Imagem adicionada e salva!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar imagem");
    }
  };

  const handleRemove = async (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    
    // Auto-salvar após remover (usando settings)
    try {
      const settingKey = `project_carousel_${projectId}`;
      await supabase
        .from("settings")
        .update({ value: { images: updatedImages } })
        .eq("key", settingKey);

      onUpdate(updatedImages);
      toast.success("Imagem removida e salva!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.indexOf(active.id as string);
    const newIndex = images.indexOf(over.id as string);

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedImages = arrayMove(images, oldIndex, newIndex);
    setImages(reorderedImages);
    
    // Auto-salvar após reordenar (usando settings)
    try {
      const settingKey = `project_carousel_${projectId}`;
      await supabase
        .from("settings")
        .update({ value: { images: reorderedImages } })
        .eq("key", settingKey);

      onUpdate(reorderedImages);
      toast.success("Ordem atualizada e salva!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar ordem");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Carrossel de Imagens
        </CardTitle>
        <CardDescription>
          Adicione imagens que aparecerão em um carrossel na página do projeto
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Título do Card */}
        <div className="space-y-2">
          <Label>Título do Card (aparece na página do projeto)</Label>
          <div className="flex gap-2">
            <Input
              value={galleryTitle}
              onChange={(e) => setGalleryTitle(e.target.value)}
              placeholder="Ex: Galeria de Imagens"
            />
            <Button 
              onClick={handleSaveTitle} 
              disabled={loadingTitle}
              variant="secondary"
            >
              {loadingTitle ? "Salvando..." : "Salvar Título"}
            </Button>
          </div>
        </div>

        {/* Grid de Slots */}
        <div className="space-y-3">
          <Label>Imagens ({images.length} adicionadas)</Label>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={images}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex flex-wrap gap-4 p-4 bg-muted/20 rounded-lg min-h-[160px]">
                {/* Slots preenchidos */}
                {images.map((image, index) => (
                  <SortableImageSlot
                    key={image}
                    image={image}
                    index={index}
                    onRemove={handleRemove}
                    onUpload={handleUpload}
                    onUrlAdd={handleUrlAdd}
                    isEmpty={false}
                  />
                ))}

                {/* Slots vazios (até completar mínimo de 1) */}
                {Array.from({ length: Math.max(0, MIN_SLOTS - images.length) }).map((_, i) => (
                  <SortableImageSlot
                    key={`empty-${i}`}
                    index={images.length + i}
                    onRemove={handleRemove}
                    onUpload={handleUpload}
                    onUrlAdd={handleUrlAdd}
                    isEmpty={true}
                  />
                ))}

                {/* Botão adicionar mais (sempre visível) */}
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
                      handleUpload(file, images.length);
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
            💡 Arraste as imagens para reordenar. Clique no slot vazio para adicionar. Tudo é salvo automaticamente!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
