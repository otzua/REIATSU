import { useMemo, useState } from 'react';
import type { ImgHTMLAttributes } from 'react';

type SmartImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src: string;
};

function buildImageCandidates(rawSrc: string | null | undefined): string[] {
  if (!rawSrc || typeof rawSrc !== 'string') return [''];
  const src = rawSrc.trim();
  if (!src || src === 'null' || src === 'undefined') return [''];

  const candidates = new Set<string>([src]);

  // TMDB: prefer original over fixed-width variants when available.
  if (src.includes('image.tmdb.org/t/p/')) {
    candidates.add(src.replace(/\/w\d+\//, '/original/'));
  }

  // AniList cover variants.
  if (src.includes('/media/anime/cover/small/')) {
    candidates.add(src.replace('/media/anime/cover/small/', '/media/anime/cover/large/'));
  }
  if (src.includes('/media/anime/cover/medium/')) {
    candidates.add(src.replace('/media/anime/cover/medium/', '/media/anime/cover/large/'));
  }

  // Google User Content & YTMusic high-res upgrades (e.g. w120-h120 -> w540-h540)
  if (src.includes('googleusercontent.com') || src.includes('ggpht.com') || src.includes('yt3.ggpht.com')) {
    let upgraded = src;
    if (src.includes('=')) {
      upgraded = src.replace(/=w\d+-h\d+(?:-[a-zA-Z0-9-]+)*/g, '=w540-h540')
                    .replace(/=s\d+(?:-[a-zA-Z0-9-]+)*/g, '=s512');
    }
    candidates.add(upgraded);
  }

  // Streaming CDN hotlink protection bypass
  const blockedCDNs = [
    'anipixcdn.co',
    'noitatnemunod.net',
    'gogocdn.net',
    'fcdn.stream',
    'focdn',
    'flawless.to',
    'rabbitstream',
    'megacloud.tv'
  ];
  
  if (blockedCDNs.some((cdn) => src.includes(cdn))) {
    candidates.add(`https://wsrv.nl/?url=${encodeURIComponent(src)}&output=webp`);
    candidates.add(`https://imagecdn.app/v2/image/${encodeURIComponent(src)}?format=webp`);
  }

  // YouTube thumbnail high-res upgrades
  if (src.includes('i.ytimg.com') || src.includes('img.youtube.com')) {
    if (src.includes('/default.jpg')) {
      candidates.add(src.replace('/default.jpg', '/maxresdefault.jpg'));
      candidates.add(src.replace('/default.jpg', '/hqdefault.jpg'));
    } else if (src.includes('/hqdefault.jpg')) {
      candidates.add(src.replace('/hqdefault.jpg', '/maxresdefault.jpg'));
    } else if (src.includes('/mqdefault.jpg')) {
      candidates.add(src.replace('/mqdefault.jpg', '/maxresdefault.jpg'));
    } else if (src.includes('/sddefault.jpg')) {
      candidates.add(src.replace('/sddefault.jpg', '/maxresdefault.jpg'));
    }
  }

  // Prefer upgraded candidates first while always keeping original as fallback.
  const ordered = [...candidates].filter(Boolean);
  const upgraded = ordered.filter((item) => item !== src);
  return [...upgraded, src];
}

const SmartImage = ({ src, loading = 'lazy', decoding = 'async', onError, ...props }: SmartImageProps) => {
  const candidates = useMemo(() => buildImageCandidates(src), [src]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hasFailed, setHasFailed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [prevSrc, setPrevSrc] = useState(src);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);
  const [triedFallback, setTriedFallback] = useState(false);

  if (src !== prevSrc) {
    setCurrentIndex(0);
    setHasFailed(false);
    setIsLoading(true);
    setPrevSrc(src);
    setFallbackUrl(null);
    setTriedFallback(false);
  }

  const fetchFallback = async (title: string) => {
    try {
      const clean = title.replace(/\(Sub\)|\(Dub\)|\(TV\)|\(Movie\)/gi, '').trim();
      if (!clean || clean.length < 2) return null;
      
      const res = await fetch(`https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(clean)}`);
      if (!res.ok) return null;
      const json = await res.json();
      const poster = json?.data?.[0]?.attributes?.posterImage;
      return poster?.original || poster?.large || poster?.medium || poster?.small || null;
    } catch (e) {
      console.error('Failed to fetch fallback poster:', e);
      return null;
    }
  };

  const currentSrc = fallbackUrl || (candidates[currentIndex] ?? src);

  if (hasFailed || !src || src === 'null' || src === 'undefined') {
    return (
      <div 
        className={props.className} 
        style={{ 
          position: 'relative', 
          overflow: 'hidden', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0d0915 0%, #1a0b22 100%)',
          borderRadius: props.style?.borderRadius ?? 'inherit',
          border: '1px solid rgba(168, 85, 247, 0.15)',
          ...props.style 
        }}
      >
        <svg viewBox="0 0 100 100" style={{ width: '38%', height: '38%', minWidth: '24px', opacity: 0.6 }}>
          <defs>
            <radialGradient id="glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="100" height="100" fill="url(#glow)" rx="10" />
          <circle cx="50" cy="50" r="22" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M46 40 L58 50 L46 60 Z" fill="#a855f7" stroke="#a855f7" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes smart-image-shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      <img
        {...props}
        src={currentSrc}
        loading={loading}
        decoding={decoding}
        referrerPolicy="no-referrer"
        style={{
          ...props.style,
          background: isLoading 
            ? 'linear-gradient(110deg, #100b1e 8%, #1f0f2d 18%, #100b1e 33%)' 
            : props.style?.background,
          backgroundSize: '200% 100%',
          animation: isLoading ? 'smart-image-shimmer 1.6s infinite linear' : props.style?.animation,
          transition: 'filter 0.3s ease-in-out, opacity 0.3s ease-in-out',
          filter: isLoading ? 'blur(3px)' : 'none',
        }}
        onLoad={() => setIsLoading(false)}
        onError={async (event) => {
          onError?.(event);
          if (currentIndex < candidates.length - 1) {
            setCurrentIndex((prev) => prev + 1);
          } else if (!triedFallback && props.alt) {
            setTriedFallback(true);
            setIsLoading(true);
            const fallback = await fetchFallback(props.alt);
            setIsLoading(false);
            if (fallback) {
              setFallbackUrl(fallback);
            } else {
              setHasFailed(true);
            }
          } else {
            setHasFailed(true);
            setIsLoading(false);
          }
        }}
      />
    </>
  );
};

export default SmartImage;
