import axios from 'axios';
import { HolidayTheme } from '@card0r/shared';
import type { MusicSearchResponse, MusicTrack } from '@card0r/shared';

// Map holiday themes to Jamendo search tags
const MUSIC_KEYWORDS: Record<HolidayTheme, string> = {
  christmas: 'christmas',
  new_year: 'celebration',
  easter: 'happy',
  valentines_day: 'romantic',
  halloween: 'dark',
  thanksgiving: 'calm',
  rosh_hashanah: 'calm',
  hanukkah: 'happy',
  passover: 'calm',
  eid_al_fitr: 'happy',
  eid_al_adha: 'calm',
  ramadan: 'calm',
  chinese_new_year: 'happy',
  diwali: 'happy',
  lunar_new_year: 'happy',
  thank_you: 'happy',
  congratulations: 'celebration',
};

export async function fetchMusic(theme: HolidayTheme, apiKey: string): Promise<MusicSearchResponse> {
  try {
    const searchTag = MUSIC_KEYWORDS[theme] || 'happy';

    console.log(`[Jamendo] Fetching music - Theme: ${theme}, Tag: ${searchTag}, API Key: ${apiKey ? 'PROVIDED (***' + apiKey.slice(-4) + ')' : 'UNDEFINED'}`);

    const response = await axios.get('https://api.jamendo.com/v3.0/tracks/', {
      params: {
        client_id: apiKey,
        format: 'json',
        limit: 6,
        tags: searchTag,
        audioformat: 'mp32',
        include: 'musicinfo',
      },
      timeout: 10000
    });

    console.log(`[Jamendo] API Response - Status: ${response.status}, Results count: ${response.data?.results?.length || 0}`);

    if (!response.data || !response.data.results || response.data.results.length === 0) {
      console.warn(`[Jamendo] No music found for theme: ${theme}`);
      return { tracks: [] };
    }

    const tracks: MusicTrack[] = response.data.results.map((track: any) => ({
      id: track.id?.toString() || `track-${track.name}`,
      name: track.name || 'Untitled',
      downloadUrl: track.audio || track.audiodownload || '',
      duration: track.duration || 30,
      previewUrl: track.audio || track.audiodownload || '',
      tags: track.musicinfo?.tags?.genres || [searchTag]
    })).filter((track: MusicTrack) => track.downloadUrl);

    if (tracks.length === 0) {
      console.warn(`No valid tracks found for theme: ${theme}`);
    }

    return { tracks };
  } catch (error) {
    console.error('Jamendo music fetch error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response:', error.response?.data);
      console.error('Status:', error.response?.status);
    }
    return { tracks: [] };
  }
}
