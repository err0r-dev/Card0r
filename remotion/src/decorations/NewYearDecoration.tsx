import { AbsoluteFill, useCurrentFrame, useVideoConfig, random, interpolate } from 'remotion';
import { useMemo } from 'react';
import { EASING } from '../utils/animations';

interface NewYearDecorationProps {
  width: number;
  height: number;
}

interface Firework {
  id: number;
  x: number;
  y: number;
  color: string;
  startFrame: number;
  particles: { angle: number; speed: number; size: number }[];
}

interface Confetti {
  id: number;
  x: number;
  startY: number; // Pre-seeded Y position for immediate visibility
  color: string;
  size: number;
  speed: number;
  delay: number;
  rotation: number;
  rotationSpeed: number;
  shape: 'rect' | 'circle' | 'triangle';
}

interface Bubble {
  id: number;
  x: number;
  startProgress: number; // Pre-seeded progress for immediate visibility
  size: number;
  speed: number;
  delay: number;
  wobble: number;
}

// Firework burst
function FireworkBurst({ firework, frame }: { firework: Firework; frame: number }) {
  const elapsed = frame - firework.startFrame;
  if (elapsed < 0 || elapsed > 60) return null;

  const burstProgress = EASING.easeOut(Math.min(elapsed / 30, 1));
  const fadeProgress = elapsed > 30 ? (elapsed - 30) / 30 : 0;
  const opacity = 1 - fadeProgress;

  return (
    <div
      style={{
        position: 'absolute',
        left: firework.x,
        top: firework.y,
        opacity,
      }}
    >
      {firework.particles.map((particle, i) => {
        const distance = burstProgress * particle.speed;
        const x = Math.cos(particle.angle) * distance;
        const y = Math.sin(particle.angle) * distance + burstProgress * 20; // gravity

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: particle.size,
              height: particle.size,
              backgroundColor: firework.color,
              borderRadius: '50%',
              boxShadow: `0 0 ${particle.size * 2}px ${firework.color}`,
            }}
          />
        );
      })}
      {/* Center glow */}
      <div
        style={{
          position: 'absolute',
          left: -20,
          top: -20,
          width: 40,
          height: 40,
          background: `radial-gradient(circle, ${firework.color}80 0%, transparent 70%)`,
          opacity: 1 - burstProgress,
        }}
      />
    </div>
  );
}

// Confetti piece
function ConfettiPiece({ confetti }: { confetti: Confetti }) {
  const { shape, size, color } = confetti;

  if (shape === 'circle') {
    return (
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: '50%',
        }}
      />
    );
  }

  if (shape === 'triangle') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24">
        <polygon points="12,2 22,22 2,22" fill={color} />
      </svg>
    );
  }

  // Rectangle
  return (
    <div
      style={{
        width: size,
        height: size * 0.6,
        backgroundColor: color,
        borderRadius: 2,
      }}
    />
  );
}

// Champagne bubble
function ChampagneBubble({ bubble, frame, height }: { bubble: Bubble; frame: number; height: number }) {
  // Pre-seeded progress for immediate visibility
  const progress = (bubble.startProgress + (frame + bubble.delay) * bubble.speed * 0.5) % (height + 100);
  const y = height - progress;
  const wobbleX = Math.sin((frame + bubble.delay) * 0.1 + bubble.wobble) * 10;

  // Fade out as it rises
  const opacity = Math.max(0, 1 - progress / height);

  return (
    <div
      style={{
        position: 'absolute',
        left: bubble.x + wobbleX,
        top: y,
        width: bubble.size,
        height: bubble.size,
        border: '1px solid rgba(255,255,255,0.6)',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent)',
        opacity,
      }}
    />
  );
}

export function NewYearDecoration({ width, height }: NewYearDecorationProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Generate fireworks
  const fireworks = useMemo(() => {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#9B59B6', '#3498DB', '#E74C3C', '#2ECC71'];
    const result: Firework[] = [];
    const fireworkCount = 12;

    for (let i = 0; i < fireworkCount; i++) {
      const particleCount = Math.floor(random(`fw-particles-${i}`) * 20) + 15;
      result.push({
        id: i,
        x: random(`fw-x-${i}`) * width * 0.8 + width * 0.1,
        y: random(`fw-y-${i}`) * height * 0.5 + height * 0.1,
        color: colors[Math.floor(random(`fw-color-${i}`) * colors.length)],
        startFrame: Math.floor(random(`fw-start-${i}`) * durationInFrames * 0.8),
        particles: Array.from({ length: particleCount }, (_, j) => ({
          angle: (j / particleCount) * Math.PI * 2,
          speed: random(`fw-speed-${i}-${j}`) * 80 + 40,
          size: random(`fw-size-${i}-${j}`) * 4 + 2,
        })),
      });
    }
    return result;
  }, [width, height, durationInFrames]);

  // Generate confetti
  const confetti = useMemo(() => {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#9B59B6', '#3498DB', '#E74C3C', '#2ECC71', '#F39C12'];
    const shapes: Confetti['shape'][] = ['rect', 'circle', 'triangle'];
    const result: Confetti[] = [];
    const confettiCount = 150;

    for (let i = 0; i < confettiCount; i++) {
      result.push({
        id: i,
        x: random(`conf-x-${i}`) * width,
        startY: random(`conf-startY-${i}`) * (height + 100), // Pre-seeded for immediate visibility
        color: colors[Math.floor(random(`conf-color-${i}`) * colors.length)],
        size: random(`conf-size-${i}`) * 10 + 5,
        speed: random(`conf-speed-${i}`) * 2 + 1,
        delay: random(`conf-delay-${i}`) * 30, // Reduced from 100 for faster appearance
        rotation: random(`conf-rot-${i}`) * 360,
        rotationSpeed: random(`conf-rot-speed-${i}`) * 10 - 5,
        shape: shapes[Math.floor(random(`conf-shape-${i}`) * shapes.length)],
      });
    }
    return result;
  }, [width, height]);

  // Generate champagne bubbles
  const bubbles = useMemo(() => {
    const result: Bubble[] = [];
    const bubbleCount = 40;
    const glassX = width * 0.85;
    const glassWidth = 60;

    for (let i = 0; i < bubbleCount; i++) {
      result.push({
        id: i,
        x: glassX + random(`bubble-x-${i}`) * glassWidth - glassWidth / 2,
        startProgress: random(`bubble-startProgress-${i}`) * (height + 100), // Pre-seeded for immediate visibility
        size: random(`bubble-size-${i}`) * 6 + 2,
        speed: random(`bubble-speed-${i}`) * 2 + 1,
        delay: random(`bubble-delay-${i}`) * 30, // Reduced from 200 for faster appearance
        wobble: random(`bubble-wobble-${i}`) * Math.PI * 2,
      });
    }
    return result;
  }, [width, height]);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Fireworks */}
      {fireworks.map((firework) => (
        <FireworkBurst key={firework.id} firework={firework} frame={frame} />
      ))}

      {/* Confetti rain */}
      {confetti.map((conf) => {
        // Pre-seeded Y position for immediate visibility
        const yOffset = (conf.startY + (frame + conf.delay) * conf.speed) % (height + 100);
        const currentY = yOffset - 50;
        const xSway = Math.sin((frame + conf.delay) * 0.05) * 30;
        const currentX = conf.x + xSway;
        const rotation = conf.rotation + frame * conf.rotationSpeed;

        return (
          <div
            key={conf.id}
            style={{
              position: 'absolute',
              left: currentX,
              top: currentY,
              transform: `rotate(${rotation}deg)`,
              opacity: 0.9,
            }}
          >
            <ConfettiPiece confetti={conf} />
          </div>
        );
      })}

      {/* Champagne glass silhouette */}
      <div
        style={{
          position: 'absolute',
          right: width * 0.05,
          bottom: 0,
          opacity: 0.15,
        }}
      >
        <svg width="120" height="200" viewBox="0 0 120 200">
          <path
            d="M30,0 L90,0 L85,80 Q85,100 60,100 Q35,100 35,80 L30,0 Z"
            fill="#FFD700"
          />
          <rect x="55" y="100" width="10" height="60" fill="#FFD700" />
          <ellipse cx="60" cy="180" rx="35" ry="10" fill="#FFD700" />
        </svg>
      </div>

      {/* Bubbles rising from glass area */}
      {bubbles.map((bubble) => (
        <ChampagneBubble key={bubble.id} bubble={bubble} frame={frame} height={height} />
      ))}

      {/* "2025" watermark */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 200,
          fontWeight: 'bold',
          fontFamily: 'sans-serif',
          opacity: 0.05,
          color: '#FFD700',
          textShadow: '0 0 50px rgba(255,215,0,0.3)',
        }}
      >
        2025
      </div>

      {/* Sparkle trail effect */}
      {Array.from({ length: 30 }).map((_, i) => {
        const sparkleFrame = frame - i * 2;
        if (sparkleFrame < 0) return null;

        const x = (sparkleFrame * 3 + i * 50) % width;
        const y = height * 0.3 + Math.sin(sparkleFrame * 0.1 + i) * 50;
        const opacity = Math.max(0, 1 - i * 0.05);
        const scale = 1 - i * 0.03;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: 8,
              height: 8,
              transform: `scale(${scale})`,
              opacity,
            }}
          >
            <svg width="8" height="8" viewBox="0 0 24 24" fill="#FFD700">
              <polygon points="12,2 15,9 22,9 17,14 19,22 12,18 5,22 7,14 2,9 9,9" />
            </svg>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}
