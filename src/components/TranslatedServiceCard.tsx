import { Card } from "@/components/ui/card";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import { useLanguage } from "@/hooks/useLanguage";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon } from "lucide-react";

interface TranslatedServiceCardProps {
  serviceId: string;
  text: string;
  icon: LucideIcon;
  hoverColor: string;
  index: number;
  inView: boolean;
  /** quando true, não tenta traduzir (texto já vem traduzido do pai) */
  skipTranslation?: boolean;
}

export function TranslatedServiceCard({
  serviceId,
  text,
  icon: ServiceIcon,
  hoverColor,
  index,
  inView,
  skipTranslation,
}: TranslatedServiceCardProps) {
  const { language } = useLanguage();

  // Traduzir o texto do serviço (opcional)
  const { translated: translatedText, isTranslating } = useAutoTranslate(
    `service_${serviceId}`,
    skipTranslation ? null : text
  );

  const displayText = language === "pt" ? text : (skipTranslation ? text : (translatedText || text));
  const showSkeleton = !skipTranslation && language !== "pt" && isTranslating && !translatedText;

  return (
    <Card 
      className={`group relative overflow-visible card-solid bg-card border-border rainbow-card-glow ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      style={{ 
        transition: 'opacity 300ms ease-out, transform 300ms ease-out',
        transitionDelay: inView ? `${(index + 1) * 50}ms` : '0ms',
      }}
    >
      <div className="relative p-6 flex flex-col items-center text-center gap-4">
        <div className="relative">
          <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 border border-border shadow-lg" style={{ transition: 'transform 0ms' }}>
            <ServiceIcon className={`w-8 h-8 text-black rainbow-icon-glow ${hoverColor}`} style={{ transition: 'color 0ms' }} />
          </div>
        </div>
        {showSkeleton ? (
          <div className="space-y-2 w-full">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4 mx-auto" />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground leading-relaxed font-medium rainbow-text-glow">
            {displayText}
          </p>
        )}
      </div>
    </Card>
  );
}
