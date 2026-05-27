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
  otherInfo?: string[];
}

export interface AnimeCard {
  id: string;
  name: string;
  jname: string | null;
  poster: string;
  type: string | null;
  episodes: { sub: number | null; dub: number | null };
  otherInfo?: string[];
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
  provider?: string;
  anime: {
    id: string;
    name: string;
    poster: string;
    description: string;
    type: string;
    status: string;
    rating?: string;
    episodes: { sub: number | null; dub: number | null };
    genres?: string[];
    studios?: string[];
    duration?: string;
    premiered?: string;
    malId?: string;
    alId?: string;
  };
  seasons: unknown[];
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


export interface ScheduleAnime {
  mal_id: number;
  title: string;
  images: { jpg: { large_image_url: string } };
  broadcast: { time: string; string: string };
  genres: { name: string }[];
  synopsis: string;
}

export const animeApi = {
  getHome: (provider?: string) => 
    apiFetch<HomeData>(provider ? `${BASE}/v2/${provider}/home` : `${BASE}/home`),

  search: (query: string, page = 1, provider?: string) =>
    apiFetch<SearchResult>(provider 
      ? `${BASE}/v2/${provider}/search?q=${encodeURIComponent(query)}&page=${page}`
      : `${BASE}/search?q=${encodeURIComponent(query)}&page=${page}`),

  getAnime: (id: string, provider?: string) => 
    apiFetch<AnimeDetail>(provider ? `${BASE}/v2/${provider}/anime/${id}` : `${BASE}/anime/${id}`),

  getEpisodes: async (id: string, provider?: string): Promise<EpisodeData> => {
    const url = provider ? `${BASE}/v2/${provider}/anime/${id}/episodes` : `${BASE}/anime/${id}/episodes`;
    return apiFetch<EpisodeData>(url);
  },

  getEpisode: (id: string, num: number, provider?: string) => 
    apiFetch<EpisodeDetail>(provider 
      ? `${BASE}/v2/${provider}/anime/${id}/ep/${num}`
      : `${BASE}/anime/${id}/ep/${num}`),

  getType: (name: string, page = 1, provider?: string) =>
    apiFetch<{ type: string; animes: AnimeCard[] }>(provider
      ? `${BASE}/v2/${provider}/type/${name}?page=${page}`
      : `${BASE}/type/${name}?page=${page}`),

  getSchedule: (day: string) =>
    apiFetch<ScheduleAnime[]>(`${BASE}/schedule?day=${day}`),
};
