import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Anchor, Shield, MapPin } from "lucide-react";
import { useDominantColor } from "@/hooks/useDominantColor";
import { INCENTIVE_LAWS, getIncentiveLawLabel } from "@/components/admin/IncentiveLawsMultiSelect";

interface Project {
  id: string;
  title: string;
  synopsis: string;
  project_type: string;
  image_url: string | null;
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

interface SortableItem {
  id: string;
  type: "real" | "example";
  data: Project | ExampleProject;
}

interface ProjectGridProps {
  projects: Project[];
  exampleProjects: ExampleProject[];
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
  formatBudget,
  getBudgetRange,
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
  const imageUrl = item.type === "real" ? (item.data as Project).image_url : null;
  const { backgroundColor, textColor } = useDominantColor(imageUrl);

  if (item.type === "real") {
    const project = item.data as Project;
    const budgetInfo = getBudgetRange(project.valor_sugerido);
    const stageInfo = getStageInfo(project.stage);

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
            {project.image_url ? (
              <img
                src={`${project.image_url}${project.updated_at ? `?v=${encodeURIComponent(project.updated_at)}` : ''}`}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <span className="text-4xl font-serif font-bold text-primary/50">
                  {getInitials(project.title)}
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
                  borderColor: 'transparent'
                }}
              >
                {project.project_type}
              </Badge>
            </div>
            {/* Incentive Law badge - only shows if a valid law from the form options was chosen */}
            {(() => {
              if (!project.has_incentive_law || !project.incentive_law_details) return null;
              
              // Get valid law values from the form options
              const validLawValues = INCENTIVE_LAWS.map(l => l.value);
              
              // Check if the stored value matches any valid option
              const storedValue = project.incentive_law_details.trim().toLowerCase();
              const matchedLaw = INCENTIVE_LAWS.find(l => 
                l.value.toLowerCase() === storedValue || 
                l.label.toLowerCase() === storedValue
              );
              
              // Only show badge if it's a valid law from form options
              if (!matchedLaw) return null;
              
              return (
                <div className="absolute top-3 right-3">
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/90 border-emerald-400 text-white text-xs flex items-center gap-1"
                  >
                    <Shield className="w-3 h-3" />
                    {matchedLaw.label}
                  </Badge>
                </div>
              );
            })()}
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="text-lg font-serif font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
              {project.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {project.synopsis}
            </p>

            {/* Meta info */}
            <div className="flex flex-wrap gap-2 mb-4">
              {project.location && (
                <Badge
                  variant="outline"
                  className="text-xs flex items-center gap-1"
                >
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
                Ver projeto
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  } else {
    const example = item.data as ExampleProject;

    return (
      <Link
        to={example.link}
        className="block group"
        style={{
          opacity: isInView ? 1 : 0,
          transform: isInView ? "translateY(0)" : "translateY(20px)",
          transition: `all 0.6s ease-out ${index * 100}ms`,
        }}
      >
        <div
          className={`card-solid bg-card border rounded-2xl overflow-hidden h-full shadow-2xl group-hover:shadow-3xl group-hover:scale-[1.02] transition-all duration-300 ${example.borderClass || "border-border"}`}
        >
          {/* Gradient Header */}
          <div
            className={`relative h-48 bg-gradient-to-br ${example.gradientClass || "from-primary to-accent"} flex items-center justify-center`}
          >
            <div
              className={`w-20 h-20 rounded-full ${example.emojiBgClass || "bg-white/30"} backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg ${example.emojiAnimate ? "animate-pulse" : ""}`}
            >
              <span className="text-4xl drop-shadow-lg">{example.emoji}</span>
            </div>
            {/* Type badge */}
            <div className="absolute top-3 left-3">
              <Badge
                variant={example.badgeVariant}
                className={example.badgeClass}
              >
                {example.badge}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="text-lg font-serif font-bold text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
              {example.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
              {example.synopsis}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              {example.footerContent}
              <span className="text-sm font-bold flex items-center gap-2 group-hover:translate-x-2 transition-transform text-foreground">
                {example.footerAction || "Saiba mais"}
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }
}

export function ProjectGrid({
  projects,
  exampleProjects,
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

        const exampleItems: SortableItem[] = exampleProjects.map((e) => ({
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
        const realItems: SortableItem[] = projects.map((p) => ({
          id: `real-${p.id}`,
          type: "real" as const,
          data: p,
        }));

        const exampleItems: SortableItem[] = exampleProjects.map((e) => ({
          id: `example-${e.id}`,
          type: "example" as const,
          data: e,
        }));

        setSortableItems([...realItems, ...exampleItems]);
      }
    };

    loadOrder();
  }, [projects, exampleProjects]);

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
              <div className="text-xl font-semibold drop-shadow-lg">
                Quer enviar seu projeto?
              </div>
            </div>
          </div>
          <div className="p-6 bg-black/20 backdrop-blur-sm">
            <h3 className="text-xl font-serif font-bold mb-3 text-white drop-shadow">
              Faça Parte da Nossa Rede
            </h3>
            <p className="text-sm text-white/90 line-clamp-3 mb-4">
              Se você tem uma ideia potente e bem estruturada, envie para nossa
              curadoria.
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-white/30">
              <span className="text-sm text-white/80 font-medium">
                ✨ Gratuito
              </span>
              <span className="text-sm font-bold flex items-center gap-2 group-hover:translate-x-2 transition-transform text-white">
                Enviar projeto
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
              <p className="text-sm text-white/50 text-center px-6">
                Slot disponível para novos projetos
              </p>
            </div>
          </div>
        ));
      })()}
    </div>
  );
}
