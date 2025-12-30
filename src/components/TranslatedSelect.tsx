import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAutoTranslate } from "@/hooks/useAutoTranslate";
import { useLanguage } from "@/hooks/useLanguage";
import { Skeleton } from "@/components/ui/skeleton";

interface TranslatedSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: Array<{ value: string; label: string }>;
  /** Prefixo do namespace para tradução. Ex: "filter_type" resultará em "filter_type_value" */
  namespacePrefix: string;
  className?: string;
  isMobile?: boolean;
  /** Se true, traduz os labels via useAutoTranslate. Se false, assume que já vêm traduzidos (ex: do i18n) */
  translateLabels?: boolean;
}

/**
 * Select com tradução automática do valor selecionado exibido no trigger.
 */
export function TranslatedSelect({
  value,
  onValueChange,
  placeholder,
  options,
  namespacePrefix,
  className = "",
  isMobile = false,
  translateLabels = true,
}: TranslatedSelectProps) {
  const { language } = useLanguage();
  
  // Encontrar o label correspondente ao valor selecionado
  const selectedOption = options.find(opt => opt.value === value);
  const labelToTranslate = selectedOption?.label || value;
  
  // Traduzir o label selecionado para exibir no trigger
  const { translated: translatedSelectedLabel, isTranslating } = useAutoTranslate(
    `${namespacePrefix}_selected_${value}`,
    translateLabels ? labelToTranslate : null
  );
  
  const displayLabel = language === "pt" 
    ? labelToTranslate 
    : (translatedSelectedLabel || labelToTranslate);
  
  const showSkeleton = language !== "pt" && translateLabels && isTranslating && !translatedSelectedLabel;

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={`rounded-full ${isMobile ? 'w-full' : 'w-fit'} ${className}`}>
        {showSkeleton ? (
          <Skeleton className="h-4 w-24" />
        ) : (
          <SelectValue placeholder={placeholder}>
            {displayLabel}
          </SelectValue>
        )}
      </SelectTrigger>
      <SelectContent position="popper" sideOffset={4}>
        {options.map(opt => (
          <TranslatedSelectOption
            key={opt.value}
            optionValue={opt.value}
            label={opt.label}
            namespacePrefix={namespacePrefix}
            translateLabels={translateLabels}
          />
        ))}
      </SelectContent>
    </Select>
  );
}

interface TranslatedSelectOptionProps {
  optionValue: string;
  label: string;
  namespacePrefix: string;
  translateLabels: boolean;
}

function TranslatedSelectOption({ 
  optionValue, 
  label, 
  namespacePrefix, 
  translateLabels 
}: TranslatedSelectOptionProps) {
  const { language } = useLanguage();
  const { translated } = useAutoTranslate(
    `${namespacePrefix}_${optionValue}`,
    translateLabels ? label : null
  );
  
  const displayLabel = language === "pt" 
    ? label 
    : (translateLabels ? (translated || label) : label);
  
  return (
    <SelectItem value={optionValue}>
      {displayLabel}
    </SelectItem>
  );
}
