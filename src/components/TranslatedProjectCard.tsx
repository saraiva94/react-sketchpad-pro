import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
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
}

export function TranslatedProjectCard({
  project,
  linkUrl,
  isLeftCard,
  heroReady,
  inView,
  index,
}: TranslatedProjectCardProps) {
  const { t, language } = useLanguage();

  // Auto-translate title, synopsis, and project_type when not PT
  const { translated: translatedTitle } = useAutoTranslate(`project_title_${project.id}`, project.title);
  const { translated: translatedSynopsis } = useAutoTranslate(`project_synopsis_${project.id}`, project.synopsis);
  const { translated: translatedType } = useAutoTranslate(`project_type_${project.id}`, project.project_type);

  // Use translated versions when language is not PT
  const displayTitle = language === 'pt' ? project.title : (translatedTitle || project.title);
  const displaySynopsis = language === 'pt' ? project.synopsis : (translatedSynopsis || project.synopsis);
  const displayType = language === 'pt' ? project.project_type : (translatedType || project.project_type);

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
              <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-sm">
                {displayType}
              </Badge>
            </div>
          </div>
          {/* Card Content */}
          <div className="p-5 flex-1 flex flex-col">
            <h4 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
              {displayTitle}
            </h4>
            <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
              {displaySynopsis}
            </p>
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
