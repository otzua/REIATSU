// Central API service for the Reiatsu platform
// VITE_API_URL: set in .env for prod (e.g. https://your-api.vercel.app)
// Empty string falls back to the Vite dev proxy (/api -> localhost:4000)
const API_HOST = import.meta.env.VITE_API_URL || '';
const BASE = API_HOST ? `${API_HOST}/api` : '/api';

export interface SpotlightAnime {
  id: string;
  name: string;
  jname: string;
  poster: string;
  description: string;
  rating: string;
  rank: number;
  genres: string[];
  episodes: { sub: number | null; dub: number | null };
}

export interface AnimeCard {
  id: string;
  name: string;
  jname: string | null;
  poster: string;
  type: string | null;
  episodes: { sub: number | null; dub: number | null };
}

export interface HomeData {
  spotlightAnimes: SpotlightAnime[];
  latestEpisodeAnimes: AnimeCard[];
  newReleases: AnimeCard[];
  topUpcomingAnimes: AnimeCard[];
  top10Animes: {
    today: AnimeCard[];
    week: AnimeCard[];
    month: AnimeCard[];
  };
  genres: string[];
}

export interface SearchResult {
  animes: AnimeCard[];
  totalPages: number;
  currentPage: number;
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Unknown API error');
  return json.data as T;
}

export interface AnimeDetail {
  anime: {
    id: string;
    name: string;
    poster: string;
    description: string;
    type: string;
    status: string;
    rating?: string;
    episodes: { sub: number | null; dub: number | null };
  };
  seasons: any[];
  related: AnimeCard[];
  recommended: AnimeCard[];
}

export interface Episode {
  number: number;
  title: string;
  isFiller: boolean;
  hasSub: boolean;
  hasDub: boolean;
  sources?: Record<string, string>;
}

export interface EpisodeData {
  totalEpisodes: number;
  episodes: Episode[];
}

export interface EpisodeDetail {
  episode: {
    number: number;
    title: string;
    sources: {
      sub?: string;
      dub?: string;
      aniSub?: string;
      aniDub?: string;
    };
  };
}


export const animeApi = {
  getHome: () => apiFetch<HomeData>(`${BASE}/home`),

  search: (query: string, page = 1) =>
    apiFetch<SearchResult>(`${BASE}/search?q=${encodeURIComponent(query)}&page=${page}`),

  getAnime: (id: string) => apiFetch<AnimeDetail>(`${BASE}/anime/${id}`),

  getEpisodes: async (id: string): Promise<EpisodeData> => {
    const data = await apiFetch<EpisodeData>(`${BASE}/anime/${id}/episodes`);
    if (!data.episodes || data.episodes.length === 0) {
      console.warn(`REIATSU: No episodes found for ${id}, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      return apiFetch<EpisodeData>(`${BASE}/anime/${id}/episodes`);
    }
    return data;
  },

  getEpisode: (id: string, num: number) => 
    apiFetch<EpisodeDetail>(`${BASE}/anime/${id}/ep/${num}`),

  getType: (name: string, page = 1) =>
    apiFetch<{ type: string; animes: AnimeCard[] }>(`${BASE}/type/${name}?page=${page}`),
};
