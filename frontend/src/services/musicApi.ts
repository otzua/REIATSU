import axios from 'axios';

const MUSIC_API_BASE = '/api/music';

export interface Track {
  id: string;
  name: string;
  artist: string;
  album: string;
  poster: string;
  url: string; // Spotify URL (for reference only)
  duration_ms?: number;
}

export interface Album {
  id: string;
  name: string;
  artist: string;
  poster: string;
  category: 'Hollywood' | 'Bollywood';
  year?: string;
  tracks?: Track[];
}

export interface Artist {
  id: string;
  name: string;
  description?: string;
  followers?: string;
  poster: string;
  tracks: Track[];
}

export interface StreamResult {
  stream_url: string;
  direct_url?: string;
  title: string;
  thumbnail: string;
  user_agent?: string;
}

export interface DownloadResult {
  message: string;
  /** "SpotiFLAC (Lossless)" | "yt-dlp (Fallback)" */
  engine: string;
  url: string;
  name?: string;
  artist?: string;
  downloadUrl?: string;
}

export interface LyricsResult {
  plainLyrics: string | null;
  syncedLyrics: string | null;
  instrumental?: boolean;
}

export const musicApi = {
  /**
   * Search for tracks via YouTube Music.
   */
  search: async (q: string, limit = 20): Promise<Track[]> => {
    const res = await axios.get<Track[]>(`${MUSIC_API_BASE}/search`, {
      params: { q, limit },
    });
    return res.data;
  },

  stream: async (track: Track): Promise<StreamResult> => {
    // If track has a valid YouTube video ID (11 chars, alphanumeric with - or _), use it!
    const isYoutubeId = track.id && /^[a-zA-Z0-9_-]{11}$/.test(track.id);
    const q = isYoutubeId ? track.id : `${track.artist} - ${track.name}`;
    
    try {
      const res = await axios.get<StreamResult>(`${MUSIC_API_BASE}/stream`, {
        params: { q },
      });

      const rawUrl = res.data.stream_url;
      
      // If the backend returned a Cobalt tunnel URL, it's IP-locked to the Vercel server.
      // If the browser tries to play it, Cobalt returns 403 Forbidden. We MUST fetch it client-side.
      if (rawUrl.includes('cobalt') || rawUrl.includes('tunnel') || rawUrl.includes('kittycat')) {
        console.log("REIATSU: Backend returned IP-locked Cobalt URL. Deferring to client-side Cobalt fallback...");
        throw new Error("Cobalt IP lock bypass required");
      }

      const userAgentParam = res.data.user_agent ? `&ua=${encodeURIComponent(res.data.user_agent)}` : '';
      const proxiedUrl = `${MUSIC_API_BASE}/audio-proxy?url=${encodeURIComponent(rawUrl)}${userAgentParam}`;

      return {
        ...res.data,
        stream_url: rawUrl,
        direct_url: proxiedUrl,
      };
    } catch (err) {
      if (!isYoutubeId) throw err; // Can only do client-side Cobalt if we have a valid YouTube ID
      
      console.log("REIATSU: Backend stream failed or IP-locked. Attempting client-side Cobalt generation...");
      const instances = [
        "https://cobaltapi.kittycat.boo",
        "https://apicobalt.mgytr.top",
        "https://dog.kittycat.boo",
        "https://nuko-c.meowing.de",
        "https://subito-c.meowing.de"
      ];
      const ytUrl = `https://www.youtube.com/watch?v=${track.id}`;
      
      for (const inst of instances) {
        try {
          const res = await axios.post(inst, { url: ytUrl, downloadMode: "audio", audioFormat: "mp3" }, { 
            headers: { Accept: "application/json", "Content-Type": "application/json" },
            timeout: 6000 
          });
          if (res.data?.url) {
            console.log(`REIATSU: Client-side Cobalt succeeded via ${inst}`);
            return {
              stream_url: res.data.url,
              title: track.name,
              thumbnail: track.poster
            };
          }
        } catch (e) {
          // Fallback to v7 Cobalt payload
          try {
            const res2 = await axios.post(inst, { url: ytUrl, isAudioOnly: true, aFormat: "mp3" }, { 
              headers: { Accept: "application/json", "Content-Type": "application/json" },
              timeout: 6000
            });
            if (res2.data?.url) {
              console.log(`REIATSU: Client-side Cobalt (v7) succeeded via ${inst}`);
              return {
                stream_url: res2.data.url,
                title: track.name,
                thumbnail: track.poster
              };
            }
          } catch (e2) {} // Ignore and try next instance
        }
      }
      throw new Error("All streaming engines and client fallbacks failed.");
    }
  },



  /**
   * Download a track as lossless FLAC in the background.
   *
   * Routing logic (handled server-side):
   *  - Spotify URL  → SpotiFLAC engine (Tidal → Qobuz → Deezer, true lossless)
   *  - Everything else → yt-dlp fallback (YT Music search → FLAC)
   *
   * Returns DownloadResult so callers can show the correct engine in the UI.
   */
  download: async (track: Track | string): Promise<DownloadResult> => {
    if (typeof track === 'string') {
      const res = await axios.get<DownloadResult>(`${MUSIC_API_BASE}/download`, {
        params: {
          url: track,
          name: 'Manual Download',
          artist: 'Unknown Artist',
        },
      });
      return res.data;
    }

    // Prefer track.url (Spotify link from Lossless Sync tab).
    // Search results from YT Music have no Spotify URL, so fall back to "Artist - Name".
    const url = track.url || `${track.artist} - ${track.name}`;
    const res = await axios.get<DownloadResult>(`${MUSIC_API_BASE}/download`, {
      params: {
        url,
        name: track.name,
        artist: track.artist,
      },
    });
    return res.data;
  },

  /**
   * Get trending tracks.
   */
  trending: async (limit = 20): Promise<Track[]> => {
    const res = await axios.get<Track[]>(`${MUSIC_API_BASE}/trending`, {
      params: { limit },
    });
    return res.data;
  },

  /**
   * Get latest releases.
   */
  latest: async (limit = 20): Promise<Track[]> => {
    const res = await axios.get<Track[]>(`${MUSIC_API_BASE}/latest`, {
      params: { limit },
    });
    return res.data;
  },

  /**
   * Get popular artists.
   */
  popularArtists: async (limit = 20): Promise<Track[]> => {
    const res = await axios.get<Track[]>(`${MUSIC_API_BASE}/popular-artists`, {
      params: { limit },
    });
    return res.data;
  },

  /**
   * Get curated albums list.
   */
  albums: async (): Promise<Album[]> => {
    const res = await axios.get<Album[]>(`${MUSIC_API_BASE}/albums`);
    return res.data;
  },

  /**
   * Get album details and tracks list.
   */
  getAlbum: async (albumId: string): Promise<Album> => {
    const res = await axios.get<Album>(`${MUSIC_API_BASE}/album/${albumId}`);
    return res.data;
  },

  /**
   * Get artist details and top songs.
   */
  getArtist: async (artistId: string): Promise<Artist> => {
    const res = await axios.get<Artist>(`${MUSIC_API_BASE}/artist/${artistId}`);
    return res.data;
  },

  /**
   * Search and resolve an artist's browseId by name.
   */
  resolveArtistId: async (name: string): Promise<{ id: string | null }> => {
    const res = await axios.get<{ id: string | null }>(`${MUSIC_API_BASE}/artist/resolve-id`, {
      params: { name }
    });
    return res.data;
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

  /**
   * Get the current status of a background download.
   */
  downloadStatus: async (url: string): Promise<{ status: string; file?: string }> => {
    const res = await axios.get<{ status: string; file?: string }>(`${MUSIC_API_BASE}/download-status`, {
      params: { url }
    });
    return res.data;
  },

  /**
   * Get lyrics for a track.
   */
  lyrics: async (track_name: string, artist_name: string): Promise<LyricsResult> => {
    const res = await axios.get<LyricsResult>(`${MUSIC_API_BASE}/lyrics`, {
      params: { track_name, artist_name }
    });
    return res.data;
  },
};
