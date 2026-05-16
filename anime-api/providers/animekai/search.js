import axios from 'axios';

const ANIMEKAI_API_BASE = process.env.ANIMEKAI_API_URL || 'http://localhost:5005';

const api = axios.create({
  baseURL: ANIMEKAI_API_BASE,
  timeout: 30000,
});

export async function query(q, page = 1) {
  const res = await api.get(`/api/search?keyword=${encodeURIComponent(q)}`);
  const d = res.data;
  if (!d.success) throw new Error(d.error || 'Failed to fetch search results');
  
  return {
    animes: (d.results || []).map((r, i) => ({
      id: r.slug || `search-${i}`,
      name: r.title,
      jname: r.japanese_title,
      poster: r.poster,
      type: r.type,
      episodes: { 
        sub: r.sub_episodes ? parseInt(r.sub_episodes) : null, 
        dub: r.dub_episodes ? parseInt(r.dub_episodes) : null 
      },
    })),
    totalPages: 1,
    currentPage: 1
  };
}

export async function browse(filters, page = 1) {
  return { animes: [], totalPages: 1, currentPage: 1 };
}