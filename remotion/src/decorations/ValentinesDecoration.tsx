import { AbsoluteFill, useCurrentFrame, useVideoConfig, random, interpolate } from 'remotion';
import { useMemo } from 'react';
import { usePulse } from '../utils/animations';
import { SparkleOverlay, GlowPulse, ScalePulse, FloatMotion } from '../utils/decorationAnimations';

interface ValentinesDecorationProps {
  width: number;
  height: number;
}

interface Heart {
  id: number;
  x: number;
  startY: number; // Pre-seeded Y position for immediate visibility
  size: number;
  color: string;
  speed: number;
  delay: number;
  swayAmplitude: number;
  swaySpeed: number;
  opacity: number;
  rotation: number;
}

interface Petal {
  id: number;
  x: number;
  startY: number; // Pre-seeded Y position for immediate visibility
  size: number;
  speed: number;
  delay: number;
  rotation: number;
  rotationSpeed: number;
  swayAmplitude: number;
}

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  phase: number;
}

// Heart SVG
function HeartSVG({ size, color, opacity }: { size: number; color: string; opacity: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ opacity }}>
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={color}
        filter={`drop-shadow(0 0 ${size / 4}px ${color})`}
      />
    </svg>
  );
}

// Rose petal SVG
function PetalSVG({ size, rotation }: { size: number; rotation: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <ellipse
        cx="12"
        cy="12"
        rx="8"
        ry="12"
        fill="#FF6B8A"
        opacity={0.8}
        filter="drop-shadow(1px 1px 2px rgba(0,0,0,0.2))"
      />
      <ellipse
        cx="12"
        cy="10"
        rx="4"
        ry="6"
        fill="#FF8DA1"
        opacity={0.6}
      />
    </svg>
  );
}

// Cupid arrow
function CupidArrow({ progress, startX, startY, endX, endY }: { progress: number; startX: number; startY: number; endX: number; endY: number }) {
  if (progress <= 0 || progress >= 1) return null;

  const x = interpolate(progress, [0, 1], [startX, endX]);
  const y = interpolate(progress, [0, 1], [startY, endY]);
  const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `rotate(${angle}deg)`,
        opacity: progress < 0.9 ? 1 : 1 - (progress - 0.9) * 10,
      }}
    >
      <svg width="60" height="20" viewBox="0 0 60 20">
        {/* Arrow shaft */}
        <line x1="0" y1="10" x2="50" y2="10" stroke="#8B4513" strokeWidth="2" />
        {/* Arrow head */}
        <polygon points="50,10 40,5 40,15" fill="#C41E3A" />
        <polygon points="60,10 50,5 50,15" fill="#C41E3A" />
        {/* Feathers */}
        <path d="M5,10 L0,5 L10,10 L0,15 Z" fill="#FFB6C1" />
        <path d="M10,10 L5,3 L15,10 L5,17 Z" fill="#FF69B4" />
      </svg>
    </div>
  );
}

export function ValentinesDecoration({ width, height }: ValentinesDecorationProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Heart pulse for glow effect
  const heartPulse = usePulse({ frequency: 1.5, min: 0.8, max: 1.2 });

  // Generate floating hearts
  const hearts = useMemo(() => {
    const colors = ['#FF1493', '#FF69B4', '#FFB6C1', '#C41E3A', '#DC143C'];
    const result: Heart[] = [];
    const heartCount = 80;

    for (let i = 0; i < heartCount; i++) {
      result.push({
        id: i,
        x: random(`heart-x-${i}`) * width,
        startY: random(`heart-startY-${i}`) * (height + 100), // Pre-seeded for immediate visibility
        size: random(`heart-size-${i}`) * 25 + 15,
        color: colors[Math.floor(random(`heart-color-${i}`) * colors.length)],
        speed: random(`heart-speed-${i}`) * 1.5 + 0.5,
        delay: random(`heart-delay-${i}`) * 30, // Reduced from 150 for faster appearance
        swayAmplitude: random(`heart-sway-${i}`) * 30 + 10,
        swaySpeed: random(`heart-sway-speed-${i}`) * 0.03 + 0.01,
        opacity: random(`heart-opacity-${i}`) * 0.4 + 0.5,
        rotation: random(`heart-rot-${i}`) * 40 - 20,
      });
    }
    return result;
  }, [width, height]);

  // Generate rose petals
  const petals = useMemo(() => {
    const result: Petal[] = [];
    const petalCount = 40;

    for (let i = 0; i < petalCount; i++) {
      result.push({
        id: i,
        x: random(`petal-x-${i}`) * width,
        startY: random(`petal-startY-${i}`) * (height + 100), // Pre-seeded for immediate visibility
        size: random(`petal-size-${i}`) * 15 + 10,
        speed: random(`petal-speed-${i}`) * 2 + 0.8,
        delay: random(`petal-delay-${i}`) * 30, // Reduced from 200 for faster appearance
        rotation: random(`petal-rot-${i}`) * 360,
        rotationSpeed: random(`petal-rot-speed-${i}`) * 4 - 2,
        swayAmplitude: random(`petal-sway-${i}`) * 50 + 20,
      });
    }
    return result;
  }, [width, height]);

  // Generate sparkles
  const sparkles = useMemo(() => {
    const result: Sparkle[] = [];
    const sparkleCount = 25;

    for (let i = 0; i < sparkleCount; i++) {
      result.push({
        id: i,
        x: random(`sparkle-x-${i}`) * width,
        y: random(`sparkle-y-${i}`) * height,
        size: random(`sparkle-size-${i}`) * 8 + 4,
        phase: random(`sparkle-phase-${i}`) * Math.PI * 2,
      });
    }
    return result;
  }, [width, height]);

  // Cupid arrow timings - relative to video duration
  const arrows = useMemo(() => {
    return [
      { startFrame: Math.floor(durationInFrames * 0.15), startX: -50, startY: height * 0.3, endX: width + 50, endY: height * 0.4, duration: Math.floor(durationInFrames * 0.08) },
      { startFrame: Math.floor(durationInFrames * 0.4), startX: width + 50, startY: height * 0.6, endX: -50, endY: height * 0.5, duration: Math.floor(durationInFrames * 0.08) },
      { startFrame: Math.floor(durationInFrames * 0.7), startX: -50, startY: height * 0.2, endX: width + 50, endY: height * 0.7, duration: Math.floor(durationInFrames * 0.1) },
    ];
  }, [durationInFrames, width, height]);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Pink sparkle overlay */}
      <SparkleOverlay count={35} color="#FF69B4" minSize={3} maxSize={7} seed="valentines-sparkle" />

      {/* Soft pink gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(255,182,193,0.15) 0%, transparent 70%)',
        }}
      />

      {/* Floating hearts */}
      {hearts.map((heart) => {
        // Hearts float UP - pre-seeded for immediate visibility
        const yOffset = (heart.startY + (frame + heart.delay) * heart.speed) % (height + 100);
        const currentY = height - yOffset + 50;
        const xSway = Math.sin((frame + heart.delay) * heart.swaySpeed) * heart.swayAmplitude;
        const currentX = heart.x + xSway;

        return (
          <div
            key={heart.id}
            style={{
              position: 'absolute',
              left: currentX,
              top: currentY,
              transform: `rotate(${heart.rotation}deg) scale(${heart.id % 3 === 0 ? heartPulse : 1})`,
            }}
          >
            <HeartSVG size={heart.size} color={heart.color} opacity={heart.opacity} />
          </div>
        );
      })}

      {/* Rose petals falling */}
      {petals.map((petal) => {
        // Pre-seeded Y position for immediate visibility
        const yOffset = (petal.startY + (frame + petal.delay) * petal.speed) % (height + 100);
        const currentY = yOffset - 50;
        const xSway = Math.sin((frame + petal.delay) * 0.02) * petal.swayAmplitude;
        const currentX = petal.x + xSway;
        const rotation = petal.rotation + frame * petal.rotationSpeed;

        return (
          <div
            key={petal.id}
            style={{
              position: 'absolute',
              left: currentX,
              top: currentY,
            }}
          >
            <PetalSVG size={petal.size} rotation={rotation} />
          </div>
        );
      })}

      {/* Twinkling sparkles */}
      {sparkles.map((sparkle) => {
        const twinkle = (Math.sin(frame * 0.15 + sparkle.phase) + 1) / 2;
        const scale = 0.5 + twinkle * 0.8;
        const opacity = 0.3 + twinkle * 0.7;

        return (
          <div
            key={sparkle.id}
            style={{
              position: 'absolute',
              left: sparkle.x,
              top: sparkle.y,
              transform: `scale(${scale})`,
              opacity,
            }}
          >
            <svg width={sparkle.size} height={sparkle.size} viewBox="0 0 24 24">
              <polygon points="12,2 14,10 22,12 14,14 12,22 10,14 2,12 10,10" fill="#FFD700" />
            </svg>
          </div>
        );
      })}

      {/* Cupid arrows */}
      {arrows.map((arrow, i) => {
        const progress = interpolate(
          frame,
          [arrow.startFrame, arrow.startFrame + arrow.duration],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        return (
          <CupidArrow
            key={i}
            progress={progress}
            startX={arrow.startX}
            startY={arrow.startY}
            endX={arrow.endX}
            endY={arrow.endY}
          />
        );
      })}

      {/* Large decorative heart in corner */}
      <div
        style={{
          position: 'absolute',
          right: -30,
          bottom: -30,
          opacity: 0.1,
          transform: `scale(${heartPulse})`,
        }}
      >
        <HeartSVG size={200} color="#FF1493" opacity={1} />
      </div>

      {/* XOXO watermark */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          bottom: 20,
          fontSize: 48,
          fontWeight: 'bold',
          fontFamily: 'cursive, sans-serif',
          opacity: 0.08,
          color: '#FF1493',
          letterSpacing: 8,
        }}
      >
        XOXO
      </div>
    </AbsoluteFill>
  );
}
