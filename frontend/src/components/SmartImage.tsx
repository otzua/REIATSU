import { useEffect, useMemo, useState } from 'react';
import type { ImgHTMLAttributes } from 'react';

type SmartImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src: string;
};

function buildImageCandidates(rawSrc: string): string[] {
  const src = rawSrc.trim();
  if (!src) return [''];

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

  // Prefer upgraded candidates first while always keeping original as fallback.
  const ordered = [...candidates].filter(Boolean);
  const upgraded = ordered.filter((item) => item !== src);
  return [...upgraded, src];
}

const SmartImage = ({ src, loading = 'lazy', decoding = 'async', onError, ...props }: SmartImageProps) => {
  const candidates = useMemo(() => buildImageCandidates(src), [src]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevSrc, setPrevSrc] = useState(src);

  if (src !== prevSrc) {
    setCurrentIndex(0);
    setPrevSrc(src);
  }

  const currentSrc = candidates[currentIndex] ?? src;

  return (
    <img
      {...props}
      src={currentSrc}
      loading={loading}
      decoding={decoding}
      onError={(event) => {
        onError?.(event);
        if (currentIndex < candidates.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        }
      }}
    />
  );
};

export default SmartImage;
