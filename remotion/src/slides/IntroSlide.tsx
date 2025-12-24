import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import type { HolidayTheme } from '@card0r/shared';
import { HOLIDAY_COLORS } from '../types';

interface IntroSlideProps {
  theme: HolidayTheme;
  recipientName: string;
}

// Greeting messages for each theme
const THEME_GREETINGS: Record<HolidayTheme, string> = {
  christmas: 'Merry Christmas',
  new_year: 'Happy New Year',
  easter: 'Happy Easter',
  valentines_day: "Happy Valentine's Day",
  halloween: 'Happy Halloween',
  thanksgiving: 'Happy Thanksgiving',
  rosh_hashanah: 'Shanah Tovah',
  hanukkah: 'Happy Hanukkah',
  passover: 'Chag Pesach Sameach',
  eid_al_fitr: 'Eid Mubarak',
  eid_al_adha: 'Eid Mubarak',
  ramadan: 'Ramadan Mubarak',
  chinese_new_year: 'Gong Xi Fa Cai',
  diwali: 'Happy Diwali',
  lunar_new_year: 'Happy Lunar New Year',
  thank_you: 'Thank You',
  congratulations: 'Congratulations',
};

function getGreetingMessage(theme: HolidayTheme, name: string): string {
  const greeting = THEME_GREETINGS[theme] || 'Happy Holidays';
  return `${greeting}, ${name}!`;
}

export function IntroSlide({ theme, recipientName }: IntroSlideProps) {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const colors = HOLIDAY_COLORS[theme];
  const greetingMessage = getGreetingMessage(theme, recipientName);

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

  // Dynamic font size based on message length
  const baseFontSize = 100;
  const fontSize = greetingMessage.length > 30 ? 70 : greetingMessage.length > 22 ? 85 : baseFontSize;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 40px',
      }}
    >
      <h1
        style={{
          fontSize,
          fontWeight: 'bold',
          textAlign: 'center',
          opacity: alpha,
          transform: `scale(${scale})`,
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: `0 4px 20px ${colors.primary}40`,
          lineHeight: 1.2,
        }}
      >
        {greetingMessage}
      </h1>
    </AbsoluteFill>
  );
}
