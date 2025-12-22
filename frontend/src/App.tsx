import { useEffect } from 'react';
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
import { WizardNavigation } from './components/WizardNavigation';
import {
  RecipientsStep,
  CustomizeStep,
  GenerateStep,
  DownloadStep,
} from './components/steps';
import { toast } from 'sonner';

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
    canGoForward,
  } = useUIStore();
  const { darkMode, openaiKey, jamendoKey, hasCompletedSetup } = useSettingsStore();
  const { recipients, senderName } = useRecipientsStore();
  const { selectedTheme, jobs } = useVideoStore();

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
        return true; // Can always "start over" from download step
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
      // Reset and start over
      setCurrentStep(1);
      return;
    }
    goForward();
  };

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

  // Get forward button label
  const getForwardLabel = (): string | undefined => {
    if (currentStep === 3 && !allVideosComplete) {
      return 'Generating...';
    }
    return undefined; // Use default
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

          {/* Step Content */}
          <div className="pb-32">
            <AnimatePresence mode="wait">
              {renderStepContent()}
            </AnimatePresence>
          </div>

          {/* Wizard Navigation */}
          <WizardNavigation
            currentStep={currentStep}
            canGoBack={canGoBack()}
            canGoForward={canGoForward()}
            onBack={goBack}
            onForward={handleForward}
            forwardDisabled={!canProceedForward() || (currentStep === 3 && !allVideosComplete && jobs.length > 0)}
            forwardLabel={getForwardLabel()}
          />
        </MainLayout>
      )}

      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;
