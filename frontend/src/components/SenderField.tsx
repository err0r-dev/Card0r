import { useRecipientsStore } from '../stores/recipientsStore';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { User } from 'lucide-react';

export function SenderField() {
  const { senderName, setSenderName } = useRecipientsStore();

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardContent className="pt-4">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-full bg-primary/10">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="sender-name" className="text-base font-medium">
              From (Your Name)
            </Label>
            <Input
              id="sender-name"
              type="text"
              placeholder="Enter your name or company"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="text-base"
            />
            <p className="text-xs text-muted-foreground">
              This name will appear on all cards as the sender
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
