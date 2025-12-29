import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Anchor, Shield, MapPin } from "lucide-react";
import { useDominantColor } from "@/hooks/useDominantColor";
import { INCENTIVE_LAWS } from "@/components/admin/IncentiveLawsMultiSelect";
import { useLanguage } from "@/hooks/useLanguage";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";

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
  getStageInfo: (stage: string | null) => { label: string; color: string };
  getInitials: (name: string | null) => string;
}

function ProjectCard({
  item,
  index,
  isInView,
  getStageInfo,
  getInitials,
}: {
  item: SortableItem;
  index: number;
  isInView: boolean;
  formatBudget: (value: number | null) => string;
  getBudgetRange: (value: number | null) => { label: string; color: string };
  getStageInfo: (stage: string | null) => { label: string; color: string };
  getInitials: (name: string | null) => string;
}) {
  const { t, language } = useLanguage();

  const cardImageUrl = item.data.card_image_url || item.data.image_url;
  const { backgroundColor, textColor } = useDominantColor(cardImageUrl);

  const project = item.data;
  const stageInfo = getStageInfo(project.stage);

  const { translated: translatedTitle } = useAutoTranslate(`grid_title_${project.id}`, project.title);
  const { translated: translatedSynopsis } = useAutoTranslate(`grid_synopsis_${project.id}`, project.synopsis);
  const { translated: translatedType } = useAutoTranslate(`grid_type_${project.id}`, project.project_type);

  const displayTitle = language === "pt" ? project.title : (translatedTitle || project.title);
  const displaySynopsis = language === "pt" ? project.synopsis : (translatedSynopsis || project.synopsis);
  const displayType = language === "pt" ? project.project_type : (translatedType || project.project_type);

  // Incentive law label is stored in PT; translate when needed
  const matchedLaw = (() => {
    if (!project.has_incentive_law || !project.incentive_law_details) return null;
    const storedValue = project.incentive_law_details.trim().toLowerCase();
    return INCENTIVE_LAWS.find(
      (l) => l.value.toLowerCase() === storedValue || l.label.toLowerCase() === storedValue
    );
  })();

  const { translated: translatedLawLabel } = useAutoTranslate(
    matchedLaw ? `grid_law_${project.id}` : `grid_law_${project.id}_none`,
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
          <h3 className="text-lg font-serif font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
            {displayTitle}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {displaySynopsis}
          </p>

          {/* Meta info */}
          <div className="flex flex-wrap gap-2 mb-4">
            {project.location && (
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {project.location}
              </Badge>
            )}
            {project.stage && (
              <Badge variant="outline" className={`text-xs ${stageInfo.color}`}>
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
  getStageInfo,
  getInitials,
}: ProjectGridProps) {
  const [sortableItems, setSortableItems] = useState<SortableItem[]>([]);

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

  const displayedItems = sortableItems.slice(0, displaySlots);

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {displayedItems.map((item, index) => (
        <ProjectCard
          key={item.id}
          item={item}
          index={index}
          isInView={isInView}
          formatBudget={formatBudget}
          getBudgetRange={getBudgetRange}
          getStageInfo={getStageInfo}
          getInitials={getInitials}
        />
      ))}

      {/* CTA Card Rainbow - After projects */}
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

      {/* Empty Glass Slots - Fill to complete row */}
      {(() => {
        // Total cards = displayed items + 1 rainbow CTA card
        const totalCards = displayedItems.length + 1;
        // Calculate how many slots needed to complete the row (rows of 3 on desktop, 2 on mobile)
        const remainder = totalCards % 3;
        const emptySlotsNeeded = remainder === 0 ? 0 : 3 - remainder;

        return Array.from({ length: emptySlotsNeeded }).map((_, slotIndex) => (
          <div
            key={`empty-slot-${slotIndex}`}
            className="hidden lg:block"
            style={{
              opacity: isInView ? 1 : 0,
              transform: isInView ? "translateY(0)" : "translateY(20px)",
              transition: `all 0.6s ease-out ${(displayedItems.length + 1 + slotIndex) * 100}ms`,
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
    </div>
  );
}
