import { beforeEach, describe, expect, it } from 'vitest';
import { useOpenTabsStore } from './open-tabs.store';

const fileA = { path: '/a.md', name: 'a.md', type: 'markdown' as const };
const fileB = { path: '/b.md', name: 'b.md', type: 'markdown' as const };
const fileC = { path: '/c.html', name: 'c.html', type: 'html' as const };

describe('useOpenTabsStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useOpenTabsStore.setState({ tabs: [], activeTabPath: null, focusHistory: [] });
  });

  it('starts with no tabs open', () => {
    expect(useOpenTabsStore.getState().tabs).toEqual([]);
    expect(useOpenTabsStore.getState().activeTabPath).toBeNull();
  });

  it('openTab adds a new tab and focuses it', () => {
    useOpenTabsStore.getState().openTab(fileA);
    expect(useOpenTabsStore.getState().tabs).toHaveLength(1);
    expect(useOpenTabsStore.getState().activeTabPath).toBe(fileA.path);
  });

  it('openTab does not duplicate an already-open tab, just focuses it', () => {
    useOpenTabsStore.getState().openTab(fileA);
    useOpenTabsStore.getState().openTab(fileB);
    useOpenTabsStore.getState().openTab(fileA);

    expect(useOpenTabsStore.getState().tabs).toHaveLength(2);
    expect(useOpenTabsStore.getState().activeTabPath).toBe(fileA.path);
  });

  it('closing a non-active tab does not change the active tab', () => {
    useOpenTabsStore.getState().openTab(fileA);
    useOpenTabsStore.getState().openTab(fileB);
    // fileB is active now; close fileA (not active)
    useOpenTabsStore.getState().closeTab(fileA.path);

    expect(useOpenTabsStore.getState().activeTabPath).toBe(fileB.path);
    expect(useOpenTabsStore.getState().tabs).toHaveLength(1);
  });

  it('closing the active tab restores focus to the most recently focused remaining tab (history-based, not left-neighbor)', () => {
    useOpenTabsStore.getState().openTab(fileA); // active: A, history: []
    useOpenTabsStore.getState().openTab(fileB); // active: B, history: [A]
    useOpenTabsStore.getState().openTab(fileC); // active: C, history: [A, B]

    // Now focus back to A directly (simulating clicking an earlier tab)
    useOpenTabsStore.getState().focusTab(fileA.path); // active: A, history: [A, B, C]

    // Close A (the active tab) - should go back to C (most recent in history), not B (left neighbor)
    useOpenTabsStore.getState().closeTab(fileA.path);

    expect(useOpenTabsStore.getState().activeTabPath).toBe(fileC.path);
    expect(useOpenTabsStore.getState().tabs.map((t) => t.path)).toEqual([
      fileB.path,
      fileC.path,
    ]);
  });

  it('falls back to the last remaining tab when history is exhausted', () => {
    useOpenTabsStore.getState().openTab(fileA);
    useOpenTabsStore.getState().closeTab(fileA.path);
    useOpenTabsStore.getState().openTab(fileB);
    useOpenTabsStore.getState().openTab(fileC);

    // Close C - history should have B as prior, but let's exhaust it by closing B too
    useOpenTabsStore.getState().closeTab(fileC.path);
    expect(useOpenTabsStore.getState().activeTabPath).toBe(fileB.path);
  });

  it('sets activeTabPath to null when closing the last remaining tab', () => {
    useOpenTabsStore.getState().openTab(fileA);
    useOpenTabsStore.getState().closeTab(fileA.path);

    expect(useOpenTabsStore.getState().tabs).toHaveLength(0);
    expect(useOpenTabsStore.getState().activeTabPath).toBeNull();
  });

  it('focusTab switches the active tab without altering the tab list', () => {
    useOpenTabsStore.getState().openTab(fileA);
    useOpenTabsStore.getState().openTab(fileB);
    useOpenTabsStore.getState().focusTab(fileA.path);

    expect(useOpenTabsStore.getState().activeTabPath).toBe(fileA.path);
    expect(useOpenTabsStore.getState().tabs).toHaveLength(2);
  });

  it('persists tabs to localStorage', () => {
    useOpenTabsStore.getState().openTab(fileA);
    const stored = localStorage.getItem('md-viewer-open-tabs');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.state.tabs).toHaveLength(1);
    expect(parsed.state.activeTabPath).toBe(fileA.path);
  });
});
