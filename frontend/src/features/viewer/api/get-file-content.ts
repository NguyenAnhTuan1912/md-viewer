import { apiClient } from '@/lib/api/client';
import type { IFileContent } from '@/lib/api/types';

export function getFileContent(path: string) {
  return apiClient.get<IFileContent>(`/files/content?path=${encodeURIComponent(path)}`);
}
