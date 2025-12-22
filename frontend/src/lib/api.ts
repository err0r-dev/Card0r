import type {
  ApiKeyValidationRequest,
  ApiKeyValidationResponse,
  CsvUploadResponse,
  MessageGenerationRequest,
  MessageGenerationResponse,
  MusicSearchResponse,
  VideoGenerationRequest,
  BatchVideoResponse,
  HolidayTheme,
} from '@card0r/shared';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {},
    headers: Record<string, string> = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async validateApiKeys(keys: ApiKeyValidationRequest): Promise<ApiKeyValidationResponse> {
    return this.fetch<ApiKeyValidationResponse>('/validate-keys', {
      method: 'POST',
      body: JSON.stringify(keys),
    });
  }

  async uploadCsv(file: File): Promise<CsvUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload-csv`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('CSV upload failed');
    }

    return response.json();
  }

  async generateMessages(
    request: MessageGenerationRequest,
    openaiKey: string
  ): Promise<MessageGenerationResponse> {
    return this.fetch<MessageGenerationResponse>(
      '/generate-messages',
      {
        method: 'POST',
        body: JSON.stringify(request),
      },
      { 'x-openai-key': openaiKey }
    );
  }

  async fetchMusic(theme: HolidayTheme, jamendoKey: string): Promise<MusicSearchResponse> {
    return this.fetch<MusicSearchResponse>(
      `/music/${theme}`,
      {
        method: 'GET',
      },
      { 'x-jamendo-key': jamendoKey }
    );
  }

  async generateVideos(request: VideoGenerationRequest): Promise<BatchVideoResponse> {
    return this.fetch<BatchVideoResponse>('/videos/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getJobStatus(jobId: string): Promise<BatchVideoResponse> {
    return this.fetch<BatchVideoResponse>(`/videos/status/${jobId}`, {
      method: 'GET',
    });
  }
}

export const apiClient = new ApiClient();
