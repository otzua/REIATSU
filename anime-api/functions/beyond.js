import { Hono } from 'hono';
import { handle } from 'hono/netlify';
import beyond from '../../api/beyond.js';

const app = new Hono();

// Mount the beyond router
app.route('/api/beyond', beyond);

export const handler = handle(app);
