import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjectOptions, useAddProjectOption, useRemoveProjectOption, type OptionItem } from "@/hooks/useProjectOptions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Fallback options when database is loading or empty
const DEFAULT_STAGE_OPTIONS: OptionItem[] = [
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
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  
  // Load options from database
  const { data: dbOptions, isLoading } = useProjectOptions('project_stages');
  const addOptionMutation = useAddProjectOption('project_stages');
  const removeOptionMutation = useRemoveProjectOption('project_stages');

  // Use database options if available, otherwise fallback to defaults
  const options = dbOptions && dbOptions.length > 0 ? dbOptions : DEFAULT_STAGE_OPTIONS;

  const toggleStage = (stage: string) => {
    if (confirmingDelete) return;
    if (value.includes(stage)) {
      onChange(value.filter(s => s !== stage));
    } else {
      onChange([...value, stage]);
    }
  };

  const confirmDelete = async (optionValue: string) => {
    // Check if in use
    const { data: projectsUsingIt } = await supabase
      .from('projects')
      .select('id')
      .contains('stages', [optionValue])
      .limit(1);

    if (projectsUsingIt && projectsUsingIt.length > 0) {
      toast.error('Este estágio está sendo usado em projetos e não pode ser removido');
      setConfirmingDelete(null);
      return;
    }

    // Remove from selected values
    if (value.includes(optionValue)) {
      onChange(value.filter(s => s !== optionValue));
    }
    
    // Remove from database
    await removeOptionMutation.mutateAsync(optionValue);
    setConfirmingDelete(null);
  };

  const addCustomStage = async () => {
    const trimmed = newStage.trim();
    if (!trimmed) return;
    
    // Create value from label (lowercase, underscores)
    const newValue = trimmed.toLowerCase().replace(/\s+/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Add to database
    await addOptionMutation.mutateAsync({ value: newValue, label: trimmed });
    
    // Select the new option
    if (!value.includes(newValue)) {
      onChange([...value, newValue]);
    }
    setNewStage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomStage();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {label && <Label>{label}</Label>}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Carregando estágios...</span>
        </div>
      </div>
    );
  }

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
            disabled={!newStage.trim() || addOptionMutation.isPending}
          >
            {addOptionMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
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
                    disabled={removeOptionMutation.isPending}
                  >
                    {removeOptionMutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Check className="h-3 w-3 text-green-400" />
                    )}
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
