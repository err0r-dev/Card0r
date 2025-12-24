import { AbsoluteFill, useCurrentFrame, useVideoConfig, random, interpolate } from 'remotion';
import { useMemo } from 'react';
import { usePulse } from '../utils/animations';
import { SparkleOverlay, GlowPulse, ConfettiBurst, ScalePulse } from '../utils/decorationAnimations';

interface CongratulationsDecorationProps {
  width: number;
  height: number;
}

// Balloon SVG
function BalloonSVG({ size, color, opacity }: { size: number; color: string; opacity: number }) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 40 56" style={{ opacity }}>
      {/* Balloon body */}
      <ellipse cx="20" cy="20" rx="18" ry="22" fill={color} />
      {/* Shine */}
      <ellipse cx="14" cy="14" rx="5" ry="7" fill="rgba(255,255,255,0.3)" />
      {/* Tie */}
      <polygon points="20,42 16,46 24,46" fill={color} />
      {/* String */}
      <path d="M20,46 Q18,50 22,54" stroke="#888" strokeWidth="1" fill="none" />
    </svg>
  );
}

// Star SVG
function StarSVG({ size, color, opacity, filled }: { size: number; color: string; opacity: number; filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ opacity }}>
      <polygon
        points="12,2 15,9 22,9 17,14 19,22 12,18 5,22 7,14 2,9 9,9"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={filled ? 0 : 1.5}
      />
    </svg>
  );
}

// Confetti piece
function ConfettiPiece({ size, color, rotation, shape }: { size: number; color: string; rotation: number; shape: 'rect' | 'circle' | 'triangle' }) {
  if (shape === 'circle') {
    return (
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: '50%',
          opacity: 0.85,
        }}
      />
    );
  }
  if (shape === 'triangle') {
    return (
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: `${size / 2}px solid transparent`,
          borderRight: `${size / 2}px solid transparent`,
          borderBottom: `${size}px solid ${color}`,
          transform: `rotate(${rotation}deg)`,
          opacity: 0.85,
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size * 2.5,
        backgroundColor: color,
        borderRadius: 2,
        transform: `rotate(${rotation}deg)`,
        opacity: 0.85,
      }}
    />
  );
}

// Streamer SVG
function StreamerSVG({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size * 3} viewBox="0 0 30 90">
      <path
        d="M15,0 Q5,15 25,30 Q5,45 25,60 Q5,75 15,90"
        stroke={color}
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Trophy SVG
function TrophySVG({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      {/* Cup body */}
      <path
        d="M15,10 L15,30 Q15,40 30,42 Q45,40 45,30 L45,10 Z"
        fill="#FFD700"
        stroke="#DAA520"
        strokeWidth="2"
      />
      {/* Left handle */}
      <path
        d="M15,15 Q5,15 5,25 Q5,32 15,32"
        stroke="#FFD700"
        strokeWidth="4"
        fill="none"
      />
      {/* Right handle */}
      <path
        d="M45,15 Q55,15 55,25 Q55,32 45,32"
        stroke="#FFD700"
        strokeWidth="4"
        fill="none"
      />
      {/* Stem */}
      <rect x="26" y="42" width="8" height="8" fill="#DAA520" />
      {/* Base */}
      <rect x="18" y="50" width="24" height="6" rx="2" fill="#DAA520" />
      {/* Star on cup */}
      <polygon points="30,18 32,24 38,24 33,28 35,34 30,30 25,34 27,28 22,24 28,24" fill="#FFA500" />
    </svg>
  );
}

// Firework burst
function FireworkBurst({ x, y, size, progress, color }: { x: number; y: number; size: number; progress: number; color: string }) {
  if (progress <= 0 || progress >= 1) return null;

  const scale = interpolate(progress, [0, 0.3, 1], [0, 1, 1.2]);
  const opacity = interpolate(progress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  const rays = 12;
  const rayLength = size * scale;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity,
      }}
    >
      <svg width={size * 2.5} height={size * 2.5} viewBox="-50 -50 100 100">
        {Array.from({ length: rays }).map((_, i) => {
          const angle = (i * 360) / rays;
          const rad = (angle * Math.PI) / 180;
          const x2 = Math.cos(rad) * rayLength;
          const y2 = Math.sin(rad) * rayLength;

          return (
            <line
              key={i}
              x1="0"
              y1="0"
              x2={x2}
              y2={y2}
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
            />
          );
        })}
        <circle cx="0" cy="0" r={size * 0.2 * scale} fill={color} />
      </svg>
    </div>
  );
}

export function CongratulationsDecoration({ width, height }: CongratulationsDecorationProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Balloon float
  const balloonFloat = usePulse({ frequency: 0.5, min: -5, max: 5 });

  // Generate balloons
  const balloons = useMemo(() => {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3'];
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: random(`balloon-x-${i}`) * width,
      startY: random(`balloon-startY-${i}`) * (height + 150),
      size: random(`balloon-size-${i}`) * 25 + 35,
      color: colors[Math.floor(random(`balloon-color-${i}`) * colors.length)],
      speed: random(`balloon-speed-${i}`) * 1.2 + 0.5,
      delay: random(`balloon-delay-${i}`) * 30,
      swayAmplitude: random(`balloon-sway-${i}`) * 20 + 10,
      swaySpeed: random(`balloon-sway-speed-${i}`) * 0.02 + 0.01,
      opacity: random(`balloon-opacity-${i}`) * 0.3 + 0.6,
    }));
  }, [width, height]);

  // Generate confetti
  const confetti = useMemo(() => {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA', '#805ad5', '#38b2ac'];
    const shapes: ('rect' | 'circle' | 'triangle')[] = ['rect', 'circle', 'triangle'];
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      x: random(`confetti-x-${i}`) * width,
      startY: random(`confetti-startY-${i}`) * (height + 100),
      size: random(`confetti-size-${i}`) * 8 + 5,
      color: colors[Math.floor(random(`confetti-color-${i}`) * colors.length)],
      shape: shapes[Math.floor(random(`confetti-shape-${i}`) * shapes.length)],
      speed: random(`confetti-speed-${i}`) * 3 + 1.5,
      delay: random(`confetti-delay-${i}`) * 30,
      rotation: random(`confetti-rot-${i}`) * 360,
      rotationSpeed: random(`confetti-rot-speed-${i}`) * 10 - 5,
      swayAmplitude: random(`confetti-sway-${i}`) * 50 + 25,
    }));
  }, [width, height]);

  // Generate stars
  const stars = useMemo(() => {
    const colors = ['#FFD700', '#FFA500', '#FFFF00', '#38b2ac', '#805ad5'];
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: random(`star-x-${i}`) * width,
      startY: random(`star-startY-${i}`) * (height + 100),
      size: random(`star-size-${i}`) * 20 + 15,
      color: colors[Math.floor(random(`star-color-${i}`) * colors.length)],
      speed: random(`star-speed-${i}`) * 1.5 + 0.5,
      delay: random(`star-delay-${i}`) * 30,
      rotationSpeed: random(`star-rot-${i}`) * 3 - 1.5,
      opacity: random(`star-opacity-${i}`) * 0.4 + 0.5,
      filled: random(`star-filled-${i}`) > 0.5,
    }));
  }, [width, height]);

  // Generate streamers
  const streamers = useMemo(() => {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#AA96DA', '#805ad5'];
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: random(`streamer-x-${i}`) * width,
      startY: random(`streamer-startY-${i}`) * (height + 150),
      size: random(`streamer-size-${i}`) * 15 + 20,
      color: colors[Math.floor(random(`streamer-color-${i}`) * colors.length)],
      speed: random(`streamer-speed-${i}`) * 2 + 1,
      delay: random(`streamer-delay-${i}`) * 30,
      swayAmplitude: random(`streamer-sway-${i}`) * 30 + 15,
    }));
  }, [width, height]);

  // Generate fireworks
  const fireworks = useMemo(() => {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#AA96DA', '#38b2ac'];
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: random(`fw-x-${i}`) * width * 0.8 + width * 0.1,
      y: random(`fw-y-${i}`) * height * 0.5 + height * 0.1,
      size: random(`fw-size-${i}`) * 30 + 40,
      color: colors[Math.floor(random(`fw-color-${i}`) * colors.length)],
      startFrame: Math.floor(random(`fw-start-${i}`) * durationInFrames * 0.7),
      duration: Math.floor(durationInFrames * 0.15),
    }));
  }, [width, height, durationInFrames]);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Colorful sparkle overlay */}
      <SparkleOverlay count={35} color="#FFD700" minSize={3} maxSize={8} seed="congrats-gold" />
      <SparkleOverlay count={25} color="#805ad5" minSize={2} maxSize={6} seed="congrats-purple" />

      {/* Celebratory gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(128,90,213,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Falling confetti */}
      {confetti.map((piece) => {
        const yOffset = (piece.startY + (frame + piece.delay) * piece.speed) % (height + 100);
        const currentY = yOffset - 50;
        const xSway = Math.sin((frame + piece.delay) * 0.04) * piece.swayAmplitude;
        const rotation = piece.rotation + frame * piece.rotationSpeed;

        return (
          <div
            key={`confetti-${piece.id}`}
            style={{
              position: 'absolute',
              left: piece.x + xSway,
              top: currentY,
            }}
          >
            <ConfettiPiece size={piece.size} color={piece.color} rotation={rotation} shape={piece.shape} />
          </div>
        );
      })}

      {/* Falling streamers */}
      {streamers.map((streamer) => {
        const yOffset = (streamer.startY + (frame + streamer.delay) * streamer.speed) % (height + 150);
        const currentY = yOffset - 75;
        const xSway = Math.sin((frame + streamer.delay) * 0.02) * streamer.swayAmplitude;

        return (
          <div
            key={`streamer-${streamer.id}`}
            style={{
              position: 'absolute',
              left: streamer.x + xSway,
              top: currentY,
            }}
          >
            <StreamerSVG size={streamer.size} color={streamer.color} />
          </div>
        );
      })}

      {/* Rising balloons */}
      {balloons.map((balloon) => {
        const yOffset = (balloon.startY + (frame + balloon.delay) * balloon.speed) % (height + 150);
        const currentY = height - yOffset + 75;
        const xSway = Math.sin((frame + balloon.delay) * balloon.swaySpeed) * balloon.swayAmplitude;
        const float = balloon.id % 3 === 0 ? balloonFloat : 0;

        return (
          <div
            key={`balloon-${balloon.id}`}
            style={{
              position: 'absolute',
              left: balloon.x + xSway,
              top: currentY + float,
            }}
          >
            <BalloonSVG size={balloon.size} color={balloon.color} opacity={balloon.opacity} />
          </div>
        );
      })}

      {/* Falling/floating stars */}
      {stars.map((star) => {
        const yOffset = (star.startY + (frame + star.delay) * star.speed) % (height + 100);
        const currentY = yOffset - 50;
        const xSway = Math.sin((frame + star.delay) * 0.02) * 20;
        const rotation = frame * star.rotationSpeed;

        return (
          <div
            key={`star-${star.id}`}
            style={{
              position: 'absolute',
              left: star.x + xSway,
              top: currentY,
              transform: `rotate(${rotation}deg)`,
            }}
          >
            <StarSVG size={star.size} color={star.color} opacity={star.opacity} filled={star.filled} />
          </div>
        );
      })}

      {/* Firework bursts */}
      {fireworks.map((fw) => {
        const progress = interpolate(
          frame,
          [fw.startFrame, fw.startFrame + fw.duration],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        return (
          <FireworkBurst
            key={`fw-${fw.id}`}
            x={fw.x}
            y={fw.y}
            size={fw.size}
            progress={progress}
            color={fw.color}
          />
        );
      })}

      {/* Trophy in corner */}
      <div
        style={{
          position: 'absolute',
          right: 25,
          bottom: 25,
          opacity: 0.12,
        }}
      >
        <TrophySVG size={120} />
      </div>

      {/* "Congratulations" watermark */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 20,
          fontSize: 28,
          fontWeight: 'bold',
          fontFamily: 'sans-serif',
          opacity: 0.06,
          color: '#805ad5',
          letterSpacing: 1,
        }}
      >
        Congratulations!
      </div>
    </AbsoluteFill>
  );
}
