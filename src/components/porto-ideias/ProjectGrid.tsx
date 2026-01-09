import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Anchor, Shield, MapPin, GripVertical } from "lucide-react";
import { useDominantColor } from "@/hooks/useDominantColor";
import { INCENTIVE_LAWS } from "@/components/admin/IncentiveLawsMultiSelect";
import { useLanguage } from "@/hooks/useLanguage";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import { useStageColors } from "@/hooks/useStageColors";
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDragSensors } from "@/hooks/useReorder";
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
  synopsis: string;
  project_type: string;
  image_url: string | null;
  hero_image_url?: string | null;
  card_image_url?: string | null;
  updated_at?: string | null;
  location: string | null;
  categorias_tags: string[] | null;
  responsavel_nome: string | null;
  valor_sugerido: number | null;
  budget: string | null;
  has_incentive_law: boolean;
  incentive_law_details: string | null;
  stage: string | null;
  stages: string[] | null;
}

interface SortableItem {
  id: string;
  type: "real";
  data: Project;
}

interface ProjectGridProps {
  projects: Project[];
  displaySlots: number;
  isInView: boolean;
  formatBudget: (value: number | null) => string;
  getBudgetRange: (value: number | null) => { label: string; color: string };
  getInitials: (name: string | null) => string;
  isAdmin?: boolean;
  showCtaCard?: boolean;
  showEmptySlots?: boolean;
}

// Wrapper sortável para cards
function SortableProjectWrapper({
  item,
  children,
  isAdmin,
}: {
  item: SortableItem;
  children: React.ReactNode;
  isAdmin: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !isAdmin });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  if (!isAdmin) {
    return <>{children}</>;
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group/drag">
      {/* Drag handle */}
      <div
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/drag:opacity-100 transition-opacity cursor-grab active:cursor-grabbing bg-background/90 rounded-md p-1 border shadow-sm touch-none"
        title="Segure 0.5s para arrastar"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </div>
      {children}
    </div>
  );
}

function ProjectCard({
  item,
  index,
  isInView,
  getInitials,
}: {
  item: SortableItem;
  index: number;
  isInView: boolean;
  formatBudget: (value: number | null) => string;
  getBudgetRange: (value: number | null) => { label: string; color: string };
  getInitials: (name: string | null) => string;
}) {
  const { t, language } = useLanguage();
  const { getStageInfo } = useStageColors();

  const cardImageUrl = item.data.card_image_url || item.data.image_url;
  const { backgroundColor, textColor } = useDominantColor(cardImageUrl);

  const project = item.data;
  // Usar stages[0] se disponível, senão fallback para stage legado
  const primaryStage = project.stages && project.stages.length > 0 ? project.stages[0] : project.stage;
  const stageInfo = getStageInfo(primaryStage);

  // Auto-translate all card fields - using standardized namespaces for cache consistency
  const { translated: translatedTitle, isTranslating: isTranslatingTitle } = useAutoTranslate(`project_full_${project.id}_title`, project.title);
  const { translated: translatedSynopsis, isTranslating: isTranslatingSynopsis } = useAutoTranslate(`project_full_${project.id}_synopsis`, project.synopsis);
  const { translated: translatedType, isTranslating: isTranslatingType } = useAutoTranslate(`project_type`, project.project_type);
  const { translated: translatedLocation, isTranslating: isTranslatingLocation } = useAutoTranslate(`location_${project.id}`, project.location);

  const displayTitle = language === "pt" ? project.title : (translatedTitle || project.title);
  const displaySynopsis = language === "pt" ? project.synopsis : (translatedSynopsis || project.synopsis);
  const displayType = language === "pt" ? project.project_type : (translatedType || project.project_type);
  const displayLocation = language === "pt" ? project.location : (translatedLocation || project.location);

  // Show skeleton only during first translation (no cache)
  const showTitleSkeleton = language !== 'pt' && isTranslatingTitle && !translatedTitle;
  const showSynopsisSkeleton = language !== 'pt' && isTranslatingSynopsis && !translatedSynopsis;
  const showTypeSkeleton = language !== 'pt' && isTranslatingType && !translatedType;
  const showLocationSkeleton = language !== 'pt' && isTranslatingLocation && !translatedLocation;

  // Incentive law label is stored in PT; translate when needed
  const matchedLaw = (() => {
    if (!project.has_incentive_law || !project.incentive_law_details) return null;
    const storedValue = project.incentive_law_details.trim().toLowerCase();
    return INCENTIVE_LAWS.find(
      (l) => l.value.toLowerCase() === storedValue || l.label.toLowerCase() === storedValue
    );
  })();

  const { translated: translatedLawLabel } = useAutoTranslate(
    matchedLaw ? `incentive_law_label` : `incentive_law_none`,
    matchedLaw?.label
  );

  const displayLawLabel =
    language === "pt" ? matchedLaw?.label : (translatedLawLabel || matchedLaw?.label);

  return (
    <Link
      to={`/project/${project.id}`}
      className="block group"
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0)" : "translateY(20px)",
        transition: `all 0.6s ease-out ${index * 100}ms`,
      }}
    >
      <div className="card-solid bg-card border border-border rounded-2xl overflow-hidden h-full shadow-2xl group-hover:shadow-3xl group-hover:scale-[1.02] transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-video overflow-hidden">
          {(project.card_image_url || project.image_url) ? (
            <img
              src={`${project.card_image_url || project.image_url}${project.updated_at ? `?v=${encodeURIComponent(project.updated_at)}` : ''}`}
              alt={displayTitle}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="text-4xl font-serif font-bold text-primary/50">
                {getInitials(displayTitle)}
              </span>
            </div>
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {/* Type badge - with dominant color */}
          <div className="absolute top-3 left-3">
            {showTypeSkeleton ? (
              <Skeleton className="h-5 w-20 rounded-full" />
            ) : (
              <Badge
                className="text-xs font-semibold shadow-lg"
                style={{
                  backgroundColor,
                  color: textColor,
                  borderColor: "transparent",
                }}
              >
                {displayType}
              </Badge>
            )}
          </div>

          {/* Incentive Law badge - only shows if a valid law from the form options was chosen */}
          {matchedLaw && displayLawLabel && (
            <div className="absolute top-3 right-3">
              <Badge
                variant="outline"
                className="bg-emerald-500/90 border-emerald-400 text-white text-xs flex items-center gap-1"
              >
                <Shield className="w-3 h-3" />
                {displayLawLabel}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {showTitleSkeleton ? (
            <Skeleton className="h-6 w-3/4 mb-2" />
          ) : (
            <h3 className="text-lg font-serif font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
              {displayTitle}
            </h3>
          )}
          {showSynopsisSkeleton ? (
            <div className="space-y-2 mb-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {displaySynopsis}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap gap-2 mb-4">
            {project.location && (
              showLocationSkeleton ? (
                <Skeleton className="h-5 w-24 rounded-full" />
              ) : (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {displayLocation}
                </Badge>
              )
            )}
            {primaryStage && (
              <Badge 
                variant="outline" 
                className="text-xs"
                style={{
                  backgroundColor: stageInfo.color,
                  color: stageInfo.textColor,
                  borderColor: stageInfo.color,
                }}
              >
                {stageInfo.label}
              </Badge>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end pt-4 border-t border-border">
            <span className="text-sm font-bold flex items-center gap-2 group-hover:translate-x-2 transition-transform text-foreground">
              {t.home.knowProject}
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ProjectGrid({
  projects,
  displaySlots,
  isInView,
  formatBudget,
  getBudgetRange,
  getInitials,
  isAdmin = false,
  showCtaCard = false,
  showEmptySlots = false,
}: ProjectGridProps) {
  const { t } = useLanguage();
  const [sortableItems, setSortableItems] = useState<SortableItem[]>([]);
  const sensors = useDragSensors();

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const { data } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "porto_ideias_unified_order")
          .maybeSingle();

        const savedOrder: string[] = Array.isArray(data?.value) ? data.value as string[] : [];

        const realItems: SortableItem[] = projects.map((p) => ({
          id: `real-${p.id}`,
          type: "real" as const,
          data: p,
        }));

        let allItems = [...realItems];

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
        // Fallback
        const realItems: SortableItem[] = projects.map((p) => ({
          id: `real-${p.id}`,
          type: "real" as const,
          data: p,
        }));

        setSortableItems(realItems);
      }
    };

    loadOrder();
  }, [projects]);

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!isAdmin) return;
    
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = sortableItems.findIndex(item => item.id === active.id);
      const newIndex = sortableItems.findIndex(item => item.id === over.id);
      
      const newOrder = arrayMove(sortableItems, oldIndex, newIndex);
      setSortableItems(newOrder);
      
      // Salvar no banco
      try {
        const orderIds = newOrder.map(item => item.id);
        
        const { data: existing } = await supabase
          .from("settings")
          .select("id")
          .eq("key", "porto_ideias_unified_order")
          .maybeSingle();
        
        if (existing) {
          await supabase
            .from("settings")
            .update({ value: orderIds })
            .eq("key", "porto_ideias_unified_order");
        } else {
          await supabase
            .from("settings")
            .insert({ key: "porto_ideias_unified_order", value: orderIds });
        }
        
        toast.success("Ordem dos projetos atualizada");
      } catch (error) {
        console.error("Erro ao salvar ordem:", error);
        toast.error("Erro ao salvar ordem");
      }
    }
  };

  const displayedItems = sortableItems.slice(0, displaySlots);

  const gridContent = (
    <>
      {displayedItems.map((item, index) => (
        <SortableProjectWrapper key={item.id} item={item} isAdmin={isAdmin}>
          <ProjectCard
            item={item}
            index={index}
            isInView={isInView}
            formatBudget={formatBudget}
            getBudgetRange={getBudgetRange}
            getInitials={getInitials}
          />
        </SortableProjectWrapper>
      ))}

      {/* CTA Card Rainbow - Only for captação page */}
      {showCtaCard && (
        <Link
          to="/submit"
          className="block group"
          style={{
            opacity: isInView ? 1 : 0,
            transform: isInView ? "translateY(0)" : "translateY(20px)",
            transition: `all 0.6s ease-out ${displayedItems.length * 100}ms`,
          }}
        >
          <div className="card-rainbow border-0 rounded-2xl overflow-hidden h-full shadow-2xl">
            <div className="relative h-48 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-20 h-20 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                  <Anchor className="w-10 h-10 drop-shadow-lg" />
                </div>
                <div className="text-xl font-semibold drop-shadow-lg">{t.projects.ctaQuestion}</div>
              </div>
            </div>
            <div className="p-6 bg-black/20 backdrop-blur-sm">
              <h3 className="text-xl font-serif font-bold mb-3 text-white drop-shadow">{t.projects.ctaHeadline}</h3>
              <p className="text-sm text-white/90 line-clamp-3 mb-4">{t.projects.ctaBody}</p>
              <div className="flex items-center justify-between pt-4 border-t border-white/30">
                <span className="text-sm text-white/80 font-medium">{t.projects.ctaFree}</span>
                <span className="text-sm font-bold flex items-center gap-2 group-hover:translate-x-2 transition-transform text-white">
                  {t.projects.ctaAction}
                  <ArrowRight className="w-5 h-5" />
                </span>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Empty Glass Slots - For captação page (after CTA) or portfolio page */}
      {(showCtaCard || showEmptySlots) && (() => {
        // Total cards = displayed items + CTA card (if shown)
        const totalCards = displayedItems.length + (showCtaCard ? 1 : 0);
        // Calculate how many slots needed to complete the row (rows of 3 on desktop)
        const remainder = totalCards % 3;
        const emptySlotsNeeded = remainder === 0 ? 0 : 3 - remainder;
        const baseDelay = displayedItems.length + (showCtaCard ? 1 : 0);

        return Array.from({ length: emptySlotsNeeded }).map((_, slotIndex) => (
          <div
            key={`empty-slot-${slotIndex}`}
            className="hidden lg:block"
            style={{
              opacity: isInView ? 1 : 0,
              transform: isInView ? "translateY(0)" : "translateY(20px)",
              transition: `all 0.6s ease-out ${(baseDelay + slotIndex) * 100}ms`,
            }}
          >
            <div className="glass-slot-card rounded-2xl overflow-hidden h-full flex flex-col items-center justify-center min-h-[320px]">
              <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4 border border-white/20">
                <span className="text-4xl text-white/40">+</span>
              </div>
              <p className="text-sm text-white/50 text-center px-6">{t.projects.slotAvailable}</p>
            </div>
          </div>
        ));
      })()}
    </>
  );

  if (isAdmin) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={displayedItems.map(item => item.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {gridContent}
          </div>
        </SortableContext>
      </DndContext>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {gridContent}
    </div>
  );
}
