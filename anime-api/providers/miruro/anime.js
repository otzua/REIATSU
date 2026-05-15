import axios from 'axios';

const MIRURO_API_BASE = process.env.MIRURO_API_URL || 'http://localhost:4004';

const api = axios.create({
  baseURL: MIRURO_API_BASE,
  timeout: 30000,
});

export async function getHome() {
  const res = await api.get('/home');
  return res.data.data;
}

export async function getIndex() {
  const res = await api.get('/index');
  return res.data.data;
}

export async function getById(id) {
  try {
    const res = await api.get(`/info/${id}`);
    const m = res.data.data;
    
    // Normalize to Reiatsu AnimeDetail format
    return {
      anime: {
        id: String(m.id),
        name: (m.title?.english || m.title?.romaji || ''),
        poster: (m.coverImage?.extraLarge || m.coverImage?.large),
        description: m.description || '',
        type: m.format || 'TV',
        status: m.status || 'FINISHED',
        rating: m.averageScore ? String(m.averageScore) : null,
        episodes: { sub: m.episodes || 0, dub: null },
        genres: m.genres || [],
        studios: m.studios?.nodes?.map(s => s.name) || [],
        duration: m.duration ? `${m.duration}m` : null,
        premiered: m.startDate ? `${m.startDate.year}` : null,
        malId: m.idMal,
        alId: m.id
      },
      seasons: [],
      related: m.relations?.edges?.map(e => ({
        id: String(e.node.id),
        name: e.node.title?.english || e.node.title?.romaji,
        poster: e.node.coverImage?.large,
        type: e.node.format,
        episodes: { sub: e.node.episodes, dub: null }
      })) || [],
      recommended: m.recommendations?.nodes?.map(r => ({
        id: String(r.mediaRecommendation?.id),
        name: r.mediaRecommendation?.title?.english || r.mediaRecommendation?.title?.romaji,
        poster: r.mediaRecommendation?.coverImage?.large,
        type: r.mediaRecommendation?.format,
        episodes: { sub: r.mediaRecommendation?.episodes, dub: null }
      })) || []
    };
  } catch (error) {
    console.error(`[Miruro] Failed to fetch info for ${id}:`, error.message);
    throw error; // Re-throw for details as we can't show much without it
  }
}

export async function getEpisodes(id) {
  try {
    const res = await api.get(`/episodes/${id}`);
    const data = res.data.data;
    
    const providers = data.providers || {};
    const firstProvider = Object.values(providers)[0];
    const eps = firstProvider?.episodes?.sub || firstProvider?.episodes || [];
    
    return {
      totalEpisodes: eps.length,
      episodes: eps.map(e => ({
        number: e.number,
        title: e.title || `Episode ${e.number}`,
        isFiller: false,
        hasSub: true,
        hasDub: false,
        id: e.id
      }))
    };
  } catch (error) {
    console.warn(`[Miruro] Failed to fetch episodes for ${id}: ${error.message}`);
    return {
      totalEpisodes: 0,
      episodes: []
    };
  }
}

export async function getEpisode(animeId, number) {
  // Miruro doesn't have a direct /ep/{num} but we can get it from getEpisodes
  const epsData = await getEpisodes(animeId);
  const ep = epsData.episodes.find(e => e.number === Number(number));
  if (!ep) throw new Error('Episode not found');
  
  try {
    // ep.id is the full watch path (e.g., "watch/gogoanime/182205/sub/gogoanime-1")
    // We need to ensure it has a leading slash if we use it with api.get
    const watchPath = ep.id.startsWith('/') ? ep.id : `/${ep.id}`;
    const sourcesRes = await api.get(watchPath);
    const sourcesData = sourcesRes.data.data;
    
    // Normalize sources to Reiatsu format
    // We pick the first m3u8 source as primary 'sub'
    const mainSource = sourcesData.sources?.find(s => s.isM3U8)?.url || sourcesData.sources?.[0]?.url;
    
    return {
      episode: {
        number: ep.number,
        title: ep.title,
        sources: {
          sub: mainSource,
          // You could add more sources here if needed
        }
      }
    };
  } catch (error) {
    console.error(`[Miruro] Failed to fetch sources for ${ep.id}:`, error.message);
    return {
      episode: {
        number: ep.number,
        title: ep.title,
        sources: {}
      }
    };
  }
}

export async function getNavMenu() {
  const res = await api.get('/nav');
  return res.data.data.header;
}

export async function getGenre(name, page) {
  const res = await api.get(`/filter?genre=${name}&page=${page}`);
  const data = res.data.data;
  return {
    title: name,
    animes: data.results.map(m => ({
      id: String(m.id),
      name: m.title?.english || m.title?.romaji,
      poster: m.coverImage?.large,
      episodes: { sub: m.episodes, dub: null }
    })),
    currentPage: data.page,
    hasNextPage: data.hasNextPage
  };
}
