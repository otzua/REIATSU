import { Hono } from 'hono';
import axios from 'axios';

const beyond = new Hono();
const ALPHA_BASE = 'https://www.alphaapis.org';
const HANIME_SEARCH_API = 'https://search.htv-services.com';
const HANIME_VIDEO_API = 'https://hanime.tv/api/v8/video';

/**
 * GET /api/beyond
 * Fetches recent/trending videos from Hanime via search API
 */
beyond.get('/', async (c) => {
  try {
    const response = await axios.post(HANIME_SEARCH_API, {
      search_text: "",
      tags: [],
      tags_mode: "AND",
      brands: [],
      blacklist: [],
      order_by: "created_at_unix",
      ordering: "desc",
      page_number: 1
    });

    const hits = typeof response.data.hits === 'string' 
      ? JSON.parse(response.data.hits) 
      : response.data.hits;

    const items = hits.map(hit => ({
      id: hit.slug,
      title: hit.name,
      embedUrl: `https://hanime.tv/videos/hentai/${hit.slug}`, // Initial URL, extracted later
      thumbnail: hit.poster_url || hit.cover_url ? `/api/beyond/proxy-image?url=${encodeURIComponent(hit.poster_url || hit.cover_url)}` : '',
      description: hit.description ? hit.description.replace(/<[^>]*>?/gm, '').trim() : '',
      pubDate: hit.created_at ? new Date(hit.created_at * 1000).toISOString() : ''
    }));

    return c.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('[Beyond Feed Error]', error);
    return c.json({ success: false, error: 'Failed to fetch beyond feed' }, 500);
  }
});

/**
 * GET /api/beyond/details
 * Fetches full details from Hanime + extracts stream URLs via AlphaAPIs
 */
beyond.get('/details', async (c) => {
  const slug = c.req.query('slug');
  if (!slug) return c.json({ success: false, error: 'Missing slug' }, 400);

  try {
    // 1. Get metadata from Hanime
    const hanimeRes = await axios.get(`${HANIME_VIDEO_API}?id=${slug}`);
    const hanimeData = hanimeRes.data;

    // 2. Extract streams from AlphaAPIs
    const extractRes = await axios.get(`${ALPHA_BASE}/api/v1/extract`, {
      params: { url: `https://hanime.tv/videos/hentai/${slug}` }
    });
    
    const extraction = extractRes.data;

    // Map to a consistent detail format
    // We'll wrap it in a structure that the frontend expects
    const result = {
      info: [{
        id: hanimeData.hentai_video.id,
        urlname: hanimeData.hentai_video.slug,
        videoname: hanimeData.hentai_video.name,
        description: hanimeData.hentai_video.description ? hanimeData.hentai_video.description.replace(/<[^>]*>?/gm, '').trim() : '',
        releasedate: hanimeData.hentai_video.released_at,
        uploaddate: hanimeData.hentai_video.created_at,
        coverimg: hanimeData.hentai_video.poster_url ? `/api/beyond/proxy-image?url=${encodeURIComponent(hanimeData.hentai_video.poster_url)}` : '',
        series: hanimeData.hentai_video.brand || null,
        views: hanimeData.hentai_video.views,
        rating: hanimeData.hentai_video.rating,
        status: 1,
        recentrelease: 1,
        // Custom fields for the new player
        best_stream: extraction.success ? extraction.best_stream : null,
        streams: extraction.success ? extraction.streams : []
      }],
      genres: hanimeData.hentai_tags?.map(tag => ({ genre: tag.text })) || []
    };

    return c.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[Beyond Details Error]', error);
    return c.json({ success: false, error: 'Failed to fetch beyond details' }, 500);
  }
});

/**
 * GET /api/beyond/search
 * Uses Hanime search API
 */
beyond.get('/search', async (c) => {
  const q = c.req.query('q');
  if (!q) return c.json({ success: true, data: [] });

  try {
    const response = await axios.post(HANIME_SEARCH_API, {
      search_text: q,
      tags: [],
      tags_mode: "AND",
      brands: [],
      blacklist: [],
      order_by: "views",
      ordering: "desc",
      page_number: 1
    });

    const hits = typeof response.data.hits === 'string' 
      ? JSON.parse(response.data.hits) 
      : response.data.hits;

    const items = hits.map(hit => ({
      id: hit.slug,
      title: hit.name,
      embedUrl: `https://hanime.tv/videos/hentai/${hit.slug}`,
      thumbnail: hit.poster_url || hit.cover_url ? `/api/beyond/proxy-image?url=${encodeURIComponent(hit.poster_url || hit.cover_url)}` : '',
      description: hit.description ? hit.description.replace(/<[^>]*>?/gm, '').trim() : '',
      pubDate: hit.created_at ? new Date(hit.created_at * 1000).toISOString() : ''
    }));

    return c.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('[Beyond Search Error]', error);
    return c.json({ success: false, error: 'Failed to perform beyond search' }, 500);
  }
});

/**
 * GET /api/beyond/proxy-image
 * Proxies images from Hanime to bypass Referer checks
 */
beyond.get('/proxy-image', async (c) => {
  const url = c.req.query('url');
  if (!url) return c.text('Missing url', 400);

  try {
    const response = await axios.get(url, {
      headers: { 'Referer': 'https://hanime.tv/' },
      responseType: 'arraybuffer'
    });

    c.header('Content-Type', response.headers['content-type']);
    c.header('Cache-Control', 'public, max-age=86400');
    return c.body(response.data);
  } catch (error) {
    return c.text('Failed to proxy image', 500);
  }
});

/**
 * GET /api/beyond/proxy-m3u8
 * Proxies the m3u8 manifest and rewrites segment URLs to go through our proxy
 */
beyond.get('/proxy-m3u8', async (c) => {
  const url = c.req.query('url');
  if (!url) return c.text('Missing url', 400);

  try {
    const response = await axios.get(url, {
      headers: { 'Referer': 'https://hanime.tv/' }
    });
    
    let manifest = response.data;
    const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);

    // Rewrite relative URLs to absolute via proxy
    // This handles both relative and absolute segment URLs
    manifest = manifest.replace(/^(?!#)(.+)$/gm, (match) => {
      const segmentUrl = match.startsWith('http') ? match : baseUrl + match;
      const encodedUrl = encodeURIComponent(segmentUrl);
      
      // Determine if it's a sub-manifest or a segment
      if (segmentUrl.includes('.m3u8')) {
        return `/api/beyond/proxy-m3u8?url=${encodedUrl}`;
      }
      return `/api/beyond/proxy-segment?url=${encodedUrl}`;
    });

    c.header('Content-Type', 'application/x-mpegURL');
    return c.text(manifest);
  } catch (error) {
    return c.text('Failed to proxy m3u8', 500);
  }
});

/**
 * GET /api/beyond/proxy-segment
 * Proxies the actual video segments (.ts files) with the correct Referer
 */
beyond.get('/proxy-segment', async (c) => {
  const url = c.req.query('url');
  if (!url) return c.text('Missing url', 400);

  try {
    const response = await axios.get(url, {
      headers: { 'Referer': 'https://hanime.tv/' },
      responseType: 'stream'
    });

    c.header('Content-Type', response.headers['content-type']);
    // Pipe the stream directly to the response
    return c.body(response.data);
  } catch (error) {
    return c.text('Failed to proxy segment', 500);
  }
});

export default beyond;
