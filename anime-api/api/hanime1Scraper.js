import * as cheerio from 'cheerio';

const BASE_URL = 'https://hanime1.me';

/**
 * Parses views from string (e.g., "1.2萬次")
 */
function parseViews(viewsText) {
  if (!viewsText) return 0;
  let multiplier = 1;
  let numPart = viewsText;
  if (viewsText.includes('萬')) {
    numPart = viewsText.split('萬')[0];
    multiplier = 10000;
  } else if (viewsText.includes('千')) {
    numPart = viewsText.split('千')[0];
    multiplier = 1000;
  }
  const digits = numPart.replace(/[^\d.]/g, '');
  return digits ? Math.floor(parseFloat(digits) * multiplier) : 0;
}

/**
 * Fetch HTML using the Cloudflare Bypass proxy logic.
 */
async function fetchBypassedHanime1(path, options = {}, env = {}) {
  const bypassUrl = env.CLOUDFLARE_BYPASS_SERVICE_URL || (typeof process !== 'undefined' ? process.env.CLOUDFLARE_BYPASS_SERVICE_URL : undefined);
  let targetUrl = `${BASE_URL}${path}`;
  let fetchUrl = targetUrl;
  
  const headers = { 
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    ...options.headers 
  };

  if (bypassUrl) {
    // Route request through proxy bypass
    fetchUrl = `${bypassUrl.replace(/\/$/, '')}${path}`;
    headers['x-hostname'] = 'hanime1.me';
  }

  const res = await fetch(fetchUrl, {
    ...options,
    headers,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch hanime1.me: ${res.status}`);
  }

  const html = await res.text();
  if (html.includes('Just a moment...') || html.includes('cf_chl_opt')) {
    throw new Error('Cloudflare challenge detected, bypass service failed or is missing.');
  }

  return cheerio.load(html);
}

function extractVideoId(url) {
  if (!url) return null;
  const match = url.match(/[?&]v=([^&#]+)/);
  return match ? match[1] : null;
}

function parseVideoItem($, el) {
  const $el = $(el);
  const link = $el.find('a[href*="/watch?v="]').first();
  const aTag = link.length ? link : ($el.is('a[href*="/watch?v="]') ? $el : $el.closest('a[href*="/watch?v="]'));
  
  if (!aTag.length) return null;
  
  const href = aTag.attr('href');
  const videoId = extractVideoId(href);
  if (!videoId) return null;

  const img = $el.find('img').first();
  const title = $el.find('.home-rows-videos-title, .card-mobile-title, .title, h3, h4').first().text().trim() || img.attr('alt') || img.attr('title') || videoId;
  const thumbnail = img.attr('src') || '';
  
  const viewsText = $el.find('.stats-container, .duration:contains("次")').text() || '';
  const viewsMatch = viewsText.match(/([\d.]+(?:萬|千)?)次/);
  const views = viewsMatch ? parseViews(viewsMatch[1]) : 0;

  return {
    id: `hanime1:${videoId}`,
    videoId,
    title,
    embedUrl: href,
    thumbnail,
    views,
    description: viewsMatch ? `Views: ${views}` : 'Views: N/A',
    pubDate: new Date().toISOString()
  };
}

export async function getHomeData(env = {}) {
  const $ = await fetchBypassedHanime1('/', {}, env);
  
  const items = [];
  $('#home-rows-wrapper div[title], #home-rows-wrapper a[href*="/watch?v="]').each((i, el) => {
    const video = parseVideoItem($, el);
    if (video) {
      items.push(video);
    }
  });

  // Deduplicate by ID
  const uniqueItems = [];
  const seen = new Set();
  for (const item of items) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      uniqueItems.push(item);
    }
  }

  return uniqueItems;
}

export async function getVideoDetails(slug, env = {}) {
  const videoId = slug.replace('hanime1:', '');
  const $ = await fetchBypassedHanime1(`/watch?v=${videoId}`, {}, env);
  
  const title = $('#shareBtn-title').text().trim() || videoId;
  const coverUrl = $('video#player').attr('poster') || '';
  
  // Extract streams
  let streams = [];
  $('video#player source').each((i, el) => {
    const src = $(el).attr('src');
    if (src) {
      streams.push({
        url: src,
        quality: $(el).attr('size') ? `${$(el).attr('size')}p` : '1080p',
        isM3U8: src.includes('.m3u8')
      });
    }
  });

  // Fallback to regex extraction from scripts
  if (streams.length === 0) {
    const html = $.html();
    const patterns = [
      /hls_url\s*:\s*['"]([^'"]+)['"]/g,
      /mp4_url\s*:\s*['"]([^'"]+)['"]/g,
      /source\s*:\s*['"]([^'"]+\.(?:mp4|m3u8))['"]/g,
      /video_url\s*:\s*['"]([^'"]+)['"]/g,
      /"url"\s*:\s*"([^"]+\.(?:mp4|m3u8))"/g
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(html)) !== null) {
        const url = match[1];
        if (!streams.find(s => s.url === url)) {
          streams.push({
            url,
            quality: url.includes('.m3u8') ? 'HLS' : 'MP4',
            isM3U8: url.includes('.m3u8')
          });
        }
      }
    }
  }

  // Format streams for beyond.js structure
  const formattedStreams = streams.map(s => {
    const proxyPath = s.isM3U8 ? '/api/beyond/proxy-m3u8' : '/api/beyond/proxy-video';
    return {
      url: `${proxyPath}?url=${encodeURIComponent(s.url)}`,
      filename: s.quality,
      resolution: s.quality,
      height: parseInt(s.quality) || 1080
    };
  });

  const bestStream = formattedStreams[0]?.url || '';

  // Description panel
  const descriptionPanel = $('.video-description-panel');
  let views = 0;
  let uploadDate = new Date().toISOString();
  
  if (descriptionPanel.length) {
    const text = descriptionPanel.text();
    const viewsMatch = text.match(/([\d.]+(?:萬|千)?)次\s+(\d{4}-\d{2}-\d{2})/);
    if (viewsMatch) {
      views = parseViews(viewsMatch[1]);
      uploadDate = new Date(viewsMatch[2]).toISOString();
    }
  }

  const descriptionText = descriptionPanel.find('div').eq(2).text().trim() || '';

  const tags = [];
  $('a.single-video-tag').each((i, el) => {
    const t = $(el).text().replace(/\s*\(\d+\)$/, '').trim();
    if (t) tags.push({ genre: t });
  });

  // Extract episodes (related videos)
  const episodes = [];
  $('.multiple-link-wrapper, .home-rows-videos-div, .related-doujin-videos').each((i, el) => {
    const video = parseVideoItem($, el);
    if (video) {
      episodes.push({
        id: video.id,
        title: video.title,
        image: video.thumbnail,
        isCurrent: video.videoId === videoId
      });
    }
  });

  // Deduplicate episodes
  const uniqueEpisodes = [];
  const seenEps = new Set();
  for (const ep of episodes) {
    if (!seenEps.has(ep.id)) {
      seenEps.add(ep.id);
      uniqueEpisodes.push(ep);
    }
  }

  return {
    info: [{
      id: videoId,
      urlname: `hanime1:${videoId}`,
      videoname: title,
      description: descriptionText,
      releasedate: uploadDate,
      uploaddate: uploadDate,
      coverimg: coverUrl ? `/api/beyond/proxy-image?url=${encodeURIComponent(coverUrl)}` : '',
      views: views,
      rating: "9.5",
      status: 1,
      recentrelease: 1,
      best_stream: bestStream,
      streams: formattedStreams
    }],
    genres: tags,
    episodes: uniqueEpisodes
  };
}

export async function searchVideos(query, env = {}) {
  const $ = await fetchBypassedHanime1(`/search?query=${encodeURIComponent(query)}`, {}, env);
  
  const items = [];
  $('#home-rows-wrapper div[title], #home-rows-wrapper a[href*="/watch?v="]').each((i, el) => {
    const video = parseVideoItem($, el);
    if (video) {
      items.push({
        id: video.id,
        title: video.title,
        embedUrl: video.embedUrl,
        thumbnail: video.thumbnail,
        description: video.description,
        pubDate: video.pubDate,
        source: 'hanime1'
      });
    }
  });

  // Deduplicate by ID
  const uniqueItems = [];
  const seen = new Set();
  for (const item of items) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      uniqueItems.push(item);
    }
  }

  return uniqueItems;
}
