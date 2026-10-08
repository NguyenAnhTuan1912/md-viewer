import { apiClient } from '@/lib/api/client';
import type { TFileNode } from '@/lib/api/types';

export type TSyncNodeInput = {
  sourceId: string;
  /** Root source path or subfolder path being synced. */
  path: string;
};

export function syncNode({ path }: TSyncNodeInput) {
  return apiClient.post<TFileNode[]>('/nodes/sync', { path });
}
