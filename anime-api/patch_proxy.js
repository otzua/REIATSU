import fs from 'fs';

const filePath = '/Users/otzua/CODE/REIATSU/anime-api/api/beyond.js';
let content = fs.readFileSync(filePath, 'utf8');

const regex = /\/\*\*\n \* GET \/api\/beyond\/proxy-image\n \*\/[\s\S]+?export default beyond;/;

const replacement = `/**
 * GET /api/beyond/proxy-image
 */
beyond.get('/proxy-image', async (c) => {
  const url = c.req.query('url');
  if (!url) return c.text('Missing url', 400);

  try {
    const response = await fetch(url, {
      headers: { 'Referer': 'https://hanime.tv/' }
    });
    if (!response.ok) throw new Error('Fetch failed');

    const buffer = await response.arrayBuffer();
    c.header('Content-Type', response.headers.get('content-type') || 'image/jpeg');
    c.header('Cache-Control', 'public, max-age=86400');
    return c.body(buffer);
  } catch (error) {
    return c.text('Failed to proxy image', 500);
  }
});

/**
 * GET /api/beyond/proxy-m3u8
 */
beyond.get('/proxy-m3u8', async (c) => {
  const url = c.req.query('url');
  if (!url) return c.text('Missing url', 400);

  try {
    const response = await fetch(url, {
      headers: { 'Referer': 'https://hanime.tv/' }
    });
    if (!response.ok) throw new Error('Fetch failed');

    let manifest = await response.text();
    const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);

    manifest = manifest.replace(/^(?!#)(.+)$/gm, (match) => {
      const segmentUrl = match.startsWith('http') ? match : baseUrl + match;
      return segmentUrl;
    });

    c.header('Content-Type', 'application/vnd.apple.mpegurl');
    c.header('Cache-Control', 'no-cache');
    c.header('Access-Control-Allow-Origin', '*');
    return c.text(manifest);
  } catch (error) {
    return c.text('Failed to proxy m3u8', 500);
  }
});

/**
 * GET /api/beyond/proxy-segment
 */
beyond.get('/proxy-segment', async (c) => {
  const url = c.req.query('url');
  if (!url) return c.text('Missing url', 400);

  try {
    const response = await fetch(url, {
      headers: { 'Referer': 'https://hanime.tv/' }
    });
    if (!response.ok) throw new Error('Fetch failed');

    const buffer = await response.arrayBuffer();

    c.header('Content-Type', response.headers.get('content-type') || 'video/MP2T');
    c.header('Content-Length', buffer.byteLength.toString());
    c.header('Cache-Control', 'public, max-age=3600');
    c.header('Access-Control-Allow-Origin', '*');
    return c.body(buffer);
  } catch (error) {
    console.error('[Proxy Segment Error]', error.message, url);
    return c.text('Failed to proxy segment', 500);
  }
});

/**
 * GET /api/beyond/proxy-video
 * Proxies direct MP4/video files with support for Range requests (seeking)
 */
beyond.get('/proxy-video', async (c) => {
  const url = c.req.query('url');
  if (!url) return c.text('Missing url', 400);

  const range = c.req.header('Range');
  
  // Dynamic Referer based on the target URL
  let referer = 'https://hanime.tv/';
  if (url.includes('hstorage.xyz') || url.includes('watchhentai')) {
    referer = 'https://watchhentai.net/';
  }

  const headers = {
    'Referer': referer,
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  };
  if (range) headers['Range'] = range;

  try {
    const response = await fetch(url, { headers });
    if (!response.ok && response.status !== 206) throw new Error('Fetch failed');

    const contentType = response.headers.get('content-type') || 'video/mp4';
    const contentLength = response.headers.get('content-length');
    const contentRange = response.headers.get('content-range');
    const acceptRanges = response.headers.get('accept-ranges');

    c.header('Content-Type', contentType);
    if (contentLength) c.header('Content-Length', contentLength);
    if (contentRange) c.header('Content-Range', contentRange);
    if (acceptRanges) c.header('Accept-Ranges', acceptRanges);
    
    c.status(response.status);
    c.header('Access-Control-Allow-Origin', '*');
    
    return c.body(response.body);
  } catch (error) {
    console.error('[Proxy Video Error]', error.message, url);
    return c.text('Failed to proxy video', 500);
  }
});

export default beyond;
`;

content = content.replace(regex, replacement);
fs.writeFileSync(filePath, content, 'utf8');
