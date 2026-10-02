import { syncNode } from '@/features/sidebar-tree/api/sync-node';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/client';
import type { IFileNode, ISourceTree } from '@/lib/api/types';
import { sourceTreeQueryKey } from '@/features/sidebar-tree/queries/use-source-tree';
import { toast } from '@/components/ui/toast';
import * as ToastAlert from '@/components/ui/toast-alert';

export function useSyncNode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: syncNode,
    onSuccess: (freshChildren, { sourceId, path }) => {
      queryClient.setQueryData<ISourceTree>(
        sourceTreeQueryKey(sourceId),
        (current) => {
          if (!current) {
            return current;
          }
          return {
            ...current,
            tree: replaceNodeChildren(current.tree, path, freshChildren),
          };
        },
      );

      const folderName = path.split('/').filter(Boolean).pop() ?? path;
      toast.custom((t) => (
        <ToastAlert.Root
          t={t}
          status="success"
          message={`Synced "${folderName}"`}
        />
      ));
    },
    onError: (error) => {
      const message =
        error instanceof ApiError ? error.message : 'Failed to sync folder.';
      toast.custom((t) => (
        <ToastAlert.Root t={t} status="error" message={message} />
      ));
    },
  });
}

function replaceNodeChildren(
  nodes: IFileNode[],
  targetPath: string,
  freshChildren: IFileNode[],
): IFileNode[] {
  return nodes.map((node) => {
    if (node.path === targetPath) {
      return { ...node, children: freshChildren };
    }
    if (node.children) {
      return {
        ...node,
        children: replaceNodeChildren(node.children, targetPath, freshChildren),
      };
    }
    return node;
  });
}
