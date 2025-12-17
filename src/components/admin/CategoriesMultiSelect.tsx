import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_CATEGORY_OPTIONS = [
  { value: "cinema", label: "Cinema" },
  { value: "teatro", label: "Teatro" },
  { value: "audiovisual", label: "Audiovisual" },
  { value: "videocast", label: "Videocast" },
  { value: "podcast", label: "Podcast" },
  { value: "webserie", label: "Websérie" },
  { value: "musica", label: "Música" },
  { value: "espetaculo_infantil", label: "Espetáculo Infantil" },
  { value: "projeto_educativo", label: "Projeto Educativo" },
  { value: "impacto_social", label: "Impacto Social" },
  { value: "meio_ambiente", label: "Meio Ambiente" },
  { value: "mulheres", label: "Mulheres" },
  { value: "lgbtqia", label: "LGBTQIA+" },
  { value: "comunidade", label: "Comunidade" },
  { value: "familia", label: "Família" },
  { value: "juventude", label: "Juventude" },
  { value: "multiplataforma", label: "Projeto Multiplataforma" },
  { value: "cultura_negra", label: "Cultura Negra" },
  { value: "acessibilidade", label: "Acessibilidade" },
  { value: "sustentabilidade", label: "Sustentabilidade" },
  { value: "ficcao", label: "Ficção" },
  { value: "documentario", label: "Documentário" },
];

interface CategoriesMultiSelectProps {
  value: string[];
  onChange: (categories: string[]) => void;
  label?: string;
  allowCustom?: boolean;
  availableOptions?: string[];
  onOptionsChange?: (options: string[]) => void;
}

export const CategoriesMultiSelect = ({ 
  value, 
  onChange, 
  label = "Categorias",
  allowCustom = false,
  availableOptions,
  onOptionsChange
}: CategoriesMultiSelectProps) => {
  const [newTag, setNewTag] = useState("");
  
  // Internal state for options when allowCustom but no external control
  const [internalOptions, setInternalOptions] = useState<string[]>(() => 
    DEFAULT_CATEGORY_OPTIONS.map(o => o.value)
  );

  // Determine which options to use
  const optionValues = availableOptions ?? internalOptions;
  
  // Build display options
  const options = optionValues.map(v => {
    const def = DEFAULT_CATEGORY_OPTIONS.find(d => d.value === v);
    return { value: v, label: def?.label || v };
  });

  const toggleCategory = (category: string) => {
    if (value.includes(category)) {
      onChange(value.filter(c => c !== category));
    } else {
      onChange([...value, category]);
    }
  };

  const deleteOption = (optionValue: string) => {
    // Remove from selected values
    if (value.includes(optionValue)) {
      onChange(value.filter(c => c !== optionValue));
    }
    // Remove from options
    if (onOptionsChange && availableOptions) {
      onOptionsChange(availableOptions.filter(o => o !== optionValue));
    } else if (allowCustom) {
      setInternalOptions(prev => prev.filter(o => o !== optionValue));
    }
  };

  const addCustomTag = () => {
    const trimmed = newTag.trim();
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
    setNewTag("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomTag();
    }
  };

  return (
    <div className="space-y-3">
      {label && <Label>{label}</Label>}
      
      {/* Add custom tag input */}
      {allowCustom && (
        <div className="flex gap-2">
          <Input
            placeholder="Adicionar nova categoria..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={addCustomTag}
            disabled={!newTag.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* All tags - click to toggle, X to delete */}
      <div className="flex flex-wrap gap-2">
        {options.map((cat) => {
          const isSelected = value.includes(cat.value);
          return (
            <Badge
              key={cat.value}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-all select-none text-xs flex items-center gap-1",
                isSelected 
                  ? "bg-primary text-primary-foreground hover:bg-primary/80" 
                  : "hover:bg-muted"
              )}
            >
              <span onClick={() => toggleCategory(cat.value)}>{cat.label}</span>
              {allowCustom && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteOption(cat.value);
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
        <p className="text-xs text-muted-foreground">Clique para selecionar as categorias</p>
      )}
    </div>
  );
};

export const getCategoryLabel = (value: string): string => {
  const cat = DEFAULT_CATEGORY_OPTIONS.find(c => c.value === value);
  return cat?.label || value;
};

export const CATEGORIES = DEFAULT_CATEGORY_OPTIONS;
