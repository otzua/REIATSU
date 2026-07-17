const XH = 'https://xhamster.com';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
};

function extractId(link) {
  const seg = link.split('/').pop() ?? '';
  // slug-based: slug-xhABCDE → hash part after last dash
  if (/xh[A-Za-z0-9]+$/.test(seg)) {
    return seg.split('-').pop();
  }
  // numeric ID at end
  const num = seg.match(/(\d+)$/);
  if (num) return num[1];
  return seg;
}

function formatViews(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

function formatDuration(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export async function searchXhamster(query, page = 1) {
  const url = `${XH}/search/${encodeURIComponent(query).replace(/%20/g, '+')}?page=${page}`;
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`XHamster search ${res.status}`);
  const html = await res.text();

  // Extract initials JSON from script tag
  const m = html.match(/<script[^>]+id=["']initials-script["'][^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('initials-script not found');

  let initials;
  try { initials = JSON.parse(m[1]); } catch { throw new Error('Failed to parse initials JSON'); }

  const props = initials?.searchResult?.videoThumbProps ?? [];

  const data = props.map(v => {
    const link = v.pageURL ?? v.url ?? '';
    const id = extractId(link);
    return {
      id,
      title: String(v.title ?? ''),
      image: v.thumbURL ?? v.image ?? '',
      duration: formatDuration(v.duration ?? 0),
      views: formatViews(v.views ?? 0),
      video: `${XH}/embed/${id}`,
      link,
    };
  });

  return { success: true, data, source: url };
}
