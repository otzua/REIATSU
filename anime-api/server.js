import { serve } from '@hono/node-server';
import { app } from './api/index.js';

const port = process.env.PORT || 4001;

console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port: Number(port),
});
