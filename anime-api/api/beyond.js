import { Hono } from 'hono';
import axios from 'axios';
import { HanimeClient } from '../hanime/dist/index.js';

const beyond = new Hono();
const hanimeClient = new HanimeClient();
const ALPHA_BASE = 'https://www.alphaapis.org';
const HANIME_SEARCH_API = 'https://search.htv-services.com';
const HANIME_VIDEO_API = 'https://hanime.tv/api/v8/video';
const WATCHHENTAI_API = 'https://watchhentai-api-main.vercel.app/api';

/**
 * GET /api/beyond
 * Fetches recent/trending videos from Hanime or WatchHentai
 */
beyond.get('/', async (c) => {
  const server = c.req.query('server') || 'hanime';

  if (server === 'watchhentai') {
    try {
      const res = await axios.get(`${WATCHHENTAI_API}/videos`);
      const items = res.data?.data?.items?.map(item => {
        const epSlug = item.url ? item.url.split('/videos/')[1]?.replace(/\//g, '') : item.id;
        return {
          id: `wh:${epSlug}`,
          title: item.title || `${item.series} ${item.episodeTitle}`,
          embedUrl: item.url,
          thumbnail: item.thumbnail,
          description: `Posted: ${item.posted || 'recently'} • Views: ${item.views || 'N/A'}`,
          pubDate: new Date().toISOString()
        };
      }) || [];
      return c.json({ success: true, data: items });
    } catch (err) {
      console.error('[WatchHentai Feed Error]', err.message);
      return c.json({ success: false, error: 'Failed to fetch WatchHentai feed' }, 500);
    }
  }

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
    console.error('[Beyond Feed Error]', error);
    return c.json({ success: false, error: 'Failed to fetch beyond feed' }, 500);
  }
});

const detailsCache = new Map();

/**
 * GET /api/beyond/details
 * Fetches full details from Hanime or WatchHentai
 */
beyond.get('/details', async (c) => {
  const slug = c.req.query('slug');
  if (!slug) return c.json({ success: false, error: 'Missing slug' }, 400);

  if (detailsCache.has(slug)) {
    const cached = detailsCache.get(slug);
    if (Date.now() - cached.time < 1000 * 60 * 10) {
      return c.json({ success: true, data: cached.data });
    }
  }

  if (slug.startsWith('wh:')) {
    try {
      let targetSlug = slug.replace('wh:', '');
      
      // If it's a series from search, get the series details and grab the first episode!
      if (targetSlug.startsWith('series:')) {
        const seriesSlug = targetSlug.replace('series:', '');
        const seriesRes = await axios.get(`${WATCHHENTAI_API}/series/${seriesSlug}`);
        const episodes = seriesRes.data?.data?.episodes || [];
        if (episodes.length > 0) {
          const firstEpUrl = episodes[0].url;
          targetSlug = firstEpUrl.split('/videos/')[1]?.replace(/\//g, '');
        } else {
          throw new Error('No episodes found for this series');
        }
      }

      const watchRes = await axios.get(`${WATCHHENTAI_API}/watch/${targetSlug}`);
      const data = watchRes.data?.data;

      const bestStream = data.player?.sources?.[0]?.src || data.player?.src || '';
      const allStreams = data.player?.sources?.map(s => ({
        url: s.src,
        filename: s.label || '1080p',
        resolution: s.label || '1080p',
        height: parseInt(s.label) || 1080
      })) || [{ url: bestStream, filename: '1080p', resolution: '1080p', height: 1080 }];

      const result = {
        info: [{
          id: parseInt(data.id) || Date.now(),
          urlname: slug,
          videoname: data.title || data.seriesTitle || 'WatchHentai Stream',
          description: data.synopsis || 'High fidelity uncensored anime stream.',
          releasedate: data.uploadDate || new Date().toISOString(),
          uploaddate: data.uploadDate || new Date().toISOString(),
          coverimg: data.thumbnail || data.seriesPoster || '',
          series: data.seriesTitle || null,
          views: parseInt(data.views) || 0,
          rating: "9.5",
          status: 1,
          recentrelease: 1,
          best_stream: bestStream,
          streams: allStreams
        }],
        genres: data.genres?.map(g => ({ genre: g.name })) || []
      };

      detailsCache.set(slug, { data: result, time: Date.now() });

      return c.json({ success: true, data: result });
    } catch (err) {
      console.error('[WatchHentai Details Error]', err.message);
      return c.json({ success: false, error: 'Failed to fetch WatchHentai details' }, 500);
    }
  }

  try {
    const hanimeData = await hanimeClient.getHentaiVideo(slug);

    const vManifest = hanimeData.videosManifest || hanimeData.videos_manifest;
    const hVideo = hanimeData.hentaiVideo || hanimeData.hentai_video;
    const hTags = hanimeData.hentaiTags || hanimeData.hentai_tags;

    let bestStream = null;
    let allStreams = [];

    // Use WatchHentai API as the high-fidelity extraction engine
    try {
      const videoTitle = hVideo?.name || slug;
      let cleanTitle = videoTitle.replace(/\b(ep|episode)?\s*\d+/i, '').trim();
      if (!cleanTitle) cleanTitle = videoTitle;

      const searchRes = await axios.get(`${WATCHHENTAI_API}/search`, { params: { q: cleanTitle } });
      const results = searchRes.data?.data?.results || [];
      if (results.length > 0) {
        let targetUrl = results[0].url;
        if (targetUrl.includes('/series/')) {
          const seriesSlug = targetUrl.split('/series/')[1]?.replace(/\//g, '');
          const seriesRes = await axios.get(`${WATCHHENTAI_API}/series/${seriesSlug}`);
          const episodes = seriesRes.data?.data?.episodes || [];
          
          const epMatch = slug.match(/\d+$/);
          const epNum = epMatch ? parseInt(epMatch[0], 10) : 1;

          const matchedEp = episodes.find(ep => ep.number === epNum) || episodes[0];
          if (matchedEp) {
            targetUrl = matchedEp.url;
          }
        }

        if (targetUrl.includes('/videos/')) {
          const watchSlug = targetUrl.split('/videos/')[1]?.replace(/\//g, '');
          const watchRes = await axios.get(`${WATCHHENTAI_API}/watch/${watchSlug}`);
          const data = watchRes.data?.data;
          if (data?.player) {
            const sources = data.player.sources || [];
            bestStream = sources.find(s => s.label === '720p')?.src || sources[0]?.src || data.player.src;
            allStreams = sources.map(s => ({
              url: s.src,
              filename: s.label || '1080p',
              resolution: s.label || '1080p',
              height: parseInt(s.label) || 1080
            })) || [{ url: bestStream, filename: '1080p', resolution: '1080p', height: 1080 }];
          }
        }
      }
    } catch (extractErr) {
      console.error('[WatchHentai Extraction Fallback Error]', extractErr.message);
    }

    // Fallback to Hanime manifest if extraction is unavailable
    if (!bestStream && vManifest?.servers?.length > 0) {
      const server = vManifest.servers[0];
      if (server.streams?.length > 0) {
        allStreams = server.streams.map(s => ({
          url: s.url,
          height: s.height ? parseInt(s.height, 10) : 1080
        }));
        bestStream = allStreams[0].url;
      }
    }

    const result = {
      info: [{
        id: hVideo?.id || Date.now(),
        urlname: hVideo?.slug || slug,
        videoname: hVideo?.name || slug,
        description: hVideo?.description ? hVideo.description.replace(/<[^>]*>?/gm, '').trim() : '',
        releasedate: hVideo?.releasedAt || hVideo?.released_at || new Date().toISOString(),
        uploaddate: hVideo?.createdAt || hVideo?.created_at || new Date().toISOString(),
        coverimg: hVideo?.posterUrl || hVideo?.poster_url ? `/api/beyond/proxy-image?url=${encodeURIComponent(hVideo.posterUrl || hVideo.poster_url)}` : '',
        series: hVideo?.brand || null,
        views: hVideo?.views || 0,
        rating: hVideo?.rating || 0,
        status: 1,
        recentrelease: 1,
        best_stream: bestStream,
        streams: allStreams
      }],
      genres: hTags?.map(tag => ({ genre: tag.text })) || []
    };

    detailsCache.set(slug, { data: result, time: Date.now() });

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
 */
beyond.get('/search', async (c) => {
  const q = c.req.query('q');
  const server = c.req.query('server') || 'hanime';
  if (!q) return c.json({ success: true, data: [] });

  if (server === 'watchhentai') {
    try {
      const res = await axios.get(`${WATCHHENTAI_API}/search`, { params: { q } });
      const results = res.data?.data?.results?.map(item => {
        const seriesSlug = item.url ? item.url.split('/series/')[1]?.replace(/\//g, '') : 'unknown';
        return {
          id: `wh:series:${seriesSlug}`,
          title: item.title,
          embedUrl: item.url,
          thumbnail: item.poster,
          description: item.description || `Released: ${item.year || 'N/A'}`,
          pubDate: new Date().toISOString()
        };
      }) || [];
      return c.json({ success: true, data: results });
    } catch (err) {
      console.error('[WatchHentai Search Error]', err.message);
      return c.json({ success: false, error: 'Failed to perform WatchHentai search' }, 500);
    }
  }

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

    manifest = manifest.replace(/^(?!#)(.+)$/gm, (match) => {
      const segmentUrl = match.startsWith('http') ? match : baseUrl + match;
      const encodedUrl = encodeURIComponent(segmentUrl);
      
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
 */
beyond.get('/proxy-segment', async (c) => {
  const url = c.req.query('url');
  if (!url) return c.text('Missing url', 400);

  try {
    const response = await axios.get(url, {
      headers: { 
        'Referer': 'https://hanime.tv/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      responseType: 'arraybuffer',
      timeout: 10000
    });

    c.header('Content-Type', response.headers['content-type'] || 'video/MP2T');
    c.header('Content-Length', response.data.length.toString());
    c.header('Cache-Control', 'public, max-age=3600');
    c.header('Access-Control-Allow-Origin', '*');
    return c.body(response.data);
  } catch (error) {
    console.error('[Proxy Segment Error]', error.message, url);
    return c.text('Failed to proxy segment', 500);
  }
});

export default beyond;
