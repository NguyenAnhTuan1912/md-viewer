import { RiVoiceprintLine, RiBookOpenLine, RiLinkM } from "@remixicon/react";

// Import components
import { toast } from "@/components/ui/toast";
import * as ToastAlert from "@/components/ui/toast-alert";
import * as ButtonGroup from "@/components/ui/button-group";
import * as Tooltip from "@/components/ui/tooltip";

// Import libs
import { copyTextToClipboard } from "@/lib/copy-text";

// Import stores
import { useOpenTabsStore } from "@/features/viewer/store/open-tabs-store";

import { focusedViewerStateActions } from "./focused-viewer";

export function FloatMenu() {
  const activeTabPath = useOpenTabsStore((state) => state.activeTabPath);

  return (
    <ButtonGroup.Root>
      <ButtonGroup.Item
        onClick={() => {
          focusedViewerStateActions.setIsOpen(true);
        }}
      >
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <ButtonGroup.Icon as={RiBookOpenLine} />
          </Tooltip.Trigger>
          <Tooltip.Content side="bottom">
            Go to deep reading mode
          </Tooltip.Content>
        </Tooltip.Root>
      </ButtonGroup.Item>
      <ButtonGroup.Item
        onClick={() => {
          copyTextToClipboard(activeTabPath || "", {
            onSuccess() {
              toast.custom((t) => (
                <ToastAlert.Root
                  t={t}
                  status="success"
                  message={"Copy path successfully"}
                />
              ));
            },
          });
        }}
      >
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <ButtonGroup.Icon as={RiLinkM} />
          </Tooltip.Trigger>
          <Tooltip.Content side="bottom">Copy path</Tooltip.Content>
        </Tooltip.Root>
      </ButtonGroup.Item>
      <ButtonGroup.Item>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <ButtonGroup.Icon as={RiVoiceprintLine} />ß
          </Tooltip.Trigger>
          <Tooltip.Content side="bottom">Listen</Tooltip.Content>
        </Tooltip.Root>
      </ButtonGroup.Item>
    </ButtonGroup.Root>
  );
}
