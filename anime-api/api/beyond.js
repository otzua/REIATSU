import { Hono } from 'hono';
import { HanimeClient } from '../hanime/dist/index.js';
import * as hanime1Scraper from './hanime1Scraper.js';

async function fetchJson(url, options = {}) {
  const { params, method = 'GET', body, timeout = 10000, ...rest } = options;
  const urlObj = new URL(url);
  urlObj.searchParams.append('_t', Date.now().toString());
  if (params) {
    Object.keys(params).forEach(key => urlObj.searchParams.append(key, params[key]));
  }
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const fetchOptions = {
      method,
      signal: controller.signal,
      ...rest
    };
    if (body) {
      fetchOptions.body = JSON.stringify(body);
      fetchOptions.headers = { ...fetchOptions.headers, 'Content-Type': 'application/json' };
    }
    const targetUrl = urlObj.toString();
    console.log('[fetchJson] Calling:', targetUrl);
    const res = await fetch(targetUrl, fetchOptions);
    if (!res.ok) {
      let bodyText = '';
      try { bodyText = await res.text(); } catch(_) {}
      console.error(`[fetchJson Error] Status: ${res.status}, Body: ${bodyText}`);
      throw new Error(`HTTP ${res.status}: Failed to fetch ${targetUrl}`);
    }
    const data = await res.json();
    return { data };
  } finally {
    clearTimeout(id);
  }
}


const beyond = new Hono();
const hanimeClient = new HanimeClient();
const ALPHA_BASE = 'https://www.alphaapis.org';
const HANIME_VIDEO_API = 'https://hanime.tv/api/v8/video';
const WATCHHENTAI_API = 'https://reiatsu-watchhentai-api.otzuaa.workers.dev/api';

/**
 * GET /api/beyond
 * Fetches recent/trending videos from Hanime or WatchHentai
 */
beyond.get('/', async (c) => {
  const server = c.req.query('server') || 'hanime';

  if (server === 'watchhentai') {
    try {
      const res = await fetchJson(`${WATCHHENTAI_API}/videos`, { timeout: 10000 });
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

  if (server === 'hanime1') {
    try {
      const items = await hanime1Scraper.getHomeData();
      return c.json({ success: true, data: items });
    } catch (err) {
      console.error('[Hanime1 Feed Error]', err.message);
      return c.json({ success: false, error: 'Failed to fetch Hanime1 feed' }, 500);
    }
  }

  // Hanime has no reachable data source left, so there is nothing to fetch here. Verified
  // from Cloudflare's own egress (`wrangler dev --remote`), i.e. not an IP-reputation issue:
  //   - search.htv-services.com (old feed/search host) => NXDOMAIN from its authoritative NS
  //   - hanime.tv/api/v8/*      (HanimeClient `web` base) => 404; the v8 API is retired
  //   - www.universal-cdn.com   (HanimeClient `app` base) => 403 Cloudflare challenge
  // hanime.tv now signs requests to guest.freeanimehentai.net with an in-browser WASM
  // signature plus Turnstile, which we deliberately do not attempt to reproduce.
  //
  // NOTE: /details appears to serve hanime content, but does not — getHentaiVideo() always
  // throws and it silently falls back to WatchHentai. Do not read that as the provider
  // working. Fail explicitly here rather than 500 with a misleading "failed to fetch".
  return c.json({
    success: false,
    error: 'Hanime provider is unavailable: its upstream API was discontinued. Use server=watchhentai.'
  }, 503);
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
      // If it's a series slug from search (wh:series:XXX), resolve to first episode
      if (targetSlug.startsWith('series:')) {
        const seriesSlugKey = targetSlug.replace('series:', '');
        const seriesRes = await fetchJson(`${WATCHHENTAI_API}/series/${seriesSlugKey}`, { timeout: 10000 });
        const episodes = seriesRes.data?.data?.episodes || [];
        if (episodes.length > 0) {
          targetSlug = episodes[0].url.split('/videos/')[1]?.replace(/\//g, '');
        } else {
          throw new Error('No episodes found for this series');
        }
      }

      const watchRes = await fetchJson(`${WATCHHENTAI_API}/watch/${targetSlug}`, { timeout: 10000 });
      const data = watchRes.data?.data;

      const bestStream = data.player?.sources?.[0]?.src || data.player?.src || '';
      const allStreams = data.player?.sources?.map(s => ({
        url: s.src,
        filename: s.label || '1080p',
        resolution: s.label || '1080p',
        height: parseInt(s.label) || 1080
      })) || [{ url: bestStream, filename: '1080p', resolution: '1080p', height: 1080 }];

      // The watch endpoint always returns the full episodes list with isCurrent flag
      const mappedEpisodes = (data.episodes || []).map((ep, idx) => {
        const epVideoSlug = ep.url?.split('/videos/')[1]?.replace(/\//g, '');
        return {
          id: epVideoSlug ? `wh:${epVideoSlug}` : `wh:ep-${idx + 1}`,
          title: ep.title || `Episode ${idx + 1}`,
          image: ep.thumbnail || '',
          isCurrent: ep.isCurrent || false
        };
      });

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
        genres: data.genres?.map(g => ({ genre: g.name })) || [],
        episodes: mappedEpisodes
      };

      detailsCache.set(slug, { data: result, time: Date.now() });

      return c.json({ success: true, data: result });
    } catch (err) {
      console.error('[WatchHentai Details Error]', err.message);
      return c.json({ success: false, error: 'Failed to fetch WatchHentai details' }, 500);
    }
  }

  if (slug.startsWith('hanime1:')) {
    try {
      const result = await hanime1Scraper.getVideoDetails(slug);
      detailsCache.set(slug, { data: result, time: Date.now() });
      return c.json({ success: true, data: result });
    } catch (err) {
      console.error('[Hanime1 Details Error]', err.message);
      return c.json({ success: false, error: 'Failed to fetch Hanime1 details' }, 500);
    }
  }


  try {
    let hanimeData = {};
    try {
      hanimeData = await hanimeClient.getHentaiVideo(slug);
    } catch (err) {
      console.warn('[Hanime API Failed] Falling back to WatchHentai directly:', err.message);
    }

    const vManifest = hanimeData.videosManifest || hanimeData.videos_manifest;
    const hVideo = hanimeData.hentaiVideo || hanimeData.hentai_video;
    const hTags = hanimeData.hentaiTags || hanimeData.hentai_tags;

    let bestStream = null;
    let allStreams = [];
    let whData = null;

    // Use WatchHentai API as the high-fidelity extraction engine
    try {
      const videoTitle = hVideo?.name || slug.replace(/-/g, ' ');
      let cleanTitle = videoTitle.replace(/\b(ep|episode)?\s*\d+/i, '').trim();
      if (!cleanTitle) cleanTitle = videoTitle;

      console.log('cleanTitle:', cleanTitle);
      let searchRes = await fetchJson(`${WATCHHENTAI_API}/search`, { params: { q: cleanTitle }, timeout: 8000 });
      console.log('searchRes results length:', searchRes.data?.data?.results?.length);
      let results = searchRes.data?.data?.results || [];
      if (results.length === 0 && cleanTitle.includes('-')) {
        const hyphenlessTitle = cleanTitle.replace(/-/g, ' ');
        searchRes = await fetchJson(`${WATCHHENTAI_API}/search`, { params: { q: hyphenlessTitle }, timeout: 8000 });
        results = searchRes.data?.data?.results || [];
      }
      if (results.length === 0) {
        const firstWords = cleanTitle.split(/[-:,\s]+/).slice(0, 2).join(' ');
        searchRes = await fetchJson(`${WATCHHENTAI_API}/search`, { params: { q: firstWords }, timeout: 8000 });
        results = searchRes.data?.data?.results || [];
      }

      if (results.length > 0) {
        let targetUrl = results[0].url;
        if (targetUrl.includes('/series/')) {
          const seriesSlug = targetUrl.split('/series/')[1]?.replace(/\//g, '');
          const seriesRes = await fetchJson(`${WATCHHENTAI_API}/series/${seriesSlug}`, { timeout: 8000 });
          const episodes = seriesRes.data?.data?.episodes || [];

          const epMatch = slug.match(/\d+$/);
          const epNum = epMatch ? parseInt(epMatch[0], 10) : 1;

          const matchedEp = episodes.find(ep => ep.number === epNum) || episodes[0];
          if (matchedEp) {
            targetUrl = matchedEp.url;
          }
        }

        console.log('TargetUrl before videos check:', targetUrl);
        if (targetUrl.includes('/videos/')) {
          const watchSlug = targetUrl.split('/videos/')[1]?.replace(/\//g, '');
          const watchRes = await fetchJson(`${WATCHHENTAI_API}/watch/${watchSlug}`, { timeout: 8000 });
          const data = watchRes.data?.data;
          whData = data;
          if (data?.player) {
            const sources = data.player.sources || [];
            bestStream = sources.find(s => s.label === '1080p')?.src || sources[0]?.src || data.player.src;
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
        id: hVideo?.id || whData?.id || Date.now(),
        urlname: hVideo?.slug || slug,
        videoname: hVideo?.name || whData?.title || slug.replace(/-/g, ' '),
        description: hVideo?.description ? hVideo.description.replace(/<[^>]*>?/gm, '').trim() : (whData?.synopsis || ''),
        releasedate: hVideo?.releasedAt || hVideo?.released_at || whData?.uploadDate || new Date().toISOString(),
        uploaddate: hVideo?.createdAt || hVideo?.created_at || whData?.uploadDate || new Date().toISOString(),
        coverimg: hVideo?.posterUrl || hVideo?.poster_url ? `/api/beyond/proxy-image?url=${encodeURIComponent(hVideo.posterUrl || hVideo.poster_url)}` : (whData?.thumbnail || ''),
        series: hVideo?.brand || whData?.seriesTitle || null,
        views: hVideo?.views || parseInt(whData?.views) || 0,
        rating: hVideo?.rating || "9.5",
        status: 1,
        recentrelease: 1,
        best_stream: bestStream,
        streams: allStreams
      }],
      genres: hTags?.map(tag => ({ genre: tag.text })) || whData?.genres?.map(g => ({ genre: g.name })) || [],
      episodes: (() => {
        const hanimeEps = (hanimeData.hentaiFranchiseHentaiVideos || hanimeData.hentai_franchise_hentai_videos || []);
        if (hanimeEps.length > 0) {
          return hanimeEps.map(ep => ({
            id: ep.slug,
            title: ep.name,
            image: ep.posterUrl || ep.coverUrl || ep.poster_url || ep.cover_url || '',
            isCurrent: ep.slug === slug
          }));
        }
        if (whData?.episodes && whData.episodes.length > 0) {
          return whData.episodes.map((ep, idx) => {
            const epVideoSlug = ep.url?.split('/videos/')[1]?.replace(/\//g, '');
            return {
              id: epVideoSlug ? `wh:${epVideoSlug}` : `wh:ep-${idx + 1}`,
              title: ep.title || `Episode ${ep.number || idx + 1}`,
              image: ep.thumbnail || '',
              isCurrent: ep.isCurrent || false
            };
          });
        }
        return [];
      })()
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
  if (!q) return c.json({ success: true, data: [] });

  let results = [];

  const fetchWatchHentai = async () => {
    try {
      const res = await fetchJson(`${WATCHHENTAI_API}/search`, { params: { q }, timeout: 8000 });
      return res.data?.data?.results?.map(item => {
        const seriesSlug = item.url ? item.url.split('/series/')[1]?.replace(/\//g, '') : 'unknown';
        return {
          id: `wh:series:${seriesSlug}`,
          title: item.title,
          embedUrl: item.url,
          thumbnail: item.poster,
          description: item.description || `Released: ${item.year || 'N/A'}`,
          pubDate: new Date().toISOString(),
          source: 'watchhentai'
        };
      }) || [];
    } catch (err) {
      console.error('[WatchHentai Search Error]', err.message);
      return [];
    }
  };

  // Hanime search is unavailable: it ran against search.htv-services.com, which is now
  // NXDOMAIN, and HanimeClient exposes no search endpoint to replace it (only home/video).
  // This already returned [] via its catch — short-circuit so we stop issuing a request
  // that cannot succeed. Search falls back to WatchHentai results alone.
  const fetchHanime = async () => [];
  
  const fetchHanime1 = async () => {
    try {
      return await hanime1Scraper.searchVideos(q);
    } catch (err) {
      console.error('[Hanime1 Search Error]', err.message);
      return [];
    }
  };

  const [whData, hnData, hn1Data] = await Promise.all([fetchWatchHentai(), fetchHanime(), fetchHanime1()]);
  
  // Merge and remove duplicates by matching title
  const titleSet = new Set();
  const merged = [];
  
  for (const item of hn1Data) {
    const t = item.title.toLowerCase();
    if (!titleSet.has(t)) {
      titleSet.add(t);
      merged.push(item);
    }
  }
  for (const item of hnData) {
    const t = item.title.toLowerCase();
    if (!titleSet.has(t)) {
      titleSet.add(t);
      merged.push(item);
    }
  }
  for (const item of whData) {
    const t = item.title.toLowerCase();
    if (!titleSet.has(t)) {
      titleSet.add(t);
      merged.push(item);
    }
  }

  return c.json({ success: true, data: merged });
});

/**
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
    return c.text('Failed to proxy image: ' + (error.message || error.toString()), 500);
  }
});

/**
 * GET /api/beyond/proxy-m3u8
 */
beyond.get('/proxy-m3u8', async (c) => {
  const url = c.req.query('url');
  if (!url) return c.text('Missing url', 400);
  console.log('PROXY URL IS:', url);

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
    console.error('M3U8 Proxy Error:', error, error.stack);
    return c.text('Failed to proxy m3u8: ' + (error.message || error.toString()), 500);
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
    c.header('Accept-Ranges', 'bytes');
    
    c.status(response.status);
    c.header('Access-Control-Allow-Origin', '*');
    
    return c.body(response.body);
  } catch (error) {
    console.error('[Proxy Video Error]', error.message, url);
    return c.text('Failed to proxy video', 500);
  }
});

export default beyond;

