import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { AlertTriangle, Download, Trash2 } from 'lucide-react';

interface ConfirmStartOverDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  videoCount: number;
  onDownloadFirst: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmStartOverDialog({
  open,
  onOpenChange,
  videoCount,
  onDownloadFirst,
  onConfirm,
  onCancel,
}: ConfirmStartOverDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Start Over?
          </DialogTitle>
          <DialogDescription className="pt-2 space-y-2">
            <p>
              You have <strong>{videoCount} video{videoCount !== 1 ? 's' : ''}</strong> that will be deleted if you start over.
            </p>
            <p>
              Would you like to download them first, or continue and delete everything?
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={onDownloadFirst} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download Videos First
          </Button>
          <Button variant="destructive" onClick={onConfirm} className="w-full">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete & Start Over
          </Button>
          <Button variant="outline" onClick={onCancel} className="w-full">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
