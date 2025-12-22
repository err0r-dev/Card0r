import { Trash2, Users } from 'lucide-react';
import { useRecipientsStore } from '../stores/recipientsStore';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

export function RecipientTable() {
  const { recipients, removeRecipient } = useRecipientsStore();

  if (recipients.length === 0) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recipients added yet</p>
            <p className="text-sm mt-2">Upload a CSV file or add recipients manually</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recipients ({recipients.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recipients.map((recipient, index) => (
            <div key={recipient.id}>
              <div className="flex items-start justify-between gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      #{index + 1}
                    </span>
                    <h4 className="font-medium truncate">{recipient.name}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {recipient.messageGuidance}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRecipient(recipient.id)}
                  className="flex-shrink-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {index < recipients.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
