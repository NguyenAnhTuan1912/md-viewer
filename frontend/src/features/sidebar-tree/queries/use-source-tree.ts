import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSourceTree } from '@/features/sidebar-tree/api/get-source-tree';

export function sourceTreeQueryKey(sourceId: string) {
  return ['sources', sourceId, 'tree'] as const;
}

export function useSourceTree(sourceId: string) {
  return useQuery({
    queryKey: sourceTreeQueryKey(sourceId),
    queryFn: () => getSourceTree(sourceId),
    enabled: Boolean(sourceId),
  });
}

export function useSourceTrees(sourceIds: string[]) {
  return useQueries({
    // Structurally shared results keep the tree model stable between data updates.
    combine: (results) =>
      results.map(({ data, isLoading, isError }) => ({
        data,
        isLoading,
        isError,
      })),
    queries: sourceIds.map((sourceId) => ({
      queryKey: sourceTreeQueryKey(sourceId),
      queryFn: () => getSourceTree(sourceId),
    })),
  });
}

export function useInvalidateSourceTree() {
  const queryClient = useQueryClient();
  return (sourceId: string) =>
    queryClient.invalidateQueries({ queryKey: sourceTreeQueryKey(sourceId) });
}
