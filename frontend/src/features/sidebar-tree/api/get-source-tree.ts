import { apiClient } from '@/lib/api/client';
import type { TSourceTree } from '@/lib/api/types';

export function getSourceTree(sourceId: string) {
  return apiClient.get<TSourceTree>(`/sources/${sourceId}/tree`);
}
