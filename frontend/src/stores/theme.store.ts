import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDarkMode: boolean;
  setDarkMode: (isDarkMode: boolean) => void;
  toggleDarkMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      isDarkMode: false,
      setDarkMode: (isDarkMode) => set({ isDarkMode }),
      toggleDarkMode: () => set({ isDarkMode: !get().isDarkMode }),
    }),
    {
      name: 'md-viewer-theme',
    },
  ),
);
