import archiver from 'archiver';
import { createWriteStream, promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { VideoGenerationJob } from '@card0r/shared';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VIDEOS_DIR = path.join(__dirname, '../../videos');
const TEMP_DIR = path.join(__dirname, '../../temp');

export interface ZipProgress {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  zipPath?: string;
  error?: string;
}

// In-memory progress tracking
const zipProgress = new Map<string, ZipProgress>();

// Sanitize filename for safe use in ZIP
function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .trim()
    .substring(0, 50) || 'recipient';
}

export async function generateZipForJob(
  jobId: string,
  completedJobs: VideoGenerationJob[]
): Promise<string> {
  const zipFileName = `card0r_videos_${jobId}_${Date.now()}.zip`;
  const zipPath = path.join(TEMP_DIR, zipFileName);

  // Ensure temp directory exists
  await fs.mkdir(TEMP_DIR, { recursive: true });

  // Initialize progress
  zipProgress.set(jobId, { status: 'processing', progress: 0 });

  return new Promise((resolve, reject) => {
    const output = createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 5 } });

    const totalFiles = completedJobs.length;
    let processedFiles = 0;

    output.on('close', () => {
      zipProgress.set(jobId, {
        status: 'completed',
        progress: 100,
        zipPath: `/temp/${zipFileName}`,
      });
      resolve(`/temp/${zipFileName}`);

      // Schedule cleanup after 30 minutes
      setTimeout(async () => {
        try {
          await fs.unlink(zipPath);
          zipProgress.delete(jobId);
        } catch {
          // File may already be deleted
        }
      }, 30 * 60 * 1000);
    });

    archive.on('error', (err) => {
      zipProgress.set(jobId, {
        status: 'failed',
        progress: 0,
        error: err.message,
      });
      reject(err);
    });

    archive.on('entry', () => {
      processedFiles++;
      zipProgress.set(jobId, {
        status: 'processing',
        progress: Math.round((processedFiles / totalFiles) * 100),
      });
    });

    archive.pipe(output);

    // Track used filenames to avoid duplicates
    const usedNames = new Set<string>();

    // Add each completed video to the archive
    for (const job of completedJobs) {
      if (job.videoUrl) {
        // videoUrl is like "/videos/filename.mp4"
        const videoFileName = path.basename(job.videoUrl);
        const videoPath = path.join(VIDEOS_DIR, videoFileName);

        // Create clean filename
        let cleanName = sanitizeFilename(job.recipientName);
        let finalName = `${cleanName}_video.mp4`;

        // Handle duplicates
        let counter = 1;
        while (usedNames.has(finalName)) {
          finalName = `${cleanName}_video_${counter}.mp4`;
          counter++;
        }
        usedNames.add(finalName);

        archive.file(videoPath, { name: finalName });
      }
    }

    archive.finalize();
  });
}

export function getZipProgress(jobId: string): ZipProgress | null {
  return zipProgress.get(jobId) || null;
}

export async function cleanupZipFile(zipPath: string): Promise<void> {
  try {
    const fullPath = path.join(__dirname, '../..', zipPath);
    await fs.unlink(fullPath);
  } catch (error) {
    console.error('Failed to cleanup zip file:', error);
  }
}
