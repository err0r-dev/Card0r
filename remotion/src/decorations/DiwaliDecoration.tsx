import { AbsoluteFill, useCurrentFrame, useVideoConfig, random, interpolate } from 'remotion';
import { useMemo } from 'react';
import { usePulse } from '../utils/animations';
import { SparkleOverlay, GlowPulse, Flicker, ConfettiBurst } from '../utils/decorationAnimations';

interface DiwaliDecorationProps {
  width: number;
  height: number;
}

interface Diya {
  id: number;
  x: number;
  y: number;
  size: number;
  flickerPhase: number;
}

interface Firework {
  id: number;
  x: number;
  y: number;
  color: string;
  startFrame: number;
  particles: { angle: number; speed: number }[];
}

interface Rangoli {
  x: number;
  y: number;
  size: number;
  rotation: number;
}

// Diya (oil lamp) SVG
function DiyaSVG({ size, flameHeight }: { size: number; flameHeight: number }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 60 72">
      {/* Lamp base */}
      <ellipse cx="30" cy="60" rx="25" ry="8" fill="#CD853F" />
      <path d="M10,55 Q5,50 10,45 L50,45 Q55,50 50,55 Z" fill="#CD853F" />
      {/* Oil */}
      <ellipse cx="30" cy="48" rx="18" ry="5" fill="#8B4513" />
      {/* Wick */}
      <rect x="28" y="35" width="4" height="15" fill="#333" />
      {/* Flame */}
      <ellipse
        cx="30"
        cy={25 - flameHeight * 5}
        rx="8"
        ry={12 + flameHeight * 3}
        fill="#FFD700"
        opacity={0.9}
        filter="url(#flameGlow)"
      />
      <ellipse
        cx="30"
        cy={28 - flameHeight * 4}
        rx="4"
        ry={8 + flameHeight * 2}
        fill="#FFA500"
      />
      <ellipse cx="30" cy={32 - flameHeight * 3} rx="2" ry="5" fill="#FF4500" />
      {/* Glow effect */}
      <defs>
        <filter id="flameGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

// Rangoli pattern SVG
function RangoliSVG({ size, rotation }: { size: number; rotation: number }) {
  const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Outer petals */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * 360;
        return (
          <g key={i} transform={`rotate(${angle}, 100, 100)`}>
            <ellipse cx="100" cy="30" rx="20" ry="35" fill={colors[i % colors.length]} opacity={0.8} />
          </g>
        );
      })}
      {/* Inner petals */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * 360 + 22.5;
        return (
          <g key={`inner-${i}`} transform={`rotate(${angle}, 100, 100)`}>
            <ellipse cx="100" cy="50" rx="15" ry="25" fill={colors[(i + 2) % colors.length]} opacity={0.7} />
          </g>
        );
      })}
      {/* Center circles */}
      <circle cx="100" cy="100" r="35" fill="#FFE66D" opacity={0.8} />
      <circle cx="100" cy="100" r="25" fill="#FF6B6B" opacity={0.8} />
      <circle cx="100" cy="100" r="15" fill="#4ECDC4" opacity={0.8} />
      {/* Dots around */}
      {Array.from({ length: 16 }).map((_, i) => {
        const angle = (i / 16) * Math.PI * 2;
        const x = 100 + Math.cos(angle) * 80;
        const y = 100 + Math.sin(angle) * 80;
        return (
          <circle key={`dot-${i}`} cx={x} cy={y} r="5" fill={colors[i % colors.length]} />
        );
      })}
    </svg>
  );
}

// Sparkler effect
function Sparkler({ x, y, frame, startFrame }: { x: number; y: number; frame: number; startFrame: number }) {
  const elapsed = frame - startFrame;
  if (elapsed < 0 || elapsed > 120) return null;

  const sparks = Array.from({ length: 20 }).map((_, i) => {
    const angle = random(`spark-angle-${x}-${i}`) * Math.PI * 2;
    const speed = random(`spark-speed-${x}-${i}`) * 30 + 10;
    const life = random(`spark-life-${x}-${i}`) * 20 + 10;
    const sparkElapsed = elapsed % (life + 10);

    if (sparkElapsed > life) return null;

    const distance = sparkElapsed * (speed / 10);
    const sparkX = Math.cos(angle) * distance;
    const sparkY = Math.sin(angle) * distance + sparkElapsed * 0.5; // gravity
    const opacity = 1 - sparkElapsed / life;

    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: sparkX,
          top: sparkY,
          width: 3,
          height: 3,
          backgroundColor: '#FFD700',
          borderRadius: '50%',
          opacity,
          boxShadow: '0 0 4px #FFD700',
        }}
      />
    );
  });

  return (
    <div style={{ position: 'absolute', left: x, top: y }}>
      {sparks}
      {/* Center glow */}
      <div
        style={{
          position: 'absolute',
          left: -10,
          top: -10,
          width: 20,
          height: 20,
          background: 'radial-gradient(circle, #FFD700 0%, transparent 70%)',
          opacity: 0.8,
        }}
      />
    </div>
  );
}

export function DiwaliDecoration({ width, height }: DiwaliDecorationProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Flame flicker effect
  const flameFlicker = usePulse({ frequency: 8, min: 0.8, max: 1.2 });

  // Generate diyas
  const diyas = useMemo(() => {
    const result: Diya[] = [];
    const diyaCount = 12;

    // Bottom row
    for (let i = 0; i < 8; i++) {
      result.push({
        id: i,
        x: width * 0.1 + (width * 0.8 / 7) * i,
        y: height - 60,
        size: 50,
        flickerPhase: random(`diya-flicker-${i}`) * Math.PI * 2,
      });
    }

    // Side diyas
    for (let i = 0; i < 4; i++) {
      result.push({
        id: i + 8,
        x: i < 2 ? 30 : width - 80,
        y: height * 0.3 + i % 2 * 150,
        size: 40,
        flickerPhase: random(`diya-side-${i}`) * Math.PI * 2,
      });
    }

    return result;
  }, [width, height]);

  // Generate fireworks
  const fireworks = useMemo(() => {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#9B59B6', '#E74C3C'];
    const result: Firework[] = [];
    const fireworkCount = 8;

    for (let i = 0; i < fireworkCount; i++) {
      result.push({
        id: i,
        x: random(`fw-x-${i}`) * width * 0.7 + width * 0.15,
        y: random(`fw-y-${i}`) * height * 0.4 + height * 0.1,
        color: colors[Math.floor(random(`fw-color-${i}`) * colors.length)],
        startFrame: Math.floor(random(`fw-start-${i}`) * durationInFrames * 0.7),
        particles: Array.from({ length: 24 }, (_, j) => ({
          angle: (j / 24) * Math.PI * 2,
          speed: random(`fw-speed-${i}-${j}`) * 60 + 30,
        })),
      });
    }
    return result;
  }, [width, height, durationInFrames]);

  // Rangoli positions
  const rangolis = useMemo((): Rangoli[] => [
    { x: width * 0.15, y: height * 0.7, size: 120, rotation: 0 },
    { x: width * 0.85, y: height * 0.7, size: 100, rotation: 15 },
    { x: width * 0.5, y: height * 0.85, size: 150, rotation: 7 },
  ], [width, height]);

  // Sparkler positions - relative to video duration
  const sparklers = useMemo(() => [
    { x: width * 0.2, y: height * 0.4, startFrame: Math.floor(durationInFrames * 0.08) },
    { x: width * 0.8, y: height * 0.35, startFrame: Math.floor(durationInFrames * 0.2) },
    { x: width * 0.5, y: height * 0.25, startFrame: Math.floor(durationInFrames * 0.35) },
    { x: width * 0.3, y: height * 0.5, startFrame: Math.floor(durationInFrames * 0.5) },
    { x: width * 0.7, y: height * 0.45, startFrame: Math.floor(durationInFrames * 0.65) },
  ], [width, height, durationInFrames]);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Golden sparkle overlay for festival of lights */}
      <SparkleOverlay count={40} color="#FFD700" minSize={3} maxSize={8} seed="diwali-sparkle" />
      <SparkleOverlay count={20} color="#FF6B6B" minSize={2} maxSize={5} seed="diwali-color" />

      {/* Warm golden overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center bottom, rgba(255,200,100,0.15) 0%, transparent 60%)',
        }}
      />

      {/* Rangoli patterns */}
      {rangolis.map((rangoli, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: rangoli.x - rangoli.size / 2,
            top: rangoli.y - rangoli.size / 2,
            opacity: 0.6,
          }}
        >
          <RangoliSVG size={rangoli.size} rotation={rangoli.rotation + frame * 0.1} />
        </div>
      ))}

      {/* Diyas */}
      {diyas.map((diya) => {
        const flickerAmount = Math.sin(frame * 0.3 + diya.flickerPhase) * 0.3;
        return (
          <div
            key={diya.id}
            style={{
              position: 'absolute',
              left: diya.x - diya.size / 2,
              top: diya.y - diya.size / 2,
            }}
          >
            <DiyaSVG size={diya.size} flameHeight={flameFlicker + flickerAmount} />
          </div>
        );
      })}

      {/* Fireworks */}
      {fireworks.map((fw) => {
        const elapsed = frame - fw.startFrame;
        if (elapsed < 0 || elapsed > 60) return null;

        const burstProgress = Math.min(elapsed / 30, 1);
        const fadeProgress = elapsed > 30 ? (elapsed - 30) / 30 : 0;

        return (
          <div
            key={fw.id}
            style={{
              position: 'absolute',
              left: fw.x,
              top: fw.y,
              opacity: 1 - fadeProgress,
            }}
          >
            {fw.particles.map((p, i) => {
              const dist = burstProgress * p.speed;
              const x = Math.cos(p.angle) * dist;
              const y = Math.sin(p.angle) * dist + burstProgress * 15;
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: x,
                    top: y,
                    width: 4,
                    height: 4,
                    backgroundColor: fw.color,
                    borderRadius: '50%',
                    boxShadow: `0 0 8px ${fw.color}`,
                  }}
                />
              );
            })}
          </div>
        );
      })}

      {/* Sparklers */}
      {sparklers.map((s, i) => (
        <Sparkler key={i} x={s.x} y={s.y} frame={frame} startFrame={s.startFrame} />
      ))}

      {/* Floating lights (like floating lanterns) */}
      {Array.from({ length: 15 }).map((_, i) => {
        const x = random(`lantern-x-${i}`) * width;
        const baseY = random(`lantern-y-${i}`) * height * 0.5 + height * 0.2;
        const yOffset = ((frame + i * 30) * 0.3) % (height + 50);
        const currentY = baseY - (yOffset * 0.3);
        const xWobble = Math.sin((frame + i * 20) * 0.02) * 15;
        const size = random(`lantern-size-${i}`) * 15 + 10;
        const opacity = interpolate(
          currentY,
          [0, height * 0.2, height * 0.5],
          [0, 0.8, 0.4],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x + xWobble,
              top: currentY,
              width: size,
              height: size,
              background: 'radial-gradient(circle, #FFD700 0%, #FFA500 50%, transparent 70%)',
              borderRadius: '50%',
              opacity,
              boxShadow: '0 0 20px #FFD700',
            }}
          />
        );
      })}

      {/* "Shubh Deepavali" watermark */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 80,
          transform: 'translateX(-50%)',
          fontSize: 24,
          fontFamily: 'serif',
          opacity: 0.1,
          color: '#FFD700',
          letterSpacing: 4,
        }}
      >
        SHUBH DEEPAVALI
      </div>
    </AbsoluteFill>
  );
}
