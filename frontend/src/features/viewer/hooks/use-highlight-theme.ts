import { useEffect } from 'react';
import { useThemeStore } from '@/features/theme/store/theme-store';

const LIGHT_THEME_HREF = new URL(
  'highlight.js/styles/github.css',
  import.meta.url,
).href;
const DARK_THEME_HREF = new URL(
  'highlight.js/styles/github-dark.css',
  import.meta.url,
).href;

const STYLE_ELEMENT_ID = 'hljs-theme-stylesheet';

/**
 * Dynamically swaps the highlight.js theme stylesheet (GitHub light/dark)
 * based on the app's current dark mode state.
 */
export function useHighlightTheme() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  useEffect(() => {
    let link = document.getElementById(
      STYLE_ELEMENT_ID,
    ) as HTMLLinkElement | null;

    if (!link) {
      link = document.createElement('link');
      link.id = STYLE_ELEMENT_ID;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    link.href = isDarkMode ? DARK_THEME_HREF : LIGHT_THEME_HREF;
  }, [isDarkMode]);
}
