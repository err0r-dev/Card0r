import { create } from 'zustand';
import type { Recipient, RecipientWithMessage } from '@card0r/shared';

interface RecipientsState {
  recipients: Recipient[];
  recipientsWithMessages: RecipientWithMessage[];
  addRecipient: (recipient: Recipient) => void;
  removeRecipient: (id: string) => void;
  updateRecipient: (id: string, updates: Partial<Recipient>) => void;
  setRecipients: (recipients: Recipient[]) => void;
  setRecipientsWithMessages: (recipients: RecipientWithMessage[]) => void;
  clearRecipients: () => void;
}

export const useRecipientsStore = create<RecipientsState>((set) => ({
  recipients: [],
  recipientsWithMessages: [],
  addRecipient: (recipient) =>
    set((state) => ({ recipients: [...state.recipients, recipient] })),
  removeRecipient: (id) =>
    set((state) => ({
      recipients: state.recipients.filter((r) => r.id !== id),
    })),
  updateRecipient: (id, updates) =>
    set((state) => ({
      recipients: state.recipients.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),
  setRecipients: (recipients) => set({ recipients }),
  setRecipientsWithMessages: (recipientsWithMessages) =>
    set({ recipientsWithMessages }),
  clearRecipients: () => set({ recipients: [], recipientsWithMessages: [] }),
}));
