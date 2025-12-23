import { Check } from 'lucide-react';

const STEP_LABELS = ['Recipients', 'Customize', 'Generate', 'Download'];

interface StepProgressProps {
  currentStep: 1 | 2 | 3 | 4;
}

export function StepProgress({ currentStep }: StepProgressProps) {
  return (
    <nav aria-label="Wizard progress" className="step-progress">
      {STEP_LABELS.map((label, index) => {
        const stepNum = (index + 1) as 1 | 2 | 3 | 4;
        const isActive = stepNum === currentStep;
        const isCompleted = stepNum < currentStep;

        return (
          <div key={label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`step-dot ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                aria-current={isActive ? 'step' : undefined}
                aria-label={`Step ${stepNum}: ${label}${isCompleted ? ' (completed)' : isActive ? ' (current)' : ''}`}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  stepNum
                )}
              </div>
              <span
                className={`step-label ${isActive ? 'active' : ''}`}
                aria-hidden="true"
              >
                {label}
              </span>
            </div>
            {index < STEP_LABELS.length - 1 && (
              <div
                className={`step-line ${isCompleted ? 'completed' : ''}`}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
