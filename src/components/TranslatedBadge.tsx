import React from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface TranslatedBadgeProps {
  namespace: string;
  value: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
  showSkeleton?: boolean;
}

/**
 * Badge que traduz automaticamente seu conteúdo.
 * Usa cache local para evitar chamadas repetidas à API.
 */
export const TranslatedBadge: React.FC<TranslatedBadgeProps> = ({
  namespace,
  value,
  variant = "secondary",
  className = "",
  showSkeleton = true,
}) => {
  const { language } = useLanguage();
  const { translated, isTranslating } = useAutoTranslate(namespace, value);

  // Se idioma é PT, mostrar valor original
  if (language === "pt") {
    return (
      <Badge variant={variant} className={cn("rounded-full", className)}>
        {value}
      </Badge>
    );
  }

  // Mostrar skeleton apenas na primeira tradução (sem cache)
  if (isTranslating && !translated && showSkeleton) {
    return <Skeleton className="h-5 w-16 rounded-full" />;
  }

  return (
    <Badge 
      variant={variant} 
      className={cn("rounded-full", className)}
      data-i18n-auto="1"
      data-i18n-pending={isTranslating ? "1" : undefined}
    >
      {translated || value}
    </Badge>
  );
};
