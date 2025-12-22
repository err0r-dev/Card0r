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
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Theme Selection */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Choose Your Theme</h2>
        <p className="text-muted-foreground">
          Select from 17 festive themes with unique visual effects
        </p>
      </div>

      <HolidaySelector />

      <Separator className="my-8" />

      {/* Format Selection */}
      <div>
        <h3 className="text-2xl font-bold mb-2">Select Export Format</h3>
        <p className="text-muted-foreground">
          Choose the video dimensions and quality
        </p>
      </div>

      <FormatPicker />

      <Separator className="my-8" />

      {/* Optional Music Section - Collapsible */}
      <div>
        <Button
          variant="outline"
          onClick={() => setShowMusic(!showMusic)}
          className="w-full justify-between h-14 text-left"
        >
          <span className="flex items-center gap-3">
            <Music className="w-5 h-5" />
            <span>
              <span className="font-medium">Add Background Music</span>
              <span className="text-muted-foreground ml-2">(Optional)</span>
            </span>
          </span>
          {showMusic ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
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
                  Select music that matches your theme, or proceed without music
                </p>
                <MusicSelector />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
