import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X, Check, Loader2, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjectOptions, useAddProjectOption, useRemoveProjectOption, type OptionItem } from "@/hooks/useProjectOptions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQueryClient } from "@tanstack/react-query";
import type { Json } from "@/integrations/supabase/types";

// Fallback options when database is loading or empty
const DEFAULT_STAGE_OPTIONS: OptionItem[] = [
  { value: "ideia", label: "Ideia inicial", color: "#6366f1", textColor: "#ffffff" },
  { value: "development", label: "Desenvolvimento", color: "#3b82f6", textColor: "#ffffff" },
  { value: "captacao", label: "Captação de recursos", color: "#f59e0b", textColor: "#000000" },
  { value: "pre_producao", label: "Pré-produção", color: "#8b5cf6", textColor: "#ffffff" },
  { value: "producao", label: "Produção", color: "#10b981", textColor: "#ffffff" },
  { value: "pos_producao", label: "Pós-produção", color: "#06b6d4", textColor: "#ffffff" },
  { value: "finalizado", label: "Finalizado", color: "#22c55e", textColor: "#ffffff" },
  { value: "em_exibicao", label: "Em exibição", color: "#ec4899", textColor: "#ffffff" },
  { value: "distribution", label: "Distribuição", color: "#0ea5e9", textColor: "#ffffff" },
];

// Preset colors for quick selection
const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
  "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef",
  "#ec4899", "#f43f5e", "#6b7280", "#374151", "#000000",
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
  const [editingColors, setEditingColors] = useState<string | null>(null);
  const [tempColor, setTempColor] = useState("#6366f1");
  const [tempTextColor, setTempTextColor] = useState("#ffffff");
  const queryClient = useQueryClient();
  
  // Load options from database
  const { data: dbOptions, isLoading } = useProjectOptions('project_stages');
  const addOptionMutation = useAddProjectOption('project_stages');
  const removeOptionMutation = useRemoveProjectOption('project_stages');

  // Use database options if available, otherwise fallback to defaults
  const options = dbOptions && dbOptions.length > 0 ? dbOptions : DEFAULT_STAGE_OPTIONS;

  const toggleStage = (stage: string) => {
    if (confirmingDelete || editingColors) return;
    // Single selection only - clicking the same stage deselects it, clicking another replaces
    if (value.includes(stage)) {
      onChange([]);
    } else {
      onChange([stage]);
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
    
    // Add to database with default colors
    await addOptionMutation.mutateAsync({ 
      value: newValue, 
      label: trimmed,
      color: "#6366f1",
      textColor: "#ffffff"
    });
    
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

  const openColorEditor = (stageValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const stage = options.find(s => s.value === stageValue);
    if (stage) {
      setTempColor(stage.color || "#6366f1");
      setTempTextColor(stage.textColor || "#ffffff");
      setEditingColors(stageValue);
    }
  };

  const saveColors = async () => {
    if (!editingColors) return;

    try {
      // Get current options
      const { data, error: fetchError } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'project_stages')
        .maybeSingle();

      if (fetchError) throw fetchError;

      let currentOptions: OptionItem[] = [];
      if (data?.value && Array.isArray(data.value)) {
        currentOptions = (data.value as unknown[]).map((v) => {
          const obj = v as Record<string, unknown>;
          return {
            value: String(obj.value || ''),
            label: String(obj.label || ''),
            color: obj.color ? String(obj.color) : undefined,
            textColor: obj.textColor ? String(obj.textColor) : undefined,
          };
        });
      }

      // Update the specific stage colors
      const updatedOptions = currentOptions.map(opt => {
        if (opt.value === editingColors) {
          return { ...opt, color: tempColor, textColor: tempTextColor };
        }
        return opt;
      });

      // Save to database
      const { error: updateError } = await supabase
        .from('settings')
        .update({ 
          value: updatedOptions as unknown as Json,
          updated_at: new Date().toISOString() 
        })
        .eq('key', 'project_stages');

      if (updateError) throw updateError;

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['settings', 'project_stages'] });
      toast.success('Cores atualizadas com sucesso');
      setEditingColors(null);
    } catch (error) {
      console.error('Erro ao salvar cores:', error);
      toast.error('Erro ao salvar cores');
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

      {/* All stages - click to toggle, palette to edit colors, X to delete */}
      <div className="flex flex-wrap gap-2">
        {options.map((stage) => {
          const isSelected = value.includes(stage.value);
          const isConfirming = confirmingDelete === stage.value;
          const stageColor = stage.color || "#6366f1";
          const stageTextColor = stage.textColor || "#ffffff";
          
          return (
            <Badge
              key={stage.value}
              variant="outline"
              onClick={() => toggleStage(stage.value)}
              style={{
                backgroundColor: isSelected ? stageColor : 'transparent',
                color: isSelected ? stageTextColor : undefined,
                borderColor: stageColor,
              }}
              className={cn(
                "cursor-pointer transition-all select-none flex items-center gap-1",
                !isSelected && "hover:bg-muted",
                isConfirming && "ring-2 ring-red-500/50"
              )}
            >
              <span>{stage.label}</span>
              {allowCustom && !isConfirming && (
                <div className="flex items-center gap-0.5 ml-1">
                  <Popover open={editingColors === stage.value} onOpenChange={(open) => !open && setEditingColors(null)}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        onClick={(e) => openColorEditor(stage.value, e)}
                        className="hover:bg-white/20 rounded-full p-0.5"
                      >
                        <Palette className="h-3 w-3" style={{ color: isSelected ? stageTextColor : stageColor }} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-3" onClick={(e) => e.stopPropagation()}>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="text-xs">Cor de fundo</Label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="color"
                              value={tempColor}
                              onChange={(e) => setTempColor(e.target.value)}
                              className="w-10 h-8 rounded cursor-pointer border-0"
                            />
                            <Input 
                              value={tempColor} 
                              onChange={(e) => setTempColor(e.target.value)}
                              className="flex-1 h-8 text-xs"
                            />
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {PRESET_COLORS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => setTempColor(color)}
                                className={cn(
                                  "w-5 h-5 rounded border border-border hover:scale-110 transition-transform",
                                  tempColor === color && "ring-2 ring-primary"
                                )}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-xs">Cor do texto</Label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setTempTextColor("#ffffff")}
                              className={cn(
                                "flex-1 h-8 rounded border text-xs font-medium",
                                tempTextColor === "#ffffff" && "ring-2 ring-primary"
                              )}
                              style={{ backgroundColor: tempColor, color: "#ffffff" }}
                            >
                              Branco
                            </button>
                            <button
                              type="button"
                              onClick={() => setTempTextColor("#000000")}
                              className={cn(
                                "flex-1 h-8 rounded border text-xs font-medium",
                                tempTextColor === "#000000" && "ring-2 ring-primary"
                              )}
                              style={{ backgroundColor: tempColor, color: "#000000" }}
                            >
                              Preto
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex justify-end gap-2 pt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingColors(null)}
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={saveColors}
                          >
                            Salvar
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmingDelete(stage.value);
                    }}
                    className="hover:bg-red-500/30 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3 text-red-400" />
                  </button>
                </div>
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
        <p className="text-xs text-muted-foreground">Clique para selecionar o estágio do projeto</p>
      )}
    </div>
  );
};

export const getStageLabel = (value: string): string => {
  const stage = DEFAULT_STAGE_OPTIONS.find(s => s.value === value);
  return stage?.label || value;
};

export const STAGES = DEFAULT_STAGE_OPTIONS;
