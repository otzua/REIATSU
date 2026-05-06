// Central API service for the Reiatsu platform
// VITE_API_URL: set in .env for prod (e.g. https://your-api.vercel.app)
// Empty string falls back to the Vite dev proxy (/api -> localhost:4000)
const API_HOST = import.meta.env.VITE_API_URL ?? '';
const PROVIDER = 'anikoto';
const BASE = `${API_HOST}/api/v2/${PROVIDER}`;

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

export const animeApi = {
  getHome: () => apiFetch<HomeData>(`${BASE}/home`),

  search: (query: string, page = 1) =>
    apiFetch<SearchResult>(`${BASE}/search?q=${encodeURIComponent(query)}&page=${page}`),

  getAnime: (id: string) => apiFetch<unknown>(`${BASE}/anime/${id}`),

  getEpisodes: (id: string) => apiFetch<unknown>(`${BASE}/anime/${id}/episodes`),
};
