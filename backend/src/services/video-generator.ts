import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { renderCard } from './remotion-renderer.js';
import type { VideoGenerationRequest, BatchVideoResponse, VideoGenerationJob } from '@card0r/shared';

// In-memory job storage (in production, use Redis or database)
const jobs = new Map<string, BatchVideoResponse>();

export async function generateVideoBatch(request: VideoGenerationRequest): Promise<BatchVideoResponse> {
  const jobId = uuidv4();
  const { recipients, theme, format, musicUrl, senderName } = request;

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
  const { recipients, theme, format, musicUrl, senderName } = request;
  const batch = jobs.get(jobId);
  if (!batch) return;

  // Process each recipient
  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    const job = batch.jobs[i];

    try {
      job.status = 'processing';
      jobs.set(jobId, batch);

      console.log(`[VideoGenerator] Starting render for ${recipient.name}`);

      // Render video using Remotion
      const videoUrl = await renderCard({
        recipientName: recipient.name,
        message: recipient.generatedMessage,
        senderName: senderName || '',
        theme,
        format,
        audioSrc: musicUrl,
        onProgress: (progress) => {
          job.progress = progress;
          jobs.set(jobId, batch);
        },
      });

      // Update job status
      job.status = 'completed';
      job.progress = 100;
      job.videoUrl = videoUrl;

      console.log(`[VideoGenerator] Completed video for ${recipient.name}: ${videoUrl}`);
    } catch (error) {
      console.error(`[VideoGenerator] Failed to generate video for ${recipient.name}:`, error);
      job.status = 'failed';
      job.error = error instanceof Error ? error.message : 'Unknown error';
    }

    jobs.set(jobId, batch);
  }
}

export async function getJobStatus(jobId: string): Promise<BatchVideoResponse | null> {
  return jobs.get(jobId) || null;
}
