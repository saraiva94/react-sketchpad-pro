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
const DEFAULT_CATEGORY_OPTIONS: OptionItem[] = [
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
}

export const CategoriesMultiSelect = ({ 
  value, 
  onChange, 
  label = "Categorias",
  allowCustom = false
}: CategoriesMultiSelectProps) => {
  const [newTag, setNewTag] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  
  // Load options from database
  const { data: dbOptions, isLoading } = useProjectOptions('project_categories');
  const addOptionMutation = useAddProjectOption('project_categories');
  const removeOptionMutation = useRemoveProjectOption('project_categories');

  // Use database options if available, otherwise fallback to defaults
  const options = dbOptions && dbOptions.length > 0 ? dbOptions : DEFAULT_CATEGORY_OPTIONS;

  const toggleCategory = (category: string) => {
    if (confirmingDelete) return;
    if (value.includes(category)) {
      onChange(value.filter(c => c !== category));
    } else {
      onChange([...value, category]);
    }
  };

  const confirmDelete = async (optionValue: string) => {
    // Check if in use
    const { data: projectsUsingIt } = await supabase
      .from('projects')
      .select('id')
      .contains('categorias_tags', [optionValue])
      .limit(1);

    if (projectsUsingIt && projectsUsingIt.length > 0) {
      toast.error('Esta categoria está sendo usada em projetos e não pode ser removida');
      setConfirmingDelete(null);
      return;
    }

    // Remove from selected values
    if (value.includes(optionValue)) {
      onChange(value.filter(c => c !== optionValue));
    }
    
    // Remove from database
    await removeOptionMutation.mutateAsync(optionValue);
    setConfirmingDelete(null);
  };

  const addCustomTag = async () => {
    const trimmed = newTag.trim();
    if (!trimmed) return;
    
    // Create value from label (lowercase, underscores)
    const newValue = trimmed.toLowerCase().replace(/\s+/g, '_').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Add to database
    await addOptionMutation.mutateAsync({ value: newValue, label: trimmed });
    
    // Select the new option
    if (!value.includes(newValue)) {
      onChange([...value, newValue]);
    }
    setNewTag("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomTag();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {label && <Label>{label}</Label>}
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Carregando categorias...</span>
        </div>
      </div>
    );
  }

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
            disabled={!newTag.trim() || addOptionMutation.isPending}
          >
            {addOptionMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {/* All tags - click to toggle, X to delete */}
      <div className="flex flex-wrap gap-2">
        {options.map((cat) => {
          const isSelected = value.includes(cat.value);
          const isConfirming = confirmingDelete === cat.value;
          
          return (
            <Badge
              key={cat.value}
              variant={isSelected ? "default" : "outline"}
              onClick={() => toggleCategory(cat.value)}
              className={cn(
                "cursor-pointer transition-all select-none text-xs flex items-center gap-1",
                isSelected 
                  ? "bg-primary text-primary-foreground hover:bg-primary/80" 
                  : "hover:bg-muted",
                isConfirming && "ring-2 ring-red-500/50"
              )}
            >
              <span>{cat.label}</span>
              {allowCustom && !isConfirming && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmingDelete(cat.value);
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
                      confirmDelete(cat.value);
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
