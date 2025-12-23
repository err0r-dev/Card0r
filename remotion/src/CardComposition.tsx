import { AbsoluteFill, Sequence, Audio, useVideoConfig, useCurrentFrame, interpolate } from 'remotion';
import { HolidayTheme } from '@card0r/shared';
import { CardCompositionProps, HOLIDAY_COLORS, FPS } from './types';
import { calculateMessageDuration } from './utils/animations';

// Fade duration in seconds
const FADE_DURATION = 1;
import {
  IntroSlide,
  MessageSlide,
  SenderSlide,
  OutroSlide,
} from './slides';
import { getDecorationComponent, ParticleDecoration } from './decorations';

// Duration constants (in seconds)
const INTRO_DURATION = 5;
const SENDER_REVEAL_DURATION = 3;
const OUTRO_DURATION = 3;

export function CardComposition({
  recipientName,
  message,
  senderName,
  theme,
  audioSrc,
}: CardCompositionProps) {
  const { fps, width, height, durationInFrames } = useVideoConfig();
  const frame = useCurrentFrame();
  const colors = HOLIDAY_COLORS[theme];

  // Get theme-specific decoration component, fall back to enhanced particles
  const ThemeDecoration = getDecorationComponent(theme);

  // Calculate fade frames
  const fadeFrames = FADE_DURATION * fps;

  // Calculate durations in frames
  const introFrames = INTRO_DURATION * fps;
  const messageDuration = calculateMessageDuration(message);
  const messageFrames = messageDuration * fps;
  const senderRevealFrames = SENDER_REVEAL_DURATION * fps;
  const outroFrames = OUTRO_DURATION * fps;

  // Calculate sequence start frames (content starts after fade-in)
  let currentFrame = fadeFrames; // Start after fade-in

  const introStart = currentFrame;
  currentFrame += introFrames;

  const messageStart = currentFrame;
  currentFrame += messageFrames;

  const senderRevealStart = currentFrame;
  currentFrame += senderRevealFrames;

  const outroStart = currentFrame;

  // Calculate fade opacity
  const fadeInOpacity = interpolate(
    frame,
    [0, fadeFrames],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  const fadeOutOpacity = interpolate(
    frame,
    [durationInFrames - fadeFrames, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp' }
  );

  const opacity = Math.min(fadeInOpacity, fadeOutOpacity);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg, opacity }}>
      {/* Theme-specific decoration or enhanced particles as fallback */}
      {ThemeDecoration ? (
        <ThemeDecoration width={width} height={height} />
      ) : (
        <ParticleDecoration theme={theme} particleCount={120} enableSparkle />
      )}

      {/* Intro Slide */}
      <Sequence from={introStart} durationInFrames={introFrames}>
        <IntroSlide theme={theme} recipientName={recipientName} />
      </Sequence>

      {/* Message Slide */}
      <Sequence from={messageStart} durationInFrames={messageFrames}>
        <MessageSlide name={recipientName} message={message} theme={theme} />
      </Sequence>

      {/* Sender Reveal Slide */}
      {senderName && (
        <Sequence from={senderRevealStart} durationInFrames={senderRevealFrames}>
          <SenderSlide senderName={senderName} theme={theme} />
        </Sequence>
      )}

      {/* Outro Slide */}
      <Sequence from={outroStart} durationInFrames={outroFrames}>
        <OutroSlide theme={theme} />
      </Sequence>

      {/* Audio */}
      {audioSrc && (
        <Audio
          src={audioSrc}
          volume={(frame) => {
            const totalFrames = introFrames + messageFrames +
                               senderRevealFrames + outroFrames;
            // Fade in first 2 seconds
            const fadeInEnd = fps * 2;
            // Fade out last 2 seconds
            const fadeOutStart = totalFrames - fps * 2;

            if (frame < fadeInEnd) {
              return (frame / fadeInEnd) * 0.4;
            }
            if (frame > fadeOutStart) {
              return ((totalFrames - frame) / (fps * 2)) * 0.4;
            }
            return 0.4;
          }}
        />
      )}
    </AbsoluteFill>
  );
}

// Helper to calculate total duration for a given message
export function calculateTotalFrames(message: string, fps: number = FPS): number {
  const messageDuration = calculateMessageDuration(message);
  // Add fade in/out time to total duration
  const total = FADE_DURATION + INTRO_DURATION + messageDuration +
                SENDER_REVEAL_DURATION + OUTRO_DURATION + FADE_DURATION;
  return Math.min(60, Math.max(20, total)) * fps;
}
