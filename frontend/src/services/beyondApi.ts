import axios from 'axios';

const API_HOST = import.meta.env.VITE_API_URL || '';
export const MUSIC_API_BASE = API_HOST ? `${API_HOST}/api` : '/api';

export interface BeyondVideo {
  id: string; // The slug
  title: string;
  link?: string;
  description?: string;
  pubDate?: string;
  embedUrl: string;
  thumbnail: string;
}

export interface BeyondDetailGenre {
  genre: string;
}

export interface BeyondDetailInfo {
  id: number;
  urlname: string;
  videoname: string;
  description: string;
  releasedate: string;
  uploaddate: string;
  coverimg: string;
  series: string | null;
  views?: number;
  rating?: string | null;
  status: number;
  recentrelease: number;
  best_stream?: string | null;
  streams?: Array<{
    url: string;
    filename: string;
    resolution: string;
    height: number;
  }>;
}

export interface BeyondDetails {
  info: BeyondDetailInfo[];
  genres: BeyondDetailGenre[];
}

export const beyondApi = {
  /**
   * Fetch recent videos.
   */
  getFeed: async (): Promise<BeyondVideo[]> => {
    const res = await axios.get<{ success: boolean, data: BeyondVideo[] }>(`${MUSIC_API_BASE}/beyond`);
    return res.data.data;
  },

  /**
   * Fetch full details for a video slug.
   */
  getDetails: async (slug: string): Promise<BeyondDetails> => {
    const res = await axios.get<{ success: boolean, data: BeyondDetails }>(`${MUSIC_API_BASE}/beyond/details`, {
      params: { slug }
    });
    return res.data.data;
  },

  /**
   * Search for videos.
   */
  search: async (query: string): Promise<BeyondVideo[]> => {
    const res = await axios.get<{ success: boolean, data: BeyondVideo[] }>(`${MUSIC_API_BASE}/beyond/search`, {
      params: { q: query }
    });
    return res.data.data;
  },

  /**
   * Extract video streams directly from the client.
   */
  extractStream: async (url: string): Promise<any> => {
    const res = await axios.get('https://www.alphaapis.org/api/v1/extract', {
      params: { url }
    });
    return res.data;
  }
};
