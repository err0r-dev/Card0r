import { useState } from 'react';
import { HolidaySelector } from '../HolidaySelector';
import { FormatPicker } from '../FormatPicker';
import { MusicSelector } from '../MusicSelector';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { ChevronDown, ChevronUp, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function CustomizeStep() {
  const [showMusic, setShowMusic] = useState(false);

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Select Theme</h3>
        <HolidaySelector />
      </div>

      <Separator />

      {/* Format Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Video Format</h3>
        <FormatPicker />
      </div>

      <Separator />

      {/* Optional Music Section - Collapsible */}
      <div>
        <Button
          variant="outline"
          onClick={() => setShowMusic(!showMusic)}
          className="w-full justify-between h-12 text-left"
        >
          <span className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            <span className="font-medium">Background Music</span>
            <span className="text-muted-foreground text-sm">(Optional)</span>
          </span>
          {showMusic ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>

        <AnimatePresence>
          {showMusic && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Select music that matches your theme
                </p>
                <MusicSelector />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
