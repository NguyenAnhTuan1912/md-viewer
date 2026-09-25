import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useExpandedItemsStore } from './expanded-items.store';

describe('useExpandedItemsStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useExpandedItemsStore.setState({ expandedItems: [] });
  });

  it('starts with no expanded items', () => {
    expect(useExpandedItemsStore.getState().expandedItems).toEqual([]);
  });

  it('expandPaths adds new paths to the expanded set', () => {
    useExpandedItemsStore.getState().expandPaths(['/a', '/b']);
    expect(useExpandedItemsStore.getState().expandedItems.sort()).toEqual([
      '/a',
      '/b',
    ]);
  });

  it('expandPaths does not duplicate already-expanded paths', () => {
    useExpandedItemsStore.getState().expandPaths(['/a']);
    useExpandedItemsStore.getState().expandPaths(['/a', '/b']);
    expect(useExpandedItemsStore.getState().expandedItems.sort()).toEqual([
      '/a',
      '/b',
    ]);
  });

  it('expandPaths is a no-op (does not call set) when all paths are already expanded', () => {
    useExpandedItemsStore.getState().expandPaths(['/a']);
    const subscriber = vi.fn();
    const unsubscribe = useExpandedItemsStore.subscribe(subscriber);

    useExpandedItemsStore.getState().expandPaths(['/a']);

    expect(subscriber).not.toHaveBeenCalled();
    unsubscribe();
  });

  it('setExpandedItems replaces the whole list', () => {
    useExpandedItemsStore.getState().setExpandedItems(['/x']);
    expect(useExpandedItemsStore.getState().expandedItems).toEqual(['/x']);
  });

  it('setExpandedItems accepts an updater function', () => {
    useExpandedItemsStore.getState().setExpandedItems(['/x']);
    useExpandedItemsStore.getState().setExpandedItems((prev) => [...prev, '/y']);
    expect(useExpandedItemsStore.getState().expandedItems).toEqual(['/x', '/y']);
  });

  it('persists expanded items to localStorage', () => {
    useExpandedItemsStore.getState().expandPaths(['/a']);
    const stored = localStorage.getItem('md-viewer-expanded-items');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.state.expandedItems).toEqual(['/a']);
  });
});
