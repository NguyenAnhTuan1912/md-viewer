import { useQuery } from '@tanstack/react-query';
import { getSources } from '@/features/sources/api/get-sources';

export const sourcesQueryKey = ['sources'] as const;

export function useSources() {
  return useQuery({
    queryKey: sourcesQueryKey,
    queryFn: getSources,
  });
}
