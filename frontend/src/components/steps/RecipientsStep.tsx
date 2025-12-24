import { useState } from 'react';
import { FileUploader } from '../FileUploader';
import { RecipientForm } from '../RecipientForm';
import { RecipientTable } from '../RecipientTable';
import { SenderField } from '../SenderField';
import { InputModeToggle, type InputMode } from '../InputModeToggle';
import { ConfirmModeChangeDialog } from '../ConfirmModeChangeDialog';
import { useRecipientsStore } from '../../stores/recipientsStore';
import { motion, AnimatePresence } from 'framer-motion';

export function RecipientsStep() {
  const { recipients } = useRecipientsStore();
  const [inputMode, setInputMode] = useState<InputMode>('manual');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingMode, setPendingMode] = useState<InputMode | null>(null);

  const handleModeChange = (newMode: InputMode) => {
    if (newMode === inputMode) return;

    // If there are recipients, ask for confirmation
    if (recipients.length > 0) {
      setPendingMode(newMode);
      setShowConfirmDialog(true);
    } else {
      setInputMode(newMode);
    }
  };

  const handleConfirmModeChange = () => {
    if (pendingMode) {
      setInputMode(pendingMode);
    }
    setPendingMode(null);
    setShowConfirmDialog(false);
  };

  const handleCancelModeChange = () => {
    setPendingMode(null);
    setShowConfirmDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Sender Field - Who the cards are from */}
      <SenderField />

      {/* Input Mode Toggle */}
      <InputModeToggle
        mode={inputMode}
        onModeChange={handleModeChange}
      />

      {/* Input Method - Animated switch */}
      <AnimatePresence mode="wait">
        {inputMode === 'manual' ? (
          <motion.div
            key="manual"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <RecipientForm />
          </motion.div>
        ) : (
          <motion.div
            key="csv"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <FileUploader />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recipients List - Always visible */}
      <RecipientTable />

      {/* Confirmation Dialog */}
      <ConfirmModeChangeDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        pendingMode={pendingMode}
        recipientCount={recipients.length}
        onConfirm={handleConfirmModeChange}
        onCancel={handleCancelModeChange}
      />
    </div>
  );
}
