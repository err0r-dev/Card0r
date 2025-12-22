import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// ============================================
// EASING FUNCTIONS (Framer Motion-inspired)
// ============================================

export const EASING = {
  // Standard easing
  linear: (t: number) => t,
  easeIn: (t: number) => t * t * t,
  easeOut: (t: number) => 1 - Math.pow(1 - t, 3),
  easeInOut: (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,

  // Bounce easing (like Framer Motion's spring)
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },

  // Elastic easing - great for bouncy text reveals
  easeOutElastic: (t: number) => {
    if (t === 0 || t === 1) return t;
    const c4 = (2 * Math.PI) / 3;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },

  // Smooth spring-like easing
  spring: (t: number) => {
    const c1 = Math.sin(t * Math.PI * (0.2 + 2.5 * t * t * t));
    const c2 = Math.pow(1 - t, 2.2);
    const c3 = t;
    return c1 * c2 + c3;
  },
} as const;

// ============================================
// DURATION CALCULATION
// ============================================

export const WORDS_PER_SECOND = 3.5;

export function calculateMessageDuration(message: string): number {
  const wordCount = message.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / WORDS_PER_SECOND);
  return readingTime + 2; // +2s buffer
}

export function calculateTotalDuration(message: string): number {
  const INTRO_DURATION = 5; // seconds
  const NAME_REVEAL_DURATION = 3; // seconds
  const SENDER_REVEAL_DURATION = 3; // seconds
  const OUTRO_DURATION = 3; // seconds

  const messageDuration = calculateMessageDuration(message);

  const total = INTRO_DURATION + NAME_REVEAL_DURATION + messageDuration +
                SENDER_REVEAL_DURATION + OUTRO_DURATION;

  // Clamp between 20-60 seconds
  return Math.min(60, Math.max(20, total));
}

export function useAnimationProgress(delayFrames = 0, durationFrames?: number) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const actualDuration = durationFrames ?? durationInFrames;
  const adjustedFrame = Math.max(0, frame - delayFrames);

  return interpolate(adjustedFrame, [0, actualDuration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

export function useFadeIn(startFrame: number, durationFrames: number) {
  const frame = useCurrentFrame();

  return interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
}

export function useFadeOut(startFrame: number, durationFrames: number) {
  const frame = useCurrentFrame();

  return interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
}

export function useScale(startFrame: number, durationFrames: number, fromScale = 0.5, toScale = 1) {
  const frame = useCurrentFrame();

  return interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [fromScale, toScale],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
}

export function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    if (testLine.length > maxCharsPerLine && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

// ============================================
// STAGGER UTILITIES
// ============================================

/**
 * Calculate staggered delays for a list of items
 * Returns an array of delay values in frames
 */
export function getStaggerDelays(
  itemCount: number,
  fps: number,
  options?: {
    staggerDelay?: number; // Seconds between items (default 0.1)
    startDelay?: number;   // Seconds before first item (default 0.2)
  }
): number[] {
  const staggerDelay = (options?.staggerDelay ?? 0.1) * fps;
  const startDelay = (options?.startDelay ?? 0.2) * fps;

  return Array.from({ length: itemCount }, (_, i) => startDelay + i * staggerDelay);
}

/**
 * Hook to get staggered progress values for multiple items
 * Returns an array of progress values (0-1) for each item
 */
export function useStaggeredProgress(
  itemCount: number,
  options?: {
    staggerDelay?: number;  // Seconds between items
    startDelay?: number;    // Seconds before first
    duration?: number;      // Duration of each item's animation in seconds
    easing?: keyof typeof EASING;
  }
): number[] {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delays = getStaggerDelays(itemCount, fps, options);
  const duration = (options?.duration ?? 0.4) * fps;
  const easingFn = EASING[options?.easing ?? 'easeOut'];

  return delays.map((delay) => {
    const adjustedFrame = Math.max(0, frame - delay);
    const progress = interpolate(adjustedFrame, [0, duration], [0, 1], {
      extrapolateRight: 'clamp',
    });
    return easingFn(progress);
  });
}

// ============================================
// SPRING ANIMATION HOOKS
// ============================================

/**
 * Spring animation helper - returns a spring-animated value 0-1
 */
export function useSpring(options?: { delay?: number; damping?: number; stiffness?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = options?.delay ?? 0;
  const adjustedFrame = Math.max(0, frame - delay);

  return spring({
    frame: adjustedFrame,
    fps,
    config: {
      damping: options?.damping ?? 15,
      stiffness: options?.stiffness ?? 200,
    },
  });
}

/**
 * Hook to get staggered style for list items
 */
export function useStaggeredStyle(index: number, options?: { baseDelay?: number; staggerDelay?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const baseDelay = options?.baseDelay ?? fps * 0.2;
  const staggerDelay = options?.staggerDelay ?? fps * 0.1;
  const totalDelay = baseDelay + index * staggerDelay;

  const adjustedFrame = Math.max(0, frame - totalDelay);
  const progress = interpolate(adjustedFrame, [0, fps * 0.4], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return {
    opacity: progress,
    transform: `translateY(${interpolate(progress, [0, 1], [20, 0])}px)`,
  };
}

/**
 * Hook to get animation progress with custom easing
 */
export function useEasedProgress(
  options?: {
    delay?: number;      // Delay in seconds
    duration?: number;   // Duration in seconds
    easing?: keyof typeof EASING;
  }
): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const delay = (options?.delay ?? 0) * fps;
  const duration = (options?.duration ?? 0.5) * fps;
  const easingFn = EASING[options?.easing ?? 'easeOut'];

  const adjustedFrame = Math.max(0, frame - delay);
  const rawProgress = interpolate(adjustedFrame, [0, duration], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return easingFn(rawProgress);
}

// ============================================
// PARTICLE & DECORATION HELPERS
// ============================================

/**
 * Generate random values with seed for consistent particles
 */
export function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

/**
 * Create oscillating value (for floating/bobbing effects)
 */
export function useOscillate(
  options?: {
    frequency?: number;  // Oscillations per second
    amplitude?: number;  // Max value
    phase?: number;      // Starting phase offset (0-1)
  }
): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const frequency = options?.frequency ?? 0.5;
  const amplitude = options?.amplitude ?? 1;
  const phase = options?.phase ?? 0;

  const time = frame / fps;
  return Math.sin((time * frequency + phase) * Math.PI * 2) * amplitude;
}

/**
 * Create pulsing value (for glow/sparkle effects)
 */
export function usePulse(
  options?: {
    frequency?: number;  // Pulses per second
    min?: number;        // Minimum value
    max?: number;        // Maximum value
    phase?: number;      // Starting phase offset (0-1)
  }
): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const frequency = options?.frequency ?? 1;
  const min = options?.min ?? 0.5;
  const max = options?.max ?? 1;
  const phase = options?.phase ?? 0;

  const time = frame / fps;
  const normalized = (Math.sin((time * frequency + phase) * Math.PI * 2) + 1) / 2;
  return min + normalized * (max - min);
}

/**
 * Burst animation - starts at 0, peaks, then settles
 * Great for particle explosions
 */
export function useBurst(
  triggerFrame: number,
  options?: {
    peakFrame?: number;   // Frames after trigger to peak
    settleFrame?: number; // Frames after trigger to settle
    overshoot?: number;   // How much to overshoot (1 = no overshoot)
  }
): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const peakFrame = triggerFrame + (options?.peakFrame ?? fps * 0.2);
  const settleFrame = triggerFrame + (options?.settleFrame ?? fps * 0.8);
  const overshoot = options?.overshoot ?? 1.2;

  if (frame < triggerFrame) return 0;
  if (frame < peakFrame) {
    const progress = (frame - triggerFrame) / (peakFrame - triggerFrame);
    return EASING.easeOut(progress) * overshoot;
  }
  if (frame < settleFrame) {
    const progress = (frame - peakFrame) / (settleFrame - peakFrame);
    return overshoot - (overshoot - 1) * EASING.easeInOut(progress);
  }
  return 1;
}
