import type { ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { motion } from 'framer-motion';

interface GuidedStepCardProps {
  title: string;
  description: string;
  children: ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  canGoBack?: boolean;
  canGoNext?: boolean;
  nextLabel?: string;
  nextDisabled?: boolean;
  variant?: 'default' | 'success';
  showNavigation?: boolean;
}

export function GuidedStepCard({
  title,
  description,
  children,
  onBack,
  onNext,
  canGoBack = true,
  canGoNext = true,
  nextLabel = 'Next',
  nextDisabled = false,
  variant = 'default',
  showNavigation = true,
}: GuidedStepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className={`guided-card ${variant === 'success' ? 'guided-card-success' : ''}`}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="guided-step-title">{title}</h2>
        <p className="guided-step-description">{description}</p>
      </div>

      {/* Content */}
      <div className="guided-content">
        {children}
      </div>

      {/* Navigation */}
      {showNavigation && (onBack || onNext) && (
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
          {onBack && canGoBack ? (
            <Button variant="outline" onClick={onBack} className="min-w-[100px]">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          ) : (
            <div />
          )}
          {onNext && (
            <Button
              onClick={onNext}
              disabled={!canGoNext || nextDisabled}
              className="min-w-[120px] btn-gradient"
            >
              {nextLabel}
              {nextLabel !== 'Start Over' && nextLabel !== 'Generating...' && (
                <ChevronRight className="ml-2 h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
