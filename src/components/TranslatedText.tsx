import { ReactNode } from "react";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import { useLanguage } from "@/hooks/useLanguage";

type Props = {
  namespace: string;
  value: string | null | undefined;
  fallback?: ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
};

/**
 * Small helper to ensure any backend-provided string (stored in PT) is displayed
 * translated according to the current language.
 */
export function TranslatedText({
  namespace,
  value,
  fallback = null,
  className,
  as = "span",
}: Props) {
  const { language } = useLanguage();
  const { translated, isTranslating } = useAutoTranslate(namespace, value);

  const Tag = as as any;
  const display = language === "pt" ? value : (translated ?? value);

  if (!display) return <>{fallback}</>;

  return (
    <Tag className={className} data-i18n-auto={language !== "pt" ? "1" : undefined} data-i18n-pending={isTranslating ? "1" : undefined}>
      {display}
    </Tag>
  );
}
