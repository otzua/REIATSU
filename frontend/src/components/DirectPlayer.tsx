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
 */
const DirectPlayer = ({ url, poster, className }: DirectPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !url) return;

    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHls = url.includes('.m3u8') || url.includes('m3u8');

    if (isHls) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          xhrSetup: (xhr) => {
            xhr.withCredentials = false;
          },
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        });

        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });

        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS (Safari)
        video.src = url;
        video.load();
        video.play().catch(() => {});
      }
    } else {
      // Direct MP4 / other formats
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
      crossOrigin="anonymous"
      style={{ width: '100%', height: '100%', display: 'block', background: '#000' }}
    />
  );
};

export default DirectPlayer;
