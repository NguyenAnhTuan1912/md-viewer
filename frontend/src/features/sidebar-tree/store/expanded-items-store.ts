import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface IExpandedItemsState {
  expandedItems: string[];
}

export const useExpandedItemsStore = create<IExpandedItemsState>()(
  persist(
    (): IExpandedItemsState => ({
      expandedItems: [],
    }),
    {
      name: 'md-viewer-expanded-items',
    },
  ),
);

export const expandedItemsStoreActions = {
  setExpandedItems: (itemsOrUpdater: string[] | ((prev: string[]) => string[])) => {
    const next =
      typeof itemsOrUpdater === 'function'
        ? itemsOrUpdater(useExpandedItemsStore.getState().expandedItems)
        : itemsOrUpdater;
    useExpandedItemsStore.setState({ expandedItems: next });
  },
  expandPaths: (paths: string[]) => {
    const current = useExpandedItemsStore.getState().expandedItems;
    const currentSet = new Set(current);
    const hasNewPaths = paths.some((path: string) => !currentSet.has(path));
    if (!hasNewPaths) {
      return;
    }
    const merged = new Set(current);
    for (const path of paths) {
      merged.add(path);
    }
    useExpandedItemsStore.setState({ expandedItems: Array.from(merged) });
  },
};
