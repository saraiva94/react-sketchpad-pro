import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useReorderProjects = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      // Update each project's order_index
      const updates = orderedIds.map((id, index) =>
        supabase.from('projects').update({ order_index: index } as any).eq('id', id)
      );
      
      await Promise.all(updates);
      return orderedIds;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Ordem dos projetos atualizada');
    },
    onError: (error) => {
      console.error('Erro ao reordenar projetos:', error);
      toast.error('Erro ao atualizar ordem');
    }
  });
};

export const useReorderMembers = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      // Update each member's order_index
      const updates = orderedIds.map((id, index) =>
        supabase.from('project_members').update({ order_index: index } as any).eq('id', id)
      );
      
      await Promise.all(updates);
      return orderedIds;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
      toast.success('Ordem da equipe atualizada');
    },
    onError: (error) => {
      console.error('Erro ao reordenar membros:', error);
      toast.error('Erro ao atualizar ordem');
    }
  });
};
