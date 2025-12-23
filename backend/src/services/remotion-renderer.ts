import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import { v4 as uuid } from 'uuid';
import type { HolidayTheme, VideoFormat } from '@card0r/shared';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FPS = 30;
const WORDS_PER_SECOND = 3.5;

// Duration constants (in seconds)
const INTRO_DURATION = 5;
const NAME_REVEAL_DURATION = 3;
const SENDER_REVEAL_DURATION = 3;
const OUTRO_DURATION = 3;

const FORMAT_CONFIGS: Record<VideoFormat, { width: number; height: number }> = {
  '1080p': { width: 1920, height: 1080 },
  '4k': { width: 3840, height: 2160 },
  'square': { width: 1080, height: 1080 },
  'social': { width: 1080, height: 1920 },
};

// Calculate message duration based on word count
function calculateMessageDuration(message: string): number {
  const wordCount = message.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / WORDS_PER_SECOND);
  return readingTime + 2; // +2s buffer
}

// Calculate total video duration
function calculateTotalDuration(message: string): number {
  const messageDuration = calculateMessageDuration(message);
  const total = INTRO_DURATION + NAME_REVEAL_DURATION + messageDuration +
                SENDER_REVEAL_DURATION + OUTRO_DURATION;
  return Math.min(60, Math.max(20, total));
}

interface RenderCardOptions {
  recipientName: string;
  message: string;
  senderName?: string;
  theme: HolidayTheme;
  format: VideoFormat;
  audioSrc?: string;
  onProgress?: (progress: number) => void;
}

// Path to pre-bundled Remotion composition
const BUNDLE_PATH = path.join(process.cwd(), 'remotion-bundle');

let bundleLocation: string | null = null;

// Get or create the bundle
async function getBundleLocation(): Promise<string> {
  // Check if pre-built bundle exists
  if (fs.existsSync(BUNDLE_PATH)) {
    return BUNDLE_PATH;
  }

  // If no pre-built bundle, bundle on-demand (slower, for development)
  if (!bundleLocation) {
    console.log('[Remotion] No pre-built bundle found, bundling on-demand...');
    const remotionRoot = path.join(process.cwd(), '..', 'remotion', 'src', 'index.ts');
    bundleLocation = await bundle({
      entryPoint: remotionRoot,
      onProgress: (progress) => {
        console.log(`[Remotion] Bundling: ${Math.round(progress * 100)}%`);
      },
    });
    console.log('[Remotion] Bundle created at:', bundleLocation);
  }

  return bundleLocation;
}

export async function renderCard(options: RenderCardOptions): Promise<string> {
  const {
    recipientName,
    message,
    senderName = '',
    theme,
    format,
    audioSrc,
    onProgress,
  } = options;

  const videoId = uuid();
  const outputDir = path.join(__dirname, '../../videos');
  const outputPath = path.join(outputDir, `${videoId}.mp4`);

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    // Get bundle location
    const serveUrl = await getBundleLocation();

    // Calculate duration
    const durationInFrames = Math.ceil(calculateTotalDuration(message) * FPS);
    const formatConfig = FORMAT_CONFIGS[format];

    // Select composition
    const composition = await selectComposition({
      serveUrl,
      id: 'HolidayCard',
      inputProps: {
        recipientName,
        message,
        senderName,
        theme,
        format,
        audioSrc,
      },
    });

    // Override composition properties
    composition.durationInFrames = durationInFrames;
    composition.width = formatConfig.width;
    composition.height = formatConfig.height;
    composition.fps = FPS;

    // Render video
    await renderMedia({
      composition,
      serveUrl,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: {
        recipientName,
        message,
        senderName,
        theme,
        format,
        audioSrc,
      },
      onProgress: ({ progress }) => {
        if (onProgress) {
          onProgress(Math.round(progress * 100));
        }
      },
    });

    return `/videos/${videoId}.mp4`;
  } catch (error) {
    console.error('[Remotion] Render error:', error);
    throw error;
  }
}
