import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useEditorStore } from '@/store/editor';

export const useCreateNarrativeVersion = () => {
  const queryClient = useQueryClient();
  const { setLastSaved, setDirty, setCurrentVersion } = useEditorStore();

  return useMutation({
    mutationFn: async (data: { narrativeId: string; content: string; change_summary?: string }) => {
      const response = await api.post(`/narratives/${data.narrativeId}/versions`, {
        content: data.content,
        change_summary: data.change_summary,
      });
      return response.data;
    },
    onSuccess: (_data, variables) => {
      setCurrentVersion(_data);
      setLastSaved(new Date(_data.created_at || Date.now()));
      setDirty(false);
      queryClient.invalidateQueries({ queryKey: ['narratives', variables.narrativeId] });
      queryClient.invalidateQueries({ queryKey: ['narratives', variables.narrativeId, 'versions'] });
    },
  });
};
