import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TFileContentType } from '@/lib/api/types';

export interface IOpenTab {
  path: string;
  name: string;
  type: TFileContentType;
}

interface IOpenTabsState {
  tabs: IOpenTab[];
  activeTabPath: string | null;
  /** Previously focused tabs, most recent last. */
  focusHistory: string[];
}

export const useOpenTabsStore = create<IOpenTabsState>()(
  persist(
    (): IOpenTabsState => ({
      tabs: [],
      activeTabPath: null,
      focusHistory: [],
    }),
    {
      name: 'md-viewer-open-tabs',
    },
  ),
);

export const openTabsStoreActions = {
  openTab: (tab: IOpenTab) => {
    const { tabs, activeTabPath, focusHistory } = useOpenTabsStore.getState();
    const exists = tabs.some((t) => t.path === tab.path);

    const nextFocusHistory =
      activeTabPath && activeTabPath !== tab.path
        ? [...focusHistory, activeTabPath]
        : focusHistory;

    useOpenTabsStore.setState({
      tabs: exists ? tabs : [...tabs, tab],
      activeTabPath: tab.path,
      focusHistory: nextFocusHistory,
    });
  },

  focusTab: (path: string) => {
    const { activeTabPath, focusHistory } = useOpenTabsStore.getState();
    if (activeTabPath === path) {
      return;
    }
    const nextFocusHistory = activeTabPath
      ? [...focusHistory, activeTabPath]
      : focusHistory;
    useOpenTabsStore.setState({ activeTabPath: path, focusHistory: nextFocusHistory });
  },

  closeTab: (path: string) => {
    const { tabs, activeTabPath, focusHistory } = useOpenTabsStore.getState();
    const remainingTabs = tabs.filter((t) => t.path !== path);
    const cleanedHistory = focusHistory.filter((p) => p !== path);

    if (activeTabPath !== path) {
      // Closing a non-active tab: just remove it, no focus change.
      useOpenTabsStore.setState({ tabs: remainingTabs, focusHistory: cleanedHistory });
      return;
    }

    // Closing the active tab: restore focus to the most recent entry in
    // history that still has an open tab, walking backwards.
    let nextActivePath: string | null = null;
    let nextHistory = cleanedHistory;

    while (nextHistory.length > 0) {
      const candidate = nextHistory[nextHistory.length - 1];
      nextHistory = nextHistory.slice(0, -1);
      if (remainingTabs.some((t) => t.path === candidate)) {
        nextActivePath = candidate;
        break;
      }
    }

    if (!nextActivePath && remainingTabs.length > 0) {
      nextActivePath = remainingTabs[remainingTabs.length - 1].path;
    }

    useOpenTabsStore.setState({
      tabs: remainingTabs,
      activeTabPath: nextActivePath,
      focusHistory: nextHistory,
    });
  },
};
