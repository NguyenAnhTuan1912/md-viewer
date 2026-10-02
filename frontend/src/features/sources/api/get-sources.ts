import { apiClient } from '@/lib/api/client';
import type { ISource } from '@/lib/api/types';

export function getSources() {
  return apiClient.get<ISource[]>('/sources');
}
