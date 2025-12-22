import { VideoGallery } from '../VideoGallery';
import { Button } from '../ui/button';
import { RefreshCw, PartyPopper, Sparkles } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useRecipientsStore } from '../../stores/recipientsStore';
import { useVideoStore } from '../../stores/videoStore';
import { motion } from 'framer-motion';

export function DownloadStep() {
  const { resetWizard } = useUIStore();
  const { clearRecipients } = useRecipientsStore();
  const { clearVideoState, jobs } = useVideoStore();

  const completedCount = jobs.filter(j => j.status === 'completed').length;

  const handleStartOver = () => {
    clearRecipients();
    clearVideoState();
    resetWizard();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-8"
    >
      {/* Celebration Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center py-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 10 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 mb-6 shadow-lg"
        >
          <PartyPopper className="h-10 w-10 text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent"
        >
          Your Videos Are Ready!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-muted-foreground max-w-md mx-auto"
        >
          {completedCount > 0 ? (
            <>
              <Sparkles className="inline h-5 w-5 mr-1 text-yellow-500" />
              {completedCount} personalized video{completedCount !== 1 ? 's' : ''} created successfully!
            </>
          ) : (
            'Download your personalized video cards below'
          )}
        </motion.p>
      </motion.div>

      {/* Video Gallery with Downloads */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <VideoGallery />
      </motion.div>

      {/* Start Over Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex justify-center pt-6 pb-8"
      >
        <Button
          variant="outline"
          size="lg"
          onClick={handleStartOver}
          className="min-w-56 py-6 text-base"
        >
          <RefreshCw className="mr-2 h-5 w-5" />
          Create More Cards
        </Button>
      </motion.div>
    </motion.div>
  );
}
