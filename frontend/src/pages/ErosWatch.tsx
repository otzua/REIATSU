/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Star, Eye, Clock, Tag } from 'lucide-react';
import { epornerApi } from '../services/epornerApi';
import type { ErosVideo } from '../services/epornerApi';
import { useMusic } from '../context/MusicContext';
import HalftoneWave from '../components/HalftoneWave';
import SmartImage from '../components/SmartImage';
import styles from './Watch.module.css';

const ErosWatch = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const playerWrapperRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [video, setVideo] = useState<ErosVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { stopMusic } = useMusic();

  useEffect(() => { stopMusic(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { stopMusic(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['input', 'textarea'].includes(target.tagName.toLowerCase())) return;
      if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        if (!document.fullscreenElement) {
          playerWrapperRef.current?.requestFullscreen().catch(console.error);
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
      if (e.key === 'arrowright') {
        e.preventDefault();
        if (videoRef.current) videoRef.current.currentTime += 10;
      }
      if (e.key === 'arrowleft') {
        e.preventDefault();
        if (videoRef.current) videoRef.current.currentTime -= 10;
      }
      if (e.key === 'm') {
        e.preventDefault();
        if (videoRef.current) videoRef.current.muted = !videoRef.current.muted;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(false);

    // Pull from history for instant metadata render
    try {
      const saved = localStorage.getItem('eros_history');
      if (saved) {
        const history: ErosVideo[] = JSON.parse(saved);
        const cached = history.find(v => v.id === id);
        if (cached) setVideo(cached);
      }
    } catch { /* ignore */ }

    // Fetch metadata
    epornerApi.getVideo(id)
      .then(data => {
        setVideo(data);
        const saved = localStorage.getItem('eros_history');
        const history: ErosVideo[] = saved ? JSON.parse(saved) : [];
        const filtered = history.filter(v => v.id !== data.id);
        localStorage.setItem('eros_history', JSON.stringify([data, ...filtered].slice(0, 100)));
      })
      .catch(err => {
        console.error('Eros video fetch failed:', err);
        if (!video) setError(true);
      })
      .finally(() => setLoading(false));

  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading && !video) {
    return (
      <div className={styles.container}>
        <HalftoneWave />
        <div className={styles.content}>
          <div className={styles.loadingWrapper}>
            <div className={styles.loading}>LOADING...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !video) {
    return (
      <div className={styles.container}>
        <HalftoneWave />
        <div className={styles.content}>
          <div className={styles.errorBox}>
            <h2>FAILED TO LOAD VIDEO</h2>
            <button onClick={() => navigate(-1)}>GO BACK</button>
          </div>
        </div>
      </div>
    );
  }

  const tags = video?.keywords
    ? video.keywords.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  return (
    <div className={styles.container}>
      <HalftoneWave />
      <div className={styles.content}>

        <div className={styles.topNav}>
          <button onClick={() => navigate(-1)} className={styles.backBtn}>
            <ChevronLeft size={18} />
            <span>BACK</span>
          </button>
          <div className={styles.breadcrumb}>
            <span className={styles.activeEpName}>{video?.title}</span>
          </div>
        </div>

        <div className={styles.mainGrid}>
          <div className={styles.playerSection}>
            <div className={styles.videoWrapperContainer}>
              {(video?.thumb || video?.thumbnail || video?.default_thumb || "") && (
                <SmartImage src={video?.thumb || video?.thumbnail || video?.default_thumb || ""} aria-hidden="true" className={styles.playerGlow} />
              )}
              <div ref={playerWrapperRef} className={styles.videoWrapper}>
                  {video?.sources && video.sources.length > 0 ? (
                    <video
                      ref={videoRef}
                      controls
                      autoPlay
                      muted
                      playsInline
                      className={styles.videoPlayer}
                      src={video.sources.find(s => s.quality === '1080p')?.url || video.sources[0]?.url || ""}
                      poster={video?.thumb || video?.thumbnail || video?.default_thumb || ""}
                    />
                  ) : id ? (
                    <iframe
                      key={id}
                      src={video?.embed || `https://embed.redtube.com/?id=${id}`}
                      className={styles.iframe}
                      allowFullScreen
                      scrolling="no"
                      allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                      title={video?.title}
                      style={{ border: 'none' }}
                    />
                  ) : null}
              </div>
            </div>

            <div className={styles.playerControls}>
              <div className={styles.playerControlsInner}>
                <div className={styles.epMeta}>
                  <span className={styles.epCount}>EROS • REDTUBE</span>
                  <h1 className={styles.epTitle}>{video?.title || 'Untitled'}</h1>
                </div>
                <div className={styles.playerActions}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    {(video?.rate || video?.rating) && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 800 }}>
                        <Star size={12} fill="currentColor" /> {video?.rate || video?.rating}%
                      </span>
                    )}
                    {video?.views && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'rgba(220,201,169,0.5)', fontWeight: 700 }}>
                        <Eye size={12} /> {Number(video.views).toLocaleString()} views
                      </span>
                    )}
                    {(video?.length || video?.duration) && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'rgba(220,201,169,0.5)', fontWeight: 700 }}>
                        <Clock size={12} /> {video?.length || video?.duration}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.animeDetails}>
              <div className={styles.animeMainInfo}>
                <div className={styles.miniPosterWrapper}>
                  {(video?.thumb || video?.thumbnail || video?.default_thumb || "") && (
                    <>
                      <SmartImage src={video?.thumb || video?.thumbnail || video?.default_thumb || ""} aria-hidden="true" className={styles.miniPosterGlow} />
                      <SmartImage src={video?.thumb || video?.thumbnail || video?.default_thumb || ""} alt="" className={styles.miniPoster} loading="eager" />
                    </>
                  )}
                </div>
                <div className={styles.textInfo}>
                  <h2 className={styles.animeTitle}>{video?.title}</h2>
                  <div className={styles.badges}>
                    <span className={styles.badge}>EROS</span>
                    <span className={styles.badge}>REDTUBE</span>
                    {(video?.rate || video?.rating) && <span className={styles.badge} style={{ borderColor: 'rgba(184,58,45,0.3)', color: 'var(--accent)' }}>★ {video?.rate || video?.rating}%</span>}
                  </div>
                  {tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem', alignItems: 'center' }}>
                      <Tag size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                      {tags.slice(0, 12).map((tag, i) => (
                        <span key={i} style={{ fontSize: '0.72rem', color: 'rgba(220,201,169,0.5)', background: 'rgba(255,255,255,0.02)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(220,201,169,0.06)' }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.header} style={{ padding: '1.5rem', borderBottom: '1px solid rgba(220,201,169,0.1)' }}>
              <h3 style={{ color: 'var(--accent)', fontSize: '1rem', letterSpacing: '0.1em' }}>INFO</h3>
            </div>
            <div style={{ padding: '1.5rem', color: 'rgba(220,201,169,0.6)', fontSize: '0.85rem', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {video?.added && (
                <div>
                  <span style={{ color: 'var(--accent)', fontWeight: 800, display: 'block', fontSize: '0.7rem', letterSpacing: '0.05em' }}>ADDED</span>
                  {video.added}
                </div>
              )}
              {(video?.length || video?.duration) && (
                <div>
                  <span style={{ color: 'var(--accent)', fontWeight: 800, display: 'block', fontSize: '0.7rem', letterSpacing: '0.05em' }}>DURATION</span>
                  {video?.length || video?.duration}
                </div>
              )}
              {video?.views && (
                <div>
                  <span style={{ color: 'var(--accent)', fontWeight: 800, display: 'block', fontSize: '0.7rem', letterSpacing: '0.05em' }}>VIEWS</span>
                  {Number(video.views).toLocaleString()}
                </div>
              )}
              {(video?.rate || video?.rating) && (
                <div>
                  <span style={{ color: 'var(--accent)', fontWeight: 800, display: 'block', fontSize: '0.7rem', letterSpacing: '0.05em' }}>RATING</span>
                  ★ {video?.rate || video?.rating}%
                </div>
              )}
              <div>
                <span style={{ color: 'var(--accent)', fontWeight: 800, display: 'block', fontSize: '0.7rem', letterSpacing: '0.05em' }}>SOURCE</span>
                RedTube
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ErosWatch;
