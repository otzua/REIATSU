// EPorner API v2 — replaced with RedTube API because of ISP blocks.

const PROXY_BASE  = 'http://localhost:3000'; // Or use Vite proxy if configured, but we'll use localhost for now

export interface ErosVideo {
  id: string;
  title: string;
  views: string;
  rate: string;
  rating?: string;
  length: string;
  duration?: string;
  added: string;
  keywords: string;
  thumbnail: string;
  thumb?: string;
  default_thumb?: string;
  embed: string;
  url: string;
  sources?: ErosStreamSource[];
}

export interface ErosStreamSource {
  url: string;
  quality: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeVideo(v: any): ErosVideo {
  const id = String(v.id ?? '');
  const rawThumb: string = v.thumb || v.default_thumb || v.thumbnail || '';
  return {
    id,
    title:    String(v.title ?? ''),
    views:    String(v.views ?? ''),
    rate:     String(v.rate || v.rating || ''),
    length:   String(v.length || v.duration || ''),
    added:    String(v.added || v.publish_date || ''),
    keywords: String(v.keywords ?? ''),
    thumbnail: rawThumb,
    embed:    v.embed || `https://embed.redtube.com/?id=${id}`,
    url:      v.url  || `https://www.redtube.com/${id}`,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function proxyFetch(path: string, params: Record<string, string | number> = {}): Promise<any> {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString();
  // Using direct redtube API via eros-api proxy
  const res = await fetch(`${PROXY_BASE}${path}${qs ? `?${qs}` : ''}`, {
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const epornerApi = {
  getFeed: async (_order = 'top-rated', page = 1, _perPage = 24): Promise<ErosVideo[]> => {
    // Redtube doesn't have a "feed" without query, so search for something default
    const data = await proxyFetch(`/api/eporner/search/hard`, { page });
    const videos = data.videos ?? data.data?.videos ?? data.data ?? [];
    return videos.map(normalizeVideo);
  },

  search: async (q: string, page = 1, _order = 'top-rated'): Promise<ErosVideo[]> => {
    const data = await proxyFetch(`/api/eporner/search/${encodeURIComponent(q)}`, { page });
    const videos = data.videos ?? data.data?.videos ?? data.data ?? [];
    return videos.map(normalizeVideo);
  },

  getVideo: async (videoId: string): Promise<ErosVideo> => {
    const data = await proxyFetch(`/api/eporner/details/${videoId}`);
    const v = data.data ?? data;
    const normalized = normalizeVideo(v);
    normalized.sources = v.sources ?? [];
    return normalized;
  },

  status: async (): Promise<boolean> => {
    try {
      const res = await fetch(`${PROXY_BASE}/`);
      return res.ok;
    } catch { return false; }
  },
};
