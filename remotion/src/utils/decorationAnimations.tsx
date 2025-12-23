import { AbsoluteFill, useCurrentFrame, useVideoConfig, random, interpolate } from 'remotion';
import { useMemo } from 'react';
import { usePulse, useOscillate } from './animations';

// ============================================
// SPARKLE OVERLAY COMPONENT
// ============================================

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
}

interface SparkleOverlayProps {
  count?: number;
  color?: string;
  minSize?: number;
  maxSize?: number;
  seed?: string;
}

export function SparkleOverlay({
  count = 30,
  color = 'white',
  minSize = 3,
  maxSize = 8,
  seed = 'sparkle',
}: SparkleOverlayProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames, width, height } = useVideoConfig();

  const sparkles = useMemo(() => {
    const result: Sparkle[] = [];
    for (let i = 0; i < count; i++) {
      result.push({
        id: i,
        x: random(`${seed}-x-${i}`) * width,
        y: random(`${seed}-y-${i}`) * height,
        size: random(`${seed}-size-${i}`) * (maxSize - minSize) + minSize,
        delay: random(`${seed}-delay-${i}`) * durationInFrames * 0.5,
        duration: (random(`${seed}-dur-${i}`) * 1 + 0.5) * fps,
        rotation: random(`${seed}-rot-${i}`) * 360,
      });
    }
    return result;
  }, [count, width, height, minSize, maxSize, seed, fps, durationInFrames]);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {sparkles.map((sparkle) => {
        const cycleFrame = (frame + sparkle.delay) % (sparkle.duration * 2);
        const opacity = cycleFrame < sparkle.duration
          ? interpolate(cycleFrame, [0, sparkle.duration * 0.3, sparkle.duration], [0, 1, 0])
          : 0;
        const scale = interpolate(cycleFrame, [0, sparkle.duration * 0.5, sparkle.duration], [0.5, 1.2, 0.5]);

        return (
          <div
            key={sparkle.id}
            style={{
              position: 'absolute',
              left: sparkle.x,
              top: sparkle.y,
              opacity,
              transform: `rotate(${sparkle.rotation}deg) scale(${scale})`,
            }}
          >
            <svg width={sparkle.size * 2} height={sparkle.size * 2} viewBox="0 0 24 24">
              <path
                d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10Z"
                fill={color}
                filter={`drop-shadow(0 0 ${sparkle.size}px ${color})`}
              />
            </svg>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}

// ============================================
// GLOW PULSE WRAPPER
// ============================================

interface GlowPulseProps {
  children: React.ReactNode;
  color?: string;
  minGlow?: number;
  maxGlow?: number;
  frequency?: number;
  phase?: number;
}

export function GlowPulse({
  children,
  color = 'rgba(255, 255, 255, 0.5)',
  minGlow = 5,
  maxGlow = 20,
  frequency = 0.5,
  phase = 0,
}: GlowPulseProps) {
  const pulse = usePulse({ frequency, min: 0, max: 1, phase });
  const glowSize = minGlow + pulse * (maxGlow - minGlow);

  return (
    <div
      style={{
        filter: `drop-shadow(0 0 ${glowSize}px ${color})`,
      }}
    >
      {children}
    </div>
  );
}

// ============================================
// SWAY MOTION WRAPPER
// ============================================

interface SwayMotionProps {
  children: React.ReactNode;
  amplitude?: number; // degrees of rotation
  frequency?: number;
  phase?: number;
  originX?: string;
  originY?: string;
}

export function SwayMotion({
  children,
  amplitude = 5,
  frequency = 0.3,
  phase = 0,
  originX = 'center',
  originY = 'top',
}: SwayMotionProps) {
  const sway = useOscillate({ frequency, amplitude, phase });

  return (
    <div
      style={{
        transform: `rotate(${sway}deg)`,
        transformOrigin: `${originX} ${originY}`,
      }}
    >
      {children}
    </div>
  );
}

// ============================================
// FLOAT MOTION WRAPPER
// ============================================

interface FloatMotionProps {
  children: React.ReactNode;
  amplitude?: number; // pixels of vertical movement
  frequency?: number;
  phase?: number;
  includeHorizontal?: boolean;
  horizontalAmplitude?: number;
}

export function FloatMotion({
  children,
  amplitude = 10,
  frequency = 0.4,
  phase = 0,
  includeHorizontal = false,
  horizontalAmplitude = 5,
}: FloatMotionProps) {
  const verticalFloat = useOscillate({ frequency, amplitude, phase });
  const horizontalFloat = useOscillate({ frequency: frequency * 0.7, amplitude: horizontalAmplitude, phase: phase + 0.25 });

  return (
    <div
      style={{
        transform: `translateY(${verticalFloat}px)${includeHorizontal ? ` translateX(${horizontalFloat}px)` : ''}`,
      }}
    >
      {children}
    </div>
  );
}

// ============================================
// SCALE PULSE WRAPPER
// ============================================

interface ScalePulseProps {
  children: React.ReactNode;
  minScale?: number;
  maxScale?: number;
  frequency?: number;
  phase?: number;
}

export function ScalePulse({
  children,
  minScale = 1,
  maxScale = 1.05,
  frequency = 0.5,
  phase = 0,
}: ScalePulseProps) {
  const pulse = usePulse({ frequency, min: 0, max: 1, phase });
  const scale = minScale + pulse * (maxScale - minScale);

  return (
    <div
      style={{
        transform: `scale(${scale})`,
      }}
    >
      {children}
    </div>
  );
}

// ============================================
// TRAIL EFFECT (for moving objects)
// ============================================

interface TrailParticle {
  id: number;
  offsetX: number;
  offsetY: number;
  size: number;
  opacity: number;
  delay: number;
}

interface TrailEffectProps {
  x: number;
  y: number;
  count?: number;
  color?: string;
  spread?: number;
  seed?: string;
}

export function TrailEffect({
  x,
  y,
  count = 8,
  color = 'rgba(255, 255, 255, 0.6)',
  spread = 30,
  seed = 'trail',
}: TrailEffectProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const particles = useMemo(() => {
    const result: TrailParticle[] = [];
    for (let i = 0; i < count; i++) {
      result.push({
        id: i,
        offsetX: (random(`${seed}-ox-${i}`) - 0.5) * spread,
        offsetY: (random(`${seed}-oy-${i}`) - 0.5) * spread,
        size: random(`${seed}-size-${i}`) * 6 + 2,
        opacity: random(`${seed}-op-${i}`) * 0.5 + 0.3,
        delay: i * 2,
      });
    }
    return result;
  }, [count, spread, seed]);

  return (
    <>
      {particles.map((particle) => {
        const age = (frame - particle.delay) / fps;
        const fadeOut = Math.max(0, 1 - age * 2);
        const drift = age * 20;

        return (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: x + particle.offsetX - drift,
              top: y + particle.offsetY,
              width: particle.size,
              height: particle.size,
              backgroundColor: color,
              borderRadius: '50%',
              opacity: particle.opacity * fadeOut,
              filter: `blur(${particle.size / 3}px)`,
              pointerEvents: 'none',
            }}
          />
        );
      })}
    </>
  );
}

// ============================================
// FLICKER EFFECT (for candles, lights)
// ============================================

interface FlickerProps {
  children: React.ReactNode;
  intensity?: number; // 0-1, how much to flicker
  speed?: number; // flickers per second
  seed?: string;
}

export function Flicker({
  children,
  intensity = 0.3,
  speed = 8,
  seed = 'flicker',
}: FlickerProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Use multiple sine waves for organic flicker
  const time = frame / fps;
  const flicker1 = Math.sin(time * speed * Math.PI * 2) * 0.5;
  const flicker2 = Math.sin(time * speed * 1.7 * Math.PI * 2) * 0.3;
  const flicker3 = Math.sin(time * speed * 2.3 * Math.PI * 2) * 0.2;

  const combinedFlicker = (flicker1 + flicker2 + flicker3) * intensity;
  const opacity = 0.7 + combinedFlicker * 0.3 + 0.3;

  return (
    <div style={{ opacity: Math.max(0.5, Math.min(1, opacity)) }}>
      {children}
    </div>
  );
}

// ============================================
// BEZIER PATH ANIMATION
// ============================================

interface BezierPoint {
  x: number;
  y: number;
}

export function getBezierPoint(
  t: number,
  p0: BezierPoint,
  p1: BezierPoint,
  p2: BezierPoint,
  p3: BezierPoint
): BezierPoint {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  return {
    x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
  };
}

export function getBezierAngle(
  t: number,
  p0: BezierPoint,
  p1: BezierPoint,
  p2: BezierPoint,
  p3: BezierPoint
): number {
  const delta = 0.001;
  const p1Pos = getBezierPoint(Math.max(0, t - delta), p0, p1, p2, p3);
  const p2Pos = getBezierPoint(Math.min(1, t + delta), p0, p1, p2, p3);

  return Math.atan2(p2Pos.y - p1Pos.y, p2Pos.x - p1Pos.x) * (180 / Math.PI);
}

// ============================================
// CONFETTI BURST
// ============================================

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  size: number;
  shape: 'rect' | 'circle';
}

interface ConfettiBurstProps {
  originX: number;
  originY: number;
  count?: number;
  colors?: string[];
  spread?: number;
  gravity?: number;
  seed?: string;
  triggerFrame?: number;
}

export function ConfettiBurst({
  originX,
  originY,
  count = 30,
  colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffd700'],
  spread = 200,
  gravity = 400,
  seed = 'confetti',
  triggerFrame = 0,
}: ConfettiBurstProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pieces = useMemo(() => {
    const result: ConfettiPiece[] = [];
    for (let i = 0; i < count; i++) {
      const angle = random(`${seed}-angle-${i}`) * Math.PI * 2;
      const speed = random(`${seed}-speed-${i}`) * spread + spread * 0.5;

      result.push({
        id: i,
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - spread * 0.5,
        rotation: random(`${seed}-rot-${i}`) * 360,
        rotationSpeed: (random(`${seed}-rotspd-${i}`) - 0.5) * 720,
        color: colors[Math.floor(random(`${seed}-color-${i}`) * colors.length)],
        size: random(`${seed}-size-${i}`) * 8 + 4,
        shape: random(`${seed}-shape-${i}`) > 0.5 ? 'rect' : 'circle',
      });
    }
    return result;
  }, [count, originX, originY, spread, colors, seed]);

  const elapsed = Math.max(0, frame - triggerFrame) / fps;

  if (frame < triggerFrame) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {pieces.map((piece) => {
        const x = piece.x + piece.vx * elapsed;
        const y = piece.y + piece.vy * elapsed + 0.5 * gravity * elapsed * elapsed;
        const rotation = piece.rotation + piece.rotationSpeed * elapsed;
        const opacity = Math.max(0, 1 - elapsed * 0.5);

        return (
          <div
            key={piece.id}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: piece.size,
              height: piece.shape === 'rect' ? piece.size * 0.6 : piece.size,
              backgroundColor: piece.color,
              borderRadius: piece.shape === 'circle' ? '50%' : '2px',
              transform: `rotate(${rotation}deg)`,
              opacity,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}
