// Holiday types
export enum HolidayTheme {
  // Major Western
  CHRISTMAS = 'christmas',
  NEW_YEAR = 'new_year',
  EASTER = 'easter',
  VALENTINES_DAY = 'valentines_day',
  HALLOWEEN = 'halloween',
  THANKSGIVING = 'thanksgiving',

  // Jewish
  ROSH_HASHANAH = 'rosh_hashanah',
  HANUKKAH = 'hanukkah',
  PASSOVER = 'passover',

  // Islamic
  EID_AL_FITR = 'eid_al_fitr',
  EID_AL_ADHA = 'eid_al_adha',
  RAMADAN = 'ramadan',

  // Asian
  CHINESE_NEW_YEAR = 'chinese_new_year',
  DIWALI = 'diwali',
  LUNAR_NEW_YEAR = 'lunar_new_year',

  // General
  THANK_YOU = 'thank_you',
  CONGRATULATIONS = 'congratulations',
}

export interface HolidayThemeInfo {
  id: HolidayTheme;
  name: string;
  category: 'western' | 'jewish' | 'islamic' | 'asian' | 'general';
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  keywords: string[]; // For music search
}

// Export format types
export enum VideoFormat {
  HD_1080P = '1080p',
  UHD_4K = '4k',
  SQUARE = 'square',
  SOCIAL = 'social',
}

export interface VideoFormatConfig {
  id: VideoFormat;
  name: string;
  width: number;
  height: number;
  description: string;
}

// Recipient types
export interface Recipient {
  id: string;
  name: string;
  messageGuidance: string;
}

export interface RecipientWithMessage extends Recipient {
  generatedMessage: string;
}

// API types
export interface ApiKeys {
  openai: string;
  jamendo: string;
}

export interface VideoGenerationRequest {
  recipients: RecipientWithMessage[];
  theme: HolidayTheme;
  format: VideoFormat;
  musicUrl?: string;
  senderName?: string;
}

export interface VideoGenerationJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-100
  recipientName: string;
  videoUrl?: string;
  error?: string;
}

export interface BatchVideoResponse {
  jobId: string;
  jobs: VideoGenerationJob[];
}

// Message generation types
export interface MessageGenerationRequest {
  recipients: Recipient[];
  theme: HolidayTheme;
  senderName?: string;
  targetWordCount?: number; // 5-100 words, defaults to 50
  creativity?: number; // 0-1, maps to AI temperature (0 = closer to original, 1 = more imaginative)
}

export interface MessageGenerationResponse {
  recipients: RecipientWithMessage[];
}

// Music types
export interface MusicTrack {
  id: string;
  name: string;
  downloadUrl: string;
  duration: number;
  previewUrl: string;
  tags: string[];
}

export interface MusicSearchResponse {
  tracks: MusicTrack[];
}

// Validation types
export interface ApiKeyValidationRequest {
  openai?: string;
  jamendo?: string;
}

export interface ApiKeyValidationResponse {
  openai: { valid: boolean; error?: string };
  jamendo: { valid: boolean; error?: string };
}

// CSV Upload types
export interface CsvUploadResponse {
  recipients: Recipient[];
  errors: string[];
}

// ZIP Download types
export interface ZipGenerationResponse {
  status: 'processing' | 'completed' | 'failed';
  message?: string;
  totalVideos?: number;
}

export interface ZipProgressResponse {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  zipPath?: string;
  error?: string;
}
