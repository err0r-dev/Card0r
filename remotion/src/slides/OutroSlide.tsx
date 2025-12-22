import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import type { HolidayTheme } from '@card0r/shared';
import { HOLIDAY_COLORS } from '../types';

interface OutroSlideProps {
  name: string;
  theme: HolidayTheme;
}

export function OutroSlide({ name, theme }: OutroSlideProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const colors = HOLIDAY_COLORS[theme];

  // Fade out towards the end
  const opacity = interpolate(
    frame,
    [0, durationInFrames * 0.7, durationInFrames],
    [1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Gentle pulse animation
  const pulse = 1 + Math.sin(frame * 0.1) * 0.02;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity,
      }}
    >
      <h1
        style={{
          fontSize: 80,
          fontWeight: 'bold',
          textAlign: 'center',
          color: colors.accent,
          transform: `scale(${pulse})`,
          textShadow: `0 0 30px ${colors.accent}60, 0 0 60px ${colors.primary}40`,
        }}
      >
        {name}
      </h1>
    </AbsoluteFill>
  );
}
