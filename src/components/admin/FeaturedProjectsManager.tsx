import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Trash2, Plus, GripVertical, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  title: string;
  project_type: string;
  location: string | null;
  image_url: string | null;
  featured_on_homepage: boolean;
  status: string;
}

interface FeaturedItem {
  id: string;
  type: "real" | "example";
  title: string;
  subtitle: string;
  image_url?: string | null;
  projectId?: string;
  visible: boolean;
}

// Example projects data - IDs must match PortoIdeiasCardsManager
const EXAMPLE_PROJECTS = [
  { id: "exemplo-cultura-legado", title: "Sua Cultura, Seu Legado", subtitle: "Audiovisual • Rio de Janeiro" },
  { id: "exemplo-investidores-aguardam", title: "Investidores Aguardam", subtitle: "Produção Cultural • São Paulo" },
  { id: "exemplo-historias-sucesso", title: "Histórias de Sucesso", subtitle: "Teatro • São Paulo" },
  { id: "exemplo-recursos-disponiveis", title: "Recursos Disponíveis", subtitle: "Música • Belo Horizonte" },
  { id: "exemplo-novo-projeto", title: "Adicione seu Projeto", subtitle: "Seu projeto aqui" },
];

interface SortableItemProps {
  item: FeaturedItem;
  index: number;
  onRemove: (id: string, type: "real" | "example") => void;
  onToggleVisibility: (id: string) => void;
}

function SortableItem({ item, index, onRemove, onToggleVisibility }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-3 border rounded-lg transition-all group ${
        item.visible 
          ? "border-primary/30 bg-primary/5 hover:bg-primary/10" 
          : "border-muted bg-muted/30 opacity-60"
      } ${isDragging ? "shadow-lg ring-2 ring-primary" : ""}`}
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none p-1 hover:bg-muted rounded"
          title="Arraste para reordenar"
        >
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </button>
        
        <span className={`text-sm font-medium w-6 ${item.visible ? "text-primary" : "text-muted-foreground"}`}>
          {item.visible ? index + 1 + "." : "-"}
        </span>
        
        {item.type === "real" && item.image_url ? (
          <img 
            src={item.image_url} 
            alt={item.title}
            className="w-12 h-12 rounded object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Star className="w-6 h-6 text-primary/50" />
          </div>
        )}
        
        <div>
          <h4 className="font-medium">{item.title}</h4>
          <p className="text-sm text-muted-foreground">{item.subtitle}</p>
        </div>
        
        <Badge variant={item.type === "real" ? "default" : "secondary"} className="ml-2">
          {item.type === "real" ? "Real" : "Exemplo"}
        </Badge>
        
        {!item.visible && (
          <Badge variant="outline" className="text-xs">Oculto</Badge>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {/* Toggle Visibility */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleVisibility(item.id)}
          className={`opacity-60 group-hover:opacity-100 transition-opacity ${
            item.visible ? "text-primary hover:text-primary" : "text-muted-foreground"
          }`}
          title={item.visible ? "Ocultar dos destaques" : "Mostrar nos destaques"}
        >
          {item.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </Button>
        
        {/* Remove */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(item.id, item.type)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 opacity-60 group-hover:opacity-100 transition-opacity"
          title="Remover da lista"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function DragOverlayItem({ item }: { item: FeaturedItem }) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-xl ring-2 ring-primary border-primary">
      <div className="flex items-center gap-4">
        <GripVertical className="w-5 h-5 text-primary" />
        <span className="text-sm font-medium w-6 text-primary">•</span>
        {item.type === "real" && item.image_url ? (
          <img 
            src={item.image_url} 
            alt={item.title}
            className="w-12 h-12 rounded object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Star className="w-6 h-6 text-primary/50" />
          </div>
        )}
        <div>
          <h4 className="font-medium">{item.title}</h4>
          <p className="text-sm text-muted-foreground">{item.subtitle}</p>
        </div>
        <Badge variant={item.type === "real" ? "default" : "secondary"}>
          {item.type === "real" ? "Real" : "Exemplo"}
        </Badge>
      </div>
    </div>
  );
}

interface FeaturedProjectsManagerProps {
  projects: Project[];
  onProjectUpdate: () => void;
}

export function FeaturedProjectsManager({ projects, onProjectUpdate }: FeaturedProjectsManagerProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<FeaturedItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load items from settings and projects
  useEffect(() => {
    loadItems();
  }, [projects]);

  const loadItems = async () => {
    try {
      // Get saved order from settings
      const { data: settingsData } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "featured_projects_order")
        .maybeSingle();

      const savedOrder: string[] = settingsData?.value as string[] || [];
      const savedVisibility: Record<string, boolean> = {};
      
      // Get visibility settings
      const { data: visibilityData } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "featured_projects_visibility")
        .maybeSingle();
      
      if (visibilityData?.value) {
        Object.assign(savedVisibility, visibilityData.value);
      }

      // Get featured cards settings from PortoIdeiasCardsManager
      const { data: featuredCardsData } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "porto_ideias_featured_cards")
        .maybeSingle();
      
      const featuredCards: Record<string, boolean> = featuredCardsData?.value as Record<string, boolean> || {};

      // Create items from real featured projects
      const realProjects = projects.filter(p => p.featured_on_homepage && p.status === "approved");
      const realItems: FeaturedItem[] = realProjects.map(p => ({
        id: `real-${p.id}`,
        type: "real",
        title: p.title,
        subtitle: `${p.project_type} • ${p.location || "Sem localização"}`,
        image_url: p.image_url,
        projectId: p.id,
        visible: savedVisibility[`real-${p.id}`] !== false, // Default to visible
      }));

      // Create items ONLY from example projects that are featured (starred)
      const exampleItems: FeaturedItem[] = EXAMPLE_PROJECTS
        .filter(ex => featuredCards[ex.id] === true)
        .map(ex => ({
          id: ex.id,
          type: "example",
          title: ex.title,
          subtitle: ex.subtitle,
          visible: savedVisibility[ex.id] !== false, // Default to visible
        }));

      // Combine all items
      let allItems = [...realItems, ...exampleItems];

      // Sort by saved order if exists
      if (savedOrder.length > 0) {
        allItems.sort((a, b) => {
          const indexA = savedOrder.indexOf(a.id);
          const indexB = savedOrder.indexOf(b.id);
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
      }

      setItems(allItems);
    } catch (error) {
      console.error("Error loading featured items:", error);
      // Fallback to empty
      setItems([]);
    }
  };

  const saveOrder = async (newItems: FeaturedItem[]) => {
    setSaving(true);
    try {
      const order = newItems.map(item => item.id);
      const visibility: Record<string, boolean> = {};
      newItems.forEach(item => {
        visibility[item.id] = item.visible;
      });

      // Save order
      await supabase
        .from("settings")
        .upsert({ 
          key: "featured_projects_order", 
          value: order,
          updated_at: new Date().toISOString()
        }, { onConflict: "key" });

      // Save visibility
      await supabase
        .from("settings")
        .upsert({ 
          key: "featured_projects_visibility", 
          value: visibility,
          updated_at: new Date().toISOString()
        }, { onConflict: "key" });

      toast({
        title: "Ordem salva",
        description: "A ordem dos projetos em destaque foi atualizada.",
      });
    } catch (error) {
      console.error("Error saving order:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a ordem dos projetos.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        saveOrder(newItems);
        return newItems;
      });
    }
  };

  const handleToggleVisibility = (id: string) => {
    setItems((items) => {
      const newItems = items.map(item => 
        item.id === id ? { ...item, visible: !item.visible } : item
      );
      saveOrder(newItems);
      return newItems;
    });
  };

  const handleRemove = async (id: string, type: "real" | "example") => {
    if (type === "real") {
      // Remove from featured in database
      const projectId = id.replace("real-", "");
      try {
        await supabase
          .from("projects")
          .update({ featured_on_homepage: false })
          .eq("id", projectId);
        
        onProjectUpdate();
        toast({
          title: "Projeto removido",
          description: "O projeto foi removido dos destaques.",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível remover o projeto.",
          variant: "destructive",
        });
      }
    } else {
      // Just hide the example project
      handleToggleVisibility(id);
    }
  };

  const handleAddExample = (exampleId: string) => {
    setItems((items) => {
      const newItems = items.map(item => 
        item.id === exampleId ? { ...item, visible: true } : item
      );
      saveOrder(newItems);
      return newItems;
    });
  };

  const activeItem = items.find((item) => item.id === activeId);
  const visibleItems = items.filter(item => item.visible);
  const hiddenExamples = items.filter(item => item.type === "example" && !item.visible);
  const availableProjects = projects.filter(p => p.status === "approved" && !p.featured_on_homepage);

  const handleAddRealProject = async (projectId: string) => {
    try {
      await supabase
        .from("projects")
        .update({ featured_on_homepage: true })
        .eq("id", projectId);
      
      onProjectUpdate();
      toast({
        title: "Projeto adicionado",
        description: "O projeto foi adicionado aos destaques.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o projeto.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          Projetos em Destaque na Homepage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Arraste para reordenar. Os 3 primeiros projetos visíveis serão exibidos na homepage.
        </p>

        {/* Visible count indicator */}
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
          <Eye className="w-4 h-4 text-primary" />
          <span className="text-sm">
            <strong>{visibleItems.slice(0, 3).length}</strong> de 3 slots preenchidos
          </span>
          {visibleItems.length > 3 && (
            <Badge variant="outline" className="ml-2 text-xs">
              +{visibleItems.length - 3} na fila
            </Badge>
          )}
        </div>

        {/* Sortable list */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item, index) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  index={visibleItems.findIndex(vi => vi.id === item.id)}
                  onRemove={handleRemove}
                  onToggleVisibility={handleToggleVisibility}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {activeItem ? <DragOverlayItem item={activeItem} /> : null}
          </DragOverlay>
        </DndContext>

        {/* Hidden examples that can be re-added */}
        {hiddenExamples.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">
              Projetos de exemplo ocultos
            </h4>
            <div className="flex flex-wrap gap-2">
              {hiddenExamples.map((item) => (
                <Button
                  key={item.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddExample(item.id)}
                  className="opacity-70 hover:opacity-100"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {item.title}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Available real projects to add */}
        {availableProjects.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="font-medium text-sm text-muted-foreground mb-2">
              Projetos aprovados disponíveis para destacar
            </h4>
            <div className="space-y-2">
              {availableProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    {project.image_url && (
                      <img 
                        src={project.image_url} 
                        alt={project.title}
                        className="w-12 h-12 rounded object-cover"
                      />
                    )}
                    <div>
                      <h4 className="font-medium">{project.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {project.project_type} • {project.location || "Sem localização"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddRealProject(project.id)}
                    className="opacity-60 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Adicionar
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {saving && (
          <p className="text-xs text-muted-foreground text-center animate-pulse">
            Salvando...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
