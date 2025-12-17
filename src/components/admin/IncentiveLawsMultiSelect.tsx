import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_INCENTIVE_LAW_OPTIONS = [
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
  availableOptions?: string[];
  onOptionsChange?: (options: string[]) => void;
}

export const IncentiveLawsMultiSelect = ({ 
  value, 
  onChange, 
  label = "Leis de Incentivo",
  allowCustom = false,
  availableOptions,
  onOptionsChange
}: IncentiveLawsMultiSelectProps) => {
  const [newLaw, setNewLaw] = useState("");

  // Use provided options or defaults
  const options = availableOptions 
    ? availableOptions.map(v => {
        const def = DEFAULT_INCENTIVE_LAW_OPTIONS.find(d => d.value === v);
        return { value: v, label: def?.label || v };
      })
    : DEFAULT_INCENTIVE_LAW_OPTIONS;

  const toggleLaw = (law: string) => {
    if (value.includes(law)) {
      onChange(value.filter(l => l !== law));
    } else {
      onChange([...value, law]);
    }
  };

  const deleteOption = (optionValue: string) => {
    // Remove from selected values
    if (value.includes(optionValue)) {
      onChange(value.filter(l => l !== optionValue));
    }
    // Remove from available options
    if (onOptionsChange && availableOptions) {
      onOptionsChange(availableOptions.filter(o => o !== optionValue));
    }
  };

  const addCustomLaw = () => {
    const trimmed = newLaw.trim();
    if (trimmed) {
      // Add to available options if using custom options
      if (onOptionsChange && availableOptions && !availableOptions.includes(trimmed)) {
        onOptionsChange([...availableOptions, trimmed]);
      }
      // Also select it
      if (!value.includes(trimmed)) {
        onChange([...value, trimmed]);
      }
      setNewLaw("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomLaw();
    }
  };

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
            disabled={!newLaw.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* All laws - click to toggle, X to delete */}
      <div className="flex flex-wrap gap-2">
        {options.map((law) => {
          const isSelected = value.includes(law.value);
          return (
            <Badge
              key={law.value}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-all select-none flex items-center gap-1",
                isSelected 
                  ? "bg-primary text-primary-foreground hover:bg-primary/80" 
                  : "hover:bg-muted"
              )}
            >
              <span onClick={() => toggleLaw(law.value)}>{law.label}</span>
              {allowCustom && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteOption(law.value);
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
        <p className="text-xs text-muted-foreground">Clique para selecionar as leis de incentivo</p>
      )}
    </div>
  );
};

export const getIncentiveLawLabel = (value: string): string => {
  const law = DEFAULT_INCENTIVE_LAW_OPTIONS.find(l => l.value === value);
  return law?.label || value;
};

export const INCENTIVE_LAWS = DEFAULT_INCENTIVE_LAW_OPTIONS;
