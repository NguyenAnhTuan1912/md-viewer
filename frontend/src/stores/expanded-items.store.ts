import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ExpandedItemsState {
  expandedItems: string[];
  setExpandedItems: (items: string[] | ((prev: string[]) => string[])) => void;
  expandPaths: (paths: string[]) => void;
}

export const useExpandedItemsStore = create<ExpandedItemsState>()(
  persist(
    (set, get) => ({
      expandedItems: [],
      setExpandedItems: (itemsOrUpdater) => {
        const next =
          typeof itemsOrUpdater === 'function'
            ? itemsOrUpdater(get().expandedItems)
            : itemsOrUpdater;
        set({ expandedItems: next });
      },
      expandPaths: (paths) => {
        const current = get().expandedItems;
        const currentSet = new Set(current);
        const hasNewPaths = paths.some((path) => !currentSet.has(path));
        if (!hasNewPaths) {
          return;
        }
        const merged = new Set(current);
        for (const path of paths) {
          merged.add(path);
        }
        set({ expandedItems: Array.from(merged) });
      },
    }),
    {
      name: 'md-viewer-expanded-items',
    },
  ),
);
