import { FileUploader } from '../FileUploader';
import { RecipientForm } from '../RecipientForm';
import { RecipientTable } from '../RecipientTable';
import { SenderField } from '../SenderField';
import { motion } from 'framer-motion';

export function RecipientsStep() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div>
        <h2 className="text-3xl font-bold mb-2">Add Recipients</h2>
        <p className="text-muted-foreground">
          Upload a CSV/Excel file or manually enter recipient details
        </p>
      </div>

      {/* Sender Field - Who the cards are from */}
      <SenderField />

      {/* Input Methods */}
      <div className="grid lg:grid-cols-2 gap-6">
        <FileUploader />
        <RecipientForm />
      </div>

      {/* Recipients List */}
      <RecipientTable />
    </motion.div>
  );
}
