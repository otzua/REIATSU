import express from 'express';
import cors from 'cors';
import { searchRedgifs, getRedgifsDetails } from './src/redgifs.js';
import { searchXhamster } from './src/xhamster/XhamsterSearch.js';
import { getXhamsterVideo } from './src/xhamster/XhamsterGet.js';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());

// ── status ────────────────────────────────────────────────────────────────────

app.get('/', (_, res) => res.json({ status: 'online', endpoints: [
  '/api/eporner/search/:query',
  '/api/eporner/details/:id',
  '/api/xhamster/search/:query',
  '/api/xhamster/details/:id',
]}));

// ── EPorner (Now using Redgifs backend) ───────────────────────────────────────

app.get('/api/eporner/search/:query', async (req, res) => {
  try {
    const query = req.params.query === 'all' ? 'porn' : req.params.query;
    const data = await searchRedgifs(query, Number(req.query.page ?? 1));
    res.json(data);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/eporner/details/:id', async (req, res) => {
  try {
    const data = await getRedgifsDetails(req.params.id);
    res.json(data);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// ── XHamster ──────────────────────────────────────────────────────────────────

app.get('/api/xhamster/search/:query', async (req, res) => {
  try {
    const data = await searchXhamster(req.params.query, Number(req.query.page ?? 1));
    res.json(data);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/api/xhamster/details/:id', async (req, res) => {
  try {
    const data = await getXhamsterVideo(req.params.id);
    res.json(data);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

app.listen(PORT, () => console.log(`eros-api running on :${PORT}`));

export default app;
