'use client';

import { Spinner } from '@/components/common/spinner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the confirm action as destructive (removals, deletions). */
  destructive?: boolean;
  pending?: boolean;
  pendingLabel?: string;
  onConfirm: () => void;
}

/**
 * Generic confirmation step for irreversible actions.
 *
 * While `pending` is true both buttons are disabled and the dialog cannot be
 * dismissed, so a request can never be fired twice or orphaned by a close.
 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  pending = false,
  pendingLabel = 'Working…',
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen: boolean) => {
        if (pending) return;

        onOpenChange(nextOpen);
      }}
    >
      <DialogContent showCloseButton={!pending} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            size="lg"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            {cancelLabel}
          </Button>

          <Button
            variant={destructive ? 'destructive' : 'default'}
            size="lg"
            disabled={pending}
            onClick={onConfirm}
          >
            {pending ? (
              <>
                <Spinner className="size-4" />
                {pendingLabel}
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
