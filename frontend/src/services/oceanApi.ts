import axios from 'axios';

const MUSIC_API_BASE = import.meta.env.VITE_MUSIC_API_URL || 'http://localhost:8000';

export interface OceanVideo {
  id: string; // The slug
  title: string;
  link: string;
  description: string;
  pubDate: string;
  embedUrl: string;
  thumbnail: string;
}

export interface OceanDetailGenre {
  genre: string;
}

export interface OceanDetailInfo {
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

export interface OceanDetails {
  info: OceanDetailInfo[];
  genres: OceanDetailGenre[];
}

export const oceanApi = {
  /**
   * Fetch recent videos from HentaiOcean RSS feed.
   */
  getFeed: async (): Promise<OceanVideo[]> => {
    const res = await axios.get<OceanVideo[]>(`${MUSIC_API_BASE}/ocean`);
    return res.data;
  },

  /**
   * Fetch full details for a video slug.
   */
  getDetails: async (slug: string): Promise<OceanDetails> => {
    const res = await axios.get<OceanDetails>(`${MUSIC_API_BASE}/ocean/details`, {
      params: { slug }
    });
    return res.data;
  }
};
