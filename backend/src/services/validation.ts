import OpenAI from 'openai';
import axios from 'axios';
import type { ApiKeyValidationRequest, ApiKeyValidationResponse } from '@card0r/shared';

export async function validateApiKeys(keys: ApiKeyValidationRequest): Promise<ApiKeyValidationResponse> {
  const result: ApiKeyValidationResponse = {
    openai: { valid: false },
    jamendo: { valid: false }
  };

  // Validate OpenAI API key
  if (keys.openai) {
    try {
      const openai = new OpenAI({ apiKey: keys.openai });
      await openai.models.list();
      result.openai = { valid: true };
    } catch (error) {
      result.openai = {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid API key'
      };
    }
  }

  // Validate Jamendo API key
  if (keys.jamendo) {
    try {
      console.log('[Validation] Testing Jamendo API key:', keys.jamendo ? '***' + keys.jamendo.slice(-4) : 'undefined');

      const response = await axios.get('https://api.jamendo.com/v3.0/tracks/', {
        params: {
          client_id: keys.jamendo,
          format: 'json',
          limit: 1
        },
        timeout: 5000
      });

      console.log('[Validation] Jamendo response:', {
        status: response.status,
        hasData: !!response.data,
        hasResults: !!response.data?.results,
        headers: response.data?.headers
      });

      // Jamendo API returns 200 even with invalid key, but results will be empty or headers will indicate error
      if (response.status === 200 && response.data) {
        // Check if we got valid results or if headers indicate success
        const hasResults = response.data.results && response.data.results.length > 0;
        const headersOk = !response.data.headers || response.data.headers.status === 'success' || response.data.headers.code === 0;

        if (hasResults || headersOk) {
          result.jamendo = { valid: true };
          console.log('[Validation] Jamendo API key is VALID');
        } else {
          result.jamendo = { valid: false, error: response.data.headers?.error_message || 'Invalid API key' };
          console.log('[Validation] Jamendo API key is INVALID:', response.data.headers?.error_message);
        }
      } else {
        result.jamendo = { valid: false, error: 'Invalid API response' };
      }
    } catch (error) {
      console.error('[Validation] Jamendo validation error:', error);
      result.jamendo = {
        valid: false,
        error: error instanceof Error ? error.message : 'Invalid API key'
      };
    }
  } else {
    console.log('[Validation] No Jamendo API key provided');
  }

  return result;
}
