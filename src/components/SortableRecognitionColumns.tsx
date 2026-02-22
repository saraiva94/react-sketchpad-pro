import { useState, useEffect } from "react";
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
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Award, Play, Newspaper, ExternalLink, GripVertical } from "lucide-react";
import { TranslatedText } from "./TranslatedText";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NewsItem {
  title: string;
  linkTitle?: string;
  url?: string;
  date?: string;
}

interface FestivalItem {
  title: string;
  linkTitle?: string;
  url?: string;
  date?: string;
}

interface AwardItem {
  text: string;
  linkTitle?: string;
  url?: string;
}

interface RecognitionTitle {
  text: string;
  emoji: string;
  color: string;
}

interface RecognitionColumn {
  id: string;
  type: "awards" | "festivals" | "media";
  title: RecognitionTitle;
  items: AwardItem[] | FestivalItem[] | NewsItem[];
  icon: React.ElementType;
}

interface SortableRecognitionColumnsProps {
  awards?: AwardItem[];
  festivals?: FestivalItem[];
  news?: NewsItem[];
  projectId: string;
  isAdmin: boolean;
}

// Componente para uma coluna arrastável
function SortableColumn({ 
  column, 
  projectId 
}: { 
  column: RecognitionColumn; 
  projectId: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const IconComponent = column.icon;

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="relative">
      {/* Drag handle */}
      <div 
        {...listeners} 
        className="absolute -top-3 left-1/2 -translate-x-1/2 cursor-grab active:cursor-grabbing bg-primary/10 rounded-full p-1 hover:bg-primary/20 transition-colors"
        title="Arraste para reordenar"
      >
        <GripVertical className="w-4 h-4 text-primary" />
      </div>
      
      <div>
        <h3 
          className="font-semibold text-foreground mb-4 flex items-center gap-2"
          style={{ color: column.title.color }}
        >
          <span className="text-xl">{column.title.emoji}</span>
          {column.title.text}
        </h3>
        <ul className="space-y-3">
          {column.items.map((item, index) => {
            // Extrair dados do item baseado no tipo
            let title = "";
            let linkTitle = "";
            let linkUrl = "";
            let date = "";

            if (column.type === "awards") {
              const award = item as AwardItem;
              title = typeof award === 'string' ? award : award.text || "";
              linkTitle = typeof award === 'object' ? award.linkTitle || "" : "";
              linkUrl = typeof award === 'object' ? award.url || "" : "";
            } else {
              const mediaItem = item as NewsItem | FestivalItem;
              title = mediaItem.title || "";
              linkTitle = mediaItem.linkTitle || "";
              linkUrl = mediaItem.url || "";
              date = mediaItem.date || "";
            }

            if (!title) return null;

            return (
              <li key={index}>
                <div className="block p-3 bg-muted/50 rounded-lg">
                  {column.type === "awards" ? (
                    <h4 className="font-medium text-foreground mb-2">{title}</h4>
                  ) : (
                    <>
                      <TranslatedText 
                        namespace={`${column.type}_${projectId}_${index}`}
                        value={title}
                        as="h4"
                        className="font-medium text-foreground mb-1"
                        showSkeleton={false}
                      />
                      {date && <p className="text-sm text-muted-foreground mb-2">{date}</p>}
                    </>
                  )}
                  {linkTitle && linkUrl && (
                    <a
                      href={linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:text-primary/80 hover:underline inline-flex items-center gap-1"
                    >
                      {linkTitle}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

const DEFAULT_TITLES = {
  awards: { text: "Prêmios e Reconhecimentos", emoji: "🏆", color: "#f59e0b" },
  festivals: { text: "Exibições e Festivais", emoji: "▶", color: "#8b5cf6" },
  media: { text: "Na Mídia", emoji: "📰", color: "#3b82f6" }
};

export function SortableRecognitionColumns({
  awards = [],
  festivals = [],
  news = [],
  projectId,
  isAdmin,
}: SortableRecognitionColumnsProps) {
  const { toast } = useToast();
  const [columnOrder, setColumnOrder] = useState<string[]>(["awards", "festivals", "media"]);
  const [titles, setTitles] = useState(DEFAULT_TITLES);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Buscar ordem salva e títulos personalizados
  useEffect(() => {
    const fetchSettings = async () => {
      // Buscar ordem das colunas
      const { data: orderData } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "recognition_columns_order")
        .maybeSingle();

      if (orderData && orderData.value) {
        setColumnOrder(orderData.value as string[]);
      }

      // Buscar títulos personalizados
      const { data: titlesData } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "recognition_titles")
        .maybeSingle();

      if (titlesData && titlesData.value) {
        setTitles({ ...DEFAULT_TITLES, ...(titlesData.value as typeof DEFAULT_TITLES) });
      }

      setLoading(false);
    };

    fetchSettings();
  }, []);

  // Salvar nova ordem
  const saveColumnOrder = async (newOrder: string[]) => {
    const { data: existing } = await supabase
      .from("settings")
      .select("id")
      .eq("key", "recognition_columns_order")
      .maybeSingle();

    let error;
    if (existing) {
      const result = await supabase
        .from("settings")
        .update({ value: newOrder })
        .eq("key", "recognition_columns_order");
      error = result.error;
    } else {
      const result = await supabase
        .from("settings")
        .insert([{ key: "recognition_columns_order", value: newOrder }]);
      error = result.error;
    }

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar a ordem das colunas.",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setColumnOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Salvar nova ordem se for admin
        if (isAdmin) {
          saveColumnOrder(newOrder);
        }
        
        return newOrder;
      });
    }
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse space-y-3">
            <div className="h-6 bg-muted rounded w-2/3" />
            <div className="h-24 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Criar colunas baseadas nos dados
  const columnsData: RecognitionColumn[] = [
    {
      id: "awards",
      type: "awards",
      title: titles.awards,
      items: awards,
      icon: Award,
    },
    {
      id: "festivals",
      type: "festivals",
      title: titles.festivals,
      items: festivals,
      icon: Play,
    },
    {
      id: "media",
      type: "media",
      title: titles.media,
      items: news,
      icon: Newspaper,
    },
  ];

  // Filtrar colunas com dados e ordenar
  const visibleColumns = columnOrder
    .map((id) => columnsData.find((col) => col.id === id))
    .filter((col): col is RecognitionColumn => col !== undefined && col.items.length > 0);

  if (visibleColumns.length === 0) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={visibleColumns.map((col) => col.id)}
        strategy={horizontalListSortingStrategy}
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
          {visibleColumns.map((column) => (
            <SortableColumn key={column.id} column={column} projectId={projectId} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
