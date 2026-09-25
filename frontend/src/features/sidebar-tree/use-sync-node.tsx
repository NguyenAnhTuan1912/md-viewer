import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/lib/api-client';
import type { FileNode, SourceTree } from '@/types/api';
import { sourceTreeQueryKey } from './use-source-tree';
import { toast } from '@/components/ui/toast';
import * as ToastAlert from '@/components/ui/toast-alert';

export interface SyncNodeInput {
  sourceId: string;
  /** Path of the node being synced (root source path or a subfolder path). */
  path: string;
}

export function useSyncNode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ path }: SyncNodeInput) =>
      apiClient.post<FileNode[]>('/nodes/sync', { path }),
    onSuccess: (freshChildren, { sourceId, path }) => {
      queryClient.setQueryData<SourceTree>(
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
  nodes: FileNode[],
  targetPath: string,
  freshChildren: FileNode[],
): FileNode[] {
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
