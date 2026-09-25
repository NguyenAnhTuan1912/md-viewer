import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/lib/api-client';
import type { Source } from '@/types/api';
import { toast } from '@/components/ui/toast';
import * as ToastAlert from '@/components/ui/toast-alert';

export const sourcesQueryKey = ['sources'] as const;

export function useSources() {
  return useQuery({
    queryKey: sourcesQueryKey,
    queryFn: () => apiClient.get<Source[]>('/sources'),
  });
}

export interface AddSourceInput {
  path: string;
  name?: string;
}

export function useAddSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddSourceInput) =>
      apiClient.post<Source>('/sources', input),
    onSuccess: (source) => {
      queryClient.invalidateQueries({ queryKey: sourcesQueryKey });
      toast.custom((t) => (
        <ToastAlert.Root
          t={t}
          status="success"
          message={`Added folder "${source.name}"`}
        />
      ));
    },
    onError: (error) => {
      const message =
        error instanceof ApiError ? error.message : 'Failed to add folder.';
      toast.custom((t) => (
        <ToastAlert.Root t={t} status="error" message={message} />
      ));
    },
  });
}
