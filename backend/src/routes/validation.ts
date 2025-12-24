import express from 'express';
import { validateApiKeys } from '../services/validation.js';
import type { ApiKeyValidationRequest, ApiKeyValidationResponse } from '@card0r/shared';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    console.log('[Validation Route] Received request body:', {
      openai: req.body.openai ? '***' + req.body.openai.slice(-4) : 'missing',
      jamendo: req.body.jamendo ? '***' + req.body.jamendo.slice(-4) : 'missing'
    });
    const { openai, jamendo } = req.body as ApiKeyValidationRequest;
    const result = await validateApiKeys({ openai, jamendo });
    res.json(result);
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      openai: { valid: false, error: 'Validation failed' },
      jamendo: { valid: false, error: 'Validation failed' }
    } as ApiKeyValidationResponse);
  }
});

export default router;
