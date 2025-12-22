import { AbsoluteFill, useCurrentFrame, useVideoConfig, random } from 'remotion';
import type { HolidayTheme } from '@card0r/shared';
import { HOLIDAY_COLORS } from '../types';
import { useMemo } from 'react';
import { usePulse } from '../utils/animations';

interface ParticleDecorationProps {
  theme: HolidayTheme;
  particleCount?: number;
  enableSparkle?: boolean;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  startY: number; // Pre-seeded Y position for immediate visibility
  size: number;
  speed: number;
  color: string;
  delay: number;
  swayAmplitude: number;
  swaySpeed: number;
  opacity: number;
  sparklePhase: number;
  type: 'circle' | 'star' | 'diamond' | 'snowflake' | 'heart' | 'leaf';
}

// SVG shapes for different particle types
function ParticleShape({ type, size, color }: { type: Particle['type']; size: number; color: string }) {
  switch (type) {
    case 'star':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <polygon points="12,2 15,9 22,9 17,14 19,22 12,18 5,22 7,14 2,9 9,9" />
        </svg>
      );
    case 'diamond':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <polygon points="12,2 22,12 12,22 2,12" />
        </svg>
      );
    case 'snowflake':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <line x1="12" y1="2" x2="12" y2="22" stroke={color} strokeWidth="2" />
          <line x1="2" y1="12" x2="22" y2="12" stroke={color} strokeWidth="2" />
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke={color} strokeWidth="2" />
          <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" stroke={color} strokeWidth="2" />
          <circle cx="12" cy="12" r="3" fill={color} />
        </svg>
      );
    case 'heart':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );
    case 'leaf':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
          <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
        </svg>
      );
    case 'circle':
    default:
      return null; // Use CSS for circles
  }
}

function getThemeParticleTypes(theme: HolidayTheme): Particle['type'][] {
  switch (theme) {
    case 'christmas':
      return ['snowflake', 'circle', 'star', 'circle', 'circle'];
    case 'new_year':
      return ['star', 'diamond', 'circle', 'star'];
    case 'valentines':
      return ['heart', 'circle', 'heart', 'circle'];
    case 'easter':
      return ['circle', 'diamond', 'circle'];
    case 'halloween':
      return ['circle', 'star', 'diamond'];
    case 'thanksgiving':
      return ['leaf', 'circle', 'leaf', 'circle'];
    case 'hanukkah':
      return ['star', 'circle', 'star'];
    case 'diwali':
      return ['star', 'diamond', 'circle', 'star'];
    case 'chinese_new_year':
    case 'lunar_new_year':
      return ['circle', 'star', 'diamond'];
    case 'eid_al_fitr':
    case 'eid_al_adha':
      return ['star', 'circle', 'star'];
    case 'ramadan':
      return ['star', 'circle'];
    default:
      return ['circle', 'star'];
  }
}

export function ParticleDecoration({ theme, particleCount = 100, enableSparkle = true }: ParticleDecorationProps) {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const colors = HOLIDAY_COLORS[theme];

  // Sparkle pulse for twinkling effect
  const sparkleIntensity = usePulse({ frequency: 2, min: 0.6, max: 1 });

  // Generate particles deterministically based on theme
  const particles = useMemo(() => {
    const particleColors = [colors.primary, colors.secondary, colors.accent, '#ffffff'];
    const particleTypes = getThemeParticleTypes(theme);
    const result: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const typeIndex = Math.floor(random(`type-${theme}-${i}`) * particleTypes.length);
      result.push({
        id: i,
        x: random(`x-${theme}-${i}`) * width,
        y: random(`y-${theme}-${i}`) * height,
        startY: random(`startY-${theme}-${i}`) * (height + 100), // Pre-seeded for immediate visibility
        size: random(`size-${theme}-${i}`) * 10 + 4, // 4-14px
        speed: random(`speed-${theme}-${i}`) * 2 + 0.3,
        color: particleColors[Math.floor(random(`color-${theme}-${i}`) * particleColors.length)],
        delay: random(`delay-${theme}-${i}`) * 30, // Reduced from 150 for faster appearance
        swayAmplitude: random(`sway-amp-${theme}-${i}`) * 25 + 5, // 5-30px sway
        swaySpeed: random(`sway-speed-${theme}-${i}`) * 0.03 + 0.01,
        opacity: random(`opacity-${theme}-${i}`) * 0.5 + 0.4, // 0.4-0.9
        sparklePhase: random(`sparkle-${theme}-${i}`) * Math.PI * 2,
        type: particleTypes[typeIndex],
      });
    }

    return result;
  }, [theme, particleCount, width, height, colors]);

  // Separate sparkle particles (larger, slower, more prominent)
  const sparkles = useMemo(() => {
    if (!enableSparkle) return [];
    const sparkleColors = ['#ffffff', colors.primary, colors.accent];
    const result: Particle[] = [];
    const sparkleCount = Math.floor(particleCount / 5); // 20% sparkle particles

    for (let i = 0; i < sparkleCount; i++) {
      result.push({
        id: i + 1000,
        x: random(`sparkle-x-${theme}-${i}`) * width,
        y: random(`sparkle-y-${theme}-${i}`) * height,
        startY: random(`sparkle-startY-${theme}-${i}`) * (height + 100), // Pre-seeded for immediate visibility
        size: random(`sparkle-size-${theme}-${i}`) * 8 + 6, // 6-14px
        speed: random(`sparkle-speed-${theme}-${i}`) * 0.8 + 0.2,
        color: sparkleColors[Math.floor(random(`sparkle-color-${theme}-${i}`) * sparkleColors.length)],
        delay: random(`sparkle-delay-${theme}-${i}`) * 30, // Reduced from 200 for faster appearance
        swayAmplitude: random(`sparkle-sway-${theme}-${i}`) * 40 + 10,
        swaySpeed: random(`sparkle-sway-speed-${theme}-${i}`) * 0.02 + 0.005,
        opacity: 1,
        sparklePhase: random(`sparkle-phase-${theme}-${i}`) * Math.PI * 2,
        type: 'star',
      });
    }

    return result;
  }, [theme, particleCount, width, height, colors, enableSparkle]);

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Main particles */}
      {particles.map((particle) => {
        // Calculate Y position with falling animation (pre-seeded for immediate visibility)
        const yOffset = (particle.startY + (frame + particle.delay) * particle.speed) % (height + 100);
        const currentY = yOffset - 50;

        // Gentle horizontal sway with varied amplitude and speed
        const xSway = Math.sin((frame + particle.delay) * particle.swaySpeed) * particle.swayAmplitude;
        const currentX = particle.x + xSway;

        // Rotation for non-circular particles
        const rotation = (frame + particle.delay) * (particle.type === 'snowflake' ? 0.5 : 2);

        // Individual sparkle/twinkle effect
        const twinkle = enableSparkle
          ? (Math.sin((frame * 0.1) + particle.sparklePhase) + 1) / 2 * 0.3 + 0.7
          : 1;

        const finalOpacity = particle.opacity * twinkle;

        return (
          <div
            key={particle.id}
            style={{
              position: 'absolute',
              left: currentX,
              top: currentY,
              width: particle.size,
              height: particle.size,
              transform: `rotate(${rotation}deg)`,
              opacity: finalOpacity,
              filter: particle.type === 'star' ? `drop-shadow(0 0 ${particle.size}px ${particle.color})` : undefined,
            }}
          >
            {particle.type === 'circle' ? (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: particle.color,
                  borderRadius: '50%',
                  boxShadow: `0 0 ${particle.size * 2}px ${particle.color}60`,
                }}
              />
            ) : (
              <ParticleShape type={particle.type} size={particle.size} color={particle.color} />
            )}
          </div>
        );
      })}

      {/* Sparkle overlay particles - larger, glowing stars */}
      {sparkles.map((sparkle) => {
        // Pre-seeded Y position for immediate visibility
        const yOffset = (sparkle.startY + (frame + sparkle.delay) * sparkle.speed) % (height + 100);
        const currentY = yOffset - 50;
        const xSway = Math.sin((frame + sparkle.delay) * sparkle.swaySpeed) * sparkle.swayAmplitude;
        const currentX = sparkle.x + xSway;

        // Pulsing sparkle effect
        const pulsePhase = Math.sin((frame * 0.15) + sparkle.sparklePhase);
        const scale = 0.8 + pulsePhase * 0.4;
        const opacity = 0.5 + (pulsePhase + 1) / 2 * 0.5;

        return (
          <div
            key={sparkle.id}
            style={{
              position: 'absolute',
              left: currentX,
              top: currentY,
              width: sparkle.size,
              height: sparkle.size,
              transform: `scale(${scale})`,
              opacity: opacity * sparkleIntensity,
              filter: `drop-shadow(0 0 ${sparkle.size * 2}px ${sparkle.color}) drop-shadow(0 0 ${sparkle.size}px white)`,
            }}
          >
            <ParticleShape type="star" size={sparkle.size} color={sparkle.color} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
}
