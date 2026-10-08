import { apiClient } from '@/lib/api/client';
import type { TFileContent } from '@/lib/api/types';

export function getFileContent(path: string) {
  return apiClient.get<TFileContent>(`/files/content?path=${encodeURIComponent(path)}`);
}
