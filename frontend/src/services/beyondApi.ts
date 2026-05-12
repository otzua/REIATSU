import axios from 'axios';

const MUSIC_API_BASE = '';

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
  status: number;
  recentrelease: number;
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
    const res = await axios.get<BeyondVideo[]>(`${MUSIC_API_BASE}/beyond`);
    return res.data;
  },

  /**
   * Fetch full details for a video slug.
   */
  getDetails: async (slug: string): Promise<BeyondDetails> => {
    const res = await axios.get<BeyondDetails>(`${MUSIC_API_BASE}/beyond/details`, {
      params: { slug }
    });
    return res.data;
  },

  /**
   * Search for videos.
   */
  search: async (query: string): Promise<BeyondVideo[]> => {
    const res = await axios.get<BeyondVideo[]>(`${MUSIC_API_BASE}/beyond/search`, {
      params: { q: query }
    });
    return res.data;
  }
};
