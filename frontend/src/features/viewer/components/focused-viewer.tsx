import { create } from "zustand";

// Import components
import * as Modal from "@/components/ui/modal";

export type TFocusedViewerState = {
  isOpen: boolean;
};

export type TFocusedViewerActions = {
  setIsOpen(status: boolean): void;
};

export type FocusedViewerProps = React.PropsWithChildren & {};

export const useFocusedViewerState = create<TFocusedViewerState>(() => ({
  isOpen: false,
}));

export const focusedViewerStateActions: TFocusedViewerActions = {
  setIsOpen(status) {
    useFocusedViewerState.setState((state) => {
      return {
        ...state,
        isOpen: status,
      };
    });
  },
};

export function FocusedViewer(props: FocusedViewerProps) {
  const { isOpen } = useFocusedViewerState();

  return (
    <Modal.Root
      open={isOpen}
      onOpenChange={focusedViewerStateActions.setIsOpen}
    >
      <Modal.Content className="h-full w-full max-w-[90%] overflow-y-auto mx-0">
        <Modal.Body>
          {props.children}
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
