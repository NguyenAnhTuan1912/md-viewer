import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface IThemeState {
  isDarkMode: boolean;
}

export const useThemeStore = create<IThemeState>()(
  persist(
    (): IThemeState => ({
      isDarkMode: false,
    }),
    {
      name: 'md-viewer-theme',
    },
  ),
);

export const themeStoreActions = {
  setDarkMode: (isDarkMode: boolean) => useThemeStore.setState({ isDarkMode }),
  toggleDarkMode: () =>
    useThemeStore.setState((state) => ({ isDarkMode: !state.isDarkMode })),
};
