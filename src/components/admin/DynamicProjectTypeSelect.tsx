import { useState, useEffect } from "react";
import { Plus, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DynamicProjectTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  allowManage?: boolean; // Only admins can add/delete
  label?: string;
}

const DEFAULT_PROJECT_TYPES = [
  "Longa-metragem ficção",
  "Longa-metragem documentário",
  "Curta-metragem ficção",
  "Curta-metragem documentário",
  "Série ficção",
  "Série documental",
  "Videocast",
  "Podcast",
  "Evento Cultural",
  "Musical",
  "Teatro",
  "Performance",
  "Instalação",
  "Videoclipe",
  "Projeto educativo",
  "Projeto formativo",
  "Projeto transmídia",
];

export const DynamicProjectTypeSelect = ({
  value,
  onChange,
  allowManage = false,
  label = "Tipo de Projeto",
}: DynamicProjectTypeSelectProps) => {
  const { toast } = useToast();
  const [projectTypes, setProjectTypes] = useState<string[]>(DEFAULT_PROJECT_TYPES);
  const [newType, setNewType] = useState("");
  const [deletingType, setDeletingType] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchProjectTypes();
  }, []);

  const fetchProjectTypes = async () => {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "project_types")
      .maybeSingle();

    if (data && data.value) {
      const types = (data.value as { types: string[] }).types;
      if (types && types.length > 0) {
        setProjectTypes(types);
      }
    }
  };

  const saveProjectTypes = async (types: string[]) => {
    const { data: existing } = await supabase
      .from("settings")
      .select("id")
      .eq("key", "project_types")
      .maybeSingle();

    if (existing) {
      await supabase
        .from("settings")
        .update({ value: { types } })
        .eq("key", "project_types");
    } else {
      await supabase
        .from("settings")
        .insert({ key: "project_types", value: { types } });
    }
  };

  const handleAddType = async () => {
    if (!newType.trim()) return;
    
    if (projectTypes.includes(newType.trim())) {
      toast({
        title: "Tipo já existe",
        description: "Este tipo de projeto já está na lista.",
        variant: "destructive",
      });
      return;
    }

    const updatedTypes = [...projectTypes, newType.trim()];
    setProjectTypes(updatedTypes);
    await saveProjectTypes(updatedTypes);
    setNewType("");
    
    toast({
      title: "Tipo adicionado",
      description: `"${newType.trim()}" foi adicionado à lista.`,
    });
  };

  const handleDeleteType = async (typeToDelete: string) => {
    const updatedTypes = projectTypes.filter(t => t !== typeToDelete);
    setProjectTypes(updatedTypes);
    await saveProjectTypes(updatedTypes);
    setDeletingType(null);
    
    // If the deleted type was selected, clear the selection
    if (value === typeToDelete) {
      onChange("");
    }
    
    toast({
      title: "Tipo removido",
      description: `"${typeToDelete}" foi removido da lista.`,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddType();
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select 
        value={value} 
        onValueChange={onChange}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SelectTrigger className="bg-background">
          <SelectValue placeholder="Selecione o tipo" />
        </SelectTrigger>
        <SelectContent className="bg-popover border border-border shadow-lg z-50 max-h-[300px]">
          {/* Add new type input - only for admins */}
          {allowManage && (
            <div className="flex items-center gap-2 p-2 border-b border-border sticky top-0 bg-popover z-10">
              <Input
                placeholder="Novo tipo..."
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8 text-sm flex-1"
                onClick={(e) => e.stopPropagation()}
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddType();
                }}
                disabled={!newType.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {projectTypes.map((type) => (
            <div
              key={type}
              className="relative flex items-center group"
            >
              <SelectItem 
                value={type} 
                className="flex-1 pr-10"
              >
                {type}
              </SelectItem>
              
              {/* Delete button - only for admins */}
              {allowManage && (
                <div className="absolute right-2 flex items-center">
                  {deletingType === type ? (
                    // Confirmation icons
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteType(type);
                        }}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeletingType(null);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    // Delete button (hidden until hover)
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingType(type);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {/* Outro option */}
          <SelectItem value="Outro">Outro</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default DynamicProjectTypeSelect;
