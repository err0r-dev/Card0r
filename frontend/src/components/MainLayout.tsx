import type { ReactNode } from 'react';
import { Settings, Moon, Sun } from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';
import { useUIStore } from '../stores/uiStore';
import { Button } from './ui/button';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { darkMode, toggleDarkMode } = useSettingsStore();
  const { setShowSettings, setShowSplash, setCurrentStep } = useUIStore();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => {
              setShowSplash(true);
              setCurrentStep(1);
            }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">
              Card0r
            </h1>
            <span className="text-sm text-muted-foreground">
              Video Card Generator
            </span>
          </button>

          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Settings Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
              aria-label="Open settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Built with AI-powered personalisation • OpenAI GPT-4 • FFmpeg Video Processing
          </p>
        </div>
      </footer>
    </div>
  );
}
