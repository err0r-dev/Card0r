import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Plus } from 'lucide-react';
import { useRecipientsStore } from '../stores/recipientsStore';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { toast } from 'sonner';

export function RecipientForm() {
  const { addRecipient } = useRecipientsStore();
  const [name, setName] = useState('');
  const [messageGuidance, setMessageGuidance] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !messageGuidance.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    addRecipient({
      id: uuidv4(),
      name: name.trim(),
      messageGuidance: messageGuidance.trim(),
    });

    toast.success(`Added ${name}`);
    setName('');
    setMessageGuidance('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          Add Recipient Manually
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Recipient Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., John Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">
              Full name of the person receiving the video card
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">
              Message Guidance <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              placeholder="e.g., Congratulations on your promotion! Wishing you continued success in your new role..."
              value={messageGuidance}
              onChange={(e) => setMessageGuidance(e.target.value)}
              rows={4}
              className="text-base resize-none"
            />
            <p className="text-xs text-muted-foreground">
              AI will use this guidance to create a personalised message for this recipient
            </p>
          </div>

          <Button type="submit" className="w-full" size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Add Recipient
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
