import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StageOption {
  value: string;
  label: string;
  color?: string;
  textColor?: string;
}

// Default stages with colors
const DEFAULT_STAGE_OPTIONS: StageOption[] = [
  { value: "ideia", label: "Ideia inicial", color: "#6366f1", textColor: "#ffffff" },
  { value: "development", label: "Desenvolvimento", color: "#3b82f6", textColor: "#ffffff" },
  { value: "captacao", label: "Captação de recursos", color: "#f59e0b", textColor: "#000000" },
  { value: "pre_producao", label: "Pré-produção", color: "#8b5cf6", textColor: "#ffffff" },
  { value: "producao", label: "Produção", color: "#10b981", textColor: "#ffffff" },
  { value: "pos_producao", label: "Pós-produção", color: "#06b6d4", textColor: "#ffffff" },
  { value: "finalizado", label: "Finalizado", color: "#22c55e", textColor: "#ffffff" },
  { value: "em_exibicao", label: "Em exibição", color: "#ec4899", textColor: "#ffffff" },
  { value: "distribution", label: "Distribuição", color: "#0ea5e9", textColor: "#ffffff" },
];

/**
 * Hook centralizado para obter cores e labels de estágios
 * Substitui as funções getStageInfo() duplicadas nas páginas
 */
export const useStageColors = () => {
  const { data: dbOptions, isLoading } = useQuery({
    queryKey: ['settings', 'project_stages'],
    queryFn: async (): Promise<StageOption[]> => {
      const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'project_stages')
        .maybeSingle();

      if (error) {
        console.error('Erro ao carregar estágios:', error);
        return DEFAULT_STAGE_OPTIONS;
      }

      if (!data?.value || !Array.isArray(data.value)) {
        return DEFAULT_STAGE_OPTIONS;
      }

      // Merge database options with default colors
      return (data.value as unknown[]).map((item) => {
        const obj = item as Record<string, unknown>;
        const defaultStage = DEFAULT_STAGE_OPTIONS.find(d => d.value === obj.value);
        return {
          value: String(obj.value || ''),
          label: String(obj.label || obj.value || ''),
          color: String(obj.color || defaultStage?.color || '#6b7280'),
          textColor: String(obj.textColor || defaultStage?.textColor || '#ffffff'),
        };
      });
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const stages = dbOptions || DEFAULT_STAGE_OPTIONS;

  /**
   * Obtém informações de um estágio pelo value
   */
  const getStageInfo = (stageValue: string | null): { label: string; color: string; textColor: string } => {
    if (!stageValue) {
      return { label: 'Não definido', color: '#6b7280', textColor: '#ffffff' };
    }

    const stage = stages.find(s => s.value === stageValue);
    if (stage) {
      return {
        label: stage.label,
        color: stage.color || '#6b7280',
        textColor: stage.textColor || '#ffffff',
      };
    }

    // Fallback para estágios não encontrados
    return { label: stageValue, color: '#6b7280', textColor: '#ffffff' };
  };

  return {
    stages,
    getStageInfo,
    isLoading,
  };
};

export { DEFAULT_STAGE_OPTIONS };
