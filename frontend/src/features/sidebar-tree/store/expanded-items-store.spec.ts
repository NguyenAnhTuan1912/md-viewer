import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useExpandedItemsStore,
  expandedItemsStoreActions,
} from '@/features/sidebar-tree/store/expanded-items-store';

describe('useExpandedItemsStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useExpandedItemsStore.setState({ expandedItems: [] });
  });

  it('starts with no expanded items', () => {
    expect(useExpandedItemsStore.getState().expandedItems).toEqual([]);
  });

  it('expandPaths adds new paths to the expanded set', () => {
    expandedItemsStoreActions.expandPaths(['/a', '/b']);
    expect(useExpandedItemsStore.getState().expandedItems.sort()).toEqual([
      '/a',
      '/b',
    ]);
  });

  it('expandPaths does not duplicate already-expanded paths', () => {
    expandedItemsStoreActions.expandPaths(['/a']);
    expandedItemsStoreActions.expandPaths(['/a', '/b']);
    expect(useExpandedItemsStore.getState().expandedItems.sort()).toEqual([
      '/a',
      '/b',
    ]);
  });

  it('expandPaths is a no-op (does not call set) when all paths are already expanded', () => {
    expandedItemsStoreActions.expandPaths(['/a']);
    const subscriber = vi.fn();
    const unsubscribe = useExpandedItemsStore.subscribe(subscriber);

    expandedItemsStoreActions.expandPaths(['/a']);

    expect(subscriber).not.toHaveBeenCalled();
    unsubscribe();
  });

  it('setExpandedItems replaces the whole list', () => {
    expandedItemsStoreActions.setExpandedItems(['/x']);
    expect(useExpandedItemsStore.getState().expandedItems).toEqual(['/x']);
  });

  it('setExpandedItems accepts an updater function', () => {
    expandedItemsStoreActions.setExpandedItems(['/x']);
    expandedItemsStoreActions.setExpandedItems((prev) => [...prev, '/y']);
    expect(useExpandedItemsStore.getState().expandedItems).toEqual(['/x', '/y']);
  });

  it('persists expanded items to localStorage', () => {
    expandedItemsStoreActions.expandPaths(['/a']);
    const stored = localStorage.getItem('md-viewer-expanded-items');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.state.expandedItems).toEqual(['/a']);
  });
});
