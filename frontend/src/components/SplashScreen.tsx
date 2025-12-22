import { motion } from 'framer-motion';
import { Mail, Heart, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onEnter: () => void;
}

export function SplashScreen({ onEnter }: SplashScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-amber-900 via-yellow-800 to-orange-900 cursor-pointer"
      onClick={onEnter}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-yellow-200 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0,
            }}
            animate={{
              y: [null, -100, window.innerHeight + 100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
            delay: 0.2,
          }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            {/* Greeting Card Icon */}
            <div className="relative w-24 h-24">
              <Mail className="w-24 h-24 text-yellow-300" strokeWidth={2} />
              <Heart className="w-8 h-8 text-red-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              <Sparkles className="w-6 h-6 text-yellow-200 absolute top-2 right-2" />
            </div>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="absolute inset-0 rounded-full bg-yellow-400 blur-2xl"
            />
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-6xl font-bold text-white mb-4"
        >
          Card0r
        </motion.h1>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-xl text-yellow-200 mb-12"
        >
          Create personalised video greetings with AI
        </motion.p>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: 'spring' }}
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
            className="inline-block px-8 py-3 bg-white/20 backdrop-blur-sm rounded-full border-2 border-white/50 text-white font-medium"
          >
            Click anywhere to enter
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
