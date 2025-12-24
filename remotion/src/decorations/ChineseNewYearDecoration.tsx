import { AbsoluteFill, useCurrentFrame, useVideoConfig, random, interpolate } from 'remotion';
import { useMemo } from 'react';
import { usePulse, useOscillate } from '../utils/animations';
import { SparkleOverlay, GlowPulse, SwayMotion, ConfettiBurst } from '../utils/decorationAnimations';

interface ChineseNewYearDecorationProps {
  width: number;
  height: number;
}

interface Lantern {
  id: number;
  x: number;
  y: number;
  size: number;
  swingPhase: number;
  color: string;
}

interface Firecracker {
  id: number;
  x: number;
  startFrame: number;
  particles: { angle: number; speed: number; color: string }[];
}

interface RedEnvelope {
  id: number;
  x: number;
  startY: number; // Pre-seeded Y position for immediate visibility
  speed: number;
  delay: number;
  rotation: number;
  size: number;
}

// Chinese Lantern SVG
function LanternSVG({ size, color, glowIntensity }: { size: number; color: string; glowIntensity: number }) {
  const darkColor = color === '#FF0000' ? '#CC0000' : '#CC6600';

  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 60 90">
      {/* String */}
      <line x1="30" y1="0" x2="30" y2="12" stroke="#8B4513" strokeWidth="2" />
      {/* Top cap */}
      <rect x="20" y="10" width="20" height="8" fill="#FFD700" rx="2" />
      {/* Main body */}
      <ellipse cx="30" cy="45" rx="25" ry="30" fill={color} opacity={0.9} />
      {/* Ribs */}
      <ellipse cx="30" cy="45" rx="25" ry="30" fill="none" stroke={darkColor} strokeWidth="1" />
      <line x1="30" y1="15" x2="30" y2="75" stroke={darkColor} strokeWidth="1" />
      <path d="M10,35 Q30,25 50,35" stroke={darkColor} strokeWidth="1" fill="none" />
      <path d="M10,55 Q30,65 50,55" stroke={darkColor} strokeWidth="1" fill="none" />
      {/* Bottom cap */}
      <rect x="22" y="72" width="16" height="6" fill="#FFD700" rx="2" />
      {/* Tassel */}
      <line x1="30" y1="78" x2="30" y2="88" stroke="#FFD700" strokeWidth="2" />
      <line x1="26" y1="78" x2="24" y2="86" stroke="#FFD700" strokeWidth="1" />
      <line x1="34" y1="78" x2="36" y2="86" stroke="#FFD700" strokeWidth="1" />
      {/* Inner glow */}
      <ellipse cx="30" cy="45" rx="18" ry="22" fill={`rgba(255,200,100,${glowIntensity * 0.4})`} />
      {/* Character (fu - fortune) */}
      <text x="30" y="50" textAnchor="middle" fontSize="20" fill="#FFD700" fontWeight="bold">
        福
      </text>
    </svg>
  );
}

// Dragon segment
function DragonSegment({ x, y, size, isHead }: { x: number; y: number; size: number; isHead: boolean }) {
  if (isHead) {
    return (
      <svg
        style={{ position: 'absolute', left: x - size / 2, top: y - size / 2 }}
        width={size * 1.5}
        height={size}
        viewBox="0 0 90 60"
      >
        {/* Head */}
        <ellipse cx="45" cy="30" rx="35" ry="25" fill="#CC0000" />
        {/* Snout */}
        <ellipse cx="75" cy="30" rx="15" ry="12" fill="#CC0000" />
        {/* Eye */}
        <circle cx="55" cy="22" r="8" fill="white" />
        <circle cx="57" cy="22" r="4" fill="#1a1a2e" />
        {/* Horns */}
        <path d="M30,10 Q25,0 35,5" stroke="#FFD700" strokeWidth="4" fill="none" />
        <path d="M45,8 Q42,0 50,3" stroke="#FFD700" strokeWidth="4" fill="none" />
        {/* Whiskers */}
        <path d="M80,25 Q95,20 90,15" stroke="#FFD700" strokeWidth="2" fill="none" />
        <path d="M80,35 Q95,40 90,45" stroke="#FFD700" strokeWidth="2" fill="none" />
        {/* Teeth */}
        <path d="M85,28 L88,32 L85,32 Z" fill="white" />
        <path d="M82,33 L85,37 L82,37 Z" fill="white" />
        {/* Mane */}
        <path d="M15,20 Q5,15 10,30 Q0,35 15,40" fill="#FFD700" />
      </svg>
    );
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
      }}
    >
      <svg width={size} height={size} viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="#CC0000" />
        <circle cx="20" cy="20" r="12" fill="#FF0000" />
        {/* Scales pattern */}
        <path d="M10,20 Q20,10 30,20" stroke="#FFD700" strokeWidth="1" fill="none" />
        <path d="M10,25 Q20,15 30,25" stroke="#FFD700" strokeWidth="1" fill="none" />
      </svg>
    </div>
  );
}

// Red envelope SVG
function RedEnvelopeSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={size * 1.4} viewBox="0 0 50 70">
      {/* Main body */}
      <rect x="5" y="5" width="40" height="60" rx="3" fill="#CC0000" />
      {/* Flap */}
      <path d="M5,5 L25,25 L45,5 Z" fill="#FF0000" />
      {/* Gold trim */}
      <rect x="5" y="5" width="40" height="60" rx="3" fill="none" stroke="#FFD700" strokeWidth="2" />
      {/* Gold circle */}
      <circle cx="25" cy="40" r="12" fill="#FFD700" />
      {/* Fu character */}
      <text x="25" y="45" textAnchor="middle" fontSize="14" fill="#CC0000" fontWeight="bold">
        福
      </text>
    </svg>
  );
}

export function ChineseNewYearDecoration({ width, height }: ChineseNewYearDecorationProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Lantern glow pulse
  const lanternGlow = usePulse({ frequency: 0.5, min: 0.7, max: 1 });

  // Generate lanterns
  const lanterns = useMemo(() => {
    const colors = ['#FF0000', '#FF6600'];
    const result: Lantern[] = [];
    const lanternCount = 8;

    for (let i = 0; i < lanternCount; i++) {
      result.push({
        id: i,
        x: width * 0.1 + (width * 0.8 / (lanternCount - 1)) * i,
        y: 20 + random(`lantern-y-${i}`) * 40,
        size: random(`lantern-size-${i}`) * 20 + 50,
        swingPhase: random(`lantern-swing-${i}`) * Math.PI * 2,
        color: colors[i % colors.length],
      });
    }
    return result;
  }, [width]);

  // Generate firecrackers
  const firecrackers = useMemo(() => {
    const result: Firecracker[] = [];
    const firecrackerCount = 10;

    for (let i = 0; i < firecrackerCount; i++) {
      result.push({
        id: i,
        x: random(`fc-x-${i}`) * width * 0.6 + width * 0.2,
        startFrame: Math.floor(random(`fc-start-${i}`) * durationInFrames * 0.8),
        particles: Array.from({ length: 15 }, (_, j) => ({
          angle: random(`fc-angle-${i}-${j}`) * Math.PI * 2,
          speed: random(`fc-speed-${i}-${j}`) * 50 + 20,
          color: ['#FF0000', '#FFD700', '#FF6600'][j % 3],
        })),
      });
    }
    return result;
  }, [width, durationInFrames]);

  // Generate red envelopes
  const redEnvelopes = useMemo(() => {
    const result: RedEnvelope[] = [];
    const envelopeCount = 15;

    for (let i = 0; i < envelopeCount; i++) {
      result.push({
        id: i,
        x: random(`env-x-${i}`) * width,
        startY: random(`env-startY-${i}`) * (height + 100), // Pre-seeded for immediate visibility
        speed: random(`env-speed-${i}`) * 1.5 + 0.5,
        delay: random(`env-delay-${i}`) * 30, // Reduced from 150 for faster appearance
        rotation: random(`env-rot-${i}`) * 40 - 20,
        size: random(`env-size-${i}`) * 20 + 30,
      });
    }
    return result;
  }, [width, height]);

  // Dragon path animation
  const dragonProgress = interpolate(frame, [0, durationInFrames], [0, 3], { extrapolateRight: 'clamp' });

  // Calculate dragon position
  const dragonSegments = useMemo(() => {
    const segments = 12;
    return Array.from({ length: segments }, (_, i) => {
      const segmentProgress = dragonProgress - i * 0.1;
      if (segmentProgress < 0) return null;

      const x = width * 0.1 + (segmentProgress % 1) * width * 0.8;
      const waveY = Math.sin(segmentProgress * Math.PI * 2) * 50;
      const baseY = height * 0.4;

      return {
        x,
        y: baseY + waveY,
        isHead: i === 0,
      };
    }).filter(Boolean);
  }, [dragonProgress, width, height]);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Red and gold sparkle overlay */}
      <SparkleOverlay count={30} color="#FFD700" minSize={3} maxSize={7} seed="cny-gold" />
      <SparkleOverlay count={20} color="#FF0000" minSize={2} maxSize={5} seed="cny-red" />

      {/* Red gradient background tint */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(255,0,0,0.05) 0%, transparent 70%)',
        }}
      />

      {/* Hanging lanterns */}
      {lanterns.map((lantern) => {
        const swing = Math.sin(frame * 0.03 + lantern.swingPhase) * 8;
        return (
          <div
            key={lantern.id}
            style={{
              position: 'absolute',
              left: lantern.x - lantern.size / 2,
              top: lantern.y,
              transform: `rotate(${swing}deg)`,
              transformOrigin: 'top center',
            }}
          >
            <LanternSVG size={lantern.size} color={lantern.color} glowIntensity={lanternGlow} />
          </div>
        );
      })}

      {/* Dragon (appears periodically) */}
      {dragonSegments.map((seg, i) => seg && (
        <DragonSegment key={i} x={seg.x} y={seg.y} size={40 - i * 2} isHead={seg.isHead} />
      ))}

      {/* Firecrackers */}
      {firecrackers.map((fc) => {
        const elapsed = frame - fc.startFrame;
        if (elapsed < 0 || elapsed > 40) return null;

        const burstProgress = Math.min(elapsed / 20, 1);
        const fade = elapsed > 20 ? (elapsed - 20) / 20 : 0;

        return (
          <div
            key={fc.id}
            style={{
              position: 'absolute',
              left: fc.x,
              top: height * 0.6,
              opacity: 1 - fade,
            }}
          >
            {fc.particles.map((p, i) => {
              const dist = burstProgress * p.speed;
              const x = Math.cos(p.angle) * dist;
              const y = Math.sin(p.angle) * dist - burstProgress * 20 + burstProgress * burstProgress * 30;
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: x,
                    top: y,
                    width: 5,
                    height: 5,
                    backgroundColor: p.color,
                    borderRadius: '50%',
                    boxShadow: `0 0 6px ${p.color}`,
                  }}
                />
              );
            })}
          </div>
        );
      })}

      {/* Falling red envelopes */}
      {redEnvelopes.map((env) => {
        // Pre-seeded Y position for immediate visibility
        const yOffset = (env.startY + (frame + env.delay) * env.speed) % (height + 100);
        const currentY = yOffset - 50;
        const xSway = Math.sin((frame + env.delay) * 0.03) * 20;
        const rotation = env.rotation + Math.sin((frame + env.delay) * 0.05) * 10;

        return (
          <div
            key={env.id}
            style={{
              position: 'absolute',
              left: env.x + xSway,
              top: currentY,
              transform: `rotate(${rotation}deg)`,
              opacity: 0.85,
            }}
          >
            <RedEnvelopeSVG size={env.size} />
          </div>
        );
      })}

      {/* Gold coins floating */}
      {Array.from({ length: 20 }).map((_, i) => {
        const x = random(`coin-x-${i}`) * width;
        const yOffset = ((frame + i * 30) * 0.8) % (height + 50);
        const currentY = yOffset - 25;
        const spin = frame * 3 + i * 45;
        const scaleX = Math.cos(spin * Math.PI / 180);

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: currentY,
              transform: `scaleX(${scaleX})`,
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                backgroundColor: '#FFD700',
                borderRadius: '50%',
                border: '2px solid #CC9900',
                boxShadow: '0 0 8px rgba(255,215,0,0.5)',
              }}
            />
          </div>
        );
      })}

      {/* Decorative borders */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 10,
          background: 'repeating-linear-gradient(90deg, #CC0000 0px, #CC0000 20px, #FFD700 20px, #FFD700 40px)',
          opacity: 0.6,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 10,
          background: 'repeating-linear-gradient(90deg, #FFD700 0px, #FFD700 20px, #CC0000 20px, #CC0000 40px)',
          opacity: 0.6,
        }}
      />

      {/* Year text */}
      <div
        style={{
          position: 'absolute',
          right: 30,
          top: '50%',
          transform: 'translateY(-50%)',
          writingMode: 'vertical-rl',
          fontSize: 80,
          fontWeight: 'bold',
          opacity: 0.08,
          color: '#CC0000',
        }}
      >
        新年快乐
      </div>
    </AbsoluteFill>
  );
}
