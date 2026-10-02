import { useMemo } from 'react';
import { useOpenTabsStore } from '@/features/viewer/store/open-tabs-store';
import { useSources } from '@/features/sources/queries/use-sources';
import { useFileContent } from '@/features/viewer/queries/use-file-content';
import { MarkdownViewer } from '@/features/viewer/components/markdown-viewer';
import { HtmlViewer } from '@/features/viewer/components/html-viewer';

export function ViewerPage() {
  const activeTabPath = useOpenTabsStore((state) => state.activeTabPath);
  const { data: sources } = useSources();

  const { data: fileContent, isLoading, isError } = useFileContent(activeTabPath);

  // Find the registered source whose root contains the active file, so
  // root-relative asset references (e.g. `/images/logo.png`) can be
  // resolved against that source's folder instead of the real filesystem
  // root. Pick the longest matching prefix in case sources are nested.
  const activeSourceRoot = useMemo(() => {
    if (!activeTabPath || !sources) {
      return undefined;
    }
    const matches = sources.filter(
      (source) =>
        activeTabPath === source.path ||
        activeTabPath.startsWith(`${source.path}/`),
    );
    if (matches.length === 0) {
      return undefined;
    }
    return matches.reduce((longest, current) =>
      current.path.length > longest.path.length ? current : longest,
    ).path;
  }, [activeTabPath, sources]);

  return (
    <>
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
        <MarkdownViewer
          content={fileContent.content}
          filePath={activeTabPath}
          sourceRoot={activeSourceRoot}
        />
      )}

      {activeTabPath && fileContent?.type === 'html' && (
        <HtmlViewer
          content={fileContent.content}
          filePath={activeTabPath}
          sourceRoot={activeSourceRoot}
        />
      )}
    </>
  );
}
