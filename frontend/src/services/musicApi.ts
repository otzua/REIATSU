import axios from 'axios';

const MUSIC_API_BASE = import.meta.env.VITE_MUSIC_API_URL || 'http://localhost:8000';

export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  poster: string;
  url: string; // Spotify URL (for reference only)
  duration_ms?: number;
}

export interface StreamResult {
  stream_url: string;
  title: string;
  thumbnail: string;
  user_agent?: string;
}

export const musicApi = {
  /**
   * Search for tracks via Spotify.
   */
  search: async (q: string, limit = 20): Promise<Track[]> => {
    const res = await axios.get<Track[]>(`${MUSIC_API_BASE}/search`, {
      params: { q, limit },
    });
    return res.data;
  },

  /**
   * Get a direct YouTube stream URL for playback.
   * Pass "Artist - Track Name" as the query for best results.
   */
  stream: async (track: Track): Promise<StreamResult> => {
    const q = `${track.artist} - ${track.name}`;
    const res = await axios.get<StreamResult>(`${MUSIC_API_BASE}/stream`, {
      params: { q },
    });
    
    // Wrap the returned YouTube URL into our localhost audio-proxy to prevent 403 Forbidden
    const userAgentParam = res.data.user_agent ? `&ua=${encodeURIComponent(res.data.user_agent)}` : '';
    const proxiedUrl = `${MUSIC_API_BASE}/audio-proxy?url=${encodeURIComponent(res.data.stream_url)}${userAgentParam}`;
    
    return {
      ...res.data,
      stream_url: proxiedUrl,
    };
  },

  /**
   * Download track as FLAC in the background.
   */
  download: async (track: Track): Promise<void> => {
    // Pass Spotify URL or YouTube URL if available, otherwise artist - name
    const url = track.url || `${track.artist} - ${track.name}`;
    await axios.get(`${MUSIC_API_BASE}/download`, {
      params: { 
        url,
        name: track.name,
        artist: track.artist
      },
    });
  },

  /**
   * Check if the music API is online.
   */
  status: async (): Promise<boolean> => {
    try {
      await axios.get(`${MUSIC_API_BASE}/status`, { timeout: 3000 });
      return true;
    } catch {
      return false;
    }
  },
};
