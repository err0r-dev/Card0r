import express from 'express';
import { fetchMusic } from '../services/jamendo-service.js';
import type { HolidayTheme, MusicSearchResponse } from '@card0r/shared';

const router = express.Router();

router.get('/:theme', async (req, res) => {
  try {
    const theme = req.params.theme as HolidayTheme;
    const apiKey = req.headers['x-jamendo-key'] as string;

    console.log(`[Music Route] Request - Theme: ${theme}, API Key Header: ${apiKey ? 'PROVIDED' : 'MISSING'}`);

    if (!apiKey) {
      console.error('[Music Route] ERROR: Jamendo API key is missing');
      return res.status(400).json({ error: 'Jamendo API key is required' });
    }

    if (!theme) {
      console.error('[Music Route] ERROR: Theme is missing');
      return res.status(400).json({ error: 'Theme is required' });
    }

    const result = await fetchMusic(theme, apiKey);
    res.json(result);
  } catch (error) {
    console.error('[Music Route] ERROR:', error);
    res.status(500).json({
      error: 'Music fetch failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
