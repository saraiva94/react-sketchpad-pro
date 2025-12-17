import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_STAGE_OPTIONS = [
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
  availableOptions?: string[];
  onOptionsChange?: (options: string[]) => void;
}

export const StagesMultiSelect = ({ 
  value, 
  onChange, 
  label = "Estágios do Projeto",
  allowCustom = false,
  availableOptions,
  onOptionsChange
}: StagesMultiSelectProps) => {
  const [newStage, setNewStage] = useState("");

  // Use provided options or defaults
  const options = availableOptions 
    ? availableOptions.map(v => {
        const def = DEFAULT_STAGE_OPTIONS.find(d => d.value === v);
        return { value: v, label: def?.label || v };
      })
    : DEFAULT_STAGE_OPTIONS;

  const toggleStage = (stage: string) => {
    if (value.includes(stage)) {
      onChange(value.filter(s => s !== stage));
    } else {
      onChange([...value, stage]);
    }
  };

  const deleteOption = (optionValue: string) => {
    // Remove from selected values
    if (value.includes(optionValue)) {
      onChange(value.filter(s => s !== optionValue));
    }
    // Remove from available options
    if (onOptionsChange && availableOptions) {
      onOptionsChange(availableOptions.filter(o => o !== optionValue));
    }
  };

  const addCustomStage = () => {
    const trimmed = newStage.trim();
    if (trimmed) {
      // Add to available options if using custom options
      if (onOptionsChange && availableOptions && !availableOptions.includes(trimmed)) {
        onOptionsChange([...availableOptions, trimmed]);
      }
      // Also select it
      if (!value.includes(trimmed)) {
        onChange([...value, trimmed]);
      }
      setNewStage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomStage();
    }
  };

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

      {/* All stages - click to toggle, X to delete */}
      <div className="flex flex-wrap gap-2">
        {options.map((stage) => {
          const isSelected = value.includes(stage.value);
          return (
            <Badge
              key={stage.value}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-all select-none flex items-center gap-1",
                isSelected 
                  ? "bg-primary text-primary-foreground hover:bg-primary/80" 
                  : "hover:bg-muted"
              )}
            >
              <span onClick={() => toggleStage(stage.value)}>{stage.label}</span>
              {allowCustom && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteOption(stage.value);
                  }}
                  className="ml-0.5 hover:bg-red-500/30 rounded-full p-0.5"
                >
                  <X className="h-3 w-3 text-red-400" />
                </button>
              )}
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
  const stage = DEFAULT_STAGE_OPTIONS.find(s => s.value === value);
  return stage?.label || value;
};

export const STAGES = DEFAULT_STAGE_OPTIONS;
