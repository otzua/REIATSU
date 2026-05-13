import { serve } from '@hono/node-server';
import app from './src/index';

const port = 4005;
console.log(`[WatchHentai API] Server running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});
