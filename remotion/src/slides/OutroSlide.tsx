import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import type { HolidayTheme } from '@card0r/shared';
import { HOLIDAY_COLORS } from '../types';

interface OutroSlideProps {
  theme: HolidayTheme;
}

// Themed closing messages
const THEME_CLOSINGS: Record<HolidayTheme, string> = {
  christmas: "Season's Greetings",
  new_year: 'Cheers!',
  easter: 'Blessings',
  valentines_day: 'With Love',
  halloween: 'Boo!',
  thanksgiving: 'Gratitude',
  rosh_hashanah: 'L\'Shanah Tovah',
  hanukkah: 'Chag Sameach',
  passover: 'Next Year in Jerusalem',
  eid_al_fitr: 'Eid Mubarak',
  eid_al_adha: 'Eid Mubarak',
  ramadan: 'Ramadan Kareem',
  chinese_new_year: 'Gong Hei Fat Choy',
  diwali: 'Shubh Deepavali',
  lunar_new_year: 'Best Wishes',
  thank_you: 'With Gratitude',
  congratulations: 'Well Done!',
};

export function OutroSlide({ theme }: OutroSlideProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const colors = HOLIDAY_COLORS[theme];
  const closingMessage = THEME_CLOSINGS[theme] || 'Best Wishes';

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
          fontSize: 70,
          fontWeight: 'bold',
          textAlign: 'center',
          color: colors.accent,
          transform: `scale(${pulse})`,
          textShadow: `0 0 30px ${colors.accent}60, 0 0 60px ${colors.primary}40`,
          fontStyle: 'italic',
        }}
      >
        {closingMessage}
      </h1>
    </AbsoluteFill>
  );
}
