import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, Plus, X, GripVertical, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AvatarCropDialog } from "@/components/AvatarCropDialog";
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

export type ImageFit = "cover" | "contain" | "fill";

export interface CarouselImageItem {
  url: string;
  fit?: ImageFit;
}

interface ProjectCarouselEditorProps {
  projectId: string;
  carouselImages: string[];
  onUpdate: (images: string[]) => void;
}

interface GalleryTitleContent {
  title: string;
}

const FIT_OPTIONS: { value: ImageFit; label: string }[] = [
  { value: "cover", label: "Cobrir" },
  { value: "contain", label: "Conter" },
  { value: "fill", label: "Esticar" },
];

// Componente de Slot Sortável
function SortableImageSlot({
  image,
  index,
  onRemove,
  onUpload,
  onUrlAdd,
  onFitChange,
  onEdit,
  isEmpty,
}: {
  image?: CarouselImageItem;
  index: number;
  onRemove: (index: number) => void;
  onUpload: (file: File, slotIndex: number) => void;
  onUrlAdd: (url: string, slotIndex: number) => void;
  onFitChange: (index: number, fit: ImageFit) => void;
  onEdit: (index: number) => void;
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
  } = useSortable({ id: image?.url || `empty-${index}`, disabled: isEmpty });

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

  const currentFit: ImageFit = image?.fit || "cover";

  // Slot preenchido
  return (
    <div ref={setNodeRef} style={style} className="relative group flex flex-col gap-1">
      {/* Imagem com overlay de edição centralizado */}
      <div className="w-40 h-28 border border-border rounded-lg overflow-hidden bg-card relative">
        <img
          src={image!.url}
          alt={`Imagem ${index + 1}`}
          className="w-full h-full"
          style={{ objectFit: currentFit }}
        />

        {/* Overlay escurecido + botão "Editar" centralizado */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors pointer-events-none flex items-center justify-center">
          <button
            className="pointer-events-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 bg-background/90 backdrop-blur-sm text-foreground text-xs rounded-lg border border-border shadow-md hover:bg-accent/80"
            onClick={(e) => { e.stopPropagation(); onEdit(index); }}
            title="Ajustar dimensões"
          >
            <Pencil className="w-3 h-3" />
            Editar
          </button>
        </div>
      </div>

      {/* Grip para arrastar — z-10 para ficar acima do overlay */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 p-1 bg-background/80 rounded opacity-0 group-hover:opacity-100 cursor-grab transition-opacity z-10"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Botão remover — z-10 para ficar acima do overlay */}
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-1 right-1 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        onClick={() => onRemove(index)}
      >
        <X className="w-3 h-3" />
      </Button>

      {/* Seletor de fit */}
      <div className="flex gap-0.5 justify-center">
        {FIT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onFitChange(index, opt.value)}
            className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
              currentFit === opt.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted text-muted-foreground border-border hover:bg-accent/50"
            }`}
            title={opt.label}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ProjectCarouselEditor({ projectId, carouselImages, onUpdate }: ProjectCarouselEditorProps) {
  const [images, setImages] = useState<CarouselImageItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [galleryTitle, setGalleryTitle] = useState("Galeria de Imagens");
  const [loadingTitle, setLoadingTitle] = useState(false);
  const addMoreInputRef = useRef<HTMLInputElement>(null);

  // Crop dialog state
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>("");
  // null = modo append (nova imagem); number = modo replace (editar existente)
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const MIN_SLOTS = 1; // Apenas 1 slot vazio por padrão

  // Normaliza um item que pode ser string ou objeto
  const normalizeItem = (item: unknown): CarouselImageItem => {
    if (typeof item === "string") return { url: item, fit: "cover" };
    if (item && typeof (item as CarouselImageItem).url === "string") return item as CarouselImageItem;
    return { url: String(item), fit: "cover" };
  };

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
        const raw = (data.value as any).images as unknown[];
        const loaded = raw.map(normalizeItem);
        console.log("📥 Imagens carregadas da tabela settings:", loaded);
        setImages(loaded);
      } else if (carouselImages && carouselImages.length > 0) {
        // Fallback para prop (dados antigos em string[])
        setImages(carouselImages.map((url) => ({ url, fit: "cover" as ImageFit })));
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

  // Persiste no Supabase Settings
  const persistImages = async (updatedImages: CarouselImageItem[]) => {
    const settingKey = `project_carousel_${projectId}`;
    const { data: existing } = await supabase
      .from("settings")
      .select("id")
      .eq("key", settingKey)
      .maybeSingle();

    const value = { images: updatedImages };

    if (existing) {
      const { error } = await supabase
        .from("settings")
        .update({ value })
        .eq("key", settingKey);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("settings")
        .insert({ key: settingKey, value });
      if (error) throw error;
    }

    // Notifica o componente pai com apenas as URLs (compatibilidade)
    onUpdate(updatedImages.map((img) => img.url));
  };

  // Faz o upload de um Blob já processado (pós-crop ou direto)
  const uploadBlob = async (blob: Blob) => {
    setUploading(true);
    try {
      const fileName = `carousel-${projectId}-${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("project-media")
        .upload(fileName, blob, { contentType: "image/jpeg" });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("project-media")
        .getPublicUrl(fileName);

      const newItem: CarouselImageItem = { url: publicUrl, fit: "cover" };
      const updatedImages = [...images, newItem];
      setImages(updatedImages);
      await persistImages(updatedImages);
      toast.success("Imagem adicionada e salva!");
    } catch (error: any) {
      console.error("❌ Erro no upload:", error);
      toast.error(`Erro ao salvar: ${error?.message || "Veja o console (F12)"}`);
    } finally {
      setUploading(false);
    }
  };

  // Abre o crop dialog antes do upload (modo append — nova imagem)
  const handleUpload = async (file: File, slotIndex: number) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Apenas imagens são aceitas");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem deve ter no máximo 5MB");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setCropImageSrc(objectUrl);
    setEditingIndex(null); // modo append
    setCropDialogOpen(true);
  };

  // Abre o crop dialog para reeditar uma imagem já existente (modo replace)
  const handleEditSlot = (index: number) => {
    const img = images[index];
    if (!img) return;
    setCropImageSrc(img.url);
    setEditingIndex(index);
    setCropDialogOpen(true);
  };

  // Callback chamado quando o crop é confirmado
  const handleCropComplete = async (blob: Blob) => {
    if (cropImageSrc.startsWith("blob:")) {
      URL.revokeObjectURL(cropImageSrc);
    }
    setCropImageSrc("");

    if (editingIndex !== null) {
      await replaceImageBlob(editingIndex, blob);
      setEditingIndex(null);
    } else {
      await uploadBlob(blob);
    }
  };

  // Substitui uma imagem existente por um novo blob recortado
  const replaceImageBlob = async (index: number, blob: Blob) => {
    setUploading(true);
    try {
      const fileName = `carousel-${projectId}-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("project-media")
        .upload(fileName, blob, { contentType: "image/jpeg" });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("project-media")
        .getPublicUrl(fileName);

      const updatedImages = images.map((img, i) =>
        i === index ? { ...img, url: publicUrl } : img
      );
      setImages(updatedImages);
      await persistImages(updatedImages);
      toast.success("Imagem atualizada!");
    } catch (error: any) {
      console.error("❌ Erro ao substituir imagem:", error);
      toast.error(`Erro ao salvar: ${error?.message || "Veja o console (F12)"}`);
    } finally {
      setUploading(false);
    }
  };

  // Quando o crop dialog é fechado/cancelado
  const handleCropOpenChange = (open: boolean) => {
    if (!open) {
      if (cropImageSrc.startsWith("blob:")) URL.revokeObjectURL(cropImageSrc);
      setCropImageSrc("");
      setEditingIndex(null);
    }
    setCropDialogOpen(open);
  };

  const handleUrlAdd = async (url: string, slotIndex: number) => {
    const newItem: CarouselImageItem = { url, fit: "cover" };
    const updatedImages = [...images, newItem];
    setImages(updatedImages);
    try {
      await persistImages(updatedImages);
      toast.success("Imagem adicionada e salva!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar imagem");
    }
  };

  const handleRemove = async (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    try {
      await persistImages(updatedImages);
      toast.success("Imagem removida e salva!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar");
    }
  };

  const handleFitChange = async (index: number, fit: ImageFit) => {
    const updatedImages = images.map((img, i) =>
      i === index ? { ...img, fit } : img
    );
    setImages(updatedImages);
    try {
      await persistImages(updatedImages);
      toast.success("Dimensionamento atualizado!");
    } catch (error) {
      console.error("Erro ao salvar fit:", error);
      toast.error("Erro ao salvar dimensionamento");
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((img) => img.url === active.id);
    const newIndex = images.findIndex((img) => img.url === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedImages = arrayMove(images, oldIndex, newIndex);
    setImages(reorderedImages);

    try {
      await persistImages(reorderedImages);
      toast.success("Ordem atualizada e salva!");
    } catch (error) {
      console.error("Erro ao salvar ordem:", error);
      toast.error("Erro ao salvar ordem");
    }
  };

  return (
    <>
    {/* Crop Dialog — abre antes de fazer upload */}
    {cropImageSrc && (
      <AvatarCropDialog
        open={cropDialogOpen}
        onOpenChange={handleCropOpenChange}
        imageSrc={cropImageSrc}
        onCropComplete={handleCropComplete}
      />
    )}

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Carrossel de Imagens
        </CardTitle>
        <CardDescription>
          Adicione imagens que aparecerão em um carrossel na página do projeto. Use os botões <strong>Cobrir</strong>, <strong>Conter</strong> ou <strong>Esticar</strong> para ajustar o dimensionamento de cada imagem. Ao adicionar, um recorte quadrado será solicitado.
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
              items={images.map((img) => img.url)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex flex-wrap gap-4 p-4 bg-muted/20 rounded-lg min-h-[160px]">
                {/* Slots preenchidos */}
                {images.map((image, index) => (
                  <SortableImageSlot
                    key={image.url}
                    image={image}
                    index={index}
                    onRemove={handleRemove}
                    onUpload={handleUpload}
                    onUrlAdd={handleUrlAdd}
                    onFitChange={handleFitChange}
                    onEdit={handleEditSlot}
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
                    onFitChange={handleFitChange}
                    onEdit={handleEditSlot}
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
                      e.target.value = "";
                    }
                  }}
                  className="hidden"
                />
              </div>
            </SortableContext>
          </DndContext>

          <p className="text-xs text-muted-foreground">
            💡 Arraste para reordenar. Clique no slot vazio para adicionar. Use <strong>Cobrir</strong> (recorta), <strong>Conter</strong> (exibe inteiro) ou <strong>Esticar</strong> para dimensionar. Tudo é salvo automaticamente!
          </p>
        </div>
      </CardContent>
    </Card>
    </>
  );
}
