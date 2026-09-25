import * as Switch from '@/components/ui/switch';
import * as Tooltip from '@/components/ui/tooltip';
import { RiMoonLine, RiSunLine } from '@remixicon/react';

interface HeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: (checked: boolean) => void;
}

export function Header({ isDarkMode, onToggleDarkMode }: HeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-stroke-soft-200 bg-bg-white-0 px-5">
      <span className="text-label-md text-text-strong-950">
        Markdown/HTML Viewer
      </span>

      <Tooltip.Provider>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <div className="flex items-center gap-2">
              <RiSunLine className="size-4 text-text-soft-400" />
              <Switch.Root
                checked={isDarkMode}
                onCheckedChange={onToggleDarkMode}
                aria-label="Toggle dark mode"
              />
              <RiMoonLine className="size-4 text-text-soft-400" />
            </div>
          </Tooltip.Trigger>
          <Tooltip.Content side="bottom">
            {isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          </Tooltip.Content>
        </Tooltip.Root>
      </Tooltip.Provider>
    </header>
  );
}
