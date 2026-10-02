import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const SIDEBAR_MIN_WIDTH = 200;
export const SIDEBAR_MAX_WIDTH = 480;
export const SIDEBAR_DEFAULT_WIDTH = 256;

interface ISidebarState {
  width: number;
}

function clampWidth(width: number): number {
  return Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, width));
}

export const useSidebarStore = create<ISidebarState>()(
  persist(
    (): ISidebarState => ({
      width: SIDEBAR_DEFAULT_WIDTH,
    }),
    {
      name: 'md-viewer-sidebar',
    },
  ),
);

export const sidebarStoreActions = {
  setWidth: (width: number) => useSidebarStore.setState({ width: clampWidth(width) }),
};
