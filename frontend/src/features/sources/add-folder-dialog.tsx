import { useState } from 'react';
import * as Button from '@/components/ui/button';
import * as Input from '@/components/ui/input';
import * as Modal from '@/components/ui/modal';
import { useAddSource } from '@/features/sources/use-sources';
import { ApiError } from '@/lib/api-client';
import { RiFolderAddLine } from '@remixicon/react';

interface AddFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddFolderDialog({ open, onOpenChange }: AddFolderDialogProps) {
  const [path, setPath] = useState('');
  const addSource = useAddSource();

  const errorMessage =
    addSource.error instanceof ApiError
      ? addSource.error.message
      : addSource.error
        ? 'Failed to add folder.'
        : null;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmedPath = path.trim();
    if (!trimmedPath) {
      return;
    }
    addSource.mutate(
      { path: trimmedPath },
      {
        onSuccess: () => {
          setPath('');
          onOpenChange(false);
        },
      },
    );
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setPath('');
      addSource.reset();
    }
    onOpenChange(nextOpen);
  }

  return (
    <Modal.Root open={open} onOpenChange={handleOpenChange}>
      <Modal.Content>
        <Modal.Header
          icon={RiFolderAddLine}
          title="Add folder"
          description="Enter the absolute path to a folder containing .md/.html files."
        />
        <form onSubmit={handleSubmit}>
          <Modal.Body>
            <Input.Root size="medium" hasError={Boolean(errorMessage)}>
              <Input.Wrapper>
                <Input.Input
                  autoFocus
                  placeholder="/absolute/path/to/folder"
                  value={path}
                  onChange={(event) => setPath(event.target.value)}
                  disabled={addSource.isPending}
                />
              </Input.Wrapper>
            </Input.Root>
            {errorMessage && (
              <p className="mt-2 text-paragraph-xs text-error-base">
                {errorMessage}
              </p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button.Root
              type="button"
              variant="neutral"
              mode="stroke"
              size="small"
              className="w-full"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button.Root>
            <Button.Root
              type="submit"
              variant="primary"
              mode="filled"
              size="small"
              className="w-full"
              disabled={addSource.isPending || path.trim().length === 0}
            >
              {addSource.isPending ? 'Adding...' : 'Add Folder'}
            </Button.Root>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
