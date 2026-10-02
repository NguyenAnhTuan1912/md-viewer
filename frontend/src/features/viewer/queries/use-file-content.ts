import { useQuery } from '@tanstack/react-query';
import { getFileContent } from '@/features/viewer/api/get-file-content';

export function fileContentQueryKey(path: string) {
  return ['files', 'content', path] as const;
}

export function useFileContent(path: string | null) {
  return useQuery({
    queryKey: fileContentQueryKey(path ?? ''),
    queryFn: () => getFileContent(path!),
    enabled: Boolean(path),
  });
}
