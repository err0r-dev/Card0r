import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import type { HolidayTheme } from '@card0r/shared';
import { HOLIDAY_COLORS } from '../types';
import { wrapText } from '../utils/animations';

interface MessageSlideProps {
  name: string;
  message: string;
  theme: HolidayTheme;
}

export function MessageSlide({ name, message, theme }: MessageSlideProps) {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  const colors = HOLIDAY_COLORS[theme];

  // Wrap text into lines (estimate ~40 chars per line for readable sizing)
  const maxCharsPerLine = Math.floor(width / 30);
  const lines = wrapText(message, maxCharsPerLine);

  // Time per line reveal (in frames)
  const REVEAL_TIME_PER_LINE = fps * 0.8; // 0.8 seconds per line

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 60px',
      }}
    >
      {/* Message lines */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {lines.map((line, index) => {
          const lineStartFrame = index * REVEAL_TIME_PER_LINE;
          const lineEndFrame = lineStartFrame + REVEAL_TIME_PER_LINE;

          // Calculate opacity for this line
          let lineOpacity = 0;
          if (frame >= lineEndFrame) {
            lineOpacity = 1; // Fully visible
          } else if (frame >= lineStartFrame) {
            lineOpacity = (frame - lineStartFrame) / REVEAL_TIME_PER_LINE;
          }

          // Calculate Y offset for slide-in effect
          const slideY = interpolate(
            frame,
            [lineStartFrame, lineEndFrame],
            [20, 0],
            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
          );

          return (
            <p
              key={index}
              style={{
                fontSize: 42,
                fontWeight: '500',
                color: colors.accent,
                textAlign: 'center',
                opacity: lineOpacity,
                transform: `translateY(${slideY}px)`,
                textShadow: `0 2px 15px ${colors.bg}80`,
                margin: 0,
                lineHeight: 1.4,
              }}
            >
              {line}
            </p>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
