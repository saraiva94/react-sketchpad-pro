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
const DEFAULT_INCENTIVE_LAW_OPTIONS: OptionItem[] = [
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
  allowCustom?: boolean;
}

export const IncentiveLawsMultiSelect = ({ 
  value, 
  onChange, 
  label = "Leis de Incentivo",
  allowCustom = false
}: IncentiveLawsMultiSelectProps) => {
  const [newLaw, setNewLaw] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  
  // Load options from database
  const { data: dbOptions, isLoading } = useProjectOptions('incentive_laws');
  const addOptionMutation = useAddProjectOption('incentive_laws');
  const removeOptionMutation = useRemoveProjectOption('incentive_laws');

  // Use database options if available, otherwise fallback to defaults
  const options = dbOptions && dbOptions.length > 0 ? dbOptions : DEFAULT_INCENTIVE_LAW_OPTIONS;

  const toggleLaw = (law: string) => {
    if (confirmingDelete) return;
    if (value.includes(law)) {
      onChange(value.filter(l => l !== law));
    } else {
      onChange([...value, law]);
    }
  };

  const confirmDelete = async (optionValue: string) => {
    // Check if in use (incentive_law_details is a text field, not array)
    const { data: projectsUsingIt } = await supabase
      .from('projects')
      .select('id')
      .ilike('incentive_law_details', `%${optionValue}%`)
      .limit(1);

    if (projectsUsingIt && projectsUsingIt.length > 0) {
      toast.error('Esta lei de incentivo está sendo usada em projetos e não pode ser removida');
      setConfirmingDelete(null);
      return;
    }

    // Remove from selected values
    if (value.includes(optionValue)) {
      onChange(value.filter(l => l !== optionValue));
    }
    
    // Remove from database
    await removeOptionMutation.mutateAsync(optionValue);
    setConfirmingDelete(null);
  };

  const addCustomLaw = async () => {
    const trimmed = newLaw.trim();
    if (!trimmed) return;
    
    // Create value from label (lowercase, underscores)
    const newValue = trimmed.toLowerCase().replace(/\s+/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Add to database
    await addOptionMutation.mutateAsync({ value: newValue, label: trimmed });
    
    // Select the new option
    if (!value.includes(newValue)) {
      onChange([...value, newValue]);
    }
    setNewLaw("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomLaw();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {label && <Label>{label}</Label>}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Carregando leis de incentivo...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {label && <Label>{label}</Label>}
      
      {/* Add custom law input */}
      {allowCustom && (
        <div className="flex gap-2">
          <Input
            placeholder="Adicionar nova lei..."
            value={newLaw}
            onChange={(e) => setNewLaw(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={addCustomLaw}
            disabled={!newLaw.trim() || addOptionMutation.isPending}
          >
            {addOptionMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {/* All laws - click to toggle, X to delete */}
      <div className="flex flex-wrap gap-2">
        {options.map((law) => {
          const isSelected = value.includes(law.value);
          const isConfirming = confirmingDelete === law.value;
          
          return (
            <Badge
              key={law.value}
              variant={isSelected ? "default" : "outline"}
              onClick={() => toggleLaw(law.value)}
              className={cn(
                "cursor-pointer transition-all select-none flex items-center gap-1",
                isSelected 
                  ? "bg-primary text-primary-foreground hover:bg-primary/80" 
                  : "hover:bg-muted",
                isConfirming && "ring-2 ring-red-500/50"
              )}
            >
              <span>{law.label}</span>
              {allowCustom && !isConfirming && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmingDelete(law.value);
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
                      confirmDelete(law.value);
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
        <p className="text-xs text-muted-foreground">Clique para selecionar as leis de incentivo</p>
      )}
    </div>
  );
};

export const normalizeIncentiveLawValue = (raw: string): string => {
  const v = raw.trim();
  const lower = v.toLowerCase();

  if (lower === "lei rouanet" || lower === "rouanet" || lower.includes("rouanet")) return "lei_rouanet";
  if (lower === "lei do audiovisual" || lower === "audiovisual" || lower.includes("audiovisual")) return "lei_audiovisual";
  if (lower === "icms rj" || lower === "icms" || lower.includes("icms")) return "icms_rj";
  if (lower === "iss rj" || lower === "iss" || lower.includes("iss")) return "iss_rj";
  if (lower === "proac" || lower.includes("proac")) return "proac";
  if (lower === "outros" || lower === "outro" || lower.includes("outro")) return "outros";

  return v;
};

export const getIncentiveLawLabel = (value: string): string => {
  const normalized = normalizeIncentiveLawValue(value);
  const law = DEFAULT_INCENTIVE_LAW_OPTIONS.find((l) => l.value === normalized);
  return law?.label || value;
};

export const INCENTIVE_LAWS = DEFAULT_INCENTIVE_LAW_OPTIONS;
