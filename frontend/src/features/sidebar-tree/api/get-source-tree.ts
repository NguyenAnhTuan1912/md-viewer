import { apiClient } from '@/lib/api/client';
import type { ISourceTree } from '@/lib/api/types';

export function getSourceTree(sourceId: string) {
  return apiClient.get<ISourceTree>(`/sources/${sourceId}/tree`);
}
