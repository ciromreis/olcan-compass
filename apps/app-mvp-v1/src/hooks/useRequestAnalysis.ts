import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useEditorStore } from '@/store/editor';

export const useRequestAnalysis = () => {
  const queryClient = useQueryClient();
  const { setAnalysis } = useEditorStore();

  return useMutation({
    mutationFn: async (narrativeId: string) => {
      const response = await api.post(`/narratives/${narrativeId}/analyze`, {});
      return response.data;
    },
    onSuccess: (data, narrativeId) => {
      setAnalysis(data);
      queryClient.invalidateQueries({ queryKey: ['narratives', narrativeId, 'analysis'] });
    },
  });
};
