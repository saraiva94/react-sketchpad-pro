import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import { useLanguage } from "@/hooks/useLanguage";

interface ProjectData {
  id: string;
  title: string;
  synopsis: string;
  project_type: string;
  image_url: string | null;
}

interface TranslatedProjectCardProps {
  project: ProjectData;
  linkUrl: string;
  isLeftCard: boolean;
  heroReady: boolean;
  inView: boolean;
  index: number;
  /** Quando fornecido, usa estes textos (já traduzidos) para renderizar */
  translatedProject?: Partial<Pick<ProjectData, "title" | "synopsis" | "project_type">>;
  /** Quando true, evita chamadas de tradução (textos já vêm prontos) */
  skipTranslation?: boolean;
}

export function TranslatedProjectCard({
  project,
  linkUrl,
  isLeftCard,
  heroReady,
  inView,
  index,
  translatedProject,
  skipTranslation,
}: TranslatedProjectCardProps) {
  const { t, language } = useLanguage();

  // Auto-translate title, synopsis, and project_type when not PT (mantém ordem de hooks estável)
  const shouldTranslate = language !== "pt" && !skipTranslation;

  // Se já recebemos alguma parte traduzida do pai, evitamos refazer chamadas para aquele campo
  const titleValue = shouldTranslate && !translatedProject?.title ? project.title : null;
  const synopsisValue = shouldTranslate && !translatedProject?.synopsis ? project.synopsis : null;
  const typeValue = shouldTranslate && !translatedProject?.project_type ? project.project_type : null;

  const { translated: translatedTitle, isTranslating: isTranslatingTitle } = useAutoTranslate(
    `project_title_${project.id}`,
    titleValue
  );
  const { translated: translatedSynopsis, isTranslating: isTranslatingSynopsis } = useAutoTranslate(
    `project_synopsis_${project.id}`,
    synopsisValue
  );
  const { translated: translatedType, isTranslating: isTranslatingType } = useAutoTranslate(
    `project_type_${project.id}`,
    typeValue
  );

  const displayTitle =
    language === "pt" ? project.title : (translatedProject?.title ?? translatedTitle ?? project.title);
  const displaySynopsis =
    language === "pt" ? project.synopsis : (translatedProject?.synopsis ?? translatedSynopsis ?? project.synopsis);
  const displayType =
    language === "pt" ? project.project_type : (translatedProject?.project_type ?? translatedType ?? project.project_type);

  // Skeleton apenas quando estamos efetivamente traduzindo
  const showTitleSkeleton = shouldTranslate && !!titleValue && isTranslatingTitle && !translatedTitle;
  const showSynopsisSkeleton = shouldTranslate && !!synopsisValue && isTranslatingSynopsis && !translatedSynopsis;
  const showTypeSkeleton = shouldTranslate && !!typeValue && isTranslatingType && !translatedType;

  const getInitials = (name: string | null): string => {
    if (!name) return "PC";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div 
      className={`transition-all duration-700 ease-out ${
        heroReady && inView 
          ? 'opacity-100 translate-x-0' 
          : `opacity-0 ${isLeftCard ? '-translate-x-20' : 'translate-x-20'}`
      }`}
      style={{ transitionDelay: heroReady && inView ? `${Math.floor(index / 2) * 150}ms` : '0ms' }}
    >
      <Link
        to={linkUrl}
        className="block group h-full"
      >
        <div className="card-solid bg-card border border-border rounded-2xl overflow-hidden shadow-2xl group-hover:shadow-3xl group-hover:scale-[1.02] transition-all duration-300 h-full flex flex-col">
          {/* Image */}
          <div className="relative h-48 md:h-56 overflow-hidden">
            {project.image_url ? (
              <img
                src={project.image_url}
                alt={displayTitle}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
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
            {/* Type badge */}
            <div className="absolute top-3 left-3">
              {showTypeSkeleton ? (
                <Skeleton className="h-5 w-20 rounded-full" />
              ) : (
                <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm">
                  {displayType}
                </Badge>
              )}
            </div>
          </div>
          {/* Card Content */}
          <div className="p-5 flex-1 flex flex-col">
            {showTitleSkeleton ? (
              <Skeleton className="h-6 w-3/4 mb-2" />
            ) : (
              <h4 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                {displayTitle}
              </h4>
            )}
            {showSynopsisSkeleton ? (
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                {displaySynopsis}
              </p>
            )}
            <div className="flex items-center gap-2 mt-4 text-primary font-medium text-sm">
              <span>{t.home.knowProject}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
