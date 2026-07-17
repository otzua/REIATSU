const EPORNER_API = 'https://www.eporner.com/api/v2';
const EPORNER_ROOT = 'https://www.eporner.com';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

function normalizeSearchVideo(v) {
  const id = String(v.id ?? '');
  const thumb =
    v.default_thumb?.src ||
    (Array.isArray(v.thumbs) && v.thumbs[0]?.src) ||
    v.thumbs?.medium?.src || '';
  return {
    id,
    title: String(v.title ?? ''),
    image: thumb,
    duration: String(v.length_min ?? ''),
    views: String(v.views ?? ''),
    video: v.embed || `${EPORNER_ROOT}/embed/${id}/`,
    link: `${EPORNER_ROOT}/video-${id}/`,
  };
}

export async function searchEporner(query, { per_page = 24, page = 1, order = 'top-rated', gay = 0, lq = 0 } = {}) {
  const url = `${EPORNER_API}/video/search/?query=${encodeURIComponent(query)}&per_page=${per_page}&page=${page}&thumbsize=medium&order=${order}&gay=${gay}&lq=${lq}&format=json`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`EPorner search ${res.status}`);
  const json = await res.json();
  return {
    success: true,
    data: (json.videos ?? []).map(normalizeSearchVideo),
    page: Number(page),
    total_pages: Math.ceil((json.total_count ?? 0) / per_page),
    total_count: json.total_count ?? 0,
  };
}

export async function getEpornerDetails(id, thumbsize = 'medium') {
  // Fetch metadata
  const metaUrl = `${EPORNER_API}/video/id/?id=${id}&thumbsize=${thumbsize}&format=json`;
  const metaRes = await fetch(metaUrl, { headers: HEADERS });
  if (!metaRes.ok) throw new Error(`EPorner meta ${metaRes.status}`);
  const metaJson = await metaRes.json();
  const v = Array.isArray(metaJson) ? metaJson[0] : metaJson;

  const thumb =
    v.default_thumb?.src ||
    (Array.isArray(v.thumbs) && v.thumbs[0]?.src) ||
    v.thumbs?.medium?.src || '';

  // Resolve actual MP4 stream URLs via EPorner's hash-based XHR endpoint
  let sources = [];
  try {
    sources = await resolveEpornerStreams(id);
  } catch (e) {
    console.error('EPorner stream resolve failed:', e.message);
  }

  return {
    success: true,
    data: {
      id: String(v.id ?? id),
      title: String(v.title ?? ''),
      image: thumb,
      duration: String(v.length_min ?? ''),
      views: String(v.views ?? ''),
      rating: String(v.rate ?? ''),
      uploaded: String(v.added ?? ''),
      tags: typeof v.keywords === 'string' ? v.keywords.split(',').map(t => t.trim()).filter(Boolean) : [],
      source: `${EPORNER_ROOT}/embed/${id}/`,
      sources,
    },
  };
}

async function resolveEpornerStreams(id) {
  // Fetch embed page to extract vid path and hash
  const embedUrl = `${EPORNER_ROOT}/embed/${id}/`;
  const res = await fetch(embedUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Referer': EPORNER_ROOT + '/',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });
  if (!res.ok) throw new Error(`Embed page ${res.status}`);
  const html = await res.text();

  // Extract vid and hash from embed JS
  const m = html.match(/vid\s*=\s*['"]([^'"]+)['"]\s*;[\s\S]*?hash\s*=\s*['"]([0-9a-f]{32})['"]/);
  if (!m) throw new Error('vid/hash not found in embed page');

  const [, vid, hash] = m;

  // Convert 32-char hex hash → four 8-char segments → each to base-36
  const hashCode = [0, 8, 16, 24]
    .map(i => parseInt(hash.slice(i, i + 8), 16).toString(36))
    .join('');

  // Call EPorner's XHR endpoint for actual MP4 URLs
  const xhrUrl = `${EPORNER_ROOT}/xhr/video-url/?id=${vid}&hash_code=${hashCode}&device=generic&domain=www.eporner.com&fallback=false&embed=true&supportedFormats=mp4`;
  const xhrRes = await fetch(xhrUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Referer': embedUrl,
      'X-Requested-With': 'XMLHttpRequest',
    },
  });
  if (!xhrRes.ok) throw new Error(`XHR endpoint ${xhrRes.status}`);
  const xhrJson = await xhrRes.json();

  // EPorner returns { sources: [ { file, label, type } ] } or similar
  const raw = xhrJson.sources ?? xhrJson.videoSources ?? [];
  return raw.map(s => ({
    quality: s.label ?? s.quality ?? 'SD',
    url: s.file ?? s.src ?? s.url ?? '',
  })).filter(s => s.url);
}
