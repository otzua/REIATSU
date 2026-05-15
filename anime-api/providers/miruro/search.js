import axios from 'axios';

const MIRURO_API_BASE = process.env.MIRURO_API_URL || 'http://localhost:4004';

const api = axios.create({
  baseURL: MIRURO_API_BASE,
  timeout: 30000,
});

export async function query(q, page = 1) {
  const res = await api.get(`/search?query=${encodeURIComponent(q)}&page=${page}`);
  const data = res.data.data;
  
  return {
    animes: data.results.map(m => ({
      id: String(m.id),
      name: m.title?.english || m.title?.romaji,
      jname: m.title?.native,
      poster: m.coverImage?.large,
      type: m.format,
      episodes: { sub: m.episodes, dub: null }
    })),
    totalPages: Math.ceil(data.total / data.perPage),
    currentPage: data.page
  };
}

export async function browse(filters, page = 1) {
  // Convert filters to Miruro format
  const params = new URLSearchParams({ ...filters, page: page.toString() });
  const res = await api.get(`/filter?${params.toString()}`);
  const data = res.data.data;
  
  return {
    animes: data.results.map(m => ({
      id: String(m.id),
      name: m.title?.english || m.title?.romaji,
      poster: m.coverImage?.large,
      episodes: { sub: m.episodes, dub: null }
    })),
    totalPages: Math.ceil(data.total / data.perPage),
    currentPage: data.page
  };
}
