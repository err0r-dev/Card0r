import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import type { HolidayTheme } from '@card0r/shared';
import { HOLIDAY_COLORS } from '../types';

interface NameRevealSlideProps {
  name: string;
  theme: HolidayTheme;
}

export function NameRevealSlide({ name, theme }: NameRevealSlideProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const colors = HOLIDAY_COLORS[theme];

  // Scale from 0.5 to 1 over the first 2 seconds
  const scale = interpolate(
    frame,
    [0, fps * 2],
    [0.5, 1],
    { extrapolateRight: 'clamp' }
  );

  // Fade in quickly
  const opacity = interpolate(
    frame,
    [0, fps * 0.5],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <h1
        style={{
          fontSize: 100,
          fontWeight: 'bold',
          textAlign: 'center',
          opacity,
          transform: `scale(${scale})`,
          color: colors.primary,
          textShadow: `0 4px 30px ${colors.primary}60, 0 0 60px ${colors.accent}40`,
        }}
      >
        {name}
      </h1>
    </AbsoluteFill>
  );
}
