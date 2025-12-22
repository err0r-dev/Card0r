import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  openaiKey: string;
  jamendoKey: string;
  darkMode: boolean;
  hasCompletedSetup: boolean;
  setOpenaiKey: (key: string) => void;
  setJamendoKey: (key: string) => void;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
  setHasCompletedSetup: (completed: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      openaiKey: '',
      jamendoKey: '',
      darkMode: true,
      hasCompletedSetup: false,
      setOpenaiKey: (key) => set({ openaiKey: key }),
      setJamendoKey: (key) => set({ jamendoKey: key }),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setDarkMode: (enabled) => set({ darkMode: enabled }),
      setHasCompletedSetup: (hasCompletedSetup) => set({ hasCompletedSetup }),
    }),
    {
      name: 'card0r-settings',
      migrate: (persistedState: any, version: number) => {
        // Migrate from pixabayKey to jamendoKey
        if (persistedState && persistedState.pixabayKey && !persistedState.jamendoKey) {
          persistedState.jamendoKey = persistedState.pixabayKey;
          delete persistedState.pixabayKey;
        }
        return persistedState as SettingsState;
      },
    }
  )
);
