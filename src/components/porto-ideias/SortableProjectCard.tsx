import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { MapPin, ArrowRight, Shield, GripVertical } from "lucide-react";

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

interface SortableProjectCardProps {
  project: Project;
  index: number;
  isInView: boolean;
  isAdmin: boolean;
  formatBudget: (value: number | null) => string;
  getBudgetRange: (value: number | null) => { label: string; color: string };
  getStageInfo: (stage: string | null) => { label: string; color: string };
  getInitials: (name: string | null) => string;
}

export function SortableProjectCard({
  project,
  index,
  isInView,
  isAdmin,
  formatBudget,
  getBudgetRange,
  getStageInfo,
  getInitials,
}: SortableProjectCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id, disabled: !isAdmin });

  const budgetInfo = getBudgetRange(project.valor_sugerido);
  const stageInfo = getStageInfo(project.stage);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : isInView ? 1 : 0,
    zIndex: isDragging ? 1000 : 1,
  };

  const cardContent = (
    <div 
      className={`card-solid bg-card border border-border rounded-2xl overflow-hidden shadow-2xl h-full hover:-translate-y-2 transition-transform duration-300 ${
        isDragging ? "ring-2 ring-primary shadow-xl" : ""
      }`}
    >
      {/* Admin Drag Handle */}
      {isAdmin && (
        <div 
          {...attributes}
          {...listeners}
          className="absolute top-2 right-2 z-20 cursor-grab active:cursor-grabbing touch-none p-2 bg-card/90 backdrop-blur-sm rounded-lg border border-border shadow-md hover:bg-muted transition-colors"
          onClick={(e) => e.preventDefault()}
        >
          <GripVertical className="w-5 h-5 text-primary" />
        </div>
      )}

      {/* Image */}
      <div className="relative overflow-hidden h-48">
        {project.image_url ? (
          <img
            src={project.image_url}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center min-h-[192px]">
            <span className="text-4xl font-handwritten text-primary-foreground">{project.title.charAt(0)}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 md:p-5 flex-1">
        {/* Category, Budget Range, Location */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="rounded-full text-xs">
              {project.project_type}
            </Badge>
            <Badge className={`rounded-full text-xs ${budgetInfo.color}`}>
              {budgetInfo.label}
            </Badge>
          </div>
          {project.location && (
            <span className="flex items-center text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 mr-1" />
              {project.location}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {project.title}
        </h3>

        {/* Synopsis */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {project.synopsis}
        </p>

        {/* Budget & Stage */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-foreground">
            {formatBudget(project.valor_sugerido)}
          </span>
          <Badge className={`rounded-full text-xs ${stageInfo.color}`}>
            {stageInfo.label}
          </Badge>
        </div>

        {/* Incentive Law */}
        {project.has_incentive_law && (
          <div className="mb-3">
            <Badge variant="outline" className="rounded-full text-xs border-primary/30 text-primary">
              <Shield className="w-3 h-3 mr-1" />
              {project.incentive_law_details || "Lei de Incentivo"}
            </Badge>
          </div>
        )}

        {/* Tags */}
        {project.categorias_tags && project.categorias_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {project.categorias_tags.slice(0, 3).map((tag, i) => (
              <Badge key={i} variant="outline" className="rounded-full text-xs bg-muted/50">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Creator & Link */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-xs text-primary-foreground font-semibold">
                {getInitials(project.responsavel_nome)}
              </span>
            </div>
            <span className="text-sm text-muted-foreground truncate max-w-[120px]">
              {project.responsavel_nome || "Produtor Cultural"}
            </span>
          </div>
          <span className="text-sm font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Ver Detalhes
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>
  );

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
      className="block group relative"
    >
      {isAdmin ? (
        // Admin view - card is not a link when dragging
        <div className="cursor-pointer" onClick={() => !isDragging && window.location.assign(`/project/${project.id}`)}>
          {cardContent}
        </div>
      ) : (
        // Regular user view - normal link
        <Link to={`/project/${project.id}`} className="block">
          {cardContent}
        </Link>
      )}
    </div>
  );
}
