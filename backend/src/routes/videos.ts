import express from 'express';
import { generateVideoBatch, getJobStatus } from '../services/video-generator.js';
import { generateZipForJob, getZipProgress } from '../services/zip-generator.js';
import type { VideoGenerationRequest } from '@card0r/shared';

const router = express.Router();

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

export default router;
