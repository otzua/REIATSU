import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, Calendar, Tag, Flame } from 'lucide-react';
import Hls from 'hls.js';
import { beyondApi, MUSIC_API_BASE } from '../services/beyondApi';
import type { BeyondVideo, BeyondDetails } from '../services/beyondApi';
import HalftoneWave from '../components/HalftoneWave';
import SmartImage from '../components/SmartImage';
import styles from './Watch.module.css';

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

  // Keyboard shortcuts: fullscreen, play/pause, seek, mute
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['input', 'textarea', 'select'].includes(target.tagName.toLowerCase())) return;

      const key = e.key.toLowerCase();

      if (key === 'f') {
        e.preventDefault();
        if (!document.fullscreenElement) {
          playerWrapperRef.current?.requestFullscreen().catch(err => {
            console.error(`Fullscreen error: ${err.message}`);
          });
        } else {
          document.exitFullscreen();
        }
      }
      if (e.key === ' ') {
        if (target.tagName.toLowerCase() === 'button') return;
        e.preventDefault();
        if (videoRef.current) {
          if (videoRef.current.paused) videoRef.current.play();
          else videoRef.current.pause();
        }
      }
      if (key === 'arrowright') {
        e.preventDefault();
        if (videoRef.current) videoRef.current.currentTime += 10;
      }
      if (key === 'arrowleft') {
        e.preventDefault();
        if (videoRef.current) videoRef.current.currentTime -= 10;
      }
      if (key === 'm') {
        e.preventDefault();
        if (videoRef.current) videoRef.current.muted = !videoRef.current.muted;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // HLS setup / teardown
  useEffect(() => {
    if (!activeStream || !videoRef.current) return;

    const videoElement = videoRef.current;
    let finalUrl = activeStream;

    if (activeStream.includes('.m3u8')) {
      // Proxy only raw Hanime manifest links that require a Referer header.
      // AlphaAPIs extracted stream links are pre-signed CDN links that stream directly.
      if (activeStream.includes('weeb.hanime.tv') || activeStream.includes('proxy-required')) {
        finalUrl = `${MUSIC_API_BASE}/beyond/proxy-m3u8?url=${encodeURIComponent(activeStream)}`;
      }

      if (Hls.isSupported()) {
        // Destroy previous instance BEFORE creating the new one to prevent two
        // HLS pipelines fighting the same <video> element during quality switches.
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
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

        // loadSource + attachMedia only — do NOT set videoElement.src as well.
        // Setting src alongside HLS.js causes a double-load race that produces
        // "media source error" on Chrome and Firefox.
        hls.loadSource(finalUrl);
        hls.attachMedia(videoElement);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoElement.play().catch(e => console.log('Autoplay blocked:', e));
        });
        hlsRef.current = hls;
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS on Safari — crossOrigin needed here for CORS-protected manifests
        videoElement.crossOrigin = 'anonymous';
        videoElement.src = finalUrl;
      }
    } else {
      // Standard MP4 or direct link — no crossOrigin to avoid blocking CDN streams
      // that don't send Access-Control-Allow-Origin headers.
      videoElement.removeAttribute('crossorigin');
      if (videoElement.src !== activeStream) {
        videoElement.src = activeStream;
        videoElement.load();
      }
      videoElement.play().catch(e => console.log('Autoplay blocked:', e));
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [activeStream]);

  // Fetch video details
  useEffect(() => {
    if (!id) {
      const timer = setTimeout(() => {
        setError(true);
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const loadTimer = setTimeout(() => {
      setLoading(true);
    }, 0);

    beyondApi.getDetails(id)
      .then(async (data) => {
        if (data.info && data.info[0]) {
          const info = data.info[0];
          const videoObj: BeyondVideo = {
            id: info.urlname,
            title: info.videoname,
            embedUrl: `https://hanime.tv/videos/hentai/${info.urlname}`,
            thumbnail: info.coverimg,
            description: info.description,
            pubDate: info.releasedate,
          };
          setVideo(videoObj);
          setDetails(data);
          setActiveStream(info.best_stream || info.streams?.[0]?.url || null);
          setLoading(false);

          // Update history
          const saved = localStorage.getItem('beyond_history');
          let history: BeyondVideo[] = [];
          if (saved) {
            try { history = JSON.parse(saved); } catch (e) { console.error('Failed to parse history', e); }
          }
          const filtered = history.filter((v) => v.id !== videoObj.id);
          localStorage.setItem('beyond_history', JSON.stringify([videoObj, ...filtered].slice(0, 10)));
        }
      })
      .catch((err) => {
        console.error('Beyond API Error:', err);
        setError(true);
        setLoading(false);
      });

    return () => {
      clearTimeout(loadTimer);
    };
  }, [id]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className={styles.container}>
        <HalftoneWave />
        <div className={styles.content}>
          <div className={styles.loadingWrapper}>
            <div className={styles.loading}>BYPASSING FIREWALL...</div>
            <div className={styles.loadingSubtext}>INITIALIZING ALPHA EXTRACTION PROTOCOL</div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Error ─── */
  if (error || !video) {
    return (
      <div className={styles.container}>
        <HalftoneWave />
        <div className={styles.content}>
          <div className={styles.errorBox}>
            <h2>PORTAL ERROR</h2>
            <p className={styles.errorMsg}>
              The requested content could not be located in the Beyond sector.
              It may have been moved or redacted.
            </p>
            <button onClick={() => navigate('/beyond')}>RETURN TO HUB</button>
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
        {/* Top nav */}
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
          {/* Player column */}
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
                    playsInline
                    preload="auto"
                    poster={video.thumbnail}
                    // src and crossOrigin are NOT set here — managed programmatically
                    // in the HLS useEffect. Setting src on the element while HLS.js is
                    // attached causes a double-load race and media source errors.
                  />
                ) : (
                  <div className={styles.extractionFailed}>
                    <Flame size={48} className={`${styles.pulse} ${styles.accentIcon}`} />
                    <p className={styles.qualityLabel}>EXTRACTION FAILED</p>
                    <button className={styles.retryBtn} onClick={() => window.location.reload()}>
                      RETRY EXTRACTION
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Controls bar */}
            <div className={styles.playerControls}>
              <div className={styles.playerControlsInner}>
                <div className={styles.epMeta}>
                  <span className={`${styles.epCount} ${styles.epCountRow}`}>
                    <Flame size={12} className={styles.accentIcon} />
                    ALPHA EXTRACTION • {activeStream ? 'SECURE' : 'UNSTABLE'}
                  </span>
                  <h1 className={styles.epTitle}>{video.title}</h1>
                </div>

                {currentInfo?.streams && currentInfo.streams.length > 0 && (
                  <div className={styles.playerActions}>
                    <div className={styles.controlsGroup}>
                      <span className={styles.qualityLabel}>QUALITY:</span>
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

            {/* Anime detail panel */}
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

                  {/* Synopsis */}
                  <div className={styles.detailSection}>
                    <h3 className={styles.detailSectionTitle}>
                      <Info size={14} /> SYNOPSIS
                    </h3>
                    <p className={styles.description}>
                      {video.description || 'Step into the depth of this title. Discover a high-quality streaming experience in the Beyond sector.'}
                    </p>
                  </div>

                  {/* Genre tags */}
                  {details?.genres && details.genres.length > 0 && (
                    <div className={styles.detailSection}>
                      <h3 className={styles.detailSectionTitle}>
                        <Tag size={14} /> TAGS
                      </h3>
                      <div className={styles.tagsWrap}>
                        {details.genres.map((g, i) => (
                          <span key={i} className={styles.tagPill}>{g.genre}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar — metadata panel */}
          <div className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
              <h3 className={styles.sidebarTitle}>
                <Calendar size={18} /> METADATA
              </h3>
            </div>
            <div className={styles.sidebarBody}>
              <div>
                <span className={styles.metaLabel}>RELEASE DATE</span>
                <span className={styles.metaValue}>{formatDate(video.pubDate)}</span>
              </div>
              <div>
                <span className={styles.metaLabel}>STUDIO</span>
                <span className={styles.metaValue}>{currentInfo?.series || 'N/A'}</span>
              </div>
              <div>
                <span className={styles.metaLabel}>VIEWS</span>
                <span className={styles.metaValue}>{currentInfo?.views?.toLocaleString() || '0'}</span>
              </div>
              <div>
                <span className={styles.metaLabel}>RATING</span>
                <span className={styles.metaValue}>{currentInfo?.rating || 'N/A'}</span>
              </div>
              <div>
                <span className={styles.metaLabel}>AVAILABILITY</span>
                <span className={styles.metaValue}>{activeStream ? 'High Fidelity Stream' : 'Proxy Limited'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeyondWatch;
