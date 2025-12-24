import { create } from 'zustand';

// Step 1: Recipients & Sender
// Step 2: Theme & Format (Customize)
// Step 3: Generate
// Step 4: Download
type WizardStep = 1 | 2 | 3 | 4;

interface UIState {
  showSplash: boolean;
  showSettings: boolean;
  showSetup: boolean;
  isLoading: boolean;
  currentStep: WizardStep;
  setShowSplash: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowSetup: (show: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setCurrentStep: (step: WizardStep) => void;
  goBack: () => void;
  goForward: () => void;
  canGoBack: () => boolean;
  canGoForward: () => boolean;
  resetWizard: () => void;
}

const TOTAL_STEPS = 4;

export const useUIStore = create<UIState>((set, get) => ({
  showSplash: true,
  showSettings: false,
  showSetup: false,
  isLoading: false,
  currentStep: 1,
  setShowSplash: (showSplash) => set({ showSplash }),
  setShowSettings: (showSettings) => set({ showSettings }),
  setShowSetup: (showSetup) => set({ showSetup }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setCurrentStep: (currentStep) => set({ currentStep }),
  goBack: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: (currentStep - 1) as WizardStep });
    }
  },
  goForward: () => {
    const { currentStep } = get();
    if (currentStep < TOTAL_STEPS) {
      set({ currentStep: (currentStep + 1) as WizardStep });
    }
  },
  canGoBack: () => get().currentStep > 1,
  canGoForward: () => get().currentStep < TOTAL_STEPS,
  resetWizard: () => set({ currentStep: 1, showSplash: true }),
}));
