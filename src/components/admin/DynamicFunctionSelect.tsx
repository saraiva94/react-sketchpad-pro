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

interface DynamicFunctionSelectProps {
  value: string;
  onChange: (value: string) => void;
  allowManage?: boolean; // Only admins can add/delete
  label?: string;
}

const DEFAULT_FUNCTIONS = [
  "Diretor",
  "Produtor Executivo",
  "Roteirista",
  "Diretor de Fotografia",
  "Editor",
  "Diretor de Arte",
  "Som Direto",
  "Figurinista",
  "Maquiador",
  "Ator/Atriz",
  "Elenco",
  "Compositor",
  "Assistente de Direção",
  "Coordenador de Produção",
  "Coreógrafo",
  "Iluminador",
  "Cenógrafo",
];

export const DynamicFunctionSelect = ({
  value,
  onChange,
  allowManage = true,
  label = "Função",
}: DynamicFunctionSelectProps) => {
  const { toast } = useToast();
  const [functions, setFunctions] = useState<string[]>(DEFAULT_FUNCTIONS);
  const [newFunction, setNewFunction] = useState("");
  const [deletingFunction, setDeletingFunction] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchFunctions();
  }, []);

  const fetchFunctions = async () => {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "project_functions")
      .maybeSingle();

    if (data && data.value) {
      const funcs = (data.value as { functions: string[] }).functions;
      if (funcs && funcs.length > 0) {
        setFunctions(funcs);
      }
    }
  };

  const saveFunctions = async (funcs: string[]) => {
    const { data: existing } = await supabase
      .from("settings")
      .select("id")
      .eq("key", "project_functions")
      .maybeSingle();

    if (existing) {
      await supabase
        .from("settings")
        .update({ value: { functions: funcs } })
        .eq("key", "project_functions");
    } else {
      await supabase
        .from("settings")
        .insert({ key: "project_functions", value: { functions: funcs } });
    }
  };

  const handleAddFunction = async () => {
    if (!newFunction.trim()) return;
    
    if (functions.includes(newFunction.trim())) {
      toast({
        title: "Função já existe",
        description: "Esta função já está na lista.",
        variant: "destructive",
      });
      return;
    }

    const updatedFunctions = [...functions, newFunction.trim()];
    setFunctions(updatedFunctions);
    await saveFunctions(updatedFunctions);
    setNewFunction("");
    
    toast({
      title: "Função adicionada",
      description: `"${newFunction.trim()}" foi adicionada à lista.`,
    });
  };

  const handleDeleteFunction = async (funcToDelete: string) => {
    const updatedFunctions = functions.filter(f => f !== funcToDelete);
    setFunctions(updatedFunctions);
    await saveFunctions(updatedFunctions);
    setDeletingFunction(null);
    
    // If the deleted function was selected, clear the selection
    if (value === funcToDelete) {
      onChange("");
    }
    
    toast({
      title: "Função removida",
      description: `"${funcToDelete}" foi removida da lista.`,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddFunction();
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
          <SelectValue placeholder="Selecione a função" />
        </SelectTrigger>
        <SelectContent className="bg-popover border border-border shadow-lg z-50 max-h-[300px]">
          {/* Add new function input - only for admins */}
          {allowManage && (
            <div className="flex items-center gap-2 p-2 border-b border-border sticky top-0 bg-popover z-10">
              <Input
                placeholder="Nova função..."
                value={newFunction}
                onChange={(e) => setNewFunction(e.target.value)}
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
                  handleAddFunction();
                }}
                disabled={!newFunction.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {functions.map((func) => (
            <div
              key={func}
              className="relative flex items-center group"
            >
              <SelectItem 
                value={func} 
                className="flex-1 pr-10"
              >
                {func}
              </SelectItem>
              
              {/* Delete button - only for admins */}
              {allowManage && (
                <div className="absolute right-2 flex items-center">
                  {deletingFunction === func ? (
                    // Confirmation icons
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFunction(func);
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
                          setDeletingFunction(null);
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
                        setDeletingFunction(func);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DynamicFunctionSelect;
