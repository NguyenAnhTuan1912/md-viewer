import { RiMenuLine, RiMoonLine } from "@remixicon/react";

// Import components
import * as CompactButton from "@/components/ui/compact-button";
import * as Dropdown from "@/components/ui/dropdown";
import * as Switch from "@/components/ui/switch";
import * as Tooltip from "@/components/ui/tooltip";

type THeaderProps = {
  isDarkMode: boolean;
  onToggleDarkMode: (checked: boolean) => void;
};

export function Header({ isDarkMode, onToggleDarkMode }: THeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-stroke-soft-200 bg-bg-white-0 px-5">
      <span className="text-label-md text-text-strong-950">
        Markdown/HTML Viewer
      </span>

      <Dropdown.Root>
        <Dropdown.Trigger asChild>
          <CompactButton.Root variant="modifiable">
            <CompactButton.Icon as={RiMenuLine} />
          </CompactButton.Root>
        </Dropdown.Trigger>

        <Dropdown.Content>
          <Dropdown.Item
            onSelect={(e) => {
              e.preventDefault();
              onToggleDarkMode(!isDarkMode);
            }}
          >
            <Dropdown.ItemIcon as={RiMoonLine} />
            Darkmode
            <span className="w-full"></span>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <Switch.Root checked={isDarkMode} />
              </Tooltip.Trigger>
              <Tooltip.Content side="bottom">
                {isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              </Tooltip.Content>
            </Tooltip.Root>
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Root>
    </header>
  );
}
