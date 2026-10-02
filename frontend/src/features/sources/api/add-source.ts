import { apiClient } from '@/lib/api/client';
import type { ISource } from '@/lib/api/types';

export interface IAddSourceInput {
  path: string;
  name?: string;
}

export function addSource(input: IAddSourceInput) {
  return apiClient.post<ISource>('/sources', input);
}
