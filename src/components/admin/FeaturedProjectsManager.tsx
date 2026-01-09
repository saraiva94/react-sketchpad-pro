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
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Eye, GripVertical, Loader2, Save, Lightbulb, Rocket } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { translationManager } from "@/lib/translationManager";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  title: string;
  project_type: string;
  location: string | null;
  image_url: string | null;
  featured_on_homepage: boolean;
  show_on_captacao?: boolean;
  show_on_portfolio?: boolean;
  status: string;
}

interface FeaturedItem {
  id: string;
  title: string;
  subtitle: string;
  image_url?: string | null;
  projectId: string;
}

// Sortable card for featured projects (grid layout)
function SortableFeaturedCard({ item, index }: { item: FeaturedItem; index: number }) {
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
      className={`relative border rounded-lg overflow-hidden transition-all cursor-grab active:cursor-grabbing border-primary/30 bg-card hover:border-primary/50 ${
        isDragging ? "shadow-xl ring-2 ring-primary" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      {/* Image */}
      <div className="aspect-square relative">
        {item.image_url ? (
          <img 
            src={item.image_url} 
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Star className="w-10 h-10 text-primary/50" />
          </div>
        )}
        
        {/* Position badge */}
        <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
          {index + 1}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-3">
        <h4 className="font-medium text-sm truncate">{item.title}</h4>
        <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
      </div>
    </div>
  );
}

// Drag overlay for featured cards
function DragOverlayCard({ item }: { item: FeaturedItem }) {
  return (
    <div className="border rounded-lg overflow-hidden bg-card shadow-xl ring-2 ring-primary border-primary w-40">
      <div className="aspect-square relative">
        {item.image_url ? (
          <img 
            src={item.image_url} 
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Star className="w-8 h-8 text-primary/50" />
          </div>
        )}
      </div>
      <div className="p-2">
        <h4 className="font-medium text-sm truncate">{item.title}</h4>
      </div>
    </div>
  );
}

// List item for all projects
function ProjectListItem({ 
  project, 
  index,
  isFeatured, 
  onToggleFeatured,
  onToggleCaptacao,
  onTogglePortfolio,
  isAdding,
  addingProgress,
}: { 
  project: Project; 
  index: number;
  isFeatured: boolean;
  onToggleFeatured: (id: string) => void;
  onToggleCaptacao: (id: string) => void;
  onTogglePortfolio: (id: string) => void;
  isAdding?: boolean;
  addingProgress?: number;
}) {
  const showOnCaptacao = project.show_on_captacao ?? false;
  const showOnPortfolio = project.show_on_portfolio ?? false;

  return (
    <div
      className={`relative flex flex-col border rounded-lg transition-all overflow-hidden ${
        isFeatured 
          ? "border-primary/30 bg-primary/5" 
          : "border-muted bg-muted/10 hover:bg-muted/20"
      }`}
    >
      {/* Progress bar when adding */}
      {isAdding && (
        <div className="absolute inset-x-0 top-0 z-10">
          <div className="bg-primary/10 px-3 py-2">
            <div className="flex items-center gap-2 mb-1">
              <Loader2 className="w-3 h-3 animate-spin text-primary" />
              <span className="text-xs font-medium text-primary">Adicionando...</span>
              <span className="text-xs text-muted-foreground ml-auto">{addingProgress}%</span>
            </div>
            <Progress value={addingProgress} className="h-1.5" />
          </div>
        </div>
      )}
      
      <div className={`flex items-center gap-4 p-3 ${isAdding ? "pt-14" : ""}`}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          
          <span className="text-sm font-medium w-6 text-muted-foreground flex-shrink-0">
            {index + 1}.
          </span>
          
          {project.image_url ? (
            <img 
              src={project.image_url} 
              alt={project.title}
              className="w-12 h-12 rounded object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-primary/50" />
            </div>
          )}
          
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-sm truncate">{project.title}</h4>
            <p className="text-xs text-muted-foreground truncate">
              {project.project_type} • {project.location || "Sem localização"}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Toggle Featured (Homepage) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleFeatured(project.id)}
            disabled={isAdding}
            className={`${
              isFeatured 
                ? "text-amber-500 hover:text-amber-600" 
                : "text-muted-foreground hover:text-amber-500"
            }`}
            title={isFeatured ? "Remover dos destaques" : "Adicionar aos destaques"}
          >
            <Star className={`w-4 h-4 ${isFeatured ? "fill-current" : ""}`} />
          </Button>

          {/* Toggle Captação */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleCaptacao(project.id)}
            disabled={isAdding}
            className={`text-xs px-2 gap-1 ${
              showOnCaptacao 
                ? "text-yellow-500 hover:text-yellow-600 bg-yellow-500/10" 
                : "text-muted-foreground hover:text-yellow-500 hover:bg-yellow-500/10"
            }`}
            title={showOnCaptacao ? "Remover de Captação" : "Adicionar em Captação"}
          >
            <Lightbulb className={`w-3.5 h-3.5 ${showOnCaptacao ? "fill-current" : ""}`} />
            <span className="hidden sm:inline">Captação</span>
          </Button>

          {/* Toggle Portfólio */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onTogglePortfolio(project.id)}
            disabled={isAdding}
            className={`text-xs px-2 gap-1 ${
              showOnPortfolio 
                ? "text-primary hover:text-primary/80 bg-primary/10" 
                : "text-muted-foreground hover:text-primary hover:bg-primary/10"
            }`}
            title={showOnPortfolio ? "Remover do Portfólio" : "Adicionar no Portfólio"}
          >
            <Rocket className={`w-3.5 h-3.5 ${showOnPortfolio ? "fill-current" : ""}`} />
            <span className="hidden sm:inline">Portfólio</span>
          </Button>
          
          {/* View */}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            title="Visualizar projeto"
            asChild
          >
            <a href={`/project/${project.id}`} target="_blank" rel="noopener noreferrer">
              <Eye className="w-4 h-4" />
            </a>
          </Button>
        </div>
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
  const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [addingProjectId, setAddingProjectId] = useState<string | null>(null);
  const [addingProgress, setAddingProgress] = useState(0);
  
  // Section title/subtitle state
  const [sectionTitle, setSectionTitle] = useState("Um Ecossistema de Conexões");
  const [sectionSubtitle, setSectionSubtitle] = useState("Mais que uma vitrine, somos um porto seguro onde as ideias atracam, ganham força e partem para o mundo.");
  const [savingSection, setSavingSection] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load featured items and section settings
  useEffect(() => {
    loadFeaturedItems();
    loadSectionSettings();
  }, [projects]);

  const loadSectionSettings = async () => {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "ecossistema_text")
      .maybeSingle();

    if (data) {
      const settings = data.value as { title?: string; subtitle?: string };
      if (settings.title) setSectionTitle(settings.title);
      if (settings.subtitle) setSectionSubtitle(settings.subtitle);
    }
  };

  const saveSectionSettings = async () => {
    setSavingSection(true);

    const settingsValue = { title: sectionTitle, subtitle: sectionSubtitle };

    const { data: existing } = await supabase
      .from("settings")
      .select("id")
      .eq("key", "ecossistema_text")
      .maybeSingle();

    let error;
    if (existing) {
      const result = await supabase
        .from("settings")
        .update({ value: settingsValue })
        .eq("key", "ecossistema_text");
      error = result.error;
    } else {
      const result = await supabase
        .from("settings")
        .insert({ key: "ecossistema_text", value: settingsValue });
      error = result.error;
    }

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    }

    setSavingSection(false);
  };

  const loadFeaturedItems = async () => {
    try {
      // Get saved order from settings
      const { data: settingsData } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "featured_projects_order")
        .maybeSingle();

      const savedOrder: string[] = settingsData?.value as string[] || [];

      // Create items from real featured projects
      const featuredProjects = projects.filter(p => p.featured_on_homepage && p.status === "approved");
      const items: FeaturedItem[] = featuredProjects.map(p => ({
        id: `real-${p.id}`,
        title: p.title,
        subtitle: `${p.project_type} • ${p.location || "Sem localização"}`,
        image_url: p.image_url,
        projectId: p.id,
      }));

      // Sort by saved order if exists
      if (savedOrder.length > 0) {
        items.sort((a, b) => {
          const indexA = savedOrder.indexOf(a.id);
          const indexB = savedOrder.indexOf(b.id);
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
      }

      setFeaturedItems(items);
    } catch (error) {
      console.error("Error loading featured items:", error);
      setFeaturedItems([]);
    }
  };

  const saveOrder = async (newItems: FeaturedItem[]) => {
    setSaving(true);
    try {
      const order = newItems.map(item => item.id);

      // Save order
      await supabase
        .from("settings")
        .upsert({ 
          key: "featured_projects_order", 
          value: order,
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
      setFeaturedItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        saveOrder(newItems);
        return newItems;
      });
    }
  };

  const warmProjectTranslations = async (projectId: string) => {
    const { data, error } = await supabase
      .from("projects")
      .select("id, title, synopsis, project_type")
      .eq("id", projectId)
      .maybeSingle();

    if (error || !data) {
      throw new Error("Não foi possível carregar o projeto para aquecer traduções.");
    }

    await translationManager.getTranslation(`project_title_${data.id}`, data.title, "en");
    await translationManager.getTranslation(`project_synopsis_${data.id}`, data.synopsis, "en");
    await translationManager.getTranslation(`project_type_${data.id}`, data.project_type, "en");
    await translationManager.getTranslation(`project_title_${data.id}`, data.title, "es");
    await translationManager.getTranslation(`project_synopsis_${data.id}`, data.synopsis, "es");
    await translationManager.getTranslation(`project_type_${data.id}`, data.project_type, "es");
  };

  const handleToggleFeatured = async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    const isCurrentlyFeatured = project.featured_on_homepage;
    
    // Count current featured projects from the projects array (most accurate source)
    const currentFeaturedCount = projects.filter(p => p.featured_on_homepage && p.status === "approved").length;
    
    // Check if we're at max capacity (4) - only when trying to add
    if (!isCurrentlyFeatured && currentFeaturedCount >= 4) {
      toast({
        title: "Limite atingido",
        description: "Você já tem 4 projetos em destaque. Remova um antes de adicionar outro.",
        variant: "destructive",
      });
      return;
    }

    try {
      // If adding a new featured project, show progress bar
      if (!isCurrentlyFeatured) {
        setAddingProjectId(projectId);
        setAddingProgress(0);
        
        // Start progress animation
        const progressInterval = setInterval(() => {
          setAddingProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 15;
          });
        }, 200);

        try {
          await supabase
            .from("projects")
            .update({ featured_on_homepage: true })
            .eq("id", projectId);
          
          setAddingProgress(50);

          await warmProjectTranslations(projectId);
          
          setAddingProgress(100);
          
          // Small delay to show 100% before clearing
          await new Promise(resolve => setTimeout(resolve, 300));
        } finally {
          clearInterval(progressInterval);
          setAddingProjectId(null);
          setAddingProgress(0);
        }
      } else {
        await supabase
          .from("projects")
          .update({ featured_on_homepage: false })
          .eq("id", projectId);
      }

      onProjectUpdate();
    } catch (error) {
      setAddingProjectId(null);
      setAddingProgress(0);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o projeto.",
        variant: "destructive",
      });
    }
  };

  const handleToggleCaptacao = async (projectId: string) => {
    try {
      const project = projects.find(p => p.id === projectId);
      const currentValue = project?.show_on_captacao ?? false;
      
      await supabase
        .from("projects")
        .update({ show_on_captacao: !currentValue })
        .eq("id", projectId);
      
      onProjectUpdate();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o projeto.",
        variant: "destructive",
      });
    }
  };

  const handleTogglePortfolio = async (projectId: string) => {
    try {
      const project = projects.find(p => p.id === projectId);
      const currentValue = project?.show_on_portfolio ?? false;
      
      await supabase
        .from("projects")
        .update({ show_on_portfolio: !currentValue })
        .eq("id", projectId);
      
      onProjectUpdate();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o projeto.",
        variant: "destructive",
      });
    }
  };

  const activeItem = featuredItems.find((item) => item.id === activeId);
  const approvedProjects = projects.filter(p => p.status === "approved");
  const featuredCount = featuredItems.length;
  const queueCount = Math.max(0, featuredCount - 4);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          {sectionTitle || "Projetos em Destaque na Homepage"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Section title/subtitle editor */}
        <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-muted">
          <div className="space-y-2">
            <Label htmlFor="ecossistema-title" className="text-sm font-medium">Título da Seção</Label>
            <Input
              id="ecossistema-title"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="Um Ecossistema de Conexões"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ecossistema-subtitle" className="text-sm font-medium">Descrição da Seção</Label>
            <Textarea
              id="ecossistema-subtitle"
              value={sectionSubtitle}
              onChange={(e) => setSectionSubtitle(e.target.value)}
              placeholder="Descrição da seção..."
              rows={2}
              className="resize-none"
            />
          </div>

          <Button onClick={saveSectionSettings} disabled={savingSection} size="sm" className="w-full">
            <Save className="w-4 h-4 mr-2" />
            {savingSection ? "Salvando..." : "Salvar Título e Descrição"}
          </Button>
        </div>

        {/* Featured count indicator */}
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" />
          <span className="text-sm">
            <strong>{Math.min(featuredCount, 4)}</strong> de 4 slots preenchidos
          </span>
          {queueCount > 0 && (
            <Badge variant="outline" className="text-xs">
              +{queueCount} na fila
            </Badge>
          )}
        </div>

        {/* Featured projects as cards - drag and drop */}
        {featuredItems.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground">
              Arraste para reordenar. Os 4 primeiros serão exibidos na homepage.
            </p>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={featuredItems.map(i => i.id)} strategy={rectSortingStrategy}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {featuredItems.slice(0, 4).map((item, index) => (
                    <SortableFeaturedCard
                      key={item.id}
                      item={item}
                      index={index}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeItem ? <DragOverlayCard item={activeItem} /> : null}
              </DragOverlay>
            </DndContext>
          </>
        ) : (
          <div className="p-6 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30 text-center">
            <Star className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhum projeto em destaque. Clique na estrela de um projeto abaixo para adicioná-lo.
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="border-t pt-6">
          <h4 className="font-medium text-sm text-muted-foreground mb-4">
            Todos os projetos aprovados ({approvedProjects.length})
          </h4>
          
          {/* List of all projects */}
          <div className="space-y-2">
            {approvedProjects.map((project, index) => (
              <ProjectListItem
                key={project.id}
                project={project}
                index={index}
                isFeatured={project.featured_on_homepage}
                onToggleFeatured={handleToggleFeatured}
                onToggleCaptacao={handleToggleCaptacao}
                onTogglePortfolio={handleTogglePortfolio}
                isAdding={addingProjectId === project.id}
                addingProgress={addingProjectId === project.id ? addingProgress : 0}
              />
            ))}
          </div>
          
          {approvedProjects.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum projeto aprovado disponível.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
