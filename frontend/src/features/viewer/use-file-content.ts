import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { FileContent } from '@/types/api';

export function fileContentQueryKey(path: string) {
  return ['files', 'content', path] as const;
}

export function useFileContent(path: string | null) {
  return useQuery({
    queryKey: fileContentQueryKey(path ?? ''),
    queryFn: () =>
      apiClient.get<FileContent>(
        `/files/content?path=${encodeURIComponent(path!)}`,
      ),
    enabled: Boolean(path),
  });
}
