import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { CanvasRenderer } from './canvas-renderer.js';
import { encodeFramesToVideo, downloadAudio, cleanupDirectory } from './ffmpeg-service.js';
import type { VideoGenerationRequest, BatchVideoResponse, VideoGenerationJob } from '@card0r/shared';

// In-memory job storage (in production, use Redis or database)
const jobs = new Map<string, BatchVideoResponse>();

export async function generateVideoBatch(request: VideoGenerationRequest): Promise<BatchVideoResponse> {
  const jobId = uuidv4();
  const { recipients, theme, format, musicUrl } = request;

  // Initialize job status
  const videoJobs: VideoGenerationJob[] = recipients.map(recipient => ({
    id: uuidv4(),
    status: 'pending',
    progress: 0,
    recipientName: recipient.name
  }));

  const batchResponse: BatchVideoResponse = {
    jobId,
    jobs: videoJobs
  };

  jobs.set(jobId, batchResponse);

  // Start processing asynchronously
  processVideoBatch(jobId, request).catch(error => {
    console.error('Batch processing error:', error);
  });

  return batchResponse;
}

async function processVideoBatch(jobId: string, request: VideoGenerationRequest): Promise<void> {
  const { recipients, theme, format, musicUrl } = request;
  const batch = jobs.get(jobId);
  if (!batch) return;

  // Download music if provided
  let audioPath: string | undefined;
  if (musicUrl) {
    try {
      audioPath = path.join(process.cwd(), 'temp', `audio-${jobId}.mp3`);
      await downloadAudio(musicUrl, audioPath);
    } catch (error) {
      console.error('Failed to download music:', error);
      audioPath = undefined;
    }
  }

  // Process each recipient
  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    const job = batch.jobs[i];

    try {
      job.status = 'processing';
      jobs.set(jobId, batch);

      // Generate video with progress callback
      const videoPath = await generateSingleVideo(
        recipient.name,
        recipient.generatedMessage,
        theme,
        format,
        audioPath,
        (progress) => {
          job.progress = Math.min(95, progress); // Cap at 95% until encoding is done
          jobs.set(jobId, batch);
        }
      );

      // Update job status
      job.status = 'completed';
      job.progress = 100;
      job.videoUrl = `/videos/${path.basename(videoPath)}`;
    } catch (error) {
      console.error(`Failed to generate video for ${recipient.name}:`, error);
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
    }

    jobs.set(jobId, batch);
  }

  // Cleanup audio file
  if (audioPath) {
    try {
      await fs.unlink(audioPath);
    } catch (error) {
      console.warn('Failed to cleanup audio:', error);
    }
  }
}

async function generateSingleVideo(
  name: string,
  message: string,
  theme: any,
  format: any,
  audioPath?: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const videoId = uuidv4();
  const framesDir = path.join(process.cwd(), 'temp', `frames-${videoId}`);
  const outputPath = path.join(process.cwd(), 'videos', `${videoId}.mp4`);

  // Create directories
  await fs.mkdir(framesDir, { recursive: true });
  await fs.mkdir(path.join(process.cwd(), 'videos'), { recursive: true });

  // Initialize renderer
  const renderer = new CanvasRenderer(format, theme);
  const config = renderer.getConfig();
  const totalFrames = config.fps * config.duration;

  // Generate frames
  console.log(`Generating ${totalFrames} frames for ${name}...`);
  for (let frameNumber = 0; frameNumber < totalFrames; frameNumber++) {
    const frameBuffer = renderer.generateFrame(frameNumber, name, message);
    const framePath = path.join(framesDir, `frame-${String(frameNumber).padStart(4, '0')}.png`);
    await fs.writeFile(framePath, frameBuffer);

    // Update progress (frames are 0-80% of total work)
    const frameProgress = Math.floor((frameNumber / totalFrames) * 80);
    onProgress?.(frameProgress);

    if (frameNumber % 30 === 0) {
      console.log(`Generated frame ${frameNumber}/${totalFrames}`);
    }
  }

  // Encode video (encoding is 80-95% of total work)
  console.log(`Encoding video for ${name}...`);
  onProgress?.(80);
  await encodeFramesToVideo(framesDir, outputPath, {
    framerate: config.fps,
    width: config.width,
    height: config.height,
    audioPath
  });
  onProgress?.(95);

  // Cleanup frames
  await cleanupDirectory(framesDir);

  console.log(`Video completed: ${outputPath}`);
  return outputPath;
}

export async function getJobStatus(jobId: string): Promise<BatchVideoResponse | null> {
  return jobs.get(jobId) || null;
}
