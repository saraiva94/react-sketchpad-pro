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

interface DynamicLocationSelectProps {
  value: string;
  onChange: (value: string) => void;
  allowManage?: boolean; // Only admins can add/delete
  label?: string;
}

const DEFAULT_LOCATIONS = [
  "São Paulo",
  "Rio de Janeiro",
  "Belo Horizonte",
  "Brasília",
  "Salvador",
  "Recife",
  "Porto Alegre",
  "Manaus",
  "Curitiba",
  "Fortaleza",
];

export const DynamicLocationSelect = ({
  value,
  onChange,
  allowManage = false,
  label = "Localização",
}: DynamicLocationSelectProps) => {
  const { toast } = useToast();
  const [locations, setLocations] = useState<string[]>(DEFAULT_LOCATIONS);
  const [newLocation, setNewLocation] = useState("");
  const [deletingLocation, setDeletingLocation] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    const { data } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "project_locations")
      .maybeSingle();

    if (data && data.value) {
      const locs = (data.value as { locations: string[] }).locations;
      if (locs && locs.length > 0) {
        setLocations(locs);
      }
    }
  };

  const saveLocations = async (locs: string[]) => {
    const { data: existing } = await supabase
      .from("settings")
      .select("id")
      .eq("key", "project_locations")
      .maybeSingle();

    if (existing) {
      await supabase
        .from("settings")
        .update({ value: { locations: locs } })
        .eq("key", "project_locations");
    } else {
      await supabase
        .from("settings")
        .insert({ key: "project_locations", value: { locations: locs } });
    }
  };

  const handleAddLocation = async () => {
    if (!newLocation.trim()) return;
    
    if (locations.includes(newLocation.trim())) {
      toast({
        title: "Cidade já existe",
        description: "Esta cidade já está na lista.",
        variant: "destructive",
      });
      return;
    }

    const updatedLocations = [...locations, newLocation.trim()];
    setLocations(updatedLocations);
    await saveLocations(updatedLocations);
    setNewLocation("");
    
    toast({
      title: "Cidade adicionada",
      description: `"${newLocation.trim()}" foi adicionada à lista.`,
    });
  };

  const handleDeleteLocation = async (locationToDelete: string) => {
    const updatedLocations = locations.filter(l => l !== locationToDelete);
    setLocations(updatedLocations);
    await saveLocations(updatedLocations);
    setDeletingLocation(null);
    
    // If the deleted location was selected, clear the selection
    if (value === locationToDelete) {
      onChange("");
    }
    
    toast({
      title: "Cidade removida",
      description: `"${locationToDelete}" foi removida da lista.`,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddLocation();
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
          <SelectValue placeholder="Selecione a cidade" />
        </SelectTrigger>
        <SelectContent className="bg-popover border border-border shadow-lg z-50 max-h-[300px]">
          {/* Add new location input - only for admins */}
          {allowManage && (
            <div className="flex items-center gap-2 p-2 border-b border-border sticky top-0 bg-popover z-10">
              <Input
                placeholder="Nova cidade..."
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
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
                  handleAddLocation();
                }}
                disabled={!newLocation.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          {locations.map((loc) => (
            <div
              key={loc}
              className="relative flex items-center group"
            >
              <SelectItem 
                value={loc} 
                className="flex-1 pr-10"
              >
                {loc}
              </SelectItem>
              
              {/* Delete button - only for admins */}
              {allowManage && (
                <div className="absolute right-2 flex items-center">
                  {deletingLocation === loc ? (
                    // Confirmation icons
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLocation(loc);
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
                          setDeletingLocation(null);
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
                        setDeletingLocation(loc);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
          
          {/* Outra option */}
          <SelectItem value="Outra">Outra cidade</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

// Helper function to fetch locations (for use in filters)
export const fetchProjectLocations = async (): Promise<string[]> => {
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "project_locations")
    .maybeSingle();

  if (data && data.value) {
    const locs = (data.value as { locations: string[] }).locations;
    if (locs && locs.length > 0) {
      return locs;
    }
  }
  
  return DEFAULT_LOCATIONS;
};

export default DynamicLocationSelect;
