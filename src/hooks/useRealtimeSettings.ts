import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook para sincronizar mudanças em settings em tempo real
 * Quando admin muda categorias/estágios/leis, todos os usuários veem a atualização
 */
export const useRealtimeSettings = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('settings-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'settings'
        },
        (payload) => {
          console.log('Settings alteradas:', payload);
          
          // Invalida TODAS as queries de settings para forçar refetch
          queryClient.invalidateQueries({ 
            queryKey: ['settings'] 
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
};
