import { AbsoluteFill, useCurrentFrame, useVideoConfig, random } from 'remotion';
import { useMemo } from 'react';
import { usePulse } from '../utils/animations';
import { SparkleOverlay, GlowPulse, SwayMotion } from '../utils/decorationAnimations';

interface ThanksgivingDecorationProps {
  width: number;
  height: number;
}

// Autumn leaf SVG
function LeafSVG({ size, color, type }: { size: number; color: string; type: number }) {
  if (type === 0) {
    // Maple leaf
    return (
      <svg width={size} height={size} viewBox="0 0 40 40">
        <path
          d="M20,38 L18,30 L10,35 L12,25 L2,22 L12,18 L8,10 L16,14 L20,2 L24,14 L32,10 L28,18 L38,22 L28,25 L30,35 L22,30 Z"
          fill={color}
          filter="drop-shadow(1px 1px 2px rgba(0,0,0,0.2))"
        />
      </svg>
    );
  }
  // Oak leaf
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
      <path
        d="M20,38 L18,32 Q12,34 10,28 Q6,28 8,22 Q4,20 8,16 Q6,12 10,10 Q10,6 14,6 Q16,2 20,4 Q24,2 26,6 Q30,6 30,10 Q34,12 32,16 Q36,20 32,22 Q34,28 30,28 Q28,34 22,32 Z"
        fill={color}
        filter="drop-shadow(1px 1px 2px rgba(0,0,0,0.2))"
      />
    </svg>
  );
}

// Pumpkin SVG
function PumpkinSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      {/* Stem */}
      <path d="M28,12 Q25,8 30,5 Q35,8 32,12 L32,18 L28,18 Z" fill="#228B22" />
      {/* Main pumpkin */}
      <ellipse cx="30" cy="38" rx="25" ry="20" fill="#FF8C00" />
      {/* Segments */}
      <path d="M15,38 Q15,25 30,20 Q15,25 15,38" fill="#FF7F00" opacity="0.5" />
      <path d="M45,38 Q45,25 30,20 Q45,25 45,38" fill="#FF7F00" opacity="0.5" />
      <path d="M30,20 L30,55" stroke="#FF7F00" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

// Acorn SVG
function AcornSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 30 40">
      {/* Cap */}
      <ellipse cx="15" cy="12" rx="12" ry="8" fill="#8B4513" />
      <rect x="3" y="8" width="24" height="8" fill="#8B4513" />
      {/* Cap pattern */}
      {Array.from({ length: 5 }).map((_, i) => (
        <ellipse key={i} cx={6 + i * 5} cy="10" rx="2" ry="3" fill="#6B3510" opacity="0.5" />
      ))}
      {/* Nut */}
      <ellipse cx="15" cy="26" rx="10" ry="14" fill="#D2691E" />
      {/* Stem */}
      <rect x="13" y="2" width="4" height="6" fill="#5D4037" rx="1" />
    </svg>
  );
}

export function ThanksgivingDecoration({ width, height }: ThanksgivingDecorationProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Generate leaves
  const leaves = useMemo(() => {
    const colors = ['#FF4500', '#FF6347', '#FFD700', '#FFA500', '#8B4513', '#CD853F'];
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: random(`leaf-x-${i}`) * width,
      startY: random(`leaf-startY-${i}`) * (height + 100), // Pre-seeded for immediate visibility
      size: random(`leaf-size-${i}`) * 25 + 20,
      color: colors[Math.floor(random(`leaf-color-${i}`) * colors.length)],
      speed: random(`leaf-speed-${i}`) * 1.5 + 0.5,
      delay: random(`leaf-delay-${i}`) * 30, // Reduced from 200 for faster appearance
      swayAmplitude: random(`leaf-sway-${i}`) * 50 + 20,
      rotationSpeed: random(`leaf-rot-${i}`) * 4 - 2,
      type: Math.floor(random(`leaf-type-${i}`) * 2),
    }));
  }, [width, height]);

  // Generate acorns
  const acorns = useMemo(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: random(`acorn-x-${i}`) * width,
      startY: random(`acorn-startY-${i}`) * (height + 80), // Pre-seeded for immediate visibility
      size: random(`acorn-size-${i}`) * 15 + 15,
      speed: random(`acorn-speed-${i}`) * 2 + 1,
      delay: random(`acorn-delay-${i}`) * 30, // Reduced from 150 for faster appearance
    }));
  }, [width, height]);

  // Pumpkins at bottom
  const pumpkins = useMemo(() => [
    { x: width * 0.1, size: 70 },
    { x: width * 0.25, size: 50 },
    { x: width * 0.7, size: 60 },
    { x: width * 0.88, size: 55 },
  ], [width]);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Golden autumn sparkle overlay */}
      <SparkleOverlay count={25} color="#FFD700" minSize={2} maxSize={6} seed="thanksgiving-sparkle" />

      {/* Warm autumn gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(255,140,0,0.05) 0%, rgba(139,69,19,0.1) 100%)',
        }}
      />

      {/* Falling leaves */}
      {leaves.map((leaf) => {
        // Pre-seeded Y position for immediate visibility
        const yOffset = (leaf.startY + (frame + leaf.delay) * leaf.speed) % (height + 100);
        const currentY = yOffset - 50;
        const xSway = Math.sin((frame + leaf.delay) * 0.02) * leaf.swayAmplitude;
        const currentX = leaf.x + xSway;
        const rotation = (frame + leaf.delay) * leaf.rotationSpeed;

        return (
          <div
            key={leaf.id}
            style={{
              position: 'absolute',
              left: currentX,
              top: currentY,
              transform: `rotate(${rotation}deg)`,
            }}
          >
            <LeafSVG size={leaf.size} color={leaf.color} type={leaf.type} />
          </div>
        );
      })}

      {/* Falling acorns */}
      {acorns.map((acorn) => {
        // Pre-seeded Y position for immediate visibility
        const yOffset = (acorn.startY + (frame + acorn.delay) * acorn.speed) % (height + 80);
        const currentY = yOffset - 40;
        const xSway = Math.sin((frame + acorn.delay) * 0.03) * 15;
        const rotation = (frame + acorn.delay) * 3;

        return (
          <div
            key={acorn.id}
            style={{
              position: 'absolute',
              left: acorn.x + xSway,
              top: currentY,
              transform: `rotate(${rotation}deg)`,
            }}
          >
            <AcornSVG size={acorn.size} />
          </div>
        );
      })}

      {/* Ground leaves pile */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 50,
          background: 'linear-gradient(to top, rgba(139,69,19,0.3), transparent)',
        }}
      />

      {/* Pumpkins */}
      {pumpkins.map((pumpkin, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: pumpkin.x - pumpkin.size / 2,
            bottom: 10,
          }}
        >
          <PumpkinSVG size={pumpkin.size} />
        </div>
      ))}

      {/* Cornucopia hint in corner */}
      <div
        style={{
          position: 'absolute',
          right: -20,
          bottom: 20,
          opacity: 0.15,
        }}
      >
        <svg width="150" height="100" viewBox="0 0 150 100">
          <path
            d="M10,80 Q30,90 60,85 Q100,75 140,30 Q145,20 140,15 Q130,10 120,20 Q90,60 50,70 Q20,75 10,80 Z"
            fill="#8B4513"
          />
          <ellipse cx="30" cy="70" rx="15" ry="12" fill="#FF8C00" />
          <ellipse cx="50" cy="65" rx="10" ry="8" fill="#FF4500" />
          <ellipse cx="45" cy="75" rx="8" ry="10" fill="#FFD700" />
        </svg>
      </div>

      {/* "Give Thanks" watermark */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 72,
          fontFamily: 'serif',
          fontWeight: 'bold',
          opacity: 0.04,
          color: '#8B4513',
        }}
      >
        GIVE THANKS
      </div>
    </AbsoluteFill>
  );
}
