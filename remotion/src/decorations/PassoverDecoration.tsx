import { AbsoluteFill, useCurrentFrame, useVideoConfig, random } from 'remotion';
import { useMemo } from 'react';
import { usePulse } from '../utils/animations';

interface PassoverDecorationProps {
  width: number;
  height: number;
}

// Matzah SVG
function MatzahSVG({ size, opacity }: { size: number; opacity: number }) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 60 42" style={{ opacity }}>
      {/* Matzah base */}
      <rect x="2" y="2" width="56" height="38" rx="3" fill="#E8DCC8" stroke="#D4C4A8" strokeWidth="2" />
      {/* Texture lines - horizontal */}
      <line x1="5" y1="10" x2="55" y2="10" stroke="#C9B896" strokeWidth="1" />
      <line x1="5" y1="21" x2="55" y2="21" stroke="#C9B896" strokeWidth="1" />
      <line x1="5" y1="32" x2="55" y2="32" stroke="#C9B896" strokeWidth="1" />
      {/* Texture dots (perforation pattern) */}
      {[0, 1, 2, 3, 4].map((row) =>
        [0, 1, 2, 3, 4, 5, 6, 7].map((col) => (
          <circle
            key={`${row}-${col}`}
            cx={10 + col * 6}
            cy={8 + row * 7}
            r="1.5"
            fill="#B8A67A"
          />
        ))
      )}
      {/* Slight browning spots */}
      <circle cx="15" cy="15" r="3" fill="#C4A55A" opacity={0.4} />
      <circle cx="45" cy="28" r="4" fill="#C4A55A" opacity={0.3} />
      <circle cx="30" cy="35" r="2" fill="#C4A55A" opacity={0.4} />
    </svg>
  );
}

// Wine Cup SVG
function WineCupSVG({ size, wineLevel }: { size: number; wineLevel: number }) {
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 40 52">
      {/* Cup bowl */}
      <path
        d="M5,8 L8,35 Q10,40 20,40 Q30,40 32,35 L35,8 Q35,5 20,5 Q5,5 5,8"
        fill="rgba(255,215,0,0.3)"
        stroke="#DAA520"
        strokeWidth="2"
      />
      {/* Wine */}
      <path
        d={`M8,${35 - wineLevel * 20} L10,35 Q12,38 20,38 Q28,38 30,35 L32,${35 - wineLevel * 20} Q32,${33 - wineLevel * 18} 20,${33 - wineLevel * 18} Q8,${33 - wineLevel * 18} 8,${35 - wineLevel * 20}`}
        fill="#722F37"
      />
      {/* Stem */}
      <rect x="17" y="40" width="6" height="8" fill="#DAA520" />
      {/* Base */}
      <ellipse cx="20" cy="50" rx="12" ry="3" fill="#DAA520" />
      {/* Rim highlight */}
      <ellipse cx="20" cy="6" rx="13" ry="2" fill="rgba(255,255,255,0.3)" />
    </svg>
  );
}

// Seder Plate SVG (simplified)
function SederPlateSVG({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {/* Plate */}
      <ellipse cx="50" cy="50" rx="45" ry="40" fill="#F5F5DC" stroke="#DAA520" strokeWidth="3" />
      <ellipse cx="50" cy="50" rx="38" ry="33" fill="none" stroke="#DAA520" strokeWidth="1" />

      {/* Small bowls with items */}
      {/* Egg (Beitzah) */}
      <circle cx="50" cy="25" r="8" fill="#FFF8DC" stroke="#D4C4A8" />
      <ellipse cx="50" cy="24" rx="5" ry="4" fill="#FAEBD7" />

      {/* Shank bone (Zeroa) */}
      <ellipse cx="30" cy="35" rx="7" ry="5" fill="#8B4513" />

      {/* Bitter herbs (Maror) */}
      <circle cx="70" cy="35" r="7" fill="#228B22" />

      {/* Charoset */}
      <circle cx="25" cy="55" r="7" fill="#8B6914" />

      {/* Karpas */}
      <circle cx="75" cy="55" r="7" fill="#90EE90" />

      {/* Chazeret */}
      <circle cx="50" cy="70" r="7" fill="#32CD32" />
    </svg>
  );
}

// Star of David SVG
function StarOfDavidSVG({ size, color, opacity }: { size: number; color: string; opacity: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" style={{ opacity }}>
      <polygon points="25,5 45,40 5,40" fill="none" stroke={color} strokeWidth="2" />
      <polygon points="25,45 45,10 5,10" fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

// Parsley/Karpas SVG
function ParsleySVG({ size, rotation }: { size: number; rotation: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 40"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Stem */}
      <path d="M15,40 Q14,30 15,20" stroke="#228B22" strokeWidth="2" fill="none" />
      {/* Leaves */}
      <ellipse cx="10" cy="15" rx="6" ry="10" fill="#32CD32" transform="rotate(-20 10 15)" />
      <ellipse cx="20" cy="15" rx="6" ry="10" fill="#32CD32" transform="rotate(20 20 15)" />
      <ellipse cx="15" cy="8" rx="5" ry="8" fill="#3CB371" />
    </svg>
  );
}

export function PassoverDecoration({ width, height }: PassoverDecorationProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Wine level animation
  const wineLevel = usePulse({ frequency: 0.3, min: 0.6, max: 0.9 });

  // Generate floating matzah pieces
  const matzahs = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: random(`matzah-x-${i}`) * width,
      startY: random(`matzah-startY-${i}`) * (height + 100),
      size: random(`matzah-size-${i}`) * 30 + 40,
      speed: random(`matzah-speed-${i}`) * 0.8 + 0.3,
      delay: random(`matzah-delay-${i}`) * 30,
      rotation: random(`matzah-rot-${i}`) * 20 - 10,
      opacity: random(`matzah-opacity-${i}`) * 0.3 + 0.5,
    }));
  }, [width, height]);

  // Generate wine cups
  const wineCups = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: random(`cup-x-${i}`) * width * 0.8 + width * 0.1,
      startY: random(`cup-startY-${i}`) * (height + 100),
      size: random(`cup-size-${i}`) * 20 + 35,
      speed: random(`cup-speed-${i}`) * 0.6 + 0.2,
      delay: random(`cup-delay-${i}`) * 30,
    }));
  }, [width, height]);

  // Generate Stars of David
  const stars = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: random(`star-x-${i}`) * width,
      startY: random(`star-startY-${i}`) * (height + 100),
      size: random(`star-size-${i}`) * 25 + 20,
      speed: random(`star-speed-${i}`) * 1 + 0.4,
      delay: random(`star-delay-${i}`) * 30,
      rotationSpeed: random(`star-rot-${i}`) * 2 - 1,
      opacity: random(`star-opacity-${i}`) * 0.3 + 0.2,
    }));
  }, [width, height]);

  // Generate parsley/herbs
  const parsley = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: random(`parsley-x-${i}`) * width,
      startY: random(`parsley-startY-${i}`) * (height + 100),
      size: random(`parsley-size-${i}`) * 15 + 20,
      speed: random(`parsley-speed-${i}`) * 1.5 + 0.5,
      delay: random(`parsley-delay-${i}`) * 30,
      rotation: random(`parsley-rot-${i}`) * 360,
      rotationSpeed: random(`parsley-rot-speed-${i}`) * 3 - 1.5,
      swayAmplitude: random(`parsley-sway-${i}`) * 30 + 15,
    }));
  }, [width, height]);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Warm beige gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(139,69,19,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Floating Stars of David */}
      {stars.map((star) => {
        const yOffset = (star.startY + (frame + star.delay) * star.speed) % (height + 100);
        const currentY = yOffset - 50;
        const xSway = Math.sin((frame + star.delay) * 0.015) * 25;
        const rotation = (frame + star.delay) * star.rotationSpeed;

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
            <StarOfDavidSVG size={star.size} color="#8B4513" opacity={star.opacity} />
          </div>
        );
      })}

      {/* Floating parsley */}
      {parsley.map((herb) => {
        const yOffset = (herb.startY + (frame + herb.delay) * herb.speed) % (height + 100);
        const currentY = yOffset - 50;
        const xSway = Math.sin((frame + herb.delay) * 0.02) * herb.swayAmplitude;
        const rotation = herb.rotation + frame * herb.rotationSpeed;

        return (
          <div
            key={`parsley-${herb.id}`}
            style={{
              position: 'absolute',
              left: herb.x + xSway,
              top: currentY,
            }}
          >
            <ParsleySVG size={herb.size} rotation={rotation} />
          </div>
        );
      })}

      {/* Floating matzah */}
      {matzahs.map((matzah) => {
        const yOffset = (matzah.startY + (frame + matzah.delay) * matzah.speed) % (height + 100);
        const currentY = yOffset - 50;
        const xSway = Math.sin((frame + matzah.delay) * 0.01) * 20;

        return (
          <div
            key={`matzah-${matzah.id}`}
            style={{
              position: 'absolute',
              left: matzah.x + xSway,
              top: currentY,
              transform: `rotate(${matzah.rotation}deg)`,
            }}
          >
            <MatzahSVG size={matzah.size} opacity={matzah.opacity} />
          </div>
        );
      })}

      {/* Floating wine cups */}
      {wineCups.map((cup) => {
        const yOffset = (cup.startY + (frame + cup.delay) * cup.speed) % (height + 100);
        const currentY = yOffset - 50;
        const xSway = Math.sin((frame + cup.delay) * 0.008) * 15;

        return (
          <div
            key={`cup-${cup.id}`}
            style={{
              position: 'absolute',
              left: cup.x + xSway,
              top: currentY,
            }}
          >
            <WineCupSVG size={cup.size} wineLevel={wineLevel} />
          </div>
        );
      })}

      {/* Seder plate in corner */}
      <div
        style={{
          position: 'absolute',
          right: 20,
          bottom: 20,
          opacity: 0.12,
        }}
      >
        <SederPlateSVG size={180} />
      </div>

      {/* Four cups indicator in other corner */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          bottom: 20,
          display: 'flex',
          gap: 8,
          opacity: 0.15,
        }}
      >
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ transform: `translateY(${i % 2 === 0 ? 0 : -5}px)` }}>
            <WineCupSVG size={30} wineLevel={0.8} />
          </div>
        ))}
      </div>

      {/* Hebrew watermark */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 20,
          fontSize: 24,
          fontFamily: 'serif',
          opacity: 0.08,
          color: '#8B4513',
        }}
      >
        חג פסח שמח
      </div>
    </AbsoluteFill>
  );
}
