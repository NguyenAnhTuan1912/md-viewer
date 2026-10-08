import { create } from "zustand";
import { persist } from "zustand/middleware";

type TThemeState = {
  isDarkMode: boolean;
};

export const useThemeStore = create<TThemeState>()(
  persist(
    (): TThemeState => ({
      isDarkMode: false,
    }),
    {
      name: "md-viewer-theme",
    },
  ),
);

export const themeStoreActions = {
  setDarkMode: (isDarkMode: boolean) => useThemeStore.setState({ isDarkMode }),
  toggleDarkMode: () =>
    useThemeStore.setState((state) => ({ isDarkMode: !state.isDarkMode })),
};
