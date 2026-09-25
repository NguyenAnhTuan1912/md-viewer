import { useCallback, useEffect, useRef, useState } from 'react';
import * as Button from '@/components/ui/button';
import { AddFolderDialog } from '@/features/sources/add-folder-dialog';
import { useSources } from '@/features/sources/use-sources';
import { SidebarTreeView } from '@/features/sidebar-tree/tree-view';
import {
  SIDEBAR_MAX_WIDTH,
  SIDEBAR_MIN_WIDTH,
  useSidebarStore,
} from '@/stores/sidebar.store';
import { cn } from '@/utils/cn';
import { RiAddLine } from '@remixicon/react';

export function Sidebar() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { data: sources, isLoading, isError } = useSources();

  const width = useSidebarStore((state) => state.width);
  const setWidth = useSidebarStore((state) => state.setWidth);
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(width);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      event.preventDefault();
      startXRef.current = event.clientX;
      startWidthRef.current = width;
      setIsResizing(true);
    },
    [width],
  );

  useEffect(() => {
    if (!isResizing) {
      return;
    }

    function handlePointerMove(event: PointerEvent) {
      const delta = event.clientX - startXRef.current;
      setWidth(startWidthRef.current + delta);
    }

    function handlePointerUp() {
      setIsResizing(false);
    }

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, setWidth]);

  return (
    <aside
      style={{
        width,
        minWidth: SIDEBAR_MIN_WIDTH,
        maxWidth: SIDEBAR_MAX_WIDTH,
      }}
      className="relative flex h-full shrink-0 flex-col border-r border-stroke-soft-200 bg-bg-white-0"
    >
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-stroke-soft-200 px-5">
        <span className="text-label-sm text-text-strong-950">Sources</span>
        <Button.Root
          variant="neutral"
          mode="ghost"
          size="xxsmall"
          onClick={() => setIsAddDialogOpen(true)}
          aria-label="Add folder"
        >
          <Button.Icon as={RiAddLine} />
        </Button.Root>
      </div>

      <AddFolderDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      <div className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {isLoading && (
          <div className="px-2 py-2 text-paragraph-sm text-text-soft-400">
            Loading sources...
          </div>
        )}

        {isError && (
          <div className="px-2 py-2 text-paragraph-sm text-error-base">
            Failed to load sources.
          </div>
        )}

        {!isLoading && !isError && <SidebarTreeView sources={sources ?? []} />}
      </div>

      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize sidebar"
        onPointerDown={handlePointerDown}
        className={cn(
          'group absolute -right-1 top-0 z-10 h-full w-2 cursor-col-resize touch-none',
        )}
      >
        <div
          className={cn(
            'mx-auto h-full w-px bg-transparent transition-colors group-hover:bg-primary-alpha-24',
            isResizing && 'bg-primary-base',
          )}
        />
      </div>
    </aside>
  );
}
