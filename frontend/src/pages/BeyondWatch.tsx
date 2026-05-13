import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, Calendar, Tag, Flame } from 'lucide-react';
import Hls from 'hls.js';
import { beyondApi, MUSIC_API_BASE } from '../services/beyondApi';
import type { BeyondVideo, BeyondDetails } from '../services/beyondApi';
import HalftoneWave from '../components/HalftoneWave';
import SmartImage from '../components/SmartImage';
import styles from './Watch.module.css'; // Reusing premium Watch styles

const BeyondWatch = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const playerWrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [video, setVideo] = useState<BeyondVideo | null>(null);
  const [details, setDetails] = useState<BeyondDetails | null>(null);
  const [activeStream, setActiveStream] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Keyboard Shortcuts for Fullscreen, Play/Pause, and Seeking
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      const key = e.key.toLowerCase();
      if (key === 'f') {
        if (!document.fullscreenElement) {
          playerWrapperRef.current?.requestFullscreen().catch(err => {
            console.error(`Fullscreen error: ${err.message}`);
          });
        } else {
          document.exitFullscreen();
        }
      }
      if (e.key === ' ') {
        e.preventDefault();
        if (videoRef.current) {
          if (videoRef.current.paused) videoRef.current.play();
          else videoRef.current.pause();
        }
      }
      if (key === 'arrowright') {
        if (videoRef.current) videoRef.current.currentTime += 10;
      }
      if (key === 'arrowleft') {
        if (videoRef.current) videoRef.current.currentTime -= 10;
      }
      if (key === 'm') {
        if (videoRef.current) videoRef.current.muted = !videoRef.current.muted;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // HLS logic
  useEffect(() => {
    if (!activeStream || !videoRef.current) return;

    const videoElement = videoRef.current;

    let finalUrl = activeStream;
    if (activeStream.includes('.m3u8')) {
      // Use our backend proxy to bypass Referer checks
      finalUrl = `${MUSIC_API_BASE}/beyond/proxy-m3u8?url=${encodeURIComponent(activeStream)}`;
      
      if (Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          xhrSetup: (xhr) => {
            xhr.withCredentials = false;
          }
        });
        
        hls.on(Hls.Events.ERROR, (_, data) => {
          console.error('HLS Error:', data);
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error('Network error, trying to recover...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error('Media error, trying to recover...');
                hls.recoverMediaError();
                break;
              default:
                console.error('Fatal HLS error, destroying...');
                hls.destroy();
                break;
            }
          }
        });

        hls.loadSource(finalUrl);
        hls.attachMedia(videoElement);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoElement.play().catch(e => console.log('Autoplay blocked:', e));
        });
        hlsRef.current = hls;
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        videoElement.src = finalUrl;
      }
    } else {
      // Standard MP4 or direct link
      videoElement.src = activeStream;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [activeStream]);

  useEffect(() => {
    if (!id) {
      setError(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    beyondApi.getDetails(id)
      .then(async (data) => {
        if (data.info && data.info[0]) {
          const info = data.info[0];
          const videoObj = {
            id: info.urlname,
            title: info.videoname,
            embedUrl: `https://hanime.tv/videos/hentai/${info.urlname}`,
            thumbnail: info.coverimg,
            description: info.description,
            pubDate: info.releasedate
          };
          setVideo(videoObj);
          setDetails(data);

          // Perform client-side extraction to get fresh, IP-matched stream links
          try {
            const extraction = await beyondApi.extractStream(videoObj.embedUrl);
            if (extraction.success && (extraction.best_stream || (extraction.streams && extraction.streams.length > 0))) {
              setActiveStream(extraction.best_stream || extraction.streams[0].url);
              setDetails(prev => {
                if (!prev) return data;
                const newInfo = [...prev.info];
                newInfo[0] = { ...newInfo[0], best_stream: extraction.best_stream, streams: extraction.streams };
                return { ...prev, info: newInfo };
              });
            } else {
              setActiveStream(info.best_stream || null);
            }
          } catch (err) {
            console.error('Client-side extraction failed, falling back to backend stream', err);
            setActiveStream(info.best_stream || null);
          }

          // Update history
          const saved = localStorage.getItem('beyond_history');
          let history: BeyondVideo[] = [];
          if (saved) {
            try {
              history = JSON.parse(saved);
            } catch (e) {
              console.error('Failed to parse history', e);
            }
          }
          const filtered = history.filter((v) => v.id !== videoObj.id);
          const updated = [videoObj, ...filtered].slice(0, 10);
          localStorage.setItem('beyond_history', JSON.stringify(updated));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Beyond API Error:', err);
        setError(true);
        setLoading(false);
      });
  }, [id]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <HalftoneWave />
        <div className={styles.content}>
          <div className={styles.loadingWrapper}>
            <div className={styles.loading} style={{ letterSpacing: '0.3em' }}>BYPASSING FIREWALL...</div>
            <div style={{ marginTop: '1rem', color: 'var(--accent)', fontSize: '0.7rem', opacity: 0.6 }}>INITIALIZING ALPHA EXTRACTION PROTOCOL</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className={styles.container}>
        <HalftoneWave />
        <div className={styles.content}>
          <div className={styles.errorBox}>
            <h2 style={{ letterSpacing: '0.2em' }}>PORTAL ERROR</h2>
            <p style={{ color: 'var(--color-cream)', opacity: 0.5, marginBottom: '2rem', maxWidth: '400px', marginInline: 'auto' }}>
              The requested content could not be located in the Beyond sector. It may have been moved or redacted.
            </p>
            <button onClick={() => navigate('/beyond')} className={styles.backBtn} style={{ background: 'var(--accent)', color: 'white', padding: '0.8rem 2rem' }}>
              RETURN TO HUB
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentInfo = details?.info?.[0];

  return (
    <div className={styles.container}>
      <HalftoneWave />

      <div className={styles.content}>
        <div className={styles.topNav}>
          <button onClick={() => navigate('/beyond')} className={styles.backBtn}>
            <ChevronLeft size={18} />
            <span>HUB</span>
          </button>
          <div className={styles.breadcrumb}>
            <span className={styles.activeEpName}>{video.title}</span>
          </div>
        </div>

        <div className={styles.mainGrid}>
          <div className={styles.playerSection}>
            <div className={styles.videoWrapperContainer}>
              <SmartImage src={video.thumbnail} aria-hidden="true" className={styles.playerGlow} />
              <div ref={playerWrapperRef} className={styles.videoWrapper}>
                {activeStream ? (
                    <video
                      ref={videoRef}
                      className={styles.iframe}
                      controls
                      autoPlay
                      poster={video.thumbnail}
                      crossOrigin="anonymous"
                    />
                ) : (
                  <div className={styles.iframe} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', gap: '1rem' }}>
                    <Flame size={48} className={styles.pulse} style={{ color: 'var(--accent)' }} />
                    <p style={{ color: 'var(--accent)', fontWeight: 800 }}>EXTRACTION FAILED</p>
                    <button 
                      onClick={() => window.location.reload()}
                      style={{ background: 'white', color: 'black', padding: '0.5rem 1rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 800 }}
                    >
                      RETRY EXTRACTION
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.playerControls}>
              <div className={styles.playerControlsInner}>
                <div className={styles.epMeta}>
                  <span className={styles.epCount} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Flame size={12} style={{ color: 'var(--accent)' }} />
                    ALPHA EXTRACTION • {activeStream ? 'SECURE' : 'UNSTABLE'}
                  </span>
                  <h1 className={styles.epTitle}>{video.title}</h1>
                </div>

                {currentInfo?.streams && currentInfo.streams.length > 0 && (
                  <div className={styles.playerActions}>
                    <div className={styles.controlsGroup}>
                      <span style={{ fontSize: '0.75rem', color: 'rgba(220, 201, 169, 0.4)', fontWeight: 800, letterSpacing: '0.05em' }}>QUALITY:</span>
                      <div className={styles.serverToggle}>
                        {currentInfo.streams.map((s, idx) => (
                          <button 
                            key={idx}
                            className={`${styles.serverBtn} ${activeStream === s.url ? styles.active : ''}`}
                            onClick={() => setActiveStream(s.url)}
                          >
                            {s.height}P
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.animeDetails}>
              <div className={styles.animeMainInfo}>
                <div className={styles.miniPosterWrapper}>
                  <SmartImage src={video.thumbnail} aria-hidden="true" className={styles.miniPosterGlow} />
                  <SmartImage src={video.thumbnail} alt="" className={styles.miniPoster} loading="eager" />
                </div>
                <div className={styles.textInfo}>
                  <h2 className={styles.animeTitle}>{video.title}</h2>
                  <div className={styles.badges}>
                    <span className={styles.badge}>PREMIUM</span>
                    <span className={styles.badge}>UNCENSORED</span>
                    <span className={styles.badge}>1080P HD</span>
                    {video.pubDate && <span className={styles.badge}>{new Date(video.pubDate).getFullYear()}</span>}
                  </div>
                  
                  <div style={{ marginTop: '1.5rem' }}>
                    <h3 style={{ color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Info size={14} /> SYNOPSIS
                    </h3>
                    <p className={styles.description}>
                      {video.description || "Step into the depth of this title. Discover a high-quality streaming experience in the Beyond sector."}
                    </p>
                  </div>

                  {details?.genres && details.genres.length > 0 && (
                    <div style={{ marginTop: '1.5rem' }}>
                      <h3 style={{ color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Tag size={14} /> TAGS
                      </h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {details.genres.map((g, i) => (
                          <span key={i} style={{ fontSize: '0.7rem', color: 'rgba(220, 201, 169, 0.6)', background: 'rgba(255, 255, 255, 0.03)', padding: '0.2rem 0.6rem', borderRadius: '4px', border: '1px solid rgba(220, 201, 169, 0.1)' }}>
                            {g.genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.header} style={{ padding: '1.5rem', borderBottom: '1px solid rgba(220, 201, 169, 0.1)' }}>
              <h3 style={{ color: 'var(--accent)', fontSize: '1rem', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} /> METADATA
              </h3>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <span style={{ color: 'var(--accent)', fontWeight: 800, display: 'block', fontSize: '0.7rem', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>RELEASE DATE</span>
                <span style={{ color: 'var(--color-cream)', opacity: 0.8, fontSize: '0.9rem' }}>{formatDate(video.pubDate)}</span>
              </div>
              <div>
                <span style={{ color: 'var(--accent)', fontWeight: 800, display: 'block', fontSize: '0.7rem', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>STUDIO</span>
                <span style={{ color: 'var(--color-cream)', opacity: 0.8, fontSize: '0.9rem' }}>{currentInfo?.series || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--accent)', fontWeight: 800, display: 'block', fontSize: '0.7rem', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>VIEWS</span>
                <span style={{ color: 'var(--color-cream)', opacity: 0.8, fontSize: '0.9rem' }}>{currentInfo?.views?.toLocaleString() || '0'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--accent)', fontWeight: 800, display: 'block', fontSize: '0.7rem', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>RATING</span>
                <span style={{ color: 'var(--color-cream)', opacity: 0.8, fontSize: '0.9rem' }}>{currentInfo?.rating || 'N/A'}</span>
              </div>
              <div>
                <span style={{ color: 'var(--accent)', fontWeight: 800, display: 'block', fontSize: '0.7rem', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>AVAILABILITY</span>
                <span style={{ color: 'var(--color-cream)', opacity: 0.8, fontSize: '0.9rem' }}>{activeStream ? 'High Fidelity Stream' : 'Proxy Limited'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeyondWatch;
