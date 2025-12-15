import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const STAGE_OPTIONS = [
  { value: "ideia", label: "Ideia inicial" },
  { value: "development", label: "Desenvolvimento" },
  { value: "captacao", label: "Captação de recursos" },
  { value: "pre_producao", label: "Pré-produção" },
  { value: "pos_producao", label: "Pós-produção" },
  { value: "finalizado", label: "Finalizado" },
  { value: "em_exibicao", label: "Em exibição" },
  { value: "distribution", label: "Distribuição" },
];

interface StagesMultiSelectProps {
  value: string[];
  onChange: (stages: string[]) => void;
  label?: string;
}

export const StagesMultiSelect = ({ value, onChange, label = "Estágios do Projeto" }: StagesMultiSelectProps) => {
  const toggleStage = (stage: string) => {
    if (value.includes(stage)) {
      onChange(value.filter(s => s !== stage));
    } else {
      onChange([...value, stage]);
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex flex-wrap gap-2">
        {STAGE_OPTIONS.map((stage) => {
          const isSelected = value.includes(stage.value);
          return (
            <Badge
              key={stage.value}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-all select-none",
                isSelected 
                  ? "bg-primary text-primary-foreground hover:bg-primary/80" 
                  : "hover:bg-muted"
              )}
              onClick={() => toggleStage(stage.value)}
            >
              {stage.label}
            </Badge>
          );
        })}
      </div>
      {value.length === 0 && (
        <p className="text-xs text-muted-foreground">Clique para selecionar os estágios</p>
      )}
    </div>
  );
};

export const getStageLabel = (value: string): string => {
  const stage = STAGE_OPTIONS.find(s => s.value === value);
  return stage?.label || value;
};

export const STAGES = STAGE_OPTIONS;
