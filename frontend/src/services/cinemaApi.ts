// Clean and optimized TMDB-based Cinema API service for the Reiatsu platform
const API_KEY = 'd131017ccc6e5462a81c9304d21476de';

export interface CinemaMovie {
  id: string;
  title: string;
  imageUrl: string;
  backdropUrl?: string;
  mediaType: 'movie' | 'tv';
  releaseDate?: string;
  rating?: number;
  overview?: string;
}

export interface CinemaMovieDetail {
  id: string;
  title: string;
  imageUrl: string;
  backdropUrl?: string;
  description: string;
  mediaType: 'movie' | 'tv';
  releaseDate?: string;
  rating?: number;
  genres?: string[];
  seasons?: {
    season_number: number;
    episode_count: number;
    name?: string;
  }[];
}

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const queryParams = new URLSearchParams({ api_key: API_KEY, ...params });
  // Using the /tmdb-api proxy defined in vite.config.ts and vercel.json.
  // This securely proxies requests to the Cloudflare Worker server-to-server,
  // completely bypassing ISP blocks on api.themoviedb.org and local browser CORS restrictions!
  const res = await fetch(`/tmdb-api${path}?${queryParams.toString()}`);
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

export const cinemaApi = {
  // Get trending movies for the week
  getTrendingMovies: async (): Promise<CinemaMovie[]> => {
    const data = await tmdbFetch<any>('/trending/movie/week');
    return (data.results || []).map((m: any) => ({
      id: m.id.toString(),
      title: m.title || m.original_title || 'Untitled Movie',
      imageUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : '',
      backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : '',
      mediaType: 'movie',
      releaseDate: m.release_date || '',
      rating: m.vote_average || 0,
      overview: m.overview || '',
    }));
  },

  // Get trending TV shows for the week
  getTrendingTV: async (): Promise<CinemaMovie[]> => {
    const data = await tmdbFetch<any>('/trending/tv/week');
    return (data.results || []).map((m: any) => ({
      id: m.id.toString(),
      title: m.name || m.original_name || 'Untitled Show',
      imageUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : '',
      backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : '',
      mediaType: 'tv',
      releaseDate: m.first_air_date || '',
      rating: m.vote_average || 0,
      overview: m.overview || '',
    }));
  },

  // Search across movies and TV series
  search: async (query: string): Promise<CinemaMovie[]> => {
    const data = await tmdbFetch<any>('/search/multi', { query });
    return (data.results || [])
      .filter((m: any) => m.media_type === 'movie' || m.media_type === 'tv')
      .map((m: any) => ({
        id: m.id.toString(),
        title: m.title || m.name || m.original_title || 'Untitled',
        imageUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : '',
        backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : '',
        mediaType: m.media_type as 'movie' | 'tv',
        releaseDate: m.release_date || m.first_air_date || '',
        rating: m.vote_average || 0,
        overview: m.overview || '',
      }));
  },

  // Get detailed information of a movie or TV show
  getMovieDetails: async (id: string, mediaType: 'movie' | 'tv'): Promise<CinemaMovieDetail> => {
    const path = `/${mediaType}/${id}`;
    const data = await tmdbFetch<any>(path);
    return {
      id: data.id.toString(),
      title: data.title || data.name || 'Untitled',
      imageUrl: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : '',
      backdropUrl: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : '',
      description: data.overview || 'No description available.',
      mediaType,
      releaseDate: data.release_date || data.first_air_date || '',
      rating: data.vote_average || 0,
      genres: (data.genres || []).map((g: any) => g.name),
      seasons: data.seasons ? data.seasons.map((s: any) => ({
        season_number: s.season_number,
        episode_count: s.episode_count,
        name: s.name,
      })) : undefined,
    };
  },
};
