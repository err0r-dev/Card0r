import { VideoGallery } from '../VideoGallery';
import { PartyPopper, Sparkles } from 'lucide-react';
import { useVideoStore } from '../../stores/videoStore';
import { motion } from 'framer-motion';

export function DownloadStep() {
  const { jobs } = useVideoStore();
  const completedCount = jobs.filter(j => j.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* Celebration Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
        className="flex justify-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg">
          <PartyPopper className="h-8 w-8 text-white" />
        </div>
      </motion.div>

      {/* Success Message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center text-muted-foreground"
      >
        {completedCount > 0 ? (
          <>
            <Sparkles className="inline h-4 w-4 mr-1 text-yellow-500" />
            {completedCount} personalized video{completedCount !== 1 ? 's' : ''} created successfully!
          </>
        ) : (
          'Download your personalized video cards below'
        )}
      </motion.p>

      {/* Video Gallery with Downloads */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <VideoGallery />
      </motion.div>
    </div>
  );
}
