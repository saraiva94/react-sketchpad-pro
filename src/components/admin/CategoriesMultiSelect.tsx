import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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

  // Merge predefined options with custom tags
  const customTags = value.filter(v => !CATEGORY_OPTIONS.find(c => c.value === v));
  const allOptions = [
    ...CATEGORY_OPTIONS,
    ...customTags.map(tag => ({ value: tag, label: tag }))
  ];

  return (
    <div className="space-y-3">
      {label && <Label>{label}</Label>}
      
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
            size="icon"
            onClick={addCustomTag}
            disabled={!newTag.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* All tags - click to toggle */}
      <div className="flex flex-wrap gap-2">
        {allOptions.map((cat) => {
          const isSelected = value.includes(cat.value);
          return (
            <Badge
              key={cat.value}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "cursor-pointer transition-all select-none text-xs",
                isSelected 
                  ? "bg-primary text-primary-foreground hover:bg-primary/80" 
                  : "hover:bg-muted"
              )}
              onClick={() => toggleCategory(cat.value)}
            >
              {cat.label}
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
  const cat = CATEGORY_OPTIONS.find(c => c.value === value);
  return cat?.label || value;
};

export const CATEGORIES = CATEGORY_OPTIONS;
