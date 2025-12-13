import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SortableProjectCard } from "./SortableProjectCard";
import { ArrowRight, Anchor, GripVertical, Shield } from "lucide-react";

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
  const [orderedProjects, setOrderedProjects] = useState<Project[]>(projects);
  const [activeId, setActiveId] = useState<string | null>(null);

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

  // Load saved order and apply to projects
  useEffect(() => {
    const loadOrder = async () => {
      try {
        const { data } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "porto_ideias_order")
          .single();

        if (data?.value && Array.isArray(data.value)) {
          const savedOrder = data.value as string[];
          const sorted = [...projects].sort((a, b) => {
            const indexA = savedOrder.indexOf(a.id);
            const indexB = savedOrder.indexOf(b.id);
            if (indexA === -1 && indexB === -1) return 0;
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            return indexA - indexB;
          });
          setOrderedProjects(sorted);
        } else {
          setOrderedProjects(projects);
        }
      } catch {
        setOrderedProjects(projects);
      }
    };

    loadOrder();
  }, [projects]);

  const saveOrder = async (newProjects: Project[]) => {
    try {
      const order = newProjects.map(p => p.id);
      await supabase
        .from("settings")
        .upsert({ 
          key: "porto_ideias_order", 
          value: order,
          updated_at: new Date().toISOString()
        }, { onConflict: "key" });

      toast({
        title: "Ordem salva",
        description: "A ordem dos projetos foi atualizada.",
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
      setOrderedProjects((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        saveOrder(newItems);
        return newItems;
      });
    }
  };

  const activeProject = orderedProjects.find((p) => p.id === activeId);
  const displayedProjects = orderedProjects.slice(0, displaySlots);
  const remainingSlots = displaySlots - displayedProjects.length;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(event) => setActiveId(event.active.id as string)}
      onDragEnd={handleDragEnd}
    >
      {/* Admin Mode Indicator */}
      {isAdmin && (
        <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-lg flex items-center gap-2 text-sm">
          <GripVertical className="w-4 h-4 text-primary" />
          <span className="text-primary font-medium">Modo Admin:</span>
          <span className="text-muted-foreground">Arraste os cards para reordenar os projetos</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <SortableContext items={displayedProjects.map(p => p.id)} strategy={rectSortingStrategy}>
          {displayedProjects.map((project, index) => (
            <SortableProjectCard
              key={project.id}
              project={project}
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

        {/* Example Cards - fill remaining slots */}
        {remainingSlots > 0 && exampleProjects.slice(0, remainingSlots).map((example, index) => {
          const cardIndex = displayedProjects.length + index;
          
          return (
            <Link 
              key={example.id}
              to={example.link}
              className="block group"
              style={{ 
                opacity: isInView ? 1 : 0,
                transform: isInView ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.6s ease-out ${cardIndex * 100}ms`
              }}
            >
              <div className={`card-solid bg-card ${example.borderClass || 'border border-border'} rounded-2xl overflow-hidden h-full shadow-2xl hover:-translate-y-2 transition-transform duration-300`}>
                <div className={`relative h-48 bg-gradient-to-br ${example.gradientClass || 'from-accent/20 to-primary/20'} flex items-center justify-center`}>
                  <div className={`w-20 h-20 rounded-full ${example.emojiBgClass || 'bg-accent/20'} flex items-center justify-center`}>
                    <span className={`text-4xl ${example.emojiAnimate ? 'animate-pulse' : ''}`}>{example.emoji}</span>
                  </div>
                </div>
                <div className="p-5">
                  <Badge 
                    variant={example.badgeVariant} 
                    className={`mb-3 rounded-full ${example.badgeClass || ''}`}
                  >
                    {example.badge}
                  </Badge>
                  <h3 className="text-lg font-serif font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {example.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {example.synopsis}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    {example.footerContent}
                    <span className="text-sm font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {example.footerAction || "Ver Exemplo"}
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        {/* CTA Card - Always last */}
        <Link 
          to="/submit"
          className="block group"
          style={{ 
            opacity: isInView ? 1 : 0,
            transform: isInView ? 'translateY(0)' : 'translateY(20px)',
            transition: `all 0.6s ease-out ${(displayedProjects.length + Math.min(remainingSlots, exampleProjects.length)) * 100}ms`
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
        {activeProject ? (
          <div className="card-solid bg-card border-2 border-primary rounded-2xl overflow-hidden shadow-2xl ring-4 ring-primary/30 rotate-2 scale-105">
            <div className="relative overflow-hidden h-48">
              {activeProject.image_url ? (
                <img
                  src={activeProject.image_url}
                  alt={activeProject.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <span className="text-4xl font-handwritten text-primary-foreground">{activeProject.title.charAt(0)}</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg text-foreground">{activeProject.title}</h3>
              <p className="text-sm text-muted-foreground">{activeProject.project_type}</p>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
