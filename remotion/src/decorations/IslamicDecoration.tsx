import { AbsoluteFill, useCurrentFrame, useVideoConfig, random } from 'remotion';
import { useMemo } from 'react';
import { usePulse } from '../utils/animations';
import { SparkleOverlay, GlowPulse, SwayMotion, Flicker } from '../utils/decorationAnimations';

interface IslamicDecorationProps {
  width: number;
  height: number;
  isRamadan?: boolean; // Ramadan uses lanterns, Eid uses more festive elements
}

// Crescent and Star SVG
function CrescentStar({ size, color, opacity }: { size: number; color: string; opacity: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" style={{ opacity }}>
      {/* Crescent */}
      <path
        d="M25,5 A20,20 0 1,1 25,45 A15,15 0 1,0 25,5"
        fill={color}
      />
      {/* Star */}
      <polygon
        points="38,12 40,18 46,18 41,22 43,28 38,24 33,28 35,22 30,18 36,18"
        fill={color}
      />
    </svg>
  );
}

// Lantern SVG (Fanous)
function LanternSVG({ size, glowIntensity, color }: { size: number; glowIntensity: number; color: string }) {
  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 50 75">
      {/* String */}
      <line x1="25" y1="0" x2="25" y2="10" stroke="#333" strokeWidth="2" />
      {/* Top cap */}
      <ellipse cx="25" cy="12" rx="8" ry="3" fill="#FFD700" />
      <rect x="17" y="10" width="16" height="5" fill="#FFD700" />
      {/* Main body */}
      <path
        d="M15,15 L12,55 Q12,62 25,62 Q38,62 35,55 L32,15 Z"
        fill={color}
        opacity={0.9}
      />
      {/* Glass panels */}
      <rect x="16" y="18" width="6" height="35" fill="rgba(255,255,255,0.2)" rx="1" />
      <rect x="25" y="18" width="6" height="35" fill="rgba(255,255,255,0.2)" rx="1" />
      {/* Bottom cap */}
      <ellipse cx="23" cy="62" rx="10" ry="3" fill="#FFD700" />
      {/* Tassel */}
      <line x1="23" y1="65" x2="23" y2="72" stroke="#FFD700" strokeWidth="2" />
      {/* Inner glow */}
      <ellipse
        cx="24"
        cy="40"
        rx="8"
        ry="15"
        fill={`rgba(255,200,100,${glowIntensity * 0.4})`}
      />
    </svg>
  );
}

// Mosque silhouette
function MosqueSilhouette({ width: w }: { width: number }) {
  return (
    <svg width={w} height={w * 0.6} viewBox="0 0 200 120" style={{ opacity: 0.1 }}>
      {/* Main dome */}
      <path d="M60,80 Q60,30 100,30 Q140,30 140,80 Z" fill="#2E7D32" />
      {/* Minarets */}
      <rect x="20" y="40" width="15" height="80" fill="#2E7D32" />
      <path d="M27,40 L20,20 L35,20 Z" fill="#2E7D32" />
      <circle cx="27" cy="15" r="5" fill="#2E7D32" />
      <rect x="165" y="40" width="15" height="80" fill="#2E7D32" />
      <path d="M172,40 L165,20 L180,20 Z" fill="#2E7D32" />
      <circle cx="172" cy="15" r="5" fill="#2E7D32" />
      {/* Small domes */}
      <ellipse cx="50" cy="80" rx="15" ry="12" fill="#2E7D32" />
      <ellipse cx="150" cy="80" rx="15" ry="12" fill="#2E7D32" />
      {/* Base */}
      <rect x="10" y="100" width="180" height="20" fill="#2E7D32" />
    </svg>
  );
}

// Geometric pattern tile
function GeometricTile({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ opacity: 0.15 }}>
      {/* 8-pointed star pattern */}
      <polygon points="20,0 25,15 40,15 28,24 32,40 20,30 8,40 12,24 0,15 15,15" fill="#2E7D32" />
      <polygon points="20,8 23,17 32,17 25,22 28,32 20,26 12,32 15,22 8,17 17,17" fill="#1B5E20" />
    </svg>
  );
}

export function IslamicDecoration({ width, height, isRamadan = false }: IslamicDecorationProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Lantern glow
  const lanternGlow = usePulse({ frequency: 0.8, min: 0.6, max: 1 });

  // Generate crescents and stars
  const crescents = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: random(`crescent-x-${i}`) * width,
      startY: random(`crescent-startY-${i}`) * (height + 100), // Pre-seeded for immediate visibility
      size: random(`crescent-size-${i}`) * 30 + 20,
      speed: random(`crescent-speed-${i}`) * 1 + 0.3,
      delay: random(`crescent-delay-${i}`) * 30, // Reduced from 200 for faster appearance
      rotationSpeed: random(`crescent-rot-${i}`) * 1 - 0.5,
      opacity: random(`crescent-opacity-${i}`) * 0.4 + 0.3,
    }));
  }, [width, height]);

  // Generate lanterns
  const lanterns = useMemo(() => {
    const colors = ['#2E7D32', '#1565C0', '#6A1B9A', '#C62828'];
    return Array.from({ length: isRamadan ? 12 : 6 }, (_, i) => ({
      id: i,
      x: width * 0.1 + (width * 0.8 / (isRamadan ? 11 : 5)) * i,
      y: 20 + random(`lantern-y-${i}`) * 30,
      size: random(`lantern-size-${i}`) * 20 + 40,
      swingPhase: random(`lantern-swing-${i}`) * Math.PI * 2,
      color: colors[i % colors.length],
    }));
  }, [width, isRamadan]);

  // Generate stars
  const stars = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: random(`star-x-${i}`) * width,
      y: random(`star-y-${i}`) * height * 0.5,
      size: random(`star-size-${i}`) * 4 + 2,
      twinklePhase: random(`star-twinkle-${i}`) * Math.PI * 2,
    }));
  }, [width, height]);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Gold and green sparkle overlay */}
      <SparkleOverlay count={30} color="#FFD700" minSize={2} maxSize={6} seed="islamic-gold" />
      <SparkleOverlay count={15} color="#2E7D32" minSize={2} maxSize={5} seed="islamic-green" />

      {/* Deep blue night sky gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(25,25,112,0.1) 0%, transparent 50%)',
        }}
      />

      {/* Twinkling stars in background */}
      {stars.map((star) => {
        const twinkle = (Math.sin(frame * 0.1 + star.twinklePhase) + 1) / 2;
        return (
          <div
            key={star.id}
            style={{
              position: 'absolute',
              left: star.x,
              top: star.y,
              width: star.size,
              height: star.size,
              backgroundColor: '#FFD700',
              borderRadius: '50%',
              opacity: 0.3 + twinkle * 0.5,
              boxShadow: `0 0 ${star.size * 2}px rgba(255,215,0,${twinkle * 0.5})`,
            }}
          />
        );
      })}

      {/* Geometric pattern border */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-around',
        }}
      >
        {Array.from({ length: Math.ceil(width / 40) }).map((_, i) => (
          <GeometricTile key={i} size={40} />
        ))}
      </div>

      {/* Floating crescents and stars */}
      {crescents.map((crescent) => {
        // Float upward - pre-seeded for immediate visibility
        const yOffset = (crescent.startY + (frame + crescent.delay) * crescent.speed) % (height + 100);
        const currentY = height - yOffset + 50;
        const xSway = Math.sin((frame + crescent.delay) * 0.015) * 30;
        const rotation = (frame + crescent.delay) * crescent.rotationSpeed;

        return (
          <div
            key={crescent.id}
            style={{
              position: 'absolute',
              left: crescent.x + xSway,
              top: currentY,
              transform: `rotate(${rotation}deg)`,
            }}
          >
            <CrescentStar size={crescent.size} color="#2E7D32" opacity={crescent.opacity} />
          </div>
        );
      })}

      {/* Hanging lanterns */}
      {lanterns.map((lantern) => {
        const swing = Math.sin(frame * 0.025 + lantern.swingPhase) * 6;
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
            <LanternSVG size={lantern.size} glowIntensity={lanternGlow} color={lantern.color} />
          </div>
        );
      })}

      {/* Mosque silhouette at bottom */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 0,
          transform: 'translateX(-50%)',
        }}
      >
        <MosqueSilhouette width={width * 0.6} />
      </div>

      {/* Golden particles */}
      {Array.from({ length: 25 }).map((_, i) => {
        const x = random(`gold-x-${i}`) * width;
        const yOffset = ((frame + i * 40) * 0.5) % (height + 50);
        const currentY = height - yOffset;
        const twinkle = (Math.sin(frame * 0.15 + i) + 1) / 2;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: currentY,
              width: 6,
              height: 6,
              backgroundColor: '#FFD700',
              borderRadius: '50%',
              opacity: 0.3 + twinkle * 0.4,
              boxShadow: '0 0 8px rgba(255,215,0,0.5)',
            }}
          />
        );
      })}

      {/* Greeting text watermark */}
      <div
        style={{
          position: 'absolute',
          right: 30,
          bottom: 30,
          fontSize: 32,
          fontFamily: 'serif',
          opacity: 0.08,
          color: '#2E7D32',
        }}
      >
        {isRamadan ? 'رمضان كريم' : 'عيد مبارك'}
      </div>
    </AbsoluteFill>
  );
}

// Export specific decorations
export function EidDecoration(props: Omit<IslamicDecorationProps, 'isRamadan'>) {
  return <IslamicDecoration {...props} isRamadan={false} />;
}

export function RamadanDecoration(props: Omit<IslamicDecorationProps, 'isRamadan'>) {
  return <IslamicDecoration {...props} isRamadan={true} />;
}
