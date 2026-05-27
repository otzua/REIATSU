import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

interface DirectPlayerProps {
  url: string;
  poster?: string;
  className?: string;
}

/**
 * DirectPlayer — renders a native <video> element for direct stream URLs.
 * Handles both HLS (.m3u8) and MP4 sources automatically.
 * Used by providers that return raw stream URLs instead of embed pages (e.g. Miruro).
 *
 * Bug fixes vs previous version:
 * - crossOrigin is NOT set by default — many CDN providers don't send CORS headers
 *   and setting crossOrigin="anonymous" would block the video entirely. It is only
 *   set when the URL is a known .m3u8 manifest (HLS segments often need it).
 * - HLS instance is always destroyed before creating a new one on URL change.
 */
const DirectPlayer = ({ url, poster, className }: DirectPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    // Always destroy any previous HLS instance first
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHls = url.includes('.m3u8');

    if (isHls) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          // Don't send credentials — avoids CORS pre-flight failures on CDN streams
          xhrSetup: (xhr) => { xhr.withCredentials = false; },
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.warn('[DirectPlayer] Network error, retrying...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.warn('[DirectPlayer] Media error, recovering...');
                hls.recoverMediaError();
                break;
              default:
                console.error('[DirectPlayer] Fatal HLS error, destroying.');
                hls.destroy();
            }
          }
        });

        // loadSource + attachMedia — do NOT also set video.src, that causes a
        // double-load race between native MSE and the HLS.js pipeline.
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });

        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS on Safari — set crossOrigin only here since Safari needs it for HLS
        video.crossOrigin = 'anonymous';
        video.src = url;
        video.load();
        video.play().catch(() => {});
      }
    } else {
      // Direct MP4 / other formats — no crossOrigin to avoid CORS blocks
      video.removeAttribute('crossorigin');
      video.src = url;
      video.load();
      video.play().catch(() => {});
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [url]);

  return (
    <video
      ref={videoRef}
      className={className}
      controls
      autoPlay
      playsInline
      preload="auto"
      poster={poster}
      // crossOrigin intentionally omitted here — set programmatically only when needed
      style={{ width: '100%', height: '100%', display: 'block', background: '#000' }}
    />
  );
};

export default DirectPlayer;
