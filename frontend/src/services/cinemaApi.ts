// TMDB API is proxied through /tmdb-api/* (Cloudflare Pages Function)
// The API key is injected server-side in functions/tmdb-api/[[path]].js


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
  status?: string;
}

export interface TMDBRecord {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  overview?: string;
  media_type?: string;
}

export interface TMDBResponse {
  results?: TMDBRecord[];
}

export interface TMDBDetailResponse {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  backdrop_path?: string;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  genres?: { name: string }[];
  seasons?: {
    season_number: number;
    episode_count: number;
    name?: string;
  }[];
}

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  // API key is injected server-side by the Cloudflare Pages function at /tmdb-api/*
  // No need to send it from the client — keeps key out of the browser bundle
  const queryParams = new URLSearchParams(params);
  const queryStr = queryParams.toString();
  const res = await fetch(`/tmdb-api${path}${queryStr ? `?${queryStr}` : ''}`);
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

export const cinemaApi = {
  // Get trending movies for the week
  getTrendingMovies: async (): Promise<CinemaMovie[]> => {
    const data = await tmdbFetch<TMDBResponse>('/trending/movie/week');
    return (data.results || []).map((m: TMDBRecord) => ({
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
    const data = await tmdbFetch<TMDBResponse>('/trending/tv/week');
    return (data.results || []).map((m: TMDBRecord) => ({
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
    const data = await tmdbFetch<TMDBResponse>('/search/multi', { query });
    return (data.results || [])
      .filter((m: TMDBRecord) => m.media_type === 'movie' || m.media_type === 'tv')
      .map((m: TMDBRecord) => ({
        id: m.id.toString(),
        title: m.title || m.name || m.original_title || 'Untitled',
        imageUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : '',
        backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : '',
        mediaType: (m.media_type || 'movie') as 'movie' | 'tv',
        releaseDate: m.release_date || m.first_air_date || '',
        rating: m.vote_average || 0,
        overview: m.overview || '',
      }));
  },

  // Get detailed information of a movie or TV show
  getMovieDetails: async (id: string, mediaType: 'movie' | 'tv'): Promise<CinemaMovieDetail> => {
    const path = `/${mediaType}/${id}`;
    const data = await tmdbFetch<TMDBDetailResponse>(path);
    return {
      id: data.id.toString(),
      title: data.title || data.name || 'Untitled',
      imageUrl: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : '',
      backdropUrl: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : '',
      description: data.overview || 'No description available.',
      mediaType,
      releaseDate: data.release_date || data.first_air_date || '',
      rating: data.vote_average || 0,
      genres: (data.genres || []).map((g: { name: string }) => g.name),
      seasons: data.seasons ? data.seasons.map((s: { season_number: number; episode_count: number; name?: string }) => ({
        season_number: s.season_number,
        episode_count: s.episode_count,
        name: s.name,
      })) : undefined,
    };
  },

  // Get recommended titles for a movie or TV show
  getRecommendations: async (id: string, mediaType: 'movie' | 'tv'): Promise<CinemaMovie[]> => {
    const data = await tmdbFetch<TMDBResponse>(`/${mediaType}/${id}/recommendations`);
    return (data.results || []).map((m: TMDBRecord) => ({
      id: m.id.toString(),
      title: m.title || m.name || 'Untitled',
      imageUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : '',
      backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : '',
      mediaType: mediaType,
      releaseDate: m.release_date || m.first_air_date || '',
      rating: m.vote_average || 0,
      overview: m.overview || '',
    }));
  },

  // Get top rated movies
  getTopRated: async (): Promise<CinemaMovie[]> => {
    const data = await tmdbFetch<TMDBResponse>('/movie/top_rated');
    return (data.results || []).map((m: TMDBRecord) => ({
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

  // Get upcoming movies
  getUpcoming: async (): Promise<CinemaMovie[]> => {
    const data = await tmdbFetch<TMDBResponse>('/movie/upcoming');
    return (data.results || []).map((m: TMDBRecord) => ({
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

  // Get releases for a specific month/year
  getReleasesByMonth: async (year: number, month: number): Promise<CinemaMovie[]> => {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;
    
    // We fetch both movies and TV for a complete schedule
    const [movieData, tvData] = await Promise.all([
      tmdbFetch<TMDBResponse>('/discover/movie', {
        'primary_release_date.gte': startDate,
        'primary_release_date.lte': endDate,
        'sort_by': 'popularity.desc'
      }),
      tmdbFetch<TMDBResponse>('/discover/tv', {
        'first_air_date.gte': startDate,
        'first_air_date.lte': endDate,
        'sort_by': 'popularity.desc'
      })
    ]);

    const movies = (movieData.results || []).map((m: TMDBRecord) => ({
      id: m.id.toString(),
      title: m.title || m.original_title || 'Untitled Movie',
      imageUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : '',
      backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : '',
      mediaType: 'movie' as const,
      releaseDate: m.release_date || '',
      rating: m.vote_average || 0,
      overview: m.overview || '',
    }));

    const tv = (tvData.results || []).map((m: TMDBRecord) => ({
      id: m.id.toString(),
      title: m.name || m.original_name || 'Untitled Show',
      imageUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : '',
      backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : '',
      mediaType: 'tv' as const,
      releaseDate: m.first_air_date || '',
      rating: m.vote_average || 0,
      overview: m.overview || '',
    }));

    return [...movies, ...tv].sort((a, b) => {
      const dateA = a.releaseDate || '9999-99-99';
      const dateB = b.releaseDate || '9999-99-99';
      return dateA.localeCompare(dateB);
    });
  },
};
