import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const INCENTIVE_LAW_OPTIONS = [
  { value: "lei_rouanet", label: "Lei Rouanet" },
  { value: "lei_audiovisual", label: "Lei do Audiovisual" },
  { value: "icms_rj", label: "ICMS RJ" },
  { value: "iss_rj", label: "ISS RJ" },
  { value: "proac", label: "PROAC" },
  { value: "outros", label: "Outros" },
];

interface IncentiveLawsMultiSelectProps {
  value: string[];
  onChange: (laws: string[]) => void;
  label?: string;
}

export const IncentiveLawsMultiSelect = ({ value, onChange, label = "Leis de Incentivo" }: IncentiveLawsMultiSelectProps) => {
  const toggleLaw = (law: string) => {
    if (value.includes(law)) {
      onChange(value.filter(l => l !== law));
    } else {
      onChange([...value, law]);
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex flex-wrap gap-2">
        {INCENTIVE_LAW_OPTIONS.map((law) => {
          const isSelected = value.includes(law.value);
          return (
            <Badge
              key={law.value}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-all select-none",
                isSelected 
                  ? "bg-primary text-primary-foreground hover:bg-primary/80" 
                  : "hover:bg-muted"
              )}
              onClick={() => toggleLaw(law.value)}
            >
              {law.label}
            </Badge>
          );
        })}
      </div>
      {value.length === 0 && (
        <p className="text-xs text-muted-foreground">Clique para selecionar as leis de incentivo</p>
      )}
    </div>
  );
};

export const getIncentiveLawLabel = (value: string): string => {
  const law = INCENTIVE_LAW_OPTIONS.find(l => l.value === value);
  return law?.label || value;
};

export const INCENTIVE_LAWS = INCENTIVE_LAW_OPTIONS;
