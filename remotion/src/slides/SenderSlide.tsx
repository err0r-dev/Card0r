import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import type { HolidayTheme } from '@card0r/shared';
import { HOLIDAY_COLORS } from '../types';

interface SenderSlideProps {
  senderName: string;
  theme: HolidayTheme;
}

export function SenderSlide({ senderName, theme }: SenderSlideProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const colors = HOLIDAY_COLORS[theme];

  // Fade in "From,"
  const fromOpacity = interpolate(
    frame,
    [fps * 0.3, fps * 1],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Fade in and scale sender name
  const nameOpacity = interpolate(
    frame,
    [fps * 0.8, fps * 1.5],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const nameScale = interpolate(
    frame,
    [fps * 0.8, fps * 1.5],
    [0.8, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <p
        style={{
          fontSize: 36,
          fontStyle: 'italic',
          color: colors.secondary,
          opacity: fromOpacity,
          marginBottom: 16,
        }}
      >
        From,
      </p>
      <h1
        style={{
          fontSize: 72,
          fontWeight: 'bold',
          color: colors.primary,
          opacity: nameOpacity,
          transform: `scale(${nameScale})`,
          textShadow: `0 4px 30px ${colors.primary}50`,
        }}
      >
        {senderName}
      </h1>
    </AbsoluteFill>
  );
}
