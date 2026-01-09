import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export type SettingKey = 
  | 'project_types' 
  | 'project_locations' 
  | 'project_categories' 
  | 'project_stages' 
  | 'incentive_laws';

export interface OptionItem {
  value: string;
  label: string;
  color?: string;
  textColor?: string;
}

// Type guard for OptionItem
const isOptionItem = (item: unknown): item is OptionItem => {
  return typeof item === 'object' && item !== null && 'value' in item && 'label' in item;
};

// Convert OptionItem[] to Json-compatible format (preserving all fields)
const toJsonArray = (options: OptionItem[]): Json => {
  return options.map(opt => ({
    value: opt.value,
    label: opt.label,
    ...(opt.color && { color: opt.color }),
    ...(opt.textColor && { textColor: opt.textColor }),
  })) as unknown as Json;
};

/**
 * Hook unificado para carregar opções dinâmicas do banco
 * Substitui DEFAULT_*_OPTIONS hardcoded
 */
export const useProjectOptions = (settingKey: SettingKey) => {
  return useQuery({
    queryKey: ['settings', settingKey],
    queryFn: async (): Promise<OptionItem[]> => {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', settingKey)
        .maybeSingle();

      if (error) {
        console.error(`Erro ao carregar ${settingKey}:`, error);
        return [];
      }

      if (!data?.value) return [];

      const value = data.value;
      
      // Handle both array formats: [{value, label}] or simple string arrays
      if (Array.isArray(value)) {
        // Check if it's already in {value, label} format
        if (value.length > 0 && isOptionItem(value[0])) {
          return value.map(v => {
            const obj = v as Record<string, unknown>;
            return {
              value: String(obj.value),
              label: String(obj.label),
              color: obj.color ? String(obj.color) : undefined,
              textColor: obj.textColor ? String(obj.textColor) : undefined,
            };
          });
        }
        // Simple string array - convert to {value, label}
        return value.map((v) => ({ value: String(v), label: String(v) }));
      }
      
      // Handle object format like { types: [...] } (legacy)
      if (typeof value === 'object' && value !== null) {
        const objValue = value as Record<string, unknown>;
        const firstKey = Object.keys(objValue)[0];
        const arr = objValue[firstKey];
        if (Array.isArray(arr)) {
          if (arr.length > 0 && isOptionItem(arr[0])) {
            return arr.map(v => ({ value: String((v as Record<string, unknown>).value), label: String((v as Record<string, unknown>).label) }));
          }
          return arr.map((v) => ({ value: String(v), label: String(v) }));
        }
      }
      
      return [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

/**
 * Hook para adicionar nova opção
 */
export const useAddProjectOption = (settingKey: SettingKey) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newOption: OptionItem) => {
      // 1. Buscar valor atual
      const { data, error: fetchError } = await supabase
        .from('settings')
        .select('value')
        .eq('key', settingKey)
        .maybeSingle();

      if (fetchError) throw fetchError;

      // 2. Extrair array atual
      let currentOptions: OptionItem[] = [];
      const value = data?.value;
      
      if (Array.isArray(value)) {
        if (value.length > 0 && isOptionItem(value[0])) {
          currentOptions = value.map(v => {
            const obj = v as Record<string, unknown>;
            return {
              value: String(obj.value),
              label: String(obj.label),
              color: obj.color ? String(obj.color) : undefined,
              textColor: obj.textColor ? String(obj.textColor) : undefined,
            };
          });
        } else {
          currentOptions = value.map((v) => ({ value: String(v), label: String(v) }));
        }
      }

      // 3. Verificar duplicatas
      if (currentOptions.some(opt => opt.value === newOption.value)) {
        throw new Error('Esta opção já existe');
      }

      // 4. Adicionar nova opção
      const updatedOptions = [...currentOptions, newOption];

      // 5. Salvar
      const { error: updateError } = await supabase
        .from('settings')
        .update({ value: toJsonArray(updatedOptions), updated_at: new Date().toISOString() })
        .eq('key', settingKey);

      if (updateError) throw updateError;

      return updatedOptions;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', settingKey] });
      toast.success('Opção adicionada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao adicionar opção');
    },
  });
};

/**
 * Hook para remover opção
 */
export const useRemoveProjectOption = (settingKey: SettingKey) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (optionValue: string) => {
      // 1. Buscar valor atual
      const { data, error: fetchError } = await supabase
        .from('settings')
        .select('value')
        .eq('key', settingKey)
        .maybeSingle();

      if (fetchError) throw fetchError;

      // 2. Extrair array atual
      let currentOptions: OptionItem[] = [];
      const value = data?.value;
      
      if (Array.isArray(value)) {
        if (value.length > 0 && isOptionItem(value[0])) {
          currentOptions = value.map(v => {
            const obj = v as Record<string, unknown>;
            return {
              value: String(obj.value),
              label: String(obj.label),
              color: obj.color ? String(obj.color) : undefined,
              textColor: obj.textColor ? String(obj.textColor) : undefined,
            };
          });
        } else {
          currentOptions = value.map((v) => ({ value: String(v), label: String(v) }));
        }
      }

      // 3. Remover opção
      const updatedOptions = currentOptions.filter(opt => opt.value !== optionValue);

      // 4. Salvar
      const { error: updateError } = await supabase
        .from('settings')
        .update({ value: toJsonArray(updatedOptions), updated_at: new Date().toISOString() })
        .eq('key', settingKey);

      if (updateError) throw updateError;

      return updatedOptions;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings', settingKey] });
      toast.success('Opção removida com sucesso');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao remover opção');
    },
  });
};

/**
 * Hook para verificar se uma opção está em uso
 */
export const useCheckOptionInUse = () => {
  return useMutation({
    mutationFn: async ({ column, value }: { column: string; value: string }) => {
      const { data, error } = await supabase
        .from('projects')
        .select('id')
        .contains(column, [value])
        .limit(1);

      if (error) throw error;
      return data && data.length > 0;
    },
  });
};

/**
 * Helper para obter label de uma opção
 */
export const getOptionLabel = (options: OptionItem[], value: string): string => {
  const option = options.find(opt => opt.value === value);
  return option?.label || value;
};
