import express from 'express';
import { generateVideoBatch, getJobStatus } from '../services/video-generator.js';
import type { VideoGenerationRequest } from '@card0r/shared';

const router = express.Router();

// Generate videos
router.post('/generate', async (req, res) => {
  try {
    const { recipients, theme, format, musicUrl } = req.body as VideoGenerationRequest;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'Recipients array is required' });
    }

    if (!theme) {
      return res.status(400).json({ error: 'Theme is required' });
    }

    if (!format) {
      return res.status(400).json({ error: 'Format is required' });
    }

    const result = await generateVideoBatch({ recipients, theme, format, musicUrl });
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

export default router;
