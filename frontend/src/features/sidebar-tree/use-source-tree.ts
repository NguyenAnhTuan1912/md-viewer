import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { SourceTree } from '@/types/api';

export function sourceTreeQueryKey(sourceId: string) {
  return ['sources', sourceId, 'tree'] as const;
}

export function useSourceTree(sourceId: string) {
  return useQuery({
    queryKey: sourceTreeQueryKey(sourceId),
    queryFn: () => apiClient.get<SourceTree>(`/sources/${sourceId}/tree`),
    enabled: Boolean(sourceId),
  });
}

export function useSourceTrees(sourceIds: string[]) {
  return useQueries({
    queries: sourceIds.map((sourceId) => ({
      queryKey: sourceTreeQueryKey(sourceId),
      queryFn: () => apiClient.get<SourceTree>(`/sources/${sourceId}/tree`),
    })),
  });
}

export function useInvalidateSourceTree() {
  const queryClient = useQueryClient();
  return (sourceId: string) =>
    queryClient.invalidateQueries({ queryKey: sourceTreeQueryKey(sourceId) });
}
