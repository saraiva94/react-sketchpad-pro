import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
}

export const CategoriesMultiSelect = ({ value, onChange, label = "Categorias/Tags" }: CategoriesMultiSelectProps) => {
  const toggleCategory = (category: string) => {
    if (value.includes(category)) {
      onChange(value.filter(c => c !== category));
    } else {
      onChange([...value, category]);
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex flex-wrap gap-2">
        {CATEGORY_OPTIONS.map((cat) => {
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
