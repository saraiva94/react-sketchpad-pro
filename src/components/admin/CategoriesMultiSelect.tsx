import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_OPTIONS = [
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
  label = "Categorias/Tags",
  allowCustom = false 
}: CategoriesMultiSelectProps) => {
  const [newTag, setNewTag] = useState("");

  const toggleCategory = (category: string) => {
    if (value.includes(category)) {
      onChange(value.filter(c => c !== category));
    } else {
      onChange([...value, category]);
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter(c => c !== tag));
  };

  const addCustomTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setNewTag("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustomTag();
    }
  };

  // Get custom tags (tags that are not in predefined options)
  const predefinedValues = CATEGORY_OPTIONS.map(c => c.value);
  const customTags = value.filter(v => !predefinedValues.includes(v));

  return (
    <div className="space-y-3">
      {label && <Label>{label}</Label>}
      
      {/* Selected tags with remove button */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-md">
          <span className="text-xs text-muted-foreground w-full mb-1">Selecionadas:</span>
          {value.map((tag) => {
            const predefined = CATEGORY_OPTIONS.find(c => c.value === tag);
            const displayLabel = predefined?.label || tag;
            return (
              <Badge
                key={tag}
                variant="default"
                className="bg-primary text-primary-foreground pr-1 flex items-center gap-1"
              >
                {displayLabel}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      {/* Add custom tag input */}
      {allowCustom && (
        <div className="flex gap-2">
          <Input
            placeholder="Adicionar nova tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCustomTag}
            disabled={!newTag.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Predefined options */}
      <div className="flex flex-wrap gap-2">
        {CATEGORY_OPTIONS.map((cat) => {
          const isSelected = value.includes(cat.value);
          return (
            <Badge
              key={cat.value}
              variant={isSelected ? "secondary" : "outline"}
              className={cn(
                "cursor-pointer transition-all select-none text-xs",
                isSelected 
                  ? "bg-secondary text-secondary-foreground opacity-50" 
                  : "hover:bg-muted"
              )}
              onClick={() => toggleCategory(cat.value)}
            >
              {cat.label}
            </Badge>
          );
        })}
      </div>

      {/* Custom tags section */}
      {customTags.length > 0 && (
        <div className="pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">Tags personalizadas:</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {customTags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-accent text-accent-foreground opacity-50"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {value.length === 0 && (
        <p className="text-xs text-muted-foreground">Clique para selecionar as categorias</p>
      )}
    </div>
  );
};

export const getCategoryLabel = (value: string): string => {
  const cat = CATEGORY_OPTIONS.find(c => c.value === value);
  return cat?.label || value;
};

export const CATEGORIES = CATEGORY_OPTIONS;
