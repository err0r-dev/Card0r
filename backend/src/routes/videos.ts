import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { generateVideoBatch, getJobStatus, cancelJob } from '../services/video-generator.js';
import { generateZipForJob, getZipProgress } from '../services/zip-generator.js';
import type { VideoGenerationRequest } from '@card0r/shared';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const VIDEOS_DIR = path.join(__dirname, '../../videos');

// Generate videos
router.post('/generate', async (req, res) => {
  try {
    const { recipients, theme, format, musicUrl, senderName } = req.body as VideoGenerationRequest;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'Recipients array is required' });
    }

    if (!theme) {
      return res.status(400).json({ error: 'Theme is required' });
    }

    if (!format) {
      return res.status(400).json({ error: 'Format is required' });
    }

    const result = await generateVideoBatch({ recipients, theme, format, musicUrl, senderName });
    res.json(result);
  } catch (error) {
    console.error('Video generation error:', error);
    res.status(500).json({
      error: 'Video generation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get job status
router.get('/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const result = await getJobStatus(jobId);

    if (!result) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json(result);
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({
      error: 'Status check failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Cancel all pending/processing jobs in a batch
router.post('/cancel/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const success = cancelJob(jobId);

    if (!success) {
      return res.status(404).json({ error: 'Job not found or no jobs to cancel' });
    }

    console.log(`[Videos] Cancelled all jobs in batch: ${jobId}`);
    res.json({ success: true, message: 'All pending jobs cancelled' });
  } catch (error) {
    console.error('Cancel batch error:', error);
    res.status(500).json({
      error: 'Failed to cancel jobs',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Cancel a specific video job
router.post('/cancel/:jobId/:videoJobId', async (req, res) => {
  try {
    const { jobId, videoJobId } = req.params;
    const success = cancelJob(jobId, videoJobId);

    if (!success) {
      return res.status(404).json({ error: 'Job not found or already completed' });
    }

    console.log(`[Videos] Cancelled video job: ${videoJobId} in batch ${jobId}`);
    res.json({ success: true, message: 'Video job cancelled' });
  } catch (error) {
    console.error('Cancel video error:', error);
    res.status(500).json({
      error: 'Failed to cancel video',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Generate ZIP for all completed videos in a job
router.post('/download-zip/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const batch = await getJobStatus(jobId);

    if (!batch) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const completedJobs = batch.jobs.filter(
      (job) => job.status === 'completed' && job.videoUrl
    );

    if (completedJobs.length === 0) {
      return res.status(400).json({ error: 'No completed videos to download' });
    }

    // Start ZIP generation (async) and return immediately
    generateZipForJob(jobId, completedJobs).catch((err) => {
      console.error('ZIP generation error:', err);
    });

    res.json({
      status: 'processing',
      message: 'ZIP generation started',
      totalVideos: completedJobs.length,
    });
  } catch (error) {
    console.error('ZIP generation error:', error);
    res.status(500).json({
      error: 'ZIP generation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get ZIP generation progress
router.get('/download-zip/:jobId/progress', async (req, res) => {
  try {
    const { jobId } = req.params;
    const progress = getZipProgress(jobId);

    if (!progress) {
      return res.status(404).json({ error: 'No ZIP generation in progress' });
    }

    res.json(progress);
  } catch (error) {
    console.error('ZIP progress check error:', error);
    res.status(500).json({ error: 'Failed to check progress' });
  }
});

// Delete a video file
router.delete('/delete/:filename', async (req, res) => {
  try {
    const { filename } = req.params;

    // Sanitize filename to prevent directory traversal
    const sanitizedFilename = path.basename(filename);
    const videoPath = path.join(VIDEOS_DIR, sanitizedFilename);

    // Check if file exists
    try {
      await fs.access(videoPath);
    } catch {
      // File doesn't exist, but that's okay - return success
      return res.json({ success: true, message: 'Video already deleted or not found' });
    }

    // Delete the file
    await fs.unlink(videoPath);
    console.log(`[Videos] Deleted video: ${sanitizedFilename}`);

    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Video deletion error:', error);
    res.status(500).json({
      error: 'Video deletion failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Delete multiple videos by filenames
router.post('/delete-batch', async (req, res) => {
  try {
    const { filenames } = req.body as { filenames: string[] };

    if (!filenames || !Array.isArray(filenames)) {
      return res.status(400).json({ error: 'Filenames array is required' });
    }

    const results: { filename: string; success: boolean; error?: string }[] = [];

    for (const filename of filenames) {
      const sanitizedFilename = path.basename(filename);
      const videoPath = path.join(VIDEOS_DIR, sanitizedFilename);

      try {
        await fs.access(videoPath);
        await fs.unlink(videoPath);
        console.log(`[Videos] Deleted video: ${sanitizedFilename}`);
        results.push({ filename: sanitizedFilename, success: true });
      } catch (err) {
        // File doesn't exist or couldn't be deleted
        results.push({
          filename: sanitizedFilename,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    console.log(`[Videos] Batch delete: ${successCount}/${filenames.length} files deleted`);

    res.json({
      success: true,
      message: `Deleted ${successCount} of ${filenames.length} videos`,
      results,
    });
  } catch (error) {
    console.error('Batch video deletion error:', error);
    res.status(500).json({
      error: 'Batch video deletion failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
