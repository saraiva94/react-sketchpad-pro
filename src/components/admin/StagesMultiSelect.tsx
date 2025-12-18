import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, Check } from "lucide-react";
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
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  
  // Internal state for options when allowCustom but no external control
  const [internalOptions, setInternalOptions] = useState<string[]>(() => 
    DEFAULT_STAGE_OPTIONS.map(o => o.value)
  );

  // Determine which options to use
  const optionValues = availableOptions ?? internalOptions;
  
  // Build display options
  const options = optionValues.map(v => {
    const def = DEFAULT_STAGE_OPTIONS.find(d => d.value === v);
    return { value: v, label: def?.label || v };
  });

  const toggleStage = (stage: string) => {
    if (confirmingDelete) return; // Don't toggle while confirming delete
    if (value.includes(stage)) {
      onChange(value.filter(s => s !== stage));
    } else {
      onChange([...value, stage]);
    }
  };

  const confirmDelete = (optionValue: string) => {
    // Remove from selected values
    if (value.includes(optionValue)) {
      onChange(value.filter(s => s !== optionValue));
    }
    // Remove from options
    if (onOptionsChange && availableOptions) {
      onOptionsChange(availableOptions.filter(o => o !== optionValue));
    } else if (allowCustom) {
      setInternalOptions(prev => prev.filter(o => o !== optionValue));
    }
    setConfirmingDelete(null);
  };

  const addCustomStage = () => {
    const trimmed = newStage.trim();
    if (!trimmed) return;
    
    // Add to options list
    if (onOptionsChange && availableOptions) {
      if (!availableOptions.includes(trimmed)) {
        onOptionsChange([...availableOptions, trimmed]);
      }
    } else if (allowCustom) {
      if (!internalOptions.includes(trimmed)) {
        setInternalOptions(prev => [...prev, trimmed]);
      }
    }
    
    // Select the new option
    if (!value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setNewStage("");
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
          const isConfirming = confirmingDelete === stage.value;
          
          return (
            <Badge
              key={stage.value}
              variant={isSelected ? "default" : "outline"}
              onClick={() => toggleStage(stage.value)}
              className={cn(
                "cursor-pointer transition-all select-none flex items-center gap-1",
                isSelected 
                  ? "bg-primary text-primary-foreground hover:bg-primary/80" 
                  : "hover:bg-muted",
                isConfirming && "ring-2 ring-red-500/50"
              )}
            >
              <span>{stage.label}</span>
              {allowCustom && !isConfirming && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmingDelete(stage.value);
                  }}
                  className="ml-0.5 hover:bg-red-500/30 rounded-full p-0.5"
                >
                  <X className="h-3 w-3 text-red-400" />
                </button>
              )}
              {isConfirming && (
                <div className="flex items-center gap-0.5 ml-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDelete(stage.value);
                    }}
                    className="hover:bg-green-500/30 rounded-full p-0.5"
                  >
                    <Check className="h-3 w-3 text-green-400" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmingDelete(null);
                    }}
                    className="hover:bg-red-500/30 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3 text-red-400" />
                  </button>
                </div>
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
