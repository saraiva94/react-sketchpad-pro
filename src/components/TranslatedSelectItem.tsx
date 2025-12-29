import { SelectItem } from "@/components/ui/select";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import { useLanguage } from "@/hooks/useLanguage";

interface TranslatedSelectItemProps {
  value: string;
  namespace: string;
}

/**
 * SelectItem com tradução automática para idiomas não-PT.
 * Útil para tipos de projeto, localizações e outras opções dinâmicas.
 */
export function TranslatedSelectItem({ value, namespace }: TranslatedSelectItemProps) {
  const { language } = useLanguage();
  const { translated } = useAutoTranslate(namespace, value);
  
  const displayValue = language === "pt" ? value : (translated || value);
  
  return (
    <SelectItem value={value}>
      {displayValue}
    </SelectItem>
  );
}
