import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { UserApplication } from '@/store/application';

export function useUserApplications() {
  return useQuery({
    queryKey: ['applications'],
    queryFn: () => api.get<UserApplication[]>('/applications').then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });
}
