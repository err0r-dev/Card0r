import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import type { HolidayTheme } from '@card0r/shared';
import { HOLIDAY_COLORS } from '../types';

interface IntroSlideProps {
  theme: HolidayTheme;
}

function getThemeDisplayName(theme: string): string {
  return theme
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function IntroSlide({ theme }: IntroSlideProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const colors = HOLIDAY_COLORS[theme];
  const themeName = getThemeDisplayName(theme);

  // Fade in and out using sine wave
  const progress = frame / durationInFrames;
  const alpha = Math.sin(progress * Math.PI);

  // Scale animation
  const scale = interpolate(
    frame,
    [0, fps * 2],
    [0.8, 1],
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
          fontSize: 120,
          fontWeight: 'bold',
          textAlign: 'center',
          opacity: alpha,
          transform: `scale(${scale})`,
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: `0 4px 20px ${colors.primary}40`,
        }}
      >
        {themeName}
      </h1>
    </AbsoluteFill>
  );
}
