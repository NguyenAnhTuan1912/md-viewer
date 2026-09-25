import { useEffect } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { TabBar } from '@/components/layout/tab-bar';
import { Toaster } from '@/components/ui/toast';
import { useThemeStore } from '@/stores/theme.store';
import { useOpenTabsStore } from '@/stores/open-tabs.store';
import { useFileContent } from '@/features/viewer/use-file-content';
import { MarkdownViewer } from '@/features/viewer/markdown-viewer';
import { HtmlViewer } from '@/features/viewer/html-viewer';

function App() {
  const isDarkMode = useThemeStore((state) => state.isDarkMode);
  const setDarkMode = useThemeStore((state) => state.setDarkMode);
  const activeTabPath = useOpenTabsStore((state) => state.activeTabPath);

  const { data: fileContent, isLoading, isError } = useFileContent(activeTabPath);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-weak-50">
      <Toaster theme={isDarkMode ? 'dark' : 'light'} />
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header isDarkMode={isDarkMode} onToggleDarkMode={setDarkMode} />
        <TabBar />
        <main className="flex-1 overflow-y-auto p-6">
          {!activeTabPath && (
            <div className="flex h-full items-center justify-center text-paragraph-sm text-text-soft-400">
              Select a file from the sidebar to preview it here.
            </div>
          )}

          {activeTabPath && isLoading && (
            <div className="flex h-full items-center justify-center text-paragraph-sm text-text-soft-400">
              Loading file...
            </div>
          )}

          {activeTabPath && isError && (
            <div className="flex h-full items-center justify-center text-paragraph-sm text-error-base">
              Failed to load file content.
            </div>
          )}

          {activeTabPath && fileContent?.type === 'markdown' && (
            <MarkdownViewer content={fileContent.content} />
          )}

          {activeTabPath && fileContent?.type === 'html' && (
            <HtmlViewer content={fileContent.content} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
