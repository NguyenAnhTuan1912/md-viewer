import { beforeEach, describe, expect, it } from 'vitest';
import { useThemeStore, themeStoreActions } from '@/features/theme/store/theme-store';

describe('useThemeStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useThemeStore.setState({ isDarkMode: false });
  });

  it('defaults to light mode', () => {
    expect(useThemeStore.getState().isDarkMode).toBe(false);
  });

  it('setDarkMode sets the value explicitly', () => {
    themeStoreActions.setDarkMode(true);
    expect(useThemeStore.getState().isDarkMode).toBe(true);

    themeStoreActions.setDarkMode(false);
    expect(useThemeStore.getState().isDarkMode).toBe(false);
  });

  it('toggleDarkMode flips the current value', () => {
    expect(useThemeStore.getState().isDarkMode).toBe(false);

    themeStoreActions.toggleDarkMode();
    expect(useThemeStore.getState().isDarkMode).toBe(true);

    themeStoreActions.toggleDarkMode();
    expect(useThemeStore.getState().isDarkMode).toBe(false);
  });

  it('persists state to localStorage under the configured key', () => {
    themeStoreActions.setDarkMode(true);

    const stored = localStorage.getItem('md-viewer-theme');
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.state.isDarkMode).toBe(true);
  });
});
