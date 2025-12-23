import { AbsoluteFill, Sequence, Audio, useVideoConfig } from 'remotion';
import { HolidayTheme } from '@card0r/shared';
import { CardCompositionProps, HOLIDAY_COLORS, FPS } from './types';
import { calculateMessageDuration } from './utils/animations';
import {
  IntroSlide,
  NameRevealSlide,
  MessageSlide,
  SenderSlide,
  OutroSlide,
} from './slides';
import { getDecorationComponent, ParticleDecoration } from './decorations';

// Duration constants (in seconds)
const INTRO_DURATION = 5;
const NAME_REVEAL_DURATION = 3;
const SENDER_REVEAL_DURATION = 3;
const OUTRO_DURATION = 3;

export function CardComposition({
  recipientName,
  message,
  senderName,
  theme,
  audioSrc,
}: CardCompositionProps) {
  const { fps, width, height } = useVideoConfig();
  const colors = HOLIDAY_COLORS[theme];

  // Get theme-specific decoration component, fall back to enhanced particles
  const ThemeDecoration = getDecorationComponent(theme);

  // Calculate durations in frames
  const introFrames = INTRO_DURATION * fps;
  const nameRevealFrames = NAME_REVEAL_DURATION * fps;
  const messageDuration = calculateMessageDuration(message);
  const messageFrames = messageDuration * fps;
  const senderRevealFrames = SENDER_REVEAL_DURATION * fps;
  const outroFrames = OUTRO_DURATION * fps;

  // Calculate sequence start frames
  let currentFrame = 0;

  const introStart = currentFrame;
  currentFrame += introFrames;

  const nameRevealStart = currentFrame;
  currentFrame += nameRevealFrames;

  const messageStart = currentFrame;
  currentFrame += messageFrames;

  const senderRevealStart = currentFrame;
  currentFrame += senderRevealFrames;

  const outroStart = currentFrame;

  return (
    <AbsoluteFill style={{ backgroundColor: colors.bg }}>
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

      {/* Name Reveal Slide */}
      <Sequence from={nameRevealStart} durationInFrames={nameRevealFrames}>
        <NameRevealSlide name={recipientName} theme={theme} />
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
            const totalFrames = introFrames + nameRevealFrames + messageFrames +
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
  const total = INTRO_DURATION + NAME_REVEAL_DURATION + messageDuration +
                SENDER_REVEAL_DURATION + OUTRO_DURATION;
  return Math.min(60, Math.max(20, total)) * fps;
}
