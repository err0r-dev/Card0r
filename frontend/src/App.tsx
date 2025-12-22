import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { useUIStore } from './stores/uiStore';
import { useSettingsStore } from './stores/settingsStore';
import { useRecipientsStore } from './stores/recipientsStore';
import { useVideoStore } from './stores/videoStore';
import { SplashScreen } from './components/SplashScreen';
import { MainLayout } from './components/MainLayout';
import { SettingsModal } from './components/SettingsModal';
import { FileUploader } from './components/FileUploader';
import { RecipientForm } from './components/RecipientForm';
import { RecipientTable } from './components/RecipientTable';
import { HolidaySelector } from './components/HolidaySelector';
import { FormatPicker } from './components/FormatPicker';
import { MusicSelector } from './components/MusicSelector';
import { VideoGenerator } from './components/VideoGenerator';
import { VideoGallery } from './components/VideoGallery';
import { Button } from './components/ui/button';
import { Separator } from './components/ui/separator';
import { AlertCircle, ArrowRight } from 'lucide-react';

function App() {
  const { showSplash, setShowSplash, currentStep, setCurrentStep } = useUIStore();
  const { darkMode, openaiKey, jamendoKey } = useSettingsStore();
  const { recipients } = useRecipientsStore();
  const { selectedTheme } = useVideoStore();

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleEnterApp = () => {
    setShowSplash(false);
  };

  const hasApiKeys = openaiKey && jamendoKey;
  const hasRecipients = recipients.length > 0;
  const hasSelectedTheme = selectedTheme !== null;

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onEnter={handleEnterApp} />}
      </AnimatePresence>

      {!showSplash && (
        <MainLayout>
          <SettingsModal />

          {/* API Keys Warning */}
          {!hasApiKeys && (
            <div className="mb-6 p-4 border-2 border-yellow-500/50 bg-yellow-500/10 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-yellow-700 dark:text-yellow-400">
                  API Keys Required
                </p>
                <p className="text-sm text-yellow-600 dark:text-yellow-500 mt-1">
                  Please add your OpenAI and Jamendo API keys in Settings to use Card0r.
                </p>
              </div>
            </div>
          )}

          {/* Step 1: Add Recipients */}
          <section className="mb-12">
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2">Step 1: Add Recipients</h2>
              <p className="text-muted-foreground">
                Upload a CSV/Excel file or manually enter recipient details
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <FileUploader />
              <RecipientForm />
            </div>

            <RecipientTable />

            {hasRecipients && currentStep === 'upload' && (
              <div className="mt-6 flex justify-center">
                <Button
                  size="lg"
                  onClick={() => setCurrentStep('theme')}
                  className="min-w-48"
                >
                  Continue to Theme Selection
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </section>

          {/* Step 2: Select Holiday Theme */}
          <Separator className="my-12" />
          <section className="mb-12">
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2">
                Step 2: Choose Your Theme
                {!hasRecipients && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">(Add recipients first)</span>
                )}
              </h2>
              <p className="text-muted-foreground">
                Select from 17 festive themes with unique visual effects
              </p>
            </div>

            <div className={!hasRecipients ? 'opacity-50 pointer-events-none' : ''}>
              <HolidaySelector />
            </div>

            {hasRecipients && hasSelectedTheme && (
              <div className="mt-6 flex justify-center">
                <Button
                  size="lg"
                  onClick={() => setCurrentStep('format')}
                  className="min-w-48"
                >
                  Continue to Format Selection
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}

            {hasRecipients && !hasSelectedTheme && (
              <div className="mt-6 flex justify-center">
                <p className="text-sm text-muted-foreground">
                  ↑ Select a theme above to continue
                </p>
              </div>
            )}
          </section>

          {/* Step 3: Select Export Format */}
          <Separator className="my-12" />
          <section className="mb-12">
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2">
                Step 3: Select Export Format
                {!hasSelectedTheme && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">(Select a theme first)</span>
                )}
              </h2>
              <p className="text-muted-foreground">
                Choose the video dimensions and quality
              </p>
            </div>

            <div className={!hasSelectedTheme ? 'opacity-50 pointer-events-none' : ''}>
              <FormatPicker />
            </div>

            {hasSelectedTheme && (
              <>
                <Separator className="my-8" />
                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">Optional: Add Background Music</h3>
                  <p className="text-muted-foreground text-sm">
                    Select music that matches your theme (or skip to continue without music)
                  </p>
                </div>
                <MusicSelector />

                <div className="mt-6 flex justify-center">
                  <Button
                    size="lg"
                    onClick={() => setCurrentStep('generate')}
                    className="min-w-48"
                  >
                    Start Video Generation
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </>
            )}
          </section>

          {/* Step 4: Generate Videos */}
          {(currentStep === 'generate' || currentStep === 'complete') && (
            <>
              <Separator className="my-12" />
              <section className="mb-12">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold mb-2">Step 4: Generate Videos</h2>
                  <p className="text-muted-foreground">
                    Create AI-powered personalised video cards
                  </p>
                </div>

                <VideoGenerator />
              </section>
            </>
          )}

          {/* Step 5: Download Videos */}
          {currentStep === 'complete' && (
            <>
              <Separator className="my-12" />
              <section className="mb-12">
                <div className="mb-6">
                  <h2 className="text-3xl font-bold mb-2">Step 5: Download Your Videos</h2>
                  <p className="text-muted-foreground">
                    Preview and download your personalised video cards
                  </p>
                </div>

                <VideoGallery />
              </section>
            </>
          )}
        </MainLayout>
      )}

      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;
