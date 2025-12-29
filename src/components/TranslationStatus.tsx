import React from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TranslationStatusProps {
  isTranslating: boolean;
  hasError?: boolean;
  className?: string;
}

/**
 * Componente para mostrar status de tradução.
 * Aparece apenas quando idioma não é PT.
 */
export const TranslationStatus: React.FC<TranslationStatusProps> = ({
  isTranslating,
  hasError = false,
  className = "",
}) => {
  const { language } = useLanguage();

  // Não mostrar nada se estiver em português
  if (language === "pt") return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-xs px-3 py-1.5 rounded-full transition-all duration-300",
        isTranslating && "bg-primary/10 text-primary",
        !isTranslating && !hasError && "bg-green-500/10 text-green-600",
        hasError && "bg-destructive/10 text-destructive",
        className
      )}
    >
      {isTranslating && (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Traduzindo conteúdo...</span>
        </>
      )}
      {!isTranslating && !hasError && (
        <>
          <CheckCircle2 className="h-3 w-3" />
          <span>Conteúdo traduzido</span>
        </>
      )}
      {hasError && (
        <>
          <AlertCircle className="h-3 w-3" />
          <span>Erro na tradução</span>
        </>
      )}
    </div>
  );
};
