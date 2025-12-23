import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';
import type { InputMode } from './InputModeToggle';

interface ConfirmModeChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingMode: InputMode | null;
  recipientCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModeChangeDialog({
  open,
  onOpenChange,
  pendingMode,
  recipientCount,
  onConfirm,
  onCancel,
}: ConfirmModeChangeDialogProps) {
  const modeLabel = pendingMode === 'manual' ? 'Manual Entry' : 'CSV/Excel Upload';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Switch Input Mode?
          </DialogTitle>
          <DialogDescription className="pt-2 space-y-2">
            <p>
              You currently have <strong>{recipientCount} recipient{recipientCount !== 1 ? 's' : ''}</strong> added.
            </p>
            <p>
              Switching to <strong>{modeLabel}</strong> will keep your existing recipients.
              You can continue adding more or clear them manually.
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Switch Mode
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
