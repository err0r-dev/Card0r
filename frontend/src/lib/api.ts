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
  ZipGenerationResponse,
  ZipProgressResponse,
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

  async cancelVideoJob(jobId: string, videoJobId?: string): Promise<{ success: boolean; message: string }> {
    const endpoint = videoJobId
      ? `/videos/cancel/${jobId}/${videoJobId}`
      : `/videos/cancel/${jobId}`;
    return this.fetch<{ success: boolean; message: string }>(endpoint, {
      method: 'POST',
    });
  }

  async startZipGeneration(jobId: string): Promise<ZipGenerationResponse> {
    return this.fetch<ZipGenerationResponse>(`/videos/download-zip/${jobId}`, {
      method: 'POST',
    });
  }

  async getZipProgress(jobId: string): Promise<ZipProgressResponse> {
    return this.fetch<ZipProgressResponse>(`/videos/download-zip/${jobId}/progress`, {
      method: 'GET',
    });
  }

  async deleteVideo(videoUrl: string): Promise<{ success: boolean; message: string }> {
    // Extract filename from URL (e.g., "/videos/abc123.mp4" -> "abc123.mp4")
    const filename = videoUrl.split('/').pop() || '';
    return this.fetch<{ success: boolean; message: string }>(`/videos/delete/${filename}`, {
      method: 'DELETE',
    });
  }

  async deleteVideoBatch(videoUrls: string[]): Promise<{ success: boolean; message: string }> {
    // Extract filenames from URLs
    const filenames = videoUrls.map(url => url.split('/').pop() || '').filter(Boolean);
    return this.fetch<{ success: boolean; message: string }>('/videos/delete-batch', {
      method: 'POST',
      body: JSON.stringify({ filenames }),
    });
  }
}

export const apiClient = new ApiClient();
