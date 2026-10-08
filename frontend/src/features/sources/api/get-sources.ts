import { apiClient } from '@/lib/api/client';
import type { TSource } from '@/lib/api/types';

export function getSources() {
  return apiClient.get<TSource[]>('/sources');
}
