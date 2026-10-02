import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/client';
import { addSource } from '@/features/sources/api/add-source';
import { sourcesQueryKey } from '@/features/sources/queries/use-sources';
import { toast } from '@/components/ui/toast';
import * as ToastAlert from '@/components/ui/toast-alert';

export function useAddSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addSource,
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
