import { useState } from 'react';
import { useSettingsStore } from '../stores/settingsStore';
import { apiClient } from '../lib/api';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Loader2, Check, X, ExternalLink, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface SetupScreenProps {
  onComplete: () => void;
}

export function SetupScreen({ onComplete }: SetupScreenProps) {
  const { setOpenaiKey, setJamendoKey, setHasCompletedSetup } = useSettingsStore();

  const [localOpenaiKey, setLocalOpenaiKey] = useState('');
  const [localJamendoKey, setLocalJamendoKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validation, setValidation] = useState<{
    openai: boolean | null;
    jamendo: boolean | null;
  }>({ openai: null, jamendo: null });

  const handleValidateAndContinue = async () => {
    setIsValidating(true);
    try {
      const result = await apiClient.validateApiKeys({
        openai: localOpenaiKey || undefined,
        jamendo: localJamendoKey || undefined,
      });

      setValidation({
        openai: result.openai.valid,
        jamendo: result.jamendo.valid,
      });

      if (result.openai.valid && result.jamendo.valid) {
        setOpenaiKey(localOpenaiKey);
        setJamendoKey(localJamendoKey);
        setHasCompletedSetup(true);
        toast.success('API keys saved! Let\'s create some cards!');
        onComplete();
      } else {
        const errors = [];
        if (!result.openai.valid) errors.push(`OpenAI: ${result.openai.error}`);
        if (!result.jamendo.valid) errors.push(`Jamendo: ${result.jamendo.error}`);
        toast.error('Please check your API keys:\n' + errors.join('\n'));
      }
    } catch (error) {
      toast.error('Failed to validate API keys. Please try again.');
      console.error(error);
    } finally {
      setIsValidating(false);
    }
  };

  const canProceed = localOpenaiKey.trim().length > 0 && localJamendoKey.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4"
    >
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2"
          >
            <Sparkles className="w-8 h-8 text-primary" />
          </motion.div>
          <CardTitle className="text-2xl">Welcome to Card0r!</CardTitle>
          <CardDescription className="text-base">
            To get started, you'll need to add your API keys. These enable AI-powered message generation and background music.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* OpenAI API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="setup-openai-key" className="text-base font-medium">
                OpenAI API Key
              </Label>
              {validation.openai !== null && (
                validation.openai ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <X className="h-5 w-5 text-red-500" />
                )
              )}
            </div>
            <Input
              id="setup-openai-key"
              type="password"
              placeholder="sk-..."
              value={localOpenaiKey}
              onChange={(e) => setLocalOpenaiKey(e.target.value)}
              className="text-base"
            />
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              Get your OpenAI key
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>

          {/* Jamendo API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="setup-jamendo-key" className="text-base font-medium">
                Jamendo API Key (Client ID)
              </Label>
              {validation.jamendo !== null && (
                validation.jamendo ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <X className="h-5 w-5 text-red-500" />
                )
              )}
            </div>
            <Input
              id="setup-jamendo-key"
              type="password"
              placeholder="Your Jamendo Client ID"
              value={localJamendoKey}
              onChange={(e) => setLocalJamendoKey(e.target.value)}
              className="text-base"
            />
            <a
              href="https://developer.jamendo.com/v3.0"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-primary hover:underline"
            >
              Get your Jamendo key
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>

          <Button
            onClick={handleValidateAndContinue}
            disabled={!canProceed || isValidating}
            className="w-full h-12 text-base"
            size="lg"
          >
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Validating...
              </>
            ) : (
              'Get Started'
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Your API keys are stored locally and never shared.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
