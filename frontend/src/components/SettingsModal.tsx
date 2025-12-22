import { useState, useEffect } from 'react';
import { useUIStore } from '../stores/uiStore';
import { useSettingsStore } from '../stores/settingsStore';
import { apiClient } from '../lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

export function SettingsModal() {
  const { showSettings, setShowSettings } = useUIStore();
  const { openaiKey, jamendoKey, setOpenaiKey, setJamendoKey } = useSettingsStore();

  const [localOpenaiKey, setLocalOpenaiKey] = useState(openaiKey);
  const [localJamendoKey, setLocalJamendoKey] = useState(jamendoKey);
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState<{
    openai: boolean | null;
    jamendo: boolean | null;
  }>({ openai: null, jamendo: null });

  // Sync local state with store when modal opens
  useEffect(() => {
    if (showSettings) {
      console.log('[SettingsModal] Syncing keys from store:', {
        openaiKey: openaiKey ? '***' + openaiKey.slice(-4) : 'empty',
        jamendoKey: jamendoKey ? '***' + jamendoKey.slice(-4) : 'empty'
      });
      setLocalOpenaiKey(openaiKey);
      setLocalJamendoKey(jamendoKey);
    }
  }, [showSettings, openaiKey, jamendoKey]);

  const handleSave = async () => {
    setIsValidating(true);
    console.log('[SettingsModal] Validating keys:', {
      openai: localOpenaiKey ? '***' + localOpenaiKey.slice(-4) : 'empty',
      jamendo: localJamendoKey ? '***' + localJamendoKey.slice(-4) : 'empty'
    });
    try {
      const result = await apiClient.validateApiKeys({
        openai: localOpenaiKey || undefined,
        jamendo: localJamendoKey || undefined,
      });
      console.log('[SettingsModal] Validation result:', result);

      setValidation({
        openai: result.openai.valid,
        jamendo: result.jamendo.valid,
      });

      if (result.openai.valid && result.jamendo.valid) {
        setOpenaiKey(localOpenaiKey);
        setJamendoKey(localJamendoKey);
        toast.success('API keys saved successfully!');
        setShowSettings(false);
      } else {
        const errors = [];
        if (!result.openai.valid) errors.push(`OpenAI: ${result.openai.error}`);
        if (!result.jamendo.valid) errors.push(`Jamendo: ${result.jamendo.error}`);
        toast.error('Invalid API keys:\n' + errors.join('\n'));
      }
    } catch (error) {
      toast.error('Failed to validate API keys');
      console.error(error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleClose = () => {
    setLocalOpenaiKey(openaiKey);
    setLocalJamendoKey(jamendoKey);
    setValidation({ openai: null, jamendo: null });
    setShowSettings(false);
  };

  return (
    <Dialog open={showSettings} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your API keys for OpenAI and Jamendo. Both keys are required to generate videos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* OpenAI API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="openai-key">OpenAI API Key</Label>
              {validation.openai !== null && (
                validation.openai ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )
              )}
            </div>
            <Input
              id="openai-key"
              type="password"
              placeholder="sk-..."
              value={localOpenaiKey}
              onChange={(e) => setLocalOpenaiKey(e.target.value)}
              className="text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-muted-foreground">
              Get your API key from{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                OpenAI Platform
              </a>
            </p>
          </div>

          {/* Jamendo API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="jamendo-key">Jamendo API Key (Client ID)</Label>
              {validation.jamendo !== null && (
                validation.jamendo ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-red-500" />
                )
              )}
            </div>
            <Input
              id="jamendo-key"
              type="password"
              placeholder="Your Jamendo Client ID"
              value={localJamendoKey}
              onChange={(e) => setLocalJamendoKey(e.target.value)}
              className="text-gray-900 dark:text-gray-100"
            />
            <p className="text-xs text-muted-foreground">
              Get your API key from{' '}
              <a
                href="https://developer.jamendo.com/v3.0"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Jamendo Developer
              </a>
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isValidating || !localOpenaiKey || !localJamendoKey}
          >
            {isValidating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save & Validate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
