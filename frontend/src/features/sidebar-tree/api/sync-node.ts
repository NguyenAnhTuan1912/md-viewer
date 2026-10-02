import { apiClient } from '@/lib/api/client';
import type { IFileNode } from '@/lib/api/types';

export interface ISyncNodeInput {
  sourceId: string;
  /** Root source path or subfolder path being synced. */
  path: string;
}

export function syncNode({ path }: ISyncNodeInput) {
  return apiClient.post<IFileNode[]>('/nodes/sync', { path });
}
