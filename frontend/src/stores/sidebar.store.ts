import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const SIDEBAR_MIN_WIDTH = 200;
export const SIDEBAR_MAX_WIDTH = 480;
export const SIDEBAR_DEFAULT_WIDTH = 256;

interface SidebarState {
  width: number;
  setWidth: (width: number) => void;
}

function clampWidth(width: number): number {
  return Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, width));
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      width: SIDEBAR_DEFAULT_WIDTH,
      setWidth: (width) => set({ width: clampWidth(width) }),
    }),
    {
      name: 'md-viewer-sidebar',
    },
  ),
);
