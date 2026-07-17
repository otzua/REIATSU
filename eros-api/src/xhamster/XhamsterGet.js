import { load } from 'cheerio';

const XH = 'https://xhamster.com';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};

async function extractSources(html) {
  const $ = load(html);

  // Try master m3u8 from preload link
  const preload = $('link[rel="preload"][as="fetch"]').attr('href') ||
    $('link[rel="preload"]').filter((_, el) => $(el).attr('href')?.includes('.m3u8')).attr('href');

  if (preload) {
    try {
      const m3uRes = await fetch(preload, { headers: HEADERS });
      const m3u = await m3uRes.text();
      const sources = [];
      const lines = m3u.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('#EXT-X-STREAM-INF')) {
          const res = lines[i].match(/RESOLUTION=(\d+x\d+)/)?.[1] ?? '';
          const bw = lines[i].match(/BANDWIDTH=(\d+)/)?.[1];
          const quality = res ? res.split('x')[1] + 'p' : (bw ? Math.round(Number(bw) / 1000) + 'kbps' : 'SD');
          const urlLine = lines[i + 1]?.trim();
          if (urlLine) {
            const absUrl = urlLine.startsWith('http') ? urlLine : new URL(urlLine, preload).href;
            sources.push({ quality, resolution: res, url: absUrl });
          }
        }
      }
      if (sources.length) return sources;
    } catch { /* fall through */ }
  }

  // Fallback: extract from initials JSON in page
  const m = html.match(/<script[^>]+id=["']initials-script["'][^>]*>([\s\S]*?)<\/script>/);
  if (m) {
    try {
      const initials = JSON.parse(m[1]);
      const streams =
        initials?.videoModel?.sources?.hls?.downloads ||
        initials?.xPlayerSettings?.sources ||
        [];
      if (Array.isArray(streams) && streams.length) {
        return streams.map(s => ({
          quality: String(s.quality ?? s.label ?? 'SD'),
          resolution: s.resolution ?? '',
          url: s.url ?? s.file ?? '',
        })).filter(s => s.url);
      }
    } catch { /* ignore */ }
  }

  return [];
}

export async function getXhamsterVideo(id) {
  const url = `${XH}/videos/${id}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`XHamster page ${res.status}`);
  const html = await res.text();
  const $ = load(html);

  // Try initials JSON first for metadata
  let title = '', duration = '', views = '', rating = '', uploaded = '', tags = [], image = '';
  const m = html.match(/<script[^>]+id=["']initials-script["'][^>]*>([\s\S]*?)<\/script>/);
  if (m) {
    try {
      const init = JSON.parse(m[1]);
      const vm = init?.videoModel ?? {};
      title = vm.title ?? '';
      duration = vm.duration ? formatDuration(vm.duration) : '';
      views = vm.views ? formatViews(vm.views) : '';
      rating = vm.rating ? String(Math.round(vm.rating)) + '%' : '';
      uploaded = vm.created ?? '';
      tags = (vm.categories ?? []).map(c => c.name ?? c).filter(Boolean);
      image = vm.thumbURL ?? vm.image ?? '';
    } catch { /* fallback to meta */ }
  }

  if (!title) title = $('meta[property="og:title"]').attr('content') ?? $('title').text();
  if (!image) image = $('meta[property="og:image"]').attr('content') ?? '';

  const sources = await extractSources(html);

  return {
    success: true,
    data: {
      id,
      title,
      image,
      duration,
      views,
      rating,
      uploaded,
      tags,
      source: url,
      sources,
    },
  };
}

function formatDuration(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatViews(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}
