import { AbsoluteFill, useCurrentFrame, useVideoConfig, random } from 'remotion';
import { useMemo } from 'react';
import { usePulse } from '../utils/animations';

interface EasterDecorationProps {
  width: number;
  height: number;
}

// Easter egg SVG
function EasterEgg({ size, pattern, colors }: { size: number; pattern: number; colors: string[] }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 40 52">
      {/* Egg base */}
      <ellipse cx="20" cy="28" rx="18" ry="23" fill={colors[0]} />
      {/* Patterns */}
      {pattern === 0 && (
        <>
          <path d="M5,25 Q20,15 35,25" stroke={colors[1]} strokeWidth="3" fill="none" />
          <path d="M5,35 Q20,45 35,35" stroke={colors[1]} strokeWidth="3" fill="none" />
          <circle cx="20" cy="28" r="5" fill={colors[2]} />
        </>
      )}
      {pattern === 1 && (
        <>
          {Array.from({ length: 5 }).map((_, i) => (
            <circle key={i} cx={10 + i * 5} cy={20 + (i % 2) * 8} r="3" fill={colors[1]} />
          ))}
          {Array.from({ length: 4 }).map((_, i) => (
            <circle key={`b-${i}`} cx={12 + i * 5} cy={35 + (i % 2) * 5} r="2" fill={colors[2]} />
          ))}
        </>
      )}
      {pattern === 2 && (
        <>
          <rect x="5" y="18" width="30" height="6" fill={colors[1]} />
          <rect x="5" y="30" width="30" height="6" fill={colors[2]} />
          <line x1="10" y1="10" x2="10" y2="45" stroke={colors[1]} strokeWidth="2" />
          <line x1="30" y1="10" x2="30" y2="45" stroke={colors[1]} strokeWidth="2" />
        </>
      )}
    </svg>
  );
}

// Bunny SVG
function BunnySVG({ size, flip }: { size: number; flip?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      style={{ transform: flip ? 'scaleX(-1)' : undefined }}
    >
      {/* Body */}
      <ellipse cx="30" cy="42" rx="18" ry="15" fill="#F5F5DC" />
      {/* Head */}
      <circle cx="30" cy="25" r="14" fill="#F5F5DC" />
      {/* Ears */}
      <ellipse cx="22" cy="8" rx="5" ry="15" fill="#F5F5DC" />
      <ellipse cx="22" cy="8" rx="3" ry="12" fill="#FFB6C1" />
      <ellipse cx="38" cy="8" rx="5" ry="15" fill="#F5F5DC" />
      <ellipse cx="38" cy="8" rx="3" ry="12" fill="#FFB6C1" />
      {/* Face */}
      <circle cx="25" cy="22" r="2" fill="#333" />
      <circle cx="35" cy="22" r="2" fill="#333" />
      <ellipse cx="30" cy="28" rx="3" ry="2" fill="#FFB6C1" />
      {/* Whiskers */}
      <line x1="18" y1="26" x2="8" y2="24" stroke="#999" strokeWidth="1" />
      <line x1="18" y1="28" x2="8" y2="28" stroke="#999" strokeWidth="1" />
      <line x1="42" y1="26" x2="52" y2="24" stroke="#999" strokeWidth="1" />
      <line x1="42" y1="28" x2="52" y2="28" stroke="#999" strokeWidth="1" />
      {/* Tail */}
      <circle cx="45" cy="45" r="6" fill="#F5F5DC" />
    </svg>
  );
}

// Spring flower
function FlowerSVG({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      {/* Petals */}
      {Array.from({ length: 6 }).map((_, i) => {
        const angle = (i / 6) * 360;
        return (
          <ellipse
            key={i}
            cx="20"
            cy="10"
            rx="6"
            ry="10"
            fill={color}
            transform={`rotate(${angle}, 20, 20)`}
            opacity={0.9}
          />
        );
      })}
      {/* Center */}
      <circle cx="20" cy="20" r="6" fill="#FFD700" />
    </svg>
  );
}

export function EasterDecoration({ width, height }: EasterDecorationProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const flowerPulse = usePulse({ frequency: 0.5, min: 0.95, max: 1.05 });

  // Generate eggs
  const eggs = useMemo(() => {
    const colorSets = [
      ['#FF69B4', '#FFD700', '#87CEEB'],
      ['#98FB98', '#FF6B6B', '#DDA0DD'],
      ['#87CEEB', '#FFB6C1', '#98FB98'],
      ['#DDA0DD', '#87CEEB', '#FFD700'],
    ];
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: random(`egg-x-${i}`) * width,
      startY: random(`egg-startY-${i}`) * (height + 100), // Pre-seeded for immediate visibility
      size: random(`egg-size-${i}`) * 25 + 25,
      speed: random(`egg-speed-${i}`) * 1.2 + 0.4,
      delay: random(`egg-delay-${i}`) * 30, // Reduced from 150 for faster appearance
      pattern: Math.floor(random(`egg-pattern-${i}`) * 3),
      colors: colorSets[Math.floor(random(`egg-colors-${i}`) * colorSets.length)],
      rotation: random(`egg-rot-${i}`) * 30 - 15,
    }));
  }, [width, height]);

  // Generate bunnies
  const bunnies = useMemo(() => {
    return [
      { x: width * 0.1, y: height - 100, size: 80, flip: false },
      { x: width * 0.85, y: height - 90, size: 70, flip: true },
    ];
  }, [width, height]);

  // Generate flowers
  const flowers = useMemo(() => {
    const colors = ['#FF69B4', '#FFB6C1', '#DDA0DD', '#FFA07A', '#87CEEB'];
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: random(`flower-x-${i}`) * width,
      y: height - random(`flower-y-${i}`) * 100 - 20,
      size: random(`flower-size-${i}`) * 20 + 15,
      color: colors[Math.floor(random(`flower-color-${i}`) * colors.length)],
      phase: random(`flower-phase-${i}`) * Math.PI * 2,
    }));
  }, [width, height]);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Soft pastel gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(135,206,250,0.1) 0%, rgba(152,251,152,0.1) 100%)',
        }}
      />

      {/* Grass at bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 80,
          background: 'linear-gradient(to top, #90EE90 0%, transparent 100%)',
          opacity: 0.5,
        }}
      />

      {/* Flowers */}
      {flowers.map((flower) => {
        const sway = Math.sin(frame * 0.03 + flower.phase) * 5;
        const scale = 0.9 + Math.sin(frame * 0.05 + flower.phase) * 0.1;
        return (
          <div
            key={flower.id}
            style={{
              position: 'absolute',
              left: flower.x + sway,
              top: flower.y,
              transform: `scale(${scale * flowerPulse})`,
            }}
          >
            <FlowerSVG size={flower.size} color={flower.color} />
          </div>
        );
      })}

      {/* Falling eggs */}
      {eggs.map((egg) => {
        // Pre-seeded Y position for immediate visibility
        const yOffset = (egg.startY + (frame + egg.delay) * egg.speed) % (height + 100);
        const currentY = yOffset - 50;
        const xSway = Math.sin((frame + egg.delay) * 0.02) * 20;
        const rotation = egg.rotation + Math.sin((frame + egg.delay) * 0.03) * 10;

        return (
          <div
            key={egg.id}
            style={{
              position: 'absolute',
              left: egg.x + xSway,
              top: currentY,
              transform: `rotate(${rotation}deg)`,
            }}
          >
            <EasterEgg size={egg.size} pattern={egg.pattern} colors={egg.colors} />
          </div>
        );
      })}

      {/* Bunnies */}
      {bunnies.map((bunny, i) => {
        const hop = Math.abs(Math.sin(frame * 0.1)) * 10;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: bunny.x,
              top: bunny.y - hop,
            }}
          >
            <BunnySVG size={bunny.size} flip={bunny.flip} />
          </div>
        );
      })}

      {/* Butterfly */}
      {Array.from({ length: 5 }).map((_, i) => {
        const baseX = random(`butterfly-x-${i}`) * width;
        const baseY = random(`butterfly-y-${i}`) * height * 0.6;
        const xOffset = Math.sin(frame * 0.05 + i) * 50;
        const yOffset = Math.cos(frame * 0.03 + i) * 30;
        const wingFlap = Math.sin(frame * 0.3 + i) * 20;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: baseX + xOffset,
              top: baseY + yOffset,
            }}
          >
            <svg width="30" height="20" viewBox="0 0 30 20">
              <ellipse cx="15" cy="10" rx="3" ry="8" fill="#333" />
              <ellipse
                cx="8"
                cy="10"
                rx="7"
                ry="9"
                fill="#FF69B4"
                transform={`rotate(${wingFlap}, 15, 10)`}
              />
              <ellipse
                cx="22"
                cy="10"
                rx="7"
                ry="9"
                fill="#FF69B4"
                transform={`rotate(${-wingFlap}, 15, 10)`}
              />
            </svg>
          </div>
        );
      })}
    </AbsoluteFill>
  );
}
