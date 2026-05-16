import axios from 'axios';

const ANIMEKAI_API_BASE = process.env.ANIMEKAI_API_URL || 'http://localhost:5005';

const api = axios.create({
  baseURL: ANIMEKAI_API_BASE,
  timeout: 10000,
});

export async function getHome() {
  const res = await api.get('/api/home');
  const d = res.data;
  if (!d.success) throw new Error(d.error || 'Failed to fetch AnimeKAI home');
  
  return {
    spotlightAnimes: (d.banner || []).map((b, i) => ({
      id: b.url.split('/watch/').pop() || `banner-${i}`,
      name: b.title,
      jname: b.japanese_title,
      poster: b.poster,
      description: b.description,
      rating: b.rating,
      rank: i + 1,
      genres: b.genres ? b.genres.split(',') : [],
      episodes: { 
        sub: b.sub_episodes ? parseInt(b.sub_episodes) : null, 
        dub: b.dub_episodes ? parseInt(b.dub_episodes) : null 
      },
    })),
    latestEpisodeAnimes: (d.latest_updates || []).map((l, i) => ({
      id: l.url.split('/watch/').pop() || `latest-${i}`,
      name: l.title,
      jname: l.japanese_title,
      poster: l.poster,
      type: l.type,
      episodes: { 
        sub: l.sub_episodes ? parseInt(l.sub_episodes) : null, 
        dub: l.dub_episodes ? parseInt(l.dub_episodes) : null 
      },
    })),
    top10Animes: {
      today: (d.top_trending?.DAY || []).map((t, i) => ({
        id: t.url.split('/watch/').pop() || `trending-day-${i}`,
        name: t.title,
        jname: t.japanese_title,
        poster: t.poster,
        type: t.type,
        episodes: { 
          sub: t.sub_episodes ? parseInt(t.sub_episodes) : null, 
          dub: t.dub_episodes ? parseInt(t.dub_episodes) : null 
        },
      })),
      week: (d.top_trending?.WEEK || []).map((t, i) => ({
        id: t.url.split('/watch/').pop() || `trending-week-${i}`,
        name: t.title,
        jname: t.japanese_title,
        poster: t.poster,
        type: t.type,
        episodes: { 
          sub: t.sub_episodes ? parseInt(t.sub_episodes) : null, 
          dub: t.dub_episodes ? parseInt(t.dub_episodes) : null 
        },
      })),
      month: (d.top_trending?.MONTH || []).map((t, i) => ({
        id: t.url.split('/watch/').pop() || `trending-month-${i}`,
        name: t.title,
        jname: t.japanese_title,
        poster: t.poster,
        type: t.type,
        episodes: { 
          sub: t.sub_episodes ? parseInt(t.sub_episodes) : null, 
          dub: t.dub_episodes ? parseInt(t.dub_episodes) : null 
        },
      }))
    },
    topUpcomingAnimes: [],
    newReleases: [],
    genres: [],
  };
}

export async function getById(id) {
  const res = await api.get(`/api/anime/${id}`);
  const d = res.data;
  if (!d.success) throw new Error(d.error || 'Failed to fetch AnimeKAI details');
  
  return {
    anime: {
      id: String(id),
      name: d.title,
      poster: d.poster,
      description: d.description,
      type: d.type || 'TV',
      status: 'UNKNOWN',
      rating: d.rating,
      episodes: { 
        sub: d.sub_episodes ? parseInt(d.sub_episodes) : null, 
        dub: d.dub_episodes ? parseInt(d.dub_episodes) : null 
      },
      genres: [],
      malId: d.mal_score || null,
      alId: d.ani_id || null
    },
    seasons: (d.seasons || []).map(s => ({
      name: s.title,
      poster: s.poster,
      episodes: s.episodes,
      active: s.active,
      id: s.url.split('/watch/').pop()
    })),
    related: [],
    recommended: []
  };
}

export async function getEpisodes(id) {
  const infoRes = await api.get(`/api/anime/${id}`);
  const aniId = infoRes.data.ani_id;
  if (!aniId) throw new Error('ani_id not found for episodes');
  
  const res = await api.get(`/api/episodes/${aniId}`);
  const d = res.data;
  if (!d.success) throw new Error(d.error || 'Failed to fetch AnimeKAI episodes');
  
  const eps = d.episodes || [];
  return {
    totalEpisodes: eps.length,
    episodes: eps.map((e) => ({
      number: parseFloat(e.number) || 0,
      title: e.title || `Episode ${e.number}`,
      isFiller: false,
      hasSub: e.has_sub,
      hasDub: e.has_dub,
      id: e.token
    }))
  };
}

export async function getEpisode(animeId, number) {
  const infoRes = await api.get(`/api/anime/${animeId}`);
  const aniId = infoRes.data.ani_id;
  if (!aniId) throw new Error('ani_id not found for episode');
  
  const res = await api.get(`/api/episodes/${aniId}`);
  const eps = res.data.episodes || [];
  const ep = eps.find(e => parseFloat(e.number) === parseFloat(number));
  if (!ep) throw new Error(`Episode ${number} not found`);
  
  const serversRes = await api.get(`/api/servers/${ep.token}`);
  const servers = serversRes.data.servers || {};
  
  let linkId = null;
  for (const lang of Object.keys(servers)) {
    if (servers[lang] && servers[lang].length > 0) {
      linkId = servers[lang][0].link_id;
      break;
    }
  }
  
  if (!linkId) throw new Error('No servers found');
  
  const sourceRes = await api.get(`/api/source/${linkId}`);
  const sourceData = sourceRes.data;
  if (!sourceData.success) throw new Error(sourceData.error || 'Failed to fetch source');
  
  let m3u8Url = sourceData.sources?.[0]?.file;
  if (!m3u8Url) m3u8Url = sourceData.embed_url;
  
  return {
    episode: {
      number: Number(number),
      title: ep.title || `Episode ${number}`,
      sources: {
        sub: m3u8Url
      }
    }
  };
}

export async function getNavMenu() { return []; }
export async function getGenre(name, page) { return { title: name, animes: [], currentPage: 1, hasNextPage: false }; }
export async function getCategory(name, page, sort) { return { title: name, animes: [], currentPage: 1, hasNextPage: false }; }
export async function getType(name, page, sort) { return getCategory(name, page, sort); }
export async function getAzList(sort, page) { return { animes: [], currentPage: 1, hasNextPage: false }; }