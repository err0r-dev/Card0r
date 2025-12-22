import express from 'express';
import { generateMessages } from '../services/openai-service.js';
import type { MessageGenerationRequest, MessageGenerationResponse } from '@card0r/shared';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { recipients, theme, senderName } = req.body as MessageGenerationRequest;
    const apiKey = req.headers['x-openai-key'] as string;

    if (!apiKey) {
      return res.status(400).json({ error: 'OpenAI API key is required' });
    }

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'Recipients array is required' });
    }

    if (!theme) {
      return res.status(400).json({ error: 'Theme is required' });
    }

    const result = await generateMessages({ recipients, theme, senderName }, apiKey);
    res.json(result);
  } catch (error) {
    console.error('Message generation error:', error);
    res.status(500).json({
      error: 'Message generation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
