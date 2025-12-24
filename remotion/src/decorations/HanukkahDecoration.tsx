import { AbsoluteFill, useCurrentFrame, useVideoConfig, random, interpolate } from 'remotion';
import { useMemo } from 'react';
import { usePulse } from '../utils/animations';
import { SparkleOverlay, GlowPulse, Flicker } from '../utils/decorationAnimations';

interface HanukkahDecorationProps {
  width: number;
  height: number;
}

// Menorah SVG
function MenorahSVG({ size, litCandles, flameIntensity }: { size: number; litCandles: number; flameIntensity: number }) {
  const candlePositions = [-4, -3, -2, -1, 0, 1, 2, 3, 4]; // Including shamash (center, taller)

  return (
    <svg width={size} height={size * 0.8} viewBox="0 0 200 160">
      {/* Base */}
      <rect x="85" y="140" width="30" height="15" rx="3" fill="#FFD700" />
      <ellipse cx="100" cy="155" rx="40" ry="8" fill="#FFD700" />

      {/* Main stem */}
      <rect x="95" y="80" width="10" height="65" fill="#FFD700" />

      {/* Arms */}
      <path
        d="M100,100 Q60,100 40,70 L40,50"
        stroke="#FFD700"
        strokeWidth="6"
        fill="none"
      />
      <path
        d="M100,100 Q140,100 160,70 L160,50"
        stroke="#FFD700"
        strokeWidth="6"
        fill="none"
      />
      <path d="M100,90 Q70,90 55,65 L55,50" stroke="#FFD700" strokeWidth="6" fill="none" />
      <path d="M100,90 Q130,90 145,65 L145,50" stroke="#FFD700" strokeWidth="6" fill="none" />
      <path d="M100,85 Q80,85 70,60 L70,50" stroke="#FFD700" strokeWidth="6" fill="none" />
      <path d="M100,85 Q120,85 130,60 L130,50" stroke="#FFD700" strokeWidth="6" fill="none" />
      <path d="M100,82 Q90,82 85,55 L85,50" stroke="#FFD700" strokeWidth="6" fill="none" />
      <path d="M100,82 Q110,82 115,55 L115,50" stroke="#FFD700" strokeWidth="6" fill="none" />

      {/* Candles and flames */}
      {candlePositions.map((pos, i) => {
        const x = 100 + pos * 15;
        const isShemash = pos === 0;
        const candleHeight = isShemash ? 40 : 30;
        const baseY = isShemash ? 35 : 50;
        const isLit = i < litCandles || isShemash;

        return (
          <g key={i}>
            {/* Candle */}
            <rect
              x={x - 4}
              y={baseY}
              width="8"
              height={candleHeight}
              fill="#4169E1"
              rx="2"
            />
            {/* Flame */}
            {isLit && (
              <>
                <ellipse
                  cx={x}
                  cy={baseY - 8 - flameIntensity * 3}
                  rx="4"
                  ry={8 + flameIntensity * 2}
                  fill="#FFD700"
                  opacity={0.9}
                />
                <ellipse
                  cx={x}
                  cy={baseY - 5 - flameIntensity * 2}
                  rx="2"
                  ry={5 + flameIntensity}
                  fill="#FFA500"
                />
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// Star of David SVG
function StarOfDavid({ size, color, opacity }: { size: number; color: string; opacity: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" style={{ opacity }}>
      {/* Two overlapping triangles */}
      <polygon points="25,5 45,40 5,40" fill="none" stroke={color} strokeWidth="2" />
      <polygon points="25,45 45,10 5,10" fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

// Dreidel SVG
function DreidelSVG({ size, rotation }: { size: number; rotation: number }) {
  return (
    <svg
      width={size}
      height={size * 1.3}
      viewBox="0 0 40 52"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* Handle */}
      <rect x="16" y="2" width="8" height="12" fill="#4169E1" rx="2" />
      {/* Body */}
      <rect x="8" y="14" width="24" height="24" fill="#4169E1" rx="3" />
      {/* Point */}
      <polygon points="20,38 8,38 20,50 32,38" fill="#4169E1" />
      {/* Hebrew letter */}
      <text x="20" y="32" textAnchor="middle" fontSize="16" fill="#FFD700" fontWeight="bold">
        ג
      </text>
    </svg>
  );
}

export function HanukkahDecoration({ width, height }: HanukkahDecorationProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Flame flicker
  const flameFlicker = usePulse({ frequency: 6, min: 0.7, max: 1.3 });

  // Calculate lit candles based on progress (1-8)
  const litCandles = Math.min(8, Math.floor((frame / durationInFrames) * 9) + 1);

  // Generate floating Stars of David
  const stars = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: random(`star-x-${i}`) * width,
      startY: random(`star-startY-${i}`) * (height + 100), // Pre-seeded for immediate visibility
      size: random(`star-size-${i}`) * 30 + 20,
      speed: random(`star-speed-${i}`) * 1 + 0.3,
      delay: random(`star-delay-${i}`) * 30, // Reduced from 200 for faster appearance
      rotationSpeed: random(`star-rot-${i}`) * 2 - 1,
      opacity: random(`star-opacity-${i}`) * 0.4 + 0.3,
    }));
  }, [width, height]);

  // Generate dreidels
  const dreidels = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: random(`dreidel-x-${i}`) * width * 0.8 + width * 0.1,
      startY: random(`dreidel-startY-${i}`) * (height + 100), // Pre-seeded for immediate visibility
      size: random(`dreidel-size-${i}`) * 20 + 25,
      speed: random(`dreidel-speed-${i}`) * 1.5 + 0.5,
      delay: random(`dreidel-delay-${i}`) * 30, // Reduced from 150 for faster appearance
      spinSpeed: random(`dreidel-spin-${i}`) * 8 + 4,
    }));
  }, [width, height]);

  // Gelt (coins)
  const gelt = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: random(`gelt-x-${i}`) * width,
      startY: random(`gelt-startY-${i}`) * (height + 50), // Pre-seeded for immediate visibility
      size: random(`gelt-size-${i}`) * 15 + 15,
      speed: random(`gelt-speed-${i}`) * 2 + 1,
      delay: random(`gelt-delay-${i}`) * 30, // Reduced from 100 for faster appearance
    }));
  }, [width, height]);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Blue and gold sparkle overlay */}
      <SparkleOverlay count={30} color="#4169E1" minSize={2} maxSize={6} seed="hanukkah-sparkle" />
      <SparkleOverlay count={15} color="#FFD700" minSize={3} maxSize={5} seed="hanukkah-gold" />

      {/* Blue gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(65,105,225,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Floating Stars of David */}
      {stars.map((star) => {
        // Pre-seeded Y position for immediate visibility
        const yOffset = (star.startY + (frame + star.delay) * star.speed) % (height + 100);
        const currentY = yOffset - 50;
        const xSway = Math.sin((frame + star.delay) * 0.015) * 30;
        const rotation = (frame + star.delay) * star.rotationSpeed;

        return (
          <div
            key={star.id}
            style={{
              position: 'absolute',
              left: star.x + xSway,
              top: currentY,
              transform: `rotate(${rotation}deg)`,
            }}
          >
            <StarOfDavid size={star.size} color="#4169E1" opacity={star.opacity} />
          </div>
        );
      })}

      {/* Spinning dreidels */}
      {dreidels.map((dreidel) => {
        // Pre-seeded Y position for immediate visibility
        const yOffset = (dreidel.startY + (frame + dreidel.delay) * dreidel.speed) % (height + 100);
        const currentY = yOffset - 50;
        const xSway = Math.sin((frame + dreidel.delay) * 0.02) * 20;
        const rotation = (frame + dreidel.delay) * dreidel.spinSpeed;

        return (
          <div
            key={dreidel.id}
            style={{
              position: 'absolute',
              left: dreidel.x + xSway,
              top: currentY,
            }}
          >
            <DreidelSVG size={dreidel.size} rotation={rotation} />
          </div>
        );
      })}

      {/* Falling gelt */}
      {gelt.map((coin) => {
        // Pre-seeded Y position for immediate visibility
        const yOffset = (coin.startY + (frame + coin.delay) * coin.speed) % (height + 50);
        const currentY = yOffset - 25;
        const xSway = Math.sin((frame + coin.delay) * 0.03) * 15;
        const spin = frame * 4 + coin.delay;
        const scaleX = Math.cos(spin * Math.PI / 180);

        return (
          <div
            key={coin.id}
            style={{
              position: 'absolute',
              left: coin.x + xSway,
              top: currentY,
              transform: `scaleX(${scaleX})`,
            }}
          >
            <div
              style={{
                width: coin.size,
                height: coin.size,
                backgroundColor: '#FFD700',
                borderRadius: '50%',
                border: '2px solid #DAA520',
                boxShadow: '0 0 8px rgba(255,215,0,0.4)',
              }}
            />
          </div>
        );
      })}

      {/* Menorah at bottom center with enhanced glow */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 20,
          transform: 'translateX(-50%)',
        }}
      >
        <GlowPulse color="rgba(255, 215, 0, 0.5)" minGlow={15} maxGlow={40} frequency={0.4}>
          <Flicker intensity={0.15} speed={8} seed="menorah">
            <MenorahSVG size={200} litCandles={litCandles} flameIntensity={flameFlicker} />
          </Flicker>
        </GlowPulse>
      </div>

      {/* Light rays from menorah */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 100,
          transform: 'translateX(-50%)',
          width: 300,
          height: 200,
          background: `radial-gradient(ellipse at center bottom, rgba(255,215,0,${0.1 * flameFlicker}) 0%, transparent 70%)`,
        }}
      />

      {/* "Happy Hanukkah" watermark */}
      <div
        style={{
          position: 'absolute',
          left: 20,
          top: 20,
          fontSize: 24,
          fontFamily: 'serif',
          opacity: 0.08,
          color: '#4169E1',
        }}
      >
        חג חנוכה שמח
      </div>
    </AbsoluteFill>
  );
}
