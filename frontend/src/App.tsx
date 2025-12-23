import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { useUIStore } from './stores/uiStore';
import { useSettingsStore } from './stores/settingsStore';
import { useRecipientsStore } from './stores/recipientsStore';
import { useVideoStore } from './stores/videoStore';
import { SplashScreen } from './components/SplashScreen';
import { SetupScreen } from './components/SetupScreen';
import { MainLayout } from './components/MainLayout';
import { SettingsModal } from './components/SettingsModal';
import { StepProgress } from './components/StepProgress';
import { GuidedStepCard } from './components/GuidedStepCard';
import { ConfirmStartOverDialog } from './components/ConfirmStartOverDialog';
import {
  RecipientsStep,
  CustomizeStep,
  GenerateStep,
  DownloadStep,
} from './components/steps';
import { toast } from 'sonner';

// Step configuration
const STEP_CONFIG = {
  1: {
    title: 'Add Recipients',
    description: 'Enter the people who will receive personalized video cards',
  },
  2: {
    title: 'Customize Your Cards',
    description: 'Choose a theme, format, and optional background music',
  },
  3: {
    title: 'Generate Videos',
    description: 'AI will create personalized messages and render your videos',
  },
  4: {
    title: 'Your Videos Are Ready!',
    description: 'Download your personalized video cards',
  },
};

function App() {
  const {
    showSplash,
    setShowSplash,
    showSetup,
    setShowSetup,
    currentStep,
    setCurrentStep,
    goBack,
    goForward,
    canGoBack,
    resetWizard,
  } = useUIStore();
  const { darkMode, openaiKey, jamendoKey, hasCompletedSetup } = useSettingsStore();
  const { recipients, senderName, clearRecipients } = useRecipientsStore();
  const { selectedTheme, jobs, currentJobId, clearVideoState } = useVideoStore();

  // State for start over confirmation dialog
  const [showStartOverDialog, setShowStartOverDialog] = useState(false);

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Check if setup is needed when splash finishes
  useEffect(() => {
    if (!showSplash && !hasCompletedSetup && (!openaiKey || !jamendoKey)) {
      setShowSetup(true);
    }
  }, [showSplash, hasCompletedSetup, openaiKey, jamendoKey]);

  const handleEnterApp = () => {
    setShowSplash(false);
  };

  const handleSetupComplete = () => {
    setShowSetup(false);
  };

  const hasRecipients = recipients.length > 0;
  const hasSelectedTheme = selectedTheme !== null;
  const allVideosComplete = jobs.length > 0 && jobs.every(
    (job) => job.status === 'completed' || job.status === 'failed'
  );

  // Determine if we can proceed to next step
  const canProceedForward = (): boolean => {
    switch (currentStep) {
      case 1:
        return hasRecipients;
      case 2:
        return hasSelectedTheme;
      case 3:
        return allVideosComplete;
      case 4:
        return true;
      default:
        return false;
    }
  };

  // Handle forward navigation with validation
  const handleForward = () => {
    if (currentStep === 1 && !hasRecipients) {
      toast.error('Please add at least one recipient before continuing');
      return;
    }
    if (currentStep === 1 && !senderName.trim()) {
      toast.warning('Consider adding your name in the "From" field');
    }
    if (currentStep === 2 && !hasSelectedTheme) {
      toast.error('Please select a theme before continuing');
      return;
    }
    if (currentStep === 4) {
      // Check if there are completed videos - show warning dialog
      const completedVideos = jobs.filter(j => j.status === 'completed' && j.videoUrl);
      if (completedVideos.length > 0) {
        setShowStartOverDialog(true);
        return;
      }
      // No videos to warn about, just start over
      handleStartOver();
      return;
    }
    goForward();
  };

  // Start over handler
  const handleStartOver = () => {
    clearRecipients();
    clearVideoState();
    resetWizard();
    setShowStartOverDialog(false);
  };

  // Handle download first from dialog
  const handleDownloadFirst = () => {
    setShowStartOverDialog(false);
    // Stay on download page so user can download
    toast.info('Download your videos, then click Start Over again');
  };

  // Get forward button label
  const getForwardLabel = (): string => {
    if (currentStep === 3 && !allVideosComplete && jobs.length > 0) {
      return 'Generating...';
    }
    if (currentStep === 3) {
      return 'View Downloads';
    }
    if (currentStep === 4) {
      return 'Start Over';
    }
    return 'Next';
  };

  // Check if next is disabled
  const isNextDisabled = (): boolean => {
    if (!canProceedForward()) return true;
    if (currentStep === 3 && !allVideosComplete && jobs.length > 0) return true;
    return false;
  };

  // Get step config
  const stepConfig = STEP_CONFIG[currentStep as keyof typeof STEP_CONFIG];

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <RecipientsStep />;
      case 2:
        return <CustomizeStep />;
      case 3:
        return <GenerateStep />;
      case 4:
        return <DownloadStep />;
      default:
        return <RecipientsStep />;
    }
  };

  return (
    <>
      {/* Splash Screen */}
      <AnimatePresence>
        {showSplash && <SplashScreen onEnter={handleEnterApp} />}
      </AnimatePresence>

      {/* Setup Screen (first-time API key setup) */}
      <AnimatePresence>
        {!showSplash && showSetup && (
          <SetupScreen onComplete={handleSetupComplete} />
        )}
      </AnimatePresence>

      {/* Main App */}
      {!showSplash && !showSetup && (
        <MainLayout>
          <SettingsModal />

          {/* Step Progress at top */}
          <div className="mb-6">
            <StepProgress currentStep={currentStep} />
          </div>

          {/* Guided Step Card */}
          <AnimatePresence mode="wait">
            <GuidedStepCard
              key={currentStep}
              title={stepConfig.title}
              description={stepConfig.description}
              onBack={canGoBack() ? goBack : undefined}
              onNext={handleForward}
              canGoBack={canGoBack()}
              canGoNext={true}
              nextLabel={getForwardLabel()}
              nextDisabled={isNextDisabled()}
              variant={currentStep === 4 ? 'success' : 'default'}
              showNavigation={true}
            >
              {renderStepContent()}
            </GuidedStepCard>
          </AnimatePresence>
        </MainLayout>
      )}

      {/* Start Over Confirmation Dialog */}
      <ConfirmStartOverDialog
        open={showStartOverDialog}
        onOpenChange={setShowStartOverDialog}
        videoCount={jobs.filter(j => j.status === 'completed' && j.videoUrl).length}
        onDownloadFirst={handleDownloadFirst}
        onConfirm={handleStartOver}
        onCancel={() => setShowStartOverDialog(false)}
      />

      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;
