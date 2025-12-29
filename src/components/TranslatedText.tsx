import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import { useLanguage } from "@/hooks/useLanguage";

interface TranslatedTextProps {
  namespace: string;
  value: string | null | undefined;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  showSkeleton?: boolean;
  skeletonClassName?: string;
  fallback?: string;
}

/**
 * Componente para exibir texto traduzido automaticamente.
 * Usa cache local para evitar chamadas repetidas à API.
 * Mostra skeleton loader enquanto traduz.
 */
export const TranslatedText: React.FC<TranslatedTextProps> = ({
  namespace,
  value,
  as: Component = "span",
  className = "",
  showSkeleton = true,
  skeletonClassName = "h-4 w-full",
  fallback = "...",
}) => {
  const { language } = useLanguage();
  const { translated, isTranslating } = useAutoTranslate(namespace, value);

  // Se idioma é PT, mostrar valor original
  if (language === "pt") {
    const Tag = Component as any;
    return <Tag className={className}>{value || fallback}</Tag>;
  }

  const displayValue = translated || value || fallback;

  // Mostrar skeleton apenas na primeira tradução (sem cache)
  if (isTranslating && !translated && showSkeleton) {
    return <Skeleton className={skeletonClassName} />;
  }

  const Tag = Component as any;
  return (
    <Tag
      className={className}
      data-i18n-auto="1"
      data-i18n-pending={isTranslating ? "1" : undefined}
    >
      {displayValue}
    </Tag>
  );
};
