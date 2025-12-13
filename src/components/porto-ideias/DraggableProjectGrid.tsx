import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, Anchor, GripVertical, Shield, MapPin } from "lucide-react";

interface Project {
  id: string;
  title: string;
  synopsis: string;
  project_type: string;
  image_url: string | null;
  location: string | null;
  categorias_tags: string[] | null;
  responsavel_nome: string | null;
  valor_sugerido: number | null;
  budget: string | null;
  has_incentive_law: boolean;
  incentive_law_details: string | null;
  stage: string | null;
}

interface ExampleProject {
  id: string;
  title: string;
  synopsis: string;
  emoji: string;
  badge: string;
  badgeVariant: "default" | "secondary" | "outline";
  link: string;
  gradientClass?: string;
  emojiBgClass?: string;
  borderClass?: string;
  badgeClass?: string;
  emojiAnimate?: boolean;
  footerContent: React.ReactNode;
  footerAction?: string;
}

// Unified item for sorting
interface SortableItem {
  id: string;
  type: "real" | "example";
  data: Project | ExampleProject;
}

interface SortableCardProps {
  item: SortableItem;
  index: number;
  isInView: boolean;
  isAdmin: boolean;
  formatBudget: (value: number | null) => string;
  getBudgetRange: (value: number | null) => { label: string; color: string };
  getStageInfo: (stage: string | null) => { label: string; color: string };
  getInitials: (name: string | null) => string;
}

function SortableCard({
  item,
  index,
  isInView,
  isAdmin,
  formatBudget,
  getBudgetRange,
  getStageInfo,
  getInitials,
}: SortableCardProps) {
  const navigate = useNavigate();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !isAdmin });

  const pointerDownTime = useRef<number>(0);
  const wasDragging = useRef<boolean>(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : isInView ? 1 : 0,
    zIndex: isDragging ? 1000 : 1,
  };

  // Track if drag started - reset on each render cycle
  useEffect(() => {
    if (isDragging) {
      wasDragging.current = true;
      console.log('[DnD] Drag started for:', item.id);
    }
  }, [isDragging, item.id]);

  const handleMouseDown = () => {
    pointerDownTime.current = Date.now();
    wasDragging.current = false;
    console.log('[DnD] Mouse down at:', pointerDownTime.current, 'isAdmin:', isAdmin);
  };

  const handleClick = (e: React.MouseEvent, targetUrl: string) => {
    const holdDuration = Date.now() - pointerDownTime.current;
    console.log('[DnD] Click handler - wasDragging:', wasDragging.current, 'holdDuration:', holdDuration, 'isAdmin:', isAdmin);
    
    // If drag happened or is happening, prevent navigation
    if (wasDragging.current || isDragging) {
      console.log('[DnD] Preventing navigation - was dragging');
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    // For admin, if held too long (close to drag threshold), don't navigate
    if (isAdmin && holdDuration > 1800) {
      console.log('[DnD] Preventing navigation - held too long');
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    
    console.log('[DnD] Navigating to:', targetUrl);
    navigate(targetUrl);
  };

  if (item.type === "real") {
    const project = item.data as Project;
    const budgetInfo = getBudgetRange(project.valor_sugerido);
    const stageInfo = getStageInfo(project.stage);
    const targetUrl = `/project/${project.id}`;

    return (
      <div
        ref={setNodeRef}
        style={{
          ...style,
          transform: isDragging 
            ? CSS.Transform.toString(transform)
            : isInView ? 'translateY(0)' : 'translateY(20px)',
          transition: isDragging ? transition : `all 0.6s ease-out ${index * 100}ms`,
        }}
        className={`block group relative ${isAdmin ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
        {...(isAdmin ? { ...attributes, ...listeners } : {})}
        onMouseDown={handleMouseDown}
        onClick={(e) => handleClick(e, targetUrl)}
      >
        <div 
          className={`card-solid bg-card border border-border rounded-2xl overflow-hidden shadow-2xl h-full transition-all duration-300 ${
            isDragging ? "ring-2 ring-primary shadow-xl scale-105 rotate-1" : "hover:-translate-y-2"
          }`}
        >
          {/* Admin Drag Indicator */}
          {isAdmin && (
            <div className="absolute top-2 right-2 z-20 p-2 bg-primary/90 backdrop-blur-sm rounded-lg border border-primary shadow-md">
              <GripVertical className="w-5 h-5 text-primary-foreground" />
            </div>
          )}

          {/* Image */}
          <div className="relative overflow-hidden h-48">
            {project.image_url ? (
              <img src={project.image_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-4xl font-handwritten text-primary-foreground">{project.title.charAt(0)}</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 md:p-5">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="rounded-full text-xs">{project.project_type}</Badge>
                <Badge className={`rounded-full text-xs ${budgetInfo.color}`}>{budgetInfo.label}</Badge>
              </div>
              {project.location && (
                <span className="flex items-center text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 mr-1" />{project.location}
                </span>
              )}
            </div>
            <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">{project.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.synopsis}</p>
            <div className="flex items-center justify-between mb-3">
              <span className="font-bold text-foreground">{formatBudget(project.valor_sugerido)}</span>
              <Badge className={`rounded-full text-xs ${stageInfo.color}`}>{stageInfo.label}</Badge>
            </div>
            {project.has_incentive_law && (
              <div className="mb-3">
                <Badge variant="outline" className="rounded-full text-xs border-primary/30 text-primary">
                  <Shield className="w-3 h-3 mr-1" />{project.incentive_law_details || "Lei de Incentivo"}
                </Badge>
              </div>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-xs text-primary-foreground font-semibold">{getInitials(project.responsavel_nome)}</span>
                </div>
                <span className="text-sm text-muted-foreground truncate max-w-[120px]">{project.responsavel_nome || "Produtor Cultural"}</span>
              </div>
              {isAdmin ? (
                <span className="text-xs text-primary">Segure 2s para arrastar</span>
              ) : (
                <span className="text-sm font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver Detalhes <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Example card
  const example = item.data as ExampleProject;
  const targetUrl = example.link;
  
  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        transform: isDragging 
          ? CSS.Transform.toString(transform)
          : isInView ? 'translateY(0)' : 'translateY(20px)',
        transition: isDragging ? transition : `all 0.6s ease-out ${index * 100}ms`,
      }}
      className={`block group relative ${isAdmin ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
      {...(isAdmin ? { ...attributes, ...listeners } : {})}
      onMouseDown={handleMouseDown}
      onClick={(e) => handleClick(e, targetUrl)}
    >
      <div className={`card-solid bg-card ${example.borderClass || 'border border-border'} rounded-2xl overflow-hidden h-full shadow-2xl transition-all duration-300 ${
        isDragging ? "ring-2 ring-primary shadow-xl scale-105 rotate-1" : "hover:-translate-y-2"
      }`}>
        {/* Admin Drag Indicator */}
        {isAdmin && (
          <div className="absolute top-2 right-2 z-20 p-2 bg-primary/90 backdrop-blur-sm rounded-lg border border-primary shadow-md">
            <GripVertical className="w-5 h-5 text-primary-foreground" />
          </div>
        )}
        
        <div className={`relative h-48 bg-gradient-to-br ${example.gradientClass || 'from-accent/20 to-primary/20'} flex items-center justify-center`}>
          <div className={`w-20 h-20 rounded-full ${example.emojiBgClass || 'bg-accent/20'} flex items-center justify-center`}>
            <span className={`text-4xl ${example.emojiAnimate ? 'animate-pulse' : ''}`}>{example.emoji}</span>
          </div>
        </div>
        <div className="p-5">
          <Badge variant={example.badgeVariant} className={`mb-3 rounded-full ${example.badgeClass || ''}`}>
            {example.badge}
          </Badge>
          <h3 className="text-lg font-serif font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
            {example.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{example.synopsis}</p>
          <div className="flex items-center justify-between pt-3 border-t border-border">
            {example.footerContent}
            {isAdmin ? (
              <span className="text-xs text-primary">Segure 2s para arrastar</span>
            ) : (
              <span className="text-sm font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {example.footerAction || "Ver Exemplo"} <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface DraggableProjectGridProps {
  projects: Project[];
  exampleProjects: ExampleProject[];
  displaySlots: number;
  isInView: boolean;
  isAdmin: boolean;
  formatBudget: (value: number | null) => string;
  getBudgetRange: (value: number | null) => { label: string; color: string };
  getStageInfo: (stage: string | null) => { label: string; color: string };
  getInitials: (name: string | null) => string;
}

export function DraggableProjectGrid({
  projects,
  exampleProjects,
  displaySlots,
  isInView,
  isAdmin,
  formatBudget,
  getBudgetRange,
  getStageInfo,
  getInitials,
}: DraggableProjectGridProps) {
  const { toast } = useToast();
  const [sortableItems, setSortableItems] = useState<SortableItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        delay: 2000,
        tolerance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 2000,
        tolerance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Build sortable items from projects and examples
  useEffect(() => {
    const loadOrder = async () => {
      try {
        const { data } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "porto_ideias_unified_order")
          .single();

        const savedOrder = (data?.value as string[]) || [];
        
        // Create unified items
        const realItems: SortableItem[] = projects.map(p => ({
          id: `real-${p.id}`,
          type: "real" as const,
          data: p,
        }));

        const exampleItems: SortableItem[] = exampleProjects.map(e => ({
          id: `example-${e.id}`,
          type: "example" as const,
          data: e,
        }));

        let allItems = [...realItems, ...exampleItems];

        // Sort by saved order
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

        setSortableItems(allItems);
      } catch {
        // Fallback: real first, then examples
        const realItems: SortableItem[] = projects.map(p => ({
          id: `real-${p.id}`,
          type: "real" as const,
          data: p,
        }));

        const exampleItems: SortableItem[] = exampleProjects.map(e => ({
          id: `example-${e.id}`,
          type: "example" as const,
          data: e,
        }));

        setSortableItems([...realItems, ...exampleItems]);
      }
    };

    loadOrder();
  }, [projects, exampleProjects]);

  const saveOrder = async (items: SortableItem[]) => {
    try {
      const order = items.map(item => item.id);
      await supabase
        .from("settings")
        .upsert({ 
          key: "porto_ideias_unified_order", 
          value: order,
          updated_at: new Date().toISOString()
        }, { onConflict: "key" });

      toast({
        title: "Ordem salva",
        description: "A ordem dos cards foi atualizada.",
      });
    } catch (error) {
      console.error("Error saving order:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a ordem.",
        variant: "destructive",
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      setSortableItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        saveOrder(newItems);
        return newItems;
      });
    }
  };

  const activeItem = sortableItems.find((item) => item.id === activeId);
  const displayedItems = sortableItems.slice(0, displaySlots);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(event: DragStartEvent) => {
        console.log('[DnD] DragStart event fired!', event.active.id);
        setActiveId(event.active.id as string);
      }}
      onDragEnd={handleDragEnd}
    >
      {/* Admin Mode Indicator */}
      {isAdmin && (
        <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-lg flex items-center gap-2 text-sm">
          <GripVertical className="w-4 h-4 text-primary" />
          <span className="text-primary font-medium">Modo Admin:</span>
          <span className="text-muted-foreground">Segure 2s para arrastar • Clique para abrir</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <SortableContext items={displayedItems.map(i => i.id)} strategy={rectSortingStrategy}>
          {displayedItems.map((item, index) => (
            <SortableCard
              key={item.id}
              item={item}
              index={index}
              isInView={isInView}
              isAdmin={isAdmin}
              formatBudget={formatBudget}
              getBudgetRange={getBudgetRange}
              getStageInfo={getStageInfo}
              getInitials={getInitials}
            />
          ))}
        </SortableContext>

        {/* CTA Card - Always last */}
        <Link 
          to="/submit"
          className="block group"
          style={{ 
            opacity: isInView ? 1 : 0,
            transform: isInView ? 'translateY(0)' : 'translateY(20px)',
            transition: `all 0.6s ease-out ${displayedItems.length * 100}ms`
          }}
        >
          <div className="card-rainbow border-0 rounded-2xl overflow-hidden h-full shadow-2xl">
            <div className="relative h-48 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                  <Anchor className="w-10 h-10 drop-shadow-lg" />
                </div>
                <div className="text-xl font-semibold drop-shadow-lg">Quer enviar seu projeto?</div>
              </div>
            </div>
            <div className="p-6 bg-black/20 backdrop-blur-sm">
              <h3 className="text-xl font-serif font-bold mb-3 text-white drop-shadow">
                Faça Parte da Nossa Rede
              </h3>
              <p className="text-sm text-white/90 line-clamp-3 mb-4">
                Se você tem uma ideia potente e bem estruturada, envie para nossa curadoria.
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-white/30">
                <span className="text-sm text-white/80 font-medium">✨ Gratuito</span>
                <span className="text-sm font-bold flex items-center gap-2 group-hover:translate-x-2 transition-transform text-white">
                  Enviar projeto
                  <ArrowRight className="w-5 h-5" />
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeItem ? (
          <div className="card-solid bg-card border-2 border-primary rounded-2xl overflow-hidden shadow-2xl ring-4 ring-primary/30 rotate-2 scale-105">
            <div className="h-48 bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-4xl text-primary-foreground">
                {activeItem.type === "real" 
                  ? (activeItem.data as Project).title.charAt(0) 
                  : (activeItem.data as ExampleProject).emoji}
              </span>
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg text-foreground">
                {activeItem.type === "real" 
                  ? (activeItem.data as Project).title 
                  : (activeItem.data as ExampleProject).title}
              </h3>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
