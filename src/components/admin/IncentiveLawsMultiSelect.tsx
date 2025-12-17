import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
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
  allowCustom?: boolean;
}

export const IncentiveLawsMultiSelect = ({ 
  value, 
  onChange, 
  label = "Leis de Incentivo",
  allowCustom = false 
}: IncentiveLawsMultiSelectProps) => {
  const [newLaw, setNewLaw] = useState("");

  const toggleLaw = (law: string) => {
    if (value.includes(law)) {
      onChange(value.filter(l => l !== law));
    } else {
      onChange([...value, law]);
    }
  };

  const removeLaw = (law: string) => {
    onChange(value.filter(l => l !== law));
  };

  const addCustomLaw = () => {
    const trimmed = newLaw.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
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

      {/* All laws with remove X */}
      <div className="flex flex-wrap gap-2">
        {INCENTIVE_LAW_OPTIONS.map((law) => {
          const isSelected = value.includes(law.value);
          return (
            <Badge
              key={law.value}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-all select-none flex items-center gap-1",
                isSelected 
                  ? "bg-primary text-primary-foreground hover:bg-primary/80 pr-1" 
                  : "hover:bg-muted"
              )}
              onClick={() => !isSelected && toggleLaw(law.value)}
            >
              {law.label}
              {isSelected && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeLaw(law.value);
                  }}
                  className="ml-0.5 hover:bg-red-500/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3 text-red-400" />
                </button>
              )}
            </Badge>
          );
        })}
        
        {/* Custom laws */}
        {value.filter(v => !INCENTIVE_LAW_OPTIONS.find(l => l.value === v)).map((law) => (
          <Badge
            key={law}
            variant="default"
            className="bg-accent text-accent-foreground pr-1 flex items-center gap-1"
          >
            {law}
            <button
              type="button"
              onClick={() => removeLaw(law)}
              className="ml-0.5 hover:bg-red-500/20 rounded-full p-0.5"
            >
              <X className="h-3 w-3 text-red-400" />
            </button>
          </Badge>
        ))}
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
