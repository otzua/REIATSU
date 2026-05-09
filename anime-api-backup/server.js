// server.js – local dev wrapper for the Hono app
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { getProvider } from './core/providerManager.js';

const app = new Hono();

// ─── CORS for local dev ──────────────────────────────────────────────────────
app.use('*', async (c, next) => {
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type');
  if (c.req.method === 'OPTIONS') return c.text('', 204);
  await next();
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
const ok  = (c, data)            => c.json({ success: true,  data });
const err = (c, msg, s = 500)   => c.json({ success: false, error: msg }, s);

// ─── Root ────────────────────────────────────────────────────────────────────
app.get('/', (c) => c.json({ status: 'ok', message: 'Anime API is running' }));

// ─── Home ────────────────────────────────────────────────────────────────────
app.get('/api/v2/:provider/home', async (c) => {
  try { return ok(c, await (await getProvider(c.req.param('provider'))).anime.getHome()); }
  catch (e) { return err(c, e.message); }
});

// ─── Search ──────────────────────────────────────────────────────────────────
app.get('/api/v2/:provider/search', async (c) => {
  try {
    const p = await getProvider(c.req.param('provider'));
    const q    = c.req.query('q')    || '';
    const page = c.req.query('page') || '1';
    return ok(c, await p.anime.getSearchResults(q, page));
  } catch (e) { return err(c, e.message); }
});

// ─── Anime Detail ────────────────────────────────────────────────────────────
app.get('/api/v2/:provider/anime/:id', async (c) => {
  try { return ok(c, await (await getProvider(c.req.param('provider'))).anime.getAnimeDetails(c.req.param('id'))); }
  catch (e) { return err(c, e.message); }
});

// ─── Episodes ────────────────────────────────────────────────────────────────
app.get('/api/v2/:provider/anime/:id/episodes', async (c) => {
  try { return ok(c, await (await getProvider(c.req.param('provider'))).anime.getAnimeEpisodes(c.req.param('id'))); }
  catch (e) { return err(c, e.message); }
});

// ─── Single Episode ──────────────────────────────────────────────────────────
app.get('/api/v2/:provider/anime/:id/ep/:number', async (c) => {
  try { return ok(c, await (await getProvider(c.req.param('provider'))).anime.getEpisode(c.req.param('id'), c.req.param('number'))); }
  catch (e) { return err(c, e.message); }
});

// ─── Category ────────────────────────────────────────────────────────────────
app.get('/api/v2/:provider/category/:name', async (c) => {
  try { return ok(c, await (await getProvider(c.req.param('provider'))).anime.getCategory(c.req.param('name'))); }
  catch (e) { return err(c, e.message); }
});

// ─── Genre ───────────────────────────────────────────────────────────────────
app.get('/api/v2/:provider/genre/:name', async (c) => {
  try { return ok(c, await (await getProvider(c.req.param('provider'))).anime.getGenre(c.req.param('name'))); }
  catch (e) { return err(c, e.message); }
});

const PORT = 4000;
serve({ fetch: app.fetch, port: PORT });
console.log(`🍜 Anime API running on http://localhost:${PORT}`);
