import { create } from 'zustand';

interface UIState {
  showSplash: boolean;
  showSettings: boolean;
  isLoading: boolean;
  currentStep: 'upload' | 'theme' | 'format' | 'generate' | 'complete';
  setShowSplash: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setCurrentStep: (step: UIState['currentStep']) => void;
}

export const useUIStore = create<UIState>((set) => ({
  showSplash: true,
  showSettings: false,
  isLoading: false,
  currentStep: 'upload',
  setShowSplash: (show) => set({ showSplash: show }),
  setShowSettings: (show) => set({ showSettings: show }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setCurrentStep: (step) => set({ currentStep: step }),
}));
