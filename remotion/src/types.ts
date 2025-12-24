import type { HolidayTheme, VideoFormat } from '@card0r/shared';

export interface CardCompositionProps {
  recipientName: string;
  message: string;
  senderName: string;
  theme: HolidayTheme;
  format: VideoFormat;
  audioSrc?: string;
}

export interface ThemeColors {
  bg: string;
  primary: string;
  secondary: string;
  accent: string;
}

export const HOLIDAY_COLORS: Record<HolidayTheme, ThemeColors> = {
  christmas: { bg: '#1a472a', primary: '#d42426', secondary: '#2e7d32', accent: '#ffd700' },
  new_year: { bg: '#0a0a2e', primary: '#ffd700', secondary: '#ff6b9d', accent: '#00d4ff' },
  easter: { bg: '#fff9e6', primary: '#ff99cc', secondary: '#99ccff', accent: '#ffeb3b' },
  valentines_day: { bg: '#ffe6f0', primary: '#ff1744', secondary: '#ff4081', accent: '#f50057' },
  halloween: { bg: '#1a1a1a', primary: '#ff6600', secondary: '#8b00ff', accent: '#00ff00' },
  thanksgiving: { bg: '#8b4513', primary: '#ff8c00', secondary: '#daa520', accent: '#cd853f' },
  rosh_hashanah: { bg: '#f5f5dc', primary: '#daa520', secondary: '#cd853f', accent: '#ff6347' },
  hanukkah: { bg: '#001f3f', primary: '#0074d9', secondary: '#ffffff', accent: '#ffd700' },
  passover: { bg: '#f5f5dc', primary: '#8b4513', secondary: '#daa520', accent: '#cd853f' },
  eid_al_fitr: { bg: '#0a5f38', primary: '#ffd700', secondary: '#00d4aa', accent: '#ffffff' },
  eid_al_adha: { bg: '#0a5f38', primary: '#ffd700', secondary: '#00d4aa', accent: '#ffffff' },
  ramadan: { bg: '#1a237e', primary: '#ffd700', secondary: '#9c27b0', accent: '#00bcd4' },
  chinese_new_year: { bg: '#b71c1c', primary: '#ffd700', secondary: '#ffeb3b', accent: '#ff5722' },
  diwali: { bg: '#1a237e', primary: '#ff9800', secondary: '#ffeb3b', accent: '#f44336' },
  lunar_new_year: { bg: '#b71c1c', primary: '#ffd700', secondary: '#ffeb3b', accent: '#ff5722' },
  // General
  thank_you: { bg: '#fff5f5', primary: '#e53e3e', secondary: '#fc8181', accent: '#ffd700' },
  congratulations: { bg: '#faf5ff', primary: '#805ad5', secondary: '#d69e2e', accent: '#38b2ac' },
};

export const FORMAT_CONFIGS: Record<VideoFormat, { width: number; height: number }> = {
  '1080p': { width: 1920, height: 1080 },
  '4k': { width: 3840, height: 2160 },
  'square': { width: 1080, height: 1080 },
  'social': { width: 1080, height: 1920 },
};

export const FPS = 30;
