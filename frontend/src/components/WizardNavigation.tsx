import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STEP_LABELS = ['Recipients', 'Customize', 'Generate', 'Download'];

interface WizardNavigationProps {
  currentStep: 1 | 2 | 3 | 4;
  canGoBack: boolean;
  canGoForward: boolean;
  onBack: () => void;
  onForward: () => void;
  forwardDisabled?: boolean;
  forwardLabel?: string;
}

export function WizardNavigation({
  currentStep,
  canGoBack,
  canGoForward,
  onBack,
  onForward,
  forwardDisabled = false,
  forwardLabel,
}: WizardNavigationProps) {
  const getForwardLabel = () => {
    if (forwardLabel) return forwardLabel;
    if (currentStep === 4) return 'Start Over';
    if (currentStep === 3) return 'View Downloads';
    return 'Continue';
  };

  return (
    <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border py-4 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-4">
          {STEP_LABELS.map((label, index) => {
            const stepNum = index + 1;
            const isActive = stepNum === currentStep;
            const isCompleted = stepNum < currentStep;

            return (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                      isCompleted && 'bg-primary text-primary-foreground',
                      isActive && 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background',
                      !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                    )}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
                  </div>
                  <span
                    className={cn(
                      'text-xs mt-1 hidden sm:block',
                      isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                    )}
                  >
                    {label}
                  </span>
                </div>
                {index < STEP_LABELS.length - 1 && (
                  <div
                    className={cn(
                      'w-12 sm:w-16 h-0.5 mx-2',
                      stepNum < currentStep ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={onBack}
            disabled={!canGoBack}
            className="min-w-[100px]"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          <span className="text-sm text-muted-foreground">
            Step {currentStep} of 4
          </span>

          <Button
            onClick={onForward}
            disabled={forwardDisabled}
            className="min-w-[100px]"
          >
            {getForwardLabel()}
            {currentStep < 4 && <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
