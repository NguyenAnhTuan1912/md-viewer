import { RiCloseLine, RiFileTextLine, RiHtml5Line } from '@remixicon/react';
import {
  useOpenTabsStore,
  openTabsStoreActions,
} from '@/features/viewer/store/open-tabs-store';
import { cn } from '@/lib/cn';

export function TabBar() {
  const tabs = useOpenTabsStore((state) => state.tabs);
  const activeTabPath = useOpenTabsStore((state) => state.activeTabPath);
  const focusTab = openTabsStoreActions.focusTab;
  const closeTab = openTabsStoreActions.closeTab;

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className="flex h-10 shrink-0 items-stretch overflow-x-auto border-b border-stroke-soft-200 bg-bg-weak-50">
      {tabs.map((tab) => {
        const isActive = tab.path === activeTabPath;
        const Icon = tab.type === 'markdown' ? RiFileTextLine : RiHtml5Line;

        return (
          <div
            key={tab.path}
            role="tab"
            aria-selected={isActive}
            onClick={() => focusTab(tab.path)}
            className={cn(
              'group/tab relative flex min-w-[120px] max-w-[200px] shrink-0 cursor-pointer items-center gap-2 border-r border-stroke-soft-200 px-3 text-paragraph-sm transition-colors',
              isActive
                ? 'bg-bg-white-0 text-text-strong-950'
                : 'text-text-sub-600 hover:bg-bg-soft-200/50',
            )}
          >
            {isActive && (
              <span className="absolute inset-x-0 top-0 h-0.5 bg-primary-base" />
            )}
            <Icon className="size-4 shrink-0 text-text-soft-400" />
            <span className="flex-1 truncate">{tab.name}</span>
            <button
              type="button"
              aria-label={`Close ${tab.name}`}
              onClick={(event) => {
                event.stopPropagation();
                closeTab(tab.path);
              }}
              className={cn(
                'flex size-5 shrink-0 items-center justify-center rounded-md text-text-soft-400 opacity-0 transition-opacity hover:bg-bg-soft-200 hover:text-text-strong-950 group-hover/tab:opacity-100',
                isActive && 'opacity-100',
              )}
            >
              <RiCloseLine className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
