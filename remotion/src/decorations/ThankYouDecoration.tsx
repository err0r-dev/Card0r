import { AbsoluteFill, useCurrentFrame, useVideoConfig, random, interpolate } from 'remotion';
import { useMemo } from 'react';
import { usePulse } from '../utils/animations';
import { SparkleOverlay, GlowPulse, ScalePulse, FloatMotion } from '../utils/decorationAnimations';

interface ThankYouDecorationProps {
  width: number;
  height: number;
}

// Heart SVG (reused pattern from ValentinesDecoration)
function HeartSVG({ size, color, opacity }: { size: number; color: string; opacity: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ opacity }}>
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={color}
        filter={`drop-shadow(0 0 ${size / 6}px ${color}40)`}
      />
    </svg>
  );
}

// Flower SVG
function FlowerSVG({ size, color, opacity }: { size: number; color: string; opacity: number }) {
  const petalColors = ['#FF69B4', '#FFB6C1', '#FFC0CB', '#FF1493', '#DB7093'];
  const petalColor = color || petalColors[0];

  return (
    <svg width={size} height={size} viewBox="0 0 50 50" style={{ opacity }}>
      {/* Petals */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <ellipse
          key={i}
          cx="25"
          cy="12"
          rx="8"
          ry="12"
          fill={petalColor}
          transform={`rotate(${angle} 25 25)`}
          opacity={0.8}
        />
      ))}
      {/* Center */}
      <circle cx="25" cy="25" r="8" fill="#FFD700" />
      <circle cx="25" cy="25" r="5" fill="#FFA500" />
    </svg>
  );
}

// Ribbon SVG
function RibbonSVG({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 60 36">
      {/* Bow center */}
      <ellipse cx="30" cy="18" rx="6" ry="5" fill={color} />
      {/* Left loop */}
      <path
        d="M30,18 Q15,5 5,18 Q15,30 30,18"
        fill={color}
        opacity={0.9}
      />
      {/* Right loop */}
      <path
        d="M30,18 Q45,5 55,18 Q45,30 30,18"
        fill={color}
        opacity={0.9}
      />
      {/* Tails */}
      <path d="M26,22 Q20,28 18,35" stroke={color} strokeWidth="4" fill="none" />
      <path d="M34,22 Q40,28 42,35" stroke={color} strokeWidth="4" fill="none" />
    </svg>
  );
}

// Sparkle SVG
function SparkleSVG({ size, opacity }: { size: number; opacity: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ opacity }}>
      <polygon points="12,2 14,10 22,12 14,14 12,22 10,14 2,12 10,10" fill="#FFD700" />
    </svg>
  );
}

// Confetti piece
function ConfettiPiece({ size, color, rotation }: { size: number; color: string; rotation: number }) {
  return (
    <div
      style={{
        width: size,
        height: size * 2,
        backgroundColor: color,
        borderRadius: 2,
        transform: `rotate(${rotation}deg)`,
        opacity: 0.8,
      }}
    />
  );
}

// Gift box SVG
function GiftBoxSVG({ size, opacity }: { size: number; opacity: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" style={{ opacity }}>
      {/* Box */}
      <rect x="5" y="20" width="40" height="28" rx="2" fill="#FF69B4" />
      {/* Lid */}
      <rect x="3" y="14" width="44" height="8" rx="2" fill="#FF1493" />
      {/* Ribbon vertical */}
      <rect x="22" y="14" width="6" height="34" fill="#FFD700" />
      {/* Ribbon horizontal */}
      <rect x="3" y="16" width="44" height="4" fill="#FFD700" />
      {/* Bow */}
      <ellipse cx="25" cy="12" rx="4" ry="3" fill="#FFD700" />
      <ellipse cx="18" cy="10" rx="5" ry="4" fill="#FFD700" />
      <ellipse cx="32" cy="10" rx="5" ry="4" fill="#FFD700" />
    </svg>
  );
}

export function ThankYouDecoration({ width, height }: ThankYouDecorationProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Heart pulse
  const heartPulse = usePulse({ frequency: 1.2, min: 0.9, max: 1.1 });

  // Generate floating hearts
  const hearts = useMemo(() => {
    const colors = ['#FF69B4', '#FFB6C1', '#FF1493', '#FFC0CB', '#e53e3e'];
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: random(`heart-x-${i}`) * width,
      startY: random(`heart-startY-${i}`) * (height + 100),
      size: random(`heart-size-${i}`) * 20 + 15,
      color: colors[Math.floor(random(`heart-color-${i}`) * colors.length)],
      speed: random(`heart-speed-${i}`) * 1.2 + 0.4,
      delay: random(`heart-delay-${i}`) * 30,
      swayAmplitude: random(`heart-sway-${i}`) * 25 + 10,
      swaySpeed: random(`heart-sway-speed-${i}`) * 0.02 + 0.01,
      opacity: random(`heart-opacity-${i}`) * 0.4 + 0.5,
      rotation: random(`heart-rot-${i}`) * 30 - 15,
    }));
  }, [width, height]);

  // Generate flowers
  const flowers = useMemo(() => {
    const colors = ['#FF69B4', '#FFB6C1', '#DDA0DD', '#FFC0CB', '#FF1493'];
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: random(`flower-x-${i}`) * width,
      startY: random(`flower-startY-${i}`) * (height + 100),
      size: random(`flower-size-${i}`) * 25 + 25,
      color: colors[Math.floor(random(`flower-color-${i}`) * colors.length)],
      speed: random(`flower-speed-${i}`) * 1 + 0.3,
      delay: random(`flower-delay-${i}`) * 30,
      rotation: random(`flower-rot-${i}`) * 360,
      rotationSpeed: random(`flower-rot-speed-${i}`) * 2 - 1,
      opacity: random(`flower-opacity-${i}`) * 0.3 + 0.5,
    }));
  }, [width, height]);

  // Generate confetti
  const confetti = useMemo(() => {
    const colors = ['#FF69B4', '#FFD700', '#87CEEB', '#98FB98', '#DDA0DD', '#FFB6C1'];
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: random(`confetti-x-${i}`) * width,
      startY: random(`confetti-startY-${i}`) * (height + 100),
      size: random(`confetti-size-${i}`) * 6 + 4,
      color: colors[Math.floor(random(`confetti-color-${i}`) * colors.length)],
      speed: random(`confetti-speed-${i}`) * 2 + 1,
      delay: random(`confetti-delay-${i}`) * 30,
      rotation: random(`confetti-rot-${i}`) * 360,
      rotationSpeed: random(`confetti-rot-speed-${i}`) * 8 - 4,
      swayAmplitude: random(`confetti-sway-${i}`) * 40 + 20,
    }));
  }, [width, height]);

  // Generate sparkles
  const sparkles = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: random(`sparkle-x-${i}`) * width,
      y: random(`sparkle-y-${i}`) * height,
      size: random(`sparkle-size-${i}`) * 10 + 6,
      phase: random(`sparkle-phase-${i}`) * Math.PI * 2,
    }));
  }, [width, height]);

  // Generate ribbons
  const ribbons = useMemo(() => {
    const colors = ['#FF69B4', '#FFD700', '#87CEEB', '#DDA0DD'];
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: random(`ribbon-x-${i}`) * width * 0.8 + width * 0.1,
      startY: random(`ribbon-startY-${i}`) * (height + 80),
      size: random(`ribbon-size-${i}`) * 30 + 40,
      color: colors[Math.floor(random(`ribbon-color-${i}`) * colors.length)],
      speed: random(`ribbon-speed-${i}`) * 0.8 + 0.3,
      delay: random(`ribbon-delay-${i}`) * 30,
      swayAmplitude: random(`ribbon-sway-${i}`) * 20 + 10,
    }));
  }, [width, height]);

  // Gift boxes
  const gifts = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: random(`gift-x-${i}`) * width * 0.7 + width * 0.15,
      startY: random(`gift-startY-${i}`) * (height + 80),
      size: random(`gift-size-${i}`) * 25 + 35,
      speed: random(`gift-speed-${i}`) * 0.5 + 0.2,
      delay: random(`gift-delay-${i}`) * 30,
      opacity: random(`gift-opacity-${i}`) * 0.3 + 0.5,
    }));
  }, [width, height]);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Pink and gold sparkle overlay */}
      <SparkleOverlay count={30} color="#FF69B4" minSize={3} maxSize={7} seed="thankyou-pink" />
      <SparkleOverlay count={20} color="#FFD700" minSize={2} maxSize={5} seed="thankyou-gold" />

      {/* Soft pink gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(255,182,193,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Falling confetti */}
      {confetti.map((piece) => {
        const yOffset = (piece.startY + (frame + piece.delay) * piece.speed) % (height + 100);
        const currentY = yOffset - 50;
        const xSway = Math.sin((frame + piece.delay) * 0.03) * piece.swayAmplitude;
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
            <ConfettiPiece size={piece.size} color={piece.color} rotation={rotation} />
          </div>
        );
      })}

      {/* Floating hearts (going UP) */}
      {hearts.map((heart) => {
        const yOffset = (heart.startY + (frame + heart.delay) * heart.speed) % (height + 100);
        const currentY = height - yOffset + 50;
        const xSway = Math.sin((frame + heart.delay) * heart.swaySpeed) * heart.swayAmplitude;
        const shouldPulse = heart.id % 4 === 0;

        return (
          <div
            key={`heart-${heart.id}`}
            style={{
              position: 'absolute',
              left: heart.x + xSway,
              top: currentY,
              transform: `rotate(${heart.rotation}deg) scale(${shouldPulse ? heartPulse : 1})`,
            }}
          >
            <HeartSVG size={heart.size} color={heart.color} opacity={heart.opacity} />
          </div>
        );
      })}

      {/* Floating flowers */}
      {flowers.map((flower) => {
        const yOffset = (flower.startY + (frame + flower.delay) * flower.speed) % (height + 100);
        const currentY = yOffset - 50;
        const xSway = Math.sin((frame + flower.delay) * 0.015) * 25;
        const rotation = flower.rotation + frame * flower.rotationSpeed;

        return (
          <div
            key={`flower-${flower.id}`}
            style={{
              position: 'absolute',
              left: flower.x + xSway,
              top: currentY,
              transform: `rotate(${rotation}deg)`,
            }}
          >
            <FlowerSVG size={flower.size} color={flower.color} opacity={flower.opacity} />
          </div>
        );
      })}

      {/* Floating ribbons */}
      {ribbons.map((ribbon) => {
        const yOffset = (ribbon.startY + (frame + ribbon.delay) * ribbon.speed) % (height + 80);
        const currentY = yOffset - 40;
        const xSway = Math.sin((frame + ribbon.delay) * 0.012) * ribbon.swayAmplitude;

        return (
          <div
            key={`ribbon-${ribbon.id}`}
            style={{
              position: 'absolute',
              left: ribbon.x + xSway,
              top: currentY,
            }}
          >
            <RibbonSVG size={ribbon.size} color={ribbon.color} />
          </div>
        );
      })}

      {/* Floating gift boxes */}
      {gifts.map((gift) => {
        const yOffset = (gift.startY + (frame + gift.delay) * gift.speed) % (height + 80);
        const currentY = yOffset - 40;
        const xSway = Math.sin((frame + gift.delay) * 0.01) * 15;

        return (
          <div
            key={`gift-${gift.id}`}
            style={{
              position: 'absolute',
              left: gift.x + xSway,
              top: currentY,
            }}
          >
            <GiftBoxSVG size={gift.size} opacity={gift.opacity} />
          </div>
        );
      })}

      {/* Twinkling sparkles */}
      {sparkles.map((sparkle) => {
        const twinkle = (Math.sin(frame * 0.12 + sparkle.phase) + 1) / 2;
        const scale = 0.5 + twinkle * 0.7;
        const opacity = 0.3 + twinkle * 0.7;

        return (
          <div
            key={`sparkle-${sparkle.id}`}
            style={{
              position: 'absolute',
              left: sparkle.x,
              top: sparkle.y,
              transform: `scale(${scale})`,
              opacity,
            }}
          >
            <SparkleSVG size={sparkle.size} opacity={1} />
          </div>
        );
      })}

      {/* Large decorative heart in corner */}
      <div
        style={{
          position: 'absolute',
          right: -20,
          bottom: -20,
          opacity: 0.08,
          transform: `scale(${heartPulse})`,
        }}
      >
        <HeartSVG size={180} color="#e53e3e" opacity={1} />
      </div>

      {/* "Thank You" watermark */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 20,
          fontSize: 32,
          fontWeight: 'bold',
          fontFamily: 'cursive, sans-serif',
          opacity: 0.06,
          color: '#e53e3e',
          letterSpacing: 2,
        }}
      >
        Thank You
      </div>
    </AbsoluteFill>
  );
}
