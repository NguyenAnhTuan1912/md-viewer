import { useEffect, useMemo } from 'react';
import {
  hotkeysCoreFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from '@headless-tree/core';
import { useTree } from '@headless-tree/react';
import {
  RiFolder2Fill,
  RiFolderOpenFill,
  RiFileTextLine,
  RiHtml5Line,
  RiLoader4Line,
  RiRefreshLine,
} from '@remixicon/react';
import * as Button from '@/components/ui/button';
import * as Tooltip from '@/components/ui/tooltip';
import { cn } from '@/utils/cn';
import { useOpenTabsStore } from '@/stores/open-tabs.store';
import { useExpandedItemsStore } from '@/stores/expanded-items.store';
import { useSourceTrees } from './use-source-tree';
import { useSyncNode } from './use-sync-node';
import type { FileNode, Source } from '@/types/api';

const ROOT_ID = '__root__';
const INDENT_SIZE = 18;

interface TreeItemData {
  name: string;
  path: string;
  type: 'root' | 'file' | 'folder';
  sourceId?: string;
  children: string[];
}

interface SidebarTreeViewProps {
  sources: Source[];
}

function ChevronIcon({ expanded, className }: { expanded: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn(
        'transition-transform duration-150 ease-out',
        expanded ? 'rotate-90' : 'rotate-0',
        className,
      )}
    >
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SidebarTreeView({ sources }: SidebarTreeViewProps) {
  const sourceIds = useMemo(() => sources.map((s) => s.id), [sources]);
  const treeQueries = useSourceTrees(sourceIds);
  const syncNode = useSyncNode();
  const activeTabPath = useOpenTabsStore((state) => state.activeTabPath);
  const openTab = useOpenTabsStore((state) => state.openTab);
  const expandedItems = useExpandedItemsStore((state) => state.expandedItems);
  const setExpandedItems = useExpandedItemsStore(
    (state) => state.setExpandedItems,
  );
  const expandPaths = useExpandedItemsStore((state) => state.expandPaths);

  const { itemMap, parentMap } = useMemo(() => {
    const map = new Map<string, TreeItemData>();
    const parents = new Map<string, string>();

    map.set(ROOT_ID, {
      name: 'root',
      path: ROOT_ID,
      type: 'root',
      children: sources.map((s) => s.id),
    });

    sources.forEach((source, index) => {
      const result = treeQueries[index]?.data;
      map.set(source.id, {
        name: source.name,
        path: source.path,
        type: 'root',
        sourceId: source.id,
        children: (result?.tree ?? []).map((node) => node.path),
      });

      function registerNodes(nodes: FileNode[], parentId: string) {
        for (const node of nodes) {
          map.set(node.path, {
            name: node.name,
            path: node.path,
            type: node.type,
            sourceId: source.id,
            children: node.children?.map((c) => c.path) ?? [],
          });
          parents.set(node.path, parentId);
          if (node.children) {
            registerNodes(node.children, node.path);
          }
        }
      }

      registerNodes(result?.tree ?? [], source.id);
    });

    return { itemMap: map, parentMap: parents };
  }, [sources, treeQueries]);

  // Auto-expand all ancestor folders of the active tab so it stays visible
  // (e.g. after a page reload where the tree starts collapsed).
  useEffect(() => {
    if (!activeTabPath || !parentMap.has(activeTabPath)) {
      return;
    }
    const ancestors: string[] = [];
    let current: string | undefined = parentMap.get(activeTabPath);
    while (current && current !== ROOT_ID) {
      ancestors.push(current);
      current = parentMap.get(current);
    }
    if (ancestors.length > 0) {
      expandPaths(ancestors);
    }
    // Only run when the tree data or active path changes, not on every
    // expandPaths identity change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabPath, parentMap]);

  // Seed the persisted expanded set with all source roots the first time
  // sources are loaded (so newly added sources start expanded), without
  // clobbering folders the user has already expanded/collapsed.
  useEffect(() => {
    if (sourceIds.length > 0) {
      expandPaths(sourceIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceIds]);

  const tree = useTree<TreeItemData>({
    rootItemId: ROOT_ID,
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => item.getItemData().type !== 'file',
    state: { expandedItems },
    setExpandedItems,
    dataLoader: {
      getItem: (itemId) => itemMap.get(itemId) ?? {
        name: itemId,
        path: itemId,
        type: 'file',
        children: [],
      },
      getChildren: (itemId) => itemMap.get(itemId)?.children ?? [],
    },
    features: [syncDataLoaderFeature, selectionFeature, hotkeysCoreFeature],
  });

  const isAnyLoading = treeQueries.some((q) => q.isLoading);
  const isAnyError = treeQueries.some((q) => q.isError);

  if (sources.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg px-2 py-2.5 text-paragraph-sm text-text-soft-400">
        <RiFolder2Fill className="size-4 shrink-0" />
        <span>No sources added yet</span>
      </div>
    );
  }

  return (
    <div {...tree.getContainerProps()} className="flex flex-col gap-px">
      {isAnyLoading && (
        <div className="px-2 py-2 text-paragraph-sm text-text-soft-400">
          Loading tree...
        </div>
      )}
      {isAnyError && (
        <div className="px-2 py-2 text-paragraph-sm text-error-base">
          Failed to load one or more source trees.
        </div>
      )}

      {tree.getItems().map((item) => {
        if (item.getId() === ROOT_ID) {
          return null;
        }

        const data = item.getItemData();
        const level = item.getItemMeta().level - 1;
        const isRoot = data.type === 'root';
        const isFolder = item.isFolder();
        const isFile = data.type === 'file';
        const isMarkdown = data.name.toLowerCase().endsWith('.md');
        const isExpanded = item.isExpanded();
        const isActive = isFile && activeTabPath === data.path;
        const isSyncing =
          syncNode.isPending && syncNode.variables?.path === data.path;

        return (
          <div
            key={item.getId()}
            {...item.getProps()}
            style={{ paddingLeft: `${level * INDENT_SIZE + 8}px` }}
            className={cn(
              'group/tree-item relative flex items-center gap-1.5 rounded-md py-1.5 pr-2 text-paragraph-sm outline-none transition-colors duration-100',
              isRoot && 'mt-2 first:mt-0',
              isActive
                ? 'bg-primary-alpha-10 font-medium text-primary-base'
                : isRoot
                  ? 'text-text-strong-950 hover:bg-bg-weak-50'
                  : 'text-text-sub-600 hover:bg-bg-weak-50',
            )}
            onClick={(event) => {
              item.getProps().onClick?.(event);
              if (isFile && data.sourceId) {
                openTab({
                  path: data.path,
                  name: data.name,
                  type: isMarkdown ? 'markdown' : 'html',
                });
              }
            }}
          >
            {/* Indent guide lines */}
            {level > 0 &&
              Array.from({ length: level }).map((_, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  className="absolute top-0 h-full w-px bg-stroke-soft-200"
                  style={{ left: `${i * INDENT_SIZE + 16}px` }}
                />
              ))}

            {isFolder ? (
              <ChevronIcon
                expanded={isExpanded}
                className="size-3.5 shrink-0 text-text-soft-400"
              />
            ) : (
              <span className="size-3.5 shrink-0" />
            )}

            {isFolder ? (
              isExpanded ? (
                <RiFolderOpenFill
                  className={cn(
                    'size-4 shrink-0',
                    isRoot ? 'text-primary-base' : 'text-yellow-500',
                  )}
                />
              ) : (
                <RiFolder2Fill
                  className={cn(
                    'size-4 shrink-0',
                    isRoot ? 'text-primary-base' : 'text-yellow-500',
                  )}
                />
              )
            ) : isMarkdown ? (
              <RiFileTextLine className="size-4 shrink-0 text-primary-base/70" />
            ) : (
              <RiHtml5Line className="size-4 shrink-0 text-warning-base" />
            )}

            <span
              className={cn(
                'flex-1 truncate',
                isRoot && 'text-label-sm',
              )}
            >
              {data.name}
            </span>

            {isFolder && (
              <Tooltip.Provider>
                <Tooltip.Root>
                  <Tooltip.Trigger asChild>
                    <Button.Root
                      type="button"
                      variant="neutral"
                      mode="ghost"
                      size="xxsmall"
                      className="opacity-0 hover:bg-transparent group-hover/tree-item:opacity-100"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (data.sourceId) {
                          syncNode.mutate({
                            sourceId: data.sourceId,
                            path: data.path,
                          });
                        }
                      }}
                      aria-label={`Sync ${data.name}`}
                    >
                      <Button.Icon
                        as={isSyncing ? RiLoader4Line : RiRefreshLine}
                        className={isSyncing ? 'animate-spin' : undefined}
                      />
                    </Button.Root>
                  </Tooltip.Trigger>
                  <Tooltip.Content side="right" size="xsmall">
                    Sync
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
            )}
          </div>
        );
      })}
    </div>
  );
}
