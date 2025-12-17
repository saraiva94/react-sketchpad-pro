import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const STAGE_OPTIONS = [
  { value: "ideia", label: "Ideia inicial" },
  { value: "development", label: "Desenvolvimento" },
  { value: "captacao", label: "Captação de recursos" },
  { value: "pre_producao", label: "Pré-produção" },
  { value: "producao", label: "Produção" },
  { value: "pos_producao", label: "Pós-produção" },
  { value: "finalizado", label: "Finalizado" },
  { value: "em_exibicao", label: "Em exibição" },
  { value: "distribution", label: "Distribuição" },
];

interface StagesMultiSelectProps {
  value: string[];
  onChange: (stages: string[]) => void;
  label?: string;
  allowCustom?: boolean;
}

export const StagesMultiSelect = ({ 
  value, 
  onChange, 
  label = "Estágios do Projeto",
  allowCustom = false 
}: StagesMultiSelectProps) => {
  const [newStage, setNewStage] = useState("");

  const toggleStage = (stage: string) => {
    if (value.includes(stage)) {
      onChange(value.filter(s => s !== stage));
    } else {
      onChange([...value, stage]);
    }
  };

  const addCustomStage = () => {
    const trimmed = newStage.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setNewStage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomStage();
    }
  };

  // Merge predefined options with custom stages
  const customStages = value.filter(v => !STAGE_OPTIONS.find(s => s.value === v));
  const allOptions = [
    ...STAGE_OPTIONS,
    ...customStages.map(stage => ({ value: stage, label: stage }))
  ];

  return (
    <div className="space-y-3">
      {label && <Label>{label}</Label>}
      
      {/* Add custom stage input */}
      {allowCustom && (
        <div className="flex gap-2">
          <Input
            placeholder="Adicionar novo estágio..."
            value={newStage}
            onChange={(e) => setNewStage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={addCustomStage}
            disabled={!newStage.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* All stages - click to toggle */}
      <div className="flex flex-wrap gap-2">
        {allOptions.map((stage) => {
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
