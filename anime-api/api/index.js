// api/index.js
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handle } from '@hono/node-server/vercel';
import { getProvider, getProviderWithFallback } from '../core/providerManager.js';
import { cacheStats, cacheDel } from '../utils/cache.js';
import { findClosestMatch } from '../utils/string.js';
import { POPULAR_TITLES } from '../constants/popular.js';
import beyond from './beyond.js';


const app = new Hono();

const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : '*';

app.use('*', cors({
  origin: (origin) => {
    if (allowedOrigins === '*') return '*';
    if (allowedOrigins.includes(origin)) return origin;
    return allowedOrigins[0]; // Fallback or reject
  }
}));

// ─── Root ────────────────────────────────────────────────────────────────────
app.get('/', (c) => c.json({
  status: 'ok',
  message: 'Anime API',
  providers: ['anikai', 'anikoto'],
  defaultProvider: 'anikai',
  docs: 'See README.md for endpoint documentation',
  endpoints: {
    anime: '/api/v2/{provider}/anime/{id}',
    episodes: '/api/v2/{provider}/anime/{id}/episodes',
    episode: '/api/v2/{provider}/anime/{id}/ep/{number}',
    search: '/api/v2/{provider}/search?q=',
    browse: '/api/v2/{provider}/browse',
    home: '/api/v2/{provider}/home',
    index: '/api/v2/{provider}/index',
    genre: '/api/v2/{provider}/genre/{name}',
    category: '/api/v2/{provider}/category/{name}',
    type: '/api/v2/{provider}/type/{name}',
    azlist: '/api/v2/{provider}/azlist/{sort}',
    nav: '/api/v2/{provider}/nav',
    beyond: '/api/beyond',
    cacheStats: '/cache/stats',
  }
}));

// ─── Beyond Section ──────────────────────────────────────────────────────────
app.route('/api/beyond', beyond);

// ─── Helper ──────────────────────────────────────────────────────────────────

function ok(c, data) {
  return c.json({ success: true, data });
}

function err(c, message, status = 500) {
  console.error(`[ERROR] ${message}`);
  return c.json({ success: false, error: message }, status);
}

// ─── Cache stats (debug) ──────────────────────────────────────────────────────
app.get('/cache/stats', (c) => {
  const authHeader = c.req.header('X-Admin-Secret');
  const adminSecret = process.env.ADMIN_SECRET;
  if (!adminSecret || authHeader !== adminSecret) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  return c.json({ success: true, cache: cacheStats() });
});

// ─── Home ─────────────────────────────────────────────────────────────────────
app.get('/api/v2/:provider/home', async (c) => {
  try {
    const p = await getProvider(c.req.param('provider'));
    const data = await p.anime.getHome();
    return ok(c, data);
  } catch (e) {
    return err(c, e.message);
  }
});

// ─── Index / landing page ─────────────────────────────────────────────────────
app.get('/api/v2/:provider/index', async (c) => {
  try {
    const p = await getProvider(c.req.param('provider'));
    const data = await p.anime.getIndex();
    return ok(c, data);
  } catch (e) {
    return err(c, e.message);
  }
});

// ─── Anime detail ─────────────────────────────────────────────────────────────
app.get('/api/v2/:provider/anime/:animeId', async (c) => {
  try {
    const p = await getProvider(c.req.param('provider'));
    const data = await p.anime.getById(c.req.param('animeId'));
    return ok(c, data);
  } catch (e) {
    return err(c, e.message);
  }
});

// ─── Episode list ─────────────────────────────────────────────────────────────
app.get('/api/v2/:provider/anime/:animeId/episodes', async (c) => {
  try {
    const p = await getProvider(c.req.param('provider'));
    const data = await p.anime.getEpisodes(c.req.param('animeId'));
    return ok(c, data);
  } catch (e) {
    return err(c, e.message);
  }
});

// ─── Single episode ───────────────────────────────────────────────────────────
app.get('/api/v2/:provider/anime/:animeId/ep/:number', async (c) => {
  try {
    const p = await getProvider(c.req.param('provider'));
    const data = await p.anime.getEpisode(c.req.param('animeId'), c.req.param('number'));
    return ok(c, data);
  } catch (e) {
    return err(c, e.message);
  }
});

// ─── Search ───────────────────────────────────────────────────────────────────
app.get('/api/v2/:provider/search', async (c) => {
  try {
    const q = c.req.query('q');
    if (!q) return err(c, 'Missing query parameter: q', 400);
    
    const p = await getProvider(c.req.param('provider'));
    const page = parseInt(c.req.query('page') || '1', 10);
    
    // Extract all filters except q, page, provider
    const { q: _q, page: _p, provider: _pr, ...filters } = Object.fromEntries(
      Object.entries(c.req.query()).filter(([k]) => !['q', 'page', 'provider'].includes(k))
    );
    
    const data = await p.search.query(q, page, filters);

    let suggestion = null;

    // --- RELEVANCE FILTERING & SUGGESTION ---
    // Make search more accurate by scoring results against the query
    if (data.animes && data.animes.length > 0) {
      const queryLower = q.toLowerCase();
      data.animes = data.animes
        .map(anime => {
          const nameLower = (anime.name || '').toLowerCase();
          const jnameLower = (anime.jname || '').toLowerCase();
          let score = 0;

          // Exact match
          if (nameLower === queryLower || jnameLower === queryLower) score += 100;
          // Starts with query
          else if (nameLower.startsWith(queryLower) || jnameLower.startsWith(queryLower)) score += 80;
          // Contains query as a word
          else if (nameLower.includes(` ${queryLower}`) || nameLower.includes(`${queryLower} `)) score += 60;
          // Contains query anywhere
          else if (nameLower.includes(queryLower) || jnameLower.includes(queryLower)) score += 40;
          
          return { ...anime, _score: score };
        })
        // Filter out absolute noise (results with 0 score that don't even contain the query)
        // We only filter if it's the first page to avoid empty results on deep browsing
        .filter(anime => page > 1 || anime._score > 0)
        .sort((a, b) => b._score - a._score)
        .map(({ _score, ...rest }) => rest);
    }

    // If no results on first page, look for a suggestion
    if (page === 1 && (!data.animes || data.animes.length === 0)) {
      suggestion = findClosestMatch(q, POPULAR_TITLES);
    }

    return ok(c, { ...data, suggestion });
  } catch (e) {
    return err(c, e.message);
  }
});

// ─── Browse ───────────────────────────────────────────────────────────────────
app.get('/api/v2/:provider/browse', async (c) => {
  try {
    const p = await getProvider(c.req.param('provider'));
    const page = parseInt(c.req.query('page') || '1', 10);
    
    const { page: _p, provider: _pr, ...filters } = Object.fromEntries(
      Object.entries(c.req.query()).filter(([k]) => !['page', 'provider'].includes(k))
    );
    
    const data = await p.search.browse(filters, page);
    return ok(c, data);
  } catch (e) {
    return err(c, e.message);
  }
});

// ─── AZ List ──────────────────────────────────────────────────────────────────
app.get('/api/v2/:provider/azlist/:sortOption', async (c) => {
  try {
    const p = await getProvider(c.req.param('provider'));
    const sort = c.req.param('sortOption');
    const page = parseInt(c.req.query('page') || '1', 10);
    const data = await p.anime.getAzList(sort, page);
    return ok(c, data);
  } catch (e) {
    return err(c, e.message);
  }
});

app.get('/api/v2/:provider/azlist', async (c) => {
  try {
    const p = await getProvider(c.req.param('provider'));
    const page = parseInt(c.req.query('page') || '1', 10);
    const data = await p.anime.getAzList('all', page);
    return ok(c, data);
  } catch (e) {
    return err(c, e.message);
  }
});

// ─── Genre ────────────────────────────────────────────────────────────────────
app.get('/api/v2/:provider/genre/:name', async (c) => {
  try {
    const p = await getProvider(c.req.param('provider'));
    const name = c.req.param('name');
    const page = parseInt(c.req.query('page') || '1', 10);
    const sort = c.req.query('sort') || null;
    const data = await p.anime.getGenre(name, page, sort);
    return ok(c, { 
      genreName: data.title || name, 
      animes: data.animes, 
      currentPage: data.currentPage, 
      totalPages: data.totalPages, 
      hasNextPage: data.hasNextPage 
    });
  } catch (e) {
    return err(c, e.message);
  }
});

// ─── Category ─────────────────────────────────────────────────────────────────
app.get('/api/v2/:provider/category/:name', async (c) => {
  try {
    const p = await getProvider(c.req.param('provider'));
    const name = c.req.param('name');
    const page = parseInt(c.req.query('page') || '1', 10);
    const sort = c.req.query('sort') || null;
    const data = await p.anime.getCategory(name, page, sort);
    return ok(c, { 
      category: data.title || name, 
      animes: data.animes, 
      currentPage: data.currentPage, 
      totalPages: data.totalPages, 
      hasNextPage: data.hasNextPage 
    });
  } catch (e) {
    return err(c, e.message);
  }
});

// ─── Type ──────────────────────────────────────────────────────────────────────
app.get('/api/v2/:provider/type/:name', async (c) => {
  try {
    const p = await getProvider(c.req.param('provider'));
    const name = c.req.param('name');
    const page = parseInt(c.req.query('page') || '1', 10);
    const sort = c.req.query('sort') || null;
    const data = await p.anime.getType(name, page, sort);
    return ok(c, { 
      type: data.title || name, 
      animes: data.animes, 
      currentPage: data.currentPage, 
      totalPages: data.totalPages, 
      hasNextPage: data.hasNextPage 
    });
  } catch (e) {
    return err(c, e.message);
  }
});

// ─── Nav menu ─────────────────────────────────────────────────────────────────
app.get('/api/v2/:provider/nav', async (c) => {
  try {
    const providerName = c.req.param('provider');
    const p = await getProvider(providerName);
    const data = await p.anime.getNavMenu(providerName);
    return ok(c, { header: data });
  } catch (e) {
    return err(c, e.message);
  }
});

// ─── Shorthand routes (no provider prefix → uses defaultProvider) ────────────
app.get('/api/home', async (c) => {
  const { name, provider: p } = await getProviderWithFallback(c.req.query('provider'));
  try {
    return ok(c, { provider: name, ...(await p.anime.getHome()) });
  } catch (e) {
    return err(c, e.message);
  }
});

app.get('/api/index', async (c) => {
  const { name, provider: p } = await getProviderWithFallback(c.req.query('provider'));
  try {
    return ok(c, { provider: name, ...(await p.anime.getIndex()) });
  } catch (e) {
    return err(c, e.message);
  }
});

app.get('/api/search', async (c) => {
  const q = c.req.query('q');
  if (!q) return err(c, 'Missing q', 400);
  const { name, provider: p } = await getProviderWithFallback(c.req.query('provider'));
  const page = parseInt(c.req.query('page') || '1', 10);
  try {
    const data = await p.search.query(q, page);
    
    let suggestion = null;

    // --- RELEVANCE FILTERING ---
    if (data.animes && data.animes.length > 0) {
      const queryLower = q.toLowerCase();
      data.animes = data.animes
        .map(anime => {
          const nameLower = (anime.name || '').toLowerCase();
          const jnameLower = (anime.jname || '').toLowerCase();
          let score = 0;
          if (nameLower === queryLower || jnameLower === queryLower) score += 100;
          else if (nameLower.startsWith(queryLower) || jnameLower.startsWith(queryLower)) score += 80;
          else if (nameLower.includes(` ${queryLower}`) || nameLower.includes(`${queryLower} `)) score += 60;
          else if (nameLower.includes(queryLower) || jnameLower.includes(queryLower)) score += 40;
          return { ...anime, _score: score };
        })
        .filter(anime => page > 1 || anime._score > 0)
        .sort((a, b) => b._score - a._score)
        .map(({ _score, ...rest }) => rest);
    }

    // If no results on first page, look for a suggestion
    if (page === 1 && (!data.animes || data.animes.length === 0)) {
      suggestion = findClosestMatch(q, POPULAR_TITLES);
    }

    return ok(c, { provider: name, ...data, suggestion });
  } catch (e) {
    return err(c, e.message);
  }
});

app.get('/api/browse', async (c) => {
  const { name, provider: p } = await getProviderWithFallback(c.req.query('provider'));
  const page = parseInt(c.req.query('page') || '1', 10);
  const { page: _p, provider: _pr, ...filters } = Object.fromEntries(
    Object.entries(c.req.query()).filter(([k]) => !['page', 'provider'].includes(k))
  );
  try {
    return ok(c, { provider: name, ...(await p.search.browse(filters, page)) });
  } catch (e) {
    return err(c, e.message);
  }
});

app.get('/api/schedule', async (c) => {
  const day = c.req.query('day');
  if (!day) return err(c, 'Missing query parameter: day', 400);
  
  try {
    const res = await fetch(`https://api.jikan.moe/v4/schedules?filter=${day}`);
    if (!res.ok) throw new Error('Failed to fetch from Jikan API');
    const json = await res.json();
    return ok(c, json.data);
  } catch (e) {
    return err(c, e.message);
  }
});

app.get('/api/anime/:id', async (c) => {
  const { name, provider: p } = await getProviderWithFallback(c.req.query('provider'));
  try {
    return ok(c, { provider: name, ...(await p.anime.getById(c.req.param('id'))) });
  } catch (e) {
    return err(c, e.message);
  }
});

app.get('/api/anime/:id/episodes', async (c) => {
  const { name, provider: p } = await getProviderWithFallback(c.req.query('provider'));
  try {
    return ok(c, { provider: name, ...(await p.anime.getEpisodes(c.req.param('id'))) });
  } catch (e) {
    return err(c, e.message);
  }
});

app.get('/api/anime/:id/ep/:number', async (c) => {
  const { name, provider: p } = await getProviderWithFallback(c.req.query('provider'));
  try {
    return ok(c, { provider: name, ...(await p.anime.getEpisode(c.req.param('id'), c.req.param('number'))) });
  } catch (e) {
    return err(c, e.message);
  }
});

app.get('/api/genre/:name', async (c) => {
  const { name, provider: p } = await getProviderWithFallback(c.req.query('provider'));
  const pg = parseInt(c.req.query('page') || '1', 10);
  const sort = c.req.query('sort') || null;
  try {
    const d = await p.anime.getGenre(c.req.param('name'), pg, sort);
    return ok(c, { provider: name, ...d });
  } catch (e) {
    return err(c, e.message);
  }
});

app.get('/api/category/:name', async (c) => {
  const { name, provider: p } = await getProviderWithFallback(c.req.query('provider'));
  const pg = parseInt(c.req.query('page') || '1', 10);
  const sort = c.req.query('sort') || null;
  try {
    const d = await p.anime.getCategory(c.req.param('name'), pg, sort);
    return ok(c, { provider: name, ...d });
  } catch (e) {
    return err(c, e.message);
  }
});

app.get('/api/type/:name', async (c) => {
  const { name, provider: p } = await getProviderWithFallback(c.req.query('provider'));
  const pg = parseInt(c.req.query('page') || '1', 10);
  const sort = c.req.query('sort') || null;
  try {
    const d = await p.anime.getType(c.req.param('name'), pg, sort);
    return ok(c, { provider: name, type: d.title, animes: d.animes, currentPage: d.currentPage, totalPages: d.totalPages, hasNextPage: d.hasNextPage });
  } catch (e) {
    return err(c, e.message);
  }
});

app.get('/api/azlist/:sort', async (c) => {
  const { name, provider: p } = await getProviderWithFallback(c.req.query('provider'));
  const pg = parseInt(c.req.query('page') || '1', 10);
  try {
    return ok(c, { provider: name, ...(await p.anime.getAzList(c.req.param('sort'), pg)) });
  } catch (e) {
    return err(c, e.message);
  }
});

app.get('/api/nav', async (c) => {
  const providerName = c.req.query('provider') || 'miruro';
  try {
    const p = await getProvider(providerName);
    return ok(c, { provider: providerName, header: await p.anime.getNavMenu(providerName) });
  } catch (e) {
    return err(c, e.message);
  }
});

// ─── Error handler ────────────────────────────────────────────────────────────
app.onError((error, c) => {
  console.error('[FATAL]', error);
  return err(c, error.message);
});

// ─── Export ───────────────────────────────────────────────────────────────────
export { app };
export default handle(app);
