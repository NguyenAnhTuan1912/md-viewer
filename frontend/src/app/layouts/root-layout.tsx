import type { PropsWithChildren } from 'react';
import { Sidebar } from '@/app/layouts/sidebar';
import { Header } from '@/app/layouts/header';
import { TabBar } from '@/features/viewer/components/tab-bar';
import { useThemeStore, themeStoreActions } from '@/features/theme/store/theme-store';

export function RootLayout({ children }: PropsWithChildren) {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-weak-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          isDarkMode={isDarkMode}
          onToggleDarkMode={themeStoreActions.setDarkMode}
        />
        <TabBar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
