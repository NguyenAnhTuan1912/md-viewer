import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FileContentType } from '@/types/api';

export interface OpenTab {
  path: string;
  name: string;
  type: FileContentType;
}

interface OpenTabsState {
  tabs: OpenTab[];
  activeTabPath: string | null;
  /** History of focused tab paths, most recent last (excludes the current active tab). */
  focusHistory: string[];
  /**
   * Opens a tab for the given file. If a tab for this path already exists,
   * it is simply focused (no duplicate is created) - VS Code-like behavior.
   */
  openTab: (tab: OpenTab) => void;
  /**
   * Closes the tab at the given path. If it was the active tab, focus moves
   * to the most recently focused remaining tab (from history), falling back
   * to the last tab in the list, or null if none remain.
   */
  closeTab: (path: string) => void;
  focusTab: (path: string) => void;
}

export const useOpenTabsStore = create<OpenTabsState>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeTabPath: null,
      focusHistory: [],

      openTab: (tab) => {
        const { tabs, activeTabPath, focusHistory } = get();
        const exists = tabs.some((t) => t.path === tab.path);

        const nextFocusHistory =
          activeTabPath && activeTabPath !== tab.path
            ? [...focusHistory, activeTabPath]
            : focusHistory;

        set({
          tabs: exists ? tabs : [...tabs, tab],
          activeTabPath: tab.path,
          focusHistory: nextFocusHistory,
        });
      },

      focusTab: (path) => {
        const { activeTabPath, focusHistory } = get();
        if (activeTabPath === path) {
          return;
        }
        const nextFocusHistory = activeTabPath
          ? [...focusHistory, activeTabPath]
          : focusHistory;
        set({ activeTabPath: path, focusHistory: nextFocusHistory });
      },

      closeTab: (path) => {
        const { tabs, activeTabPath, focusHistory } = get();
        const remainingTabs = tabs.filter((t) => t.path !== path);
        const cleanedHistory = focusHistory.filter((p) => p !== path);

        if (activeTabPath !== path) {
          // Closing a non-active tab: just remove it, no focus change.
          set({ tabs: remainingTabs, focusHistory: cleanedHistory });
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

        set({
          tabs: remainingTabs,
          activeTabPath: nextActivePath,
          focusHistory: nextHistory,
        });
      },
    }),
    {
      name: 'md-viewer-open-tabs',
    },
  ),
);
