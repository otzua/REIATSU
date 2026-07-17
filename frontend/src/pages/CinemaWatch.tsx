import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ChevronLeft, Play, Tv, Film, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { cinemaApi } from '../services/cinemaApi';
import type { CinemaMovieDetail, CinemaMovie } from '../services/cinemaApi';
import { useMusic } from '../context/MusicContext';
import HalftoneWave from '../components/HalftoneWave';
import SmartImage from '../components/SmartImage';
import styles from './Watch.module.css'; // Reusing Watch styles

interface CinemaSeason {
  season_number: number;
  episode_count: number;
  name?: string;
}

interface CinemaCWData {
  id: string;
  title: string;
  poster: string;
  mediaType: 'movie' | 'tv';
  season?: number;
  episode?: number;
  timestamp: number;
}

const CinemaWatch = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mediaTypeParam = (searchParams.get('type') || 'movie') as 'movie' | 'tv';
  
  const playerWrapperRef = useRef<HTMLDivElement>(null);
  const [movie, setMovie] = useState<CinemaMovieDetail | null>(null);
  const [recommended, setRecommended] = useState<CinemaMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { stopMusic } = useMusic();

  // Stop music as soon as the user opens a watch page
  useEffect(() => {
    stopMusic();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const [prevId, setPrevId] = useState(id);
  const [prevMediaType, setPrevMediaType] = useState(mediaTypeParam);

  if (id !== prevId || mediaTypeParam !== prevMediaType) {
    setPrevId(id);
    setPrevMediaType(mediaTypeParam);
    setLoading(true);
    setMovie(null);
  }
  
  // Embed state
  const [activeServer, setActiveServer] = useState<'videasy' | 'vidsrcicu' | 'vidlink' | 'vidfast'>('vidlink');
  
  // TV Show State
  const [seasons, setSeasons] = useState<CinemaSeason[]>([]);
  const [activeSeason, setActiveSeason] = useState<number>(1);
  const [activeEpisode, setActiveEpisode] = useState<number>(1);
  
  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key.toLowerCase() === 'f') {
        if (!document.fullscreenElement) {
          playerWrapperRef.current?.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message}`);
          });
        } else {
          document.exitFullscreen();
        }
      }

      if (e.key.toLowerCase() === 'n' && movie?.mediaType === 'tv') {
        const currentSeasonObj = seasons.find(s => s.season_number === activeSeason);
        if (currentSeasonObj && activeEpisode < currentSeasonObj.episode_count) {
          setActiveEpisode(prev => prev + 1);
        } else if (currentSeasonObj) {
          // Check if there is a next season
          const nextSeasonIdx = seasons.findIndex(s => s.season_number === activeSeason) + 1;
          if (nextSeasonIdx < seasons.length) {
            setActiveSeason(seasons[nextSeasonIdx].season_number);
            setActiveEpisode(1);
          }
        }
      }

      if (e.key.toLowerCase() === 'p' && movie?.mediaType === 'tv') {
        if (activeEpisode > 1) {
          setActiveEpisode(prev => prev - 1);
        } else {
          // Check if there is a previous season
          const prevSeasonIdx = seasons.findIndex(s => s.season_number === activeSeason) - 1;
          if (prevSeasonIdx >= 0) {
            setActiveSeason(seasons[prevSeasonIdx].season_number);
            setActiveEpisode(seasons[prevSeasonIdx].episode_count);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movie, activeSeason, activeEpisode, seasons]);

  useEffect(() => {
    console.log('CinemaWatch Mounted, ID:', id, 'MediaType:', mediaTypeParam);
    if (!id) {
      return;
    }
    
    Promise.all([
      cinemaApi.getMovieDetails(id, mediaTypeParam),
      cinemaApi.getRecommendations(id, mediaTypeParam)
    ])
      .then(([data, recData]) => {
        console.log('Cinema Movie Data:', data);
        setMovie(data);
        setRecommended(recData);
        
        if (data.mediaType === 'tv' && data.seasons) {
          // Filter out season 0 (specials) unless it's the only season
          const validSeasons = data.seasons.filter((s) => s.season_number > 0);
          const finalSeasons = validSeasons.length > 0 ? validSeasons : data.seasons;
          setSeasons(finalSeasons);
          setActiveSeason(finalSeasons[0].season_number);
          setActiveEpisode(1);
        }
        
        // Save to Continue Watching
        const cwItem: CinemaCWData = {
          id: data.id,
          title: data.title,
          poster: data.imageUrl,
          mediaType: data.mediaType,
          season: data.mediaType === 'tv' ? 1 : undefined,
          episode: data.mediaType === 'tv' ? 1 : undefined,
          timestamp: Date.now()
        };
        
        const existingRaw = localStorage.getItem('reiatsu_cinema_continue_watching');
        let cwHistory: CinemaCWData[];
        try {
          const parsed = existingRaw ? JSON.parse(existingRaw) : [];
          cwHistory = Array.isArray(parsed) ? parsed : [];
        } catch {
          cwHistory = [];
        }

        // Remove if exists and add to front
        cwHistory = cwHistory.filter((item) => item.id !== data.id);
        cwHistory.unshift(cwItem);
        localStorage.setItem('reiatsu_cinema_continue_watching', JSON.stringify(cwHistory.slice(0, 15)));
        
        setLoading(false);
      })
      .catch((err) => {
        console.error('Cinema API Error:', err);
        setError(true);
        setLoading(false);
      });
  }, [id, mediaTypeParam]);

  useEffect(() => {
    if (movie && movie.mediaType === 'tv') {
      const existingRaw = localStorage.getItem('reiatsu_cinema_continue_watching');
      try {
        const parsed = existingRaw ? JSON.parse(existingRaw) : [];
        const cwHistory: CinemaCWData[] = Array.isArray(parsed) ? parsed : [];
        
        const index = cwHistory.findIndex((item) => item.id === movie.id);
        if (index !== -1) {
          cwHistory[index].season = activeSeason;
          cwHistory[index].episode = activeEpisode;
          cwHistory[index].timestamp = Date.now();
          
          // Move to front
          const [updatedItem] = cwHistory.splice(index, 1);
          cwHistory.unshift(updatedItem);
          
          localStorage.setItem('reiatsu_cinema_continue_watching', JSON.stringify(cwHistory));
        }
      } catch {
        console.error('History update error');
      }
    }
  }, [activeSeason, activeEpisode, movie]);

  if (loading) {
    return (
      <div className={styles.container}>
        <HalftoneWave />
        <div className={styles.content}>
          <div className={styles.loadingWrapper}>
            <div className={styles.loading}>LOADING STREAM...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className={styles.container}>
        <HalftoneWave />
        <div className={styles.content}>
          <div className={styles.errorBox}>
            <h2>FAILED TO LOAD MOVIE DATA</h2>
            <p style={{ color: 'var(--color-cream)', opacity: 0.5, marginBottom: '1rem' }}>Please verify the link or try another selection.</p>
            <button onClick={() => navigate(-1)}>GO BACK</button>
          </div>
        </div>
      </div>
    );
  }

  // Compute active embed URL based on Server & Season/Episode
  let finalPlayerUrl = '';
  if (activeServer === 'videasy') {
    finalPlayerUrl = movie.mediaType === 'tv'
      ? `https://player.videasy.net/tv/${movie.id}/${activeSeason}/${activeEpisode}`
      : `https://player.videasy.net/movie/${movie.id}`;
  } else if (activeServer === 'vidsrcicu') {
    finalPlayerUrl = movie.mediaType === 'tv'
      ? `https://vidsrc.icu/embed/tv/${movie.id}/${activeSeason}/${activeEpisode}`
      : `https://vidsrc.icu/embed/movie/${movie.id}`;
  } else if (activeServer === 'vidlink') {
    finalPlayerUrl = movie.mediaType === 'tv'
      ? `https://vidlink.pro/tv/${movie.id}/${activeSeason}/${activeEpisode}`
      : `https://vidlink.pro/movie/${movie.id}`;
  } else if (activeServer === 'vidfast') {
    finalPlayerUrl = movie.mediaType === 'tv'
      ? `https://vidfast.pro/tv/${movie.id}/${activeSeason}/${activeEpisode}`
      : `https://vidfast.pro/movie/${movie.id}`;
  }

  const releaseYear = movie.releaseDate ? movie.releaseDate.split('-')[0] : '';

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
            <span className={styles.activeEpName}>
              {movie.title} {movie.mediaType === 'tv' && `(S${activeSeason} E${activeEpisode})`}
            </span>
          </div>
        </div>

        <div className={styles.mainGrid}>
          <div className={styles.playerSection}>
            <div className={styles.videoWrapperContainer}>
              {movie.imageUrl && <SmartImage src={movie.imageUrl} aria-hidden="true" className={styles.playerGlow} />}
              <div ref={playerWrapperRef} className={styles.videoWrapper}>
                {finalPlayerUrl ? (
                  <iframe
                    key={finalPlayerUrl}
                    src={finalPlayerUrl}
                    className={styles.iframe}
                    allowFullScreen
                    scrolling="no"
                    allow="autoplay; encrypted-media"
                    title={movie.title}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className={styles.playerPlaceholder}>
                    NO STREAM SOURCE FOUND
                  </div>
                )}
              </div>
            </div>

            <div className={styles.playerControls}>
              <div className={styles.playerControlsInner}>
                <div className={styles.epMeta}>
                  <span className={styles.epCount} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {movie.mediaType === 'tv' ? <Tv size={12} /> : <Film size={12} />}
                    {movie.mediaType === 'tv' ? `TV SERIES • SEASON ${activeSeason} • EPISODE ${activeEpisode}` : 'CINEMA MOVIE'}
                  </span>
                  <h1 className={styles.epTitle}>{movie.title || 'Untitled'}</h1>
                </div>

                <div className={styles.playerActions}>
                  <div className={styles.controlsGroup}>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(220, 201, 169, 0.4)', fontWeight: 800, letterSpacing: '0.05em' }}>SERVER:</span>
                    <div className={styles.serverToggle}>
                      <button 
                        className={`${styles.serverBtn} ${activeServer === 'videasy' ? styles.active : ''}`}
                        onClick={() => setActiveServer('videasy')}
                      >
                        Videasy
                      </button>
                      <button 
                        className={`${styles.serverBtn} ${activeServer === 'vidsrcicu' ? styles.active : ''}`}
                        onClick={() => setActiveServer('vidsrcicu')}
                      >
                        VidSrc
                      </button>
                      <button 
                        className={`${styles.serverBtn} ${activeServer === 'vidlink' ? styles.active : ''}`}
                        onClick={() => setActiveServer('vidlink')}
                      >
                        VidLink
                      </button>
                      <button 
                        className={`${styles.serverBtn} ${activeServer === 'vidfast' ? styles.active : ''}`}
                        onClick={() => setActiveServer('vidfast')}
                      >
                        VidFast
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.animeDetails}>
              <div className={styles.animeMainInfo}>
                <div className={styles.miniPosterWrapper}>
                  {movie.imageUrl && (
                    <>
                      <SmartImage src={movie.imageUrl} aria-hidden="true" className={styles.miniPosterGlow} />
                      <SmartImage src={movie.imageUrl} alt="" className={styles.miniPoster} loading="eager" />
                    </>
                  )}
                </div>
                <div className={styles.textInfo}>
                  <h2 className={styles.animeTitle}>{movie.title}</h2>
                  <div className={styles.badges}>
                    <span className={styles.badge} style={{ textTransform: 'uppercase' }}>{movie.mediaType}</span>
                    <span className={styles.badge}>CINEMA</span>
                    {releaseYear && <span className={styles.badge}>{releaseYear}</span>}
                    {movie.rating !== undefined && movie.rating > 0 && (
                      <span className={styles.badge} style={{ borderColor: 'rgba(184, 58, 45, 0.3)', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Star size={12} fill="currentColor" style={{ verticalAlign: 'middle' }} /> {movie.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  {movie.genres && movie.genres.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '-0.5rem' }}>
                      {movie.genres.map((genre, i) => (
                        <span key={i} style={{ fontSize: '0.75rem', color: 'rgba(220, 201, 169, 0.5)', background: 'rgba(255, 255, 255, 0.02)', padding: '0.2rem 0.6rem', borderRadius: '4px', border: '1px solid rgba(220, 201, 169, 0.05)' }}>
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className={styles.description}>
                    {movie.description || "No description available for this title."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.header} style={{ padding: '1.5rem', borderBottom: '1px solid rgba(220, 201, 169, 0.1)' }}>
              <h3 style={{ color: 'var(--accent)', fontSize: '1rem', letterSpacing: '0.1em' }}>
                {movie.mediaType === 'tv' ? 'EPISODES' : 'INFO'}
              </h3>
            </div>
            
            {movie.mediaType === 'tv' && seasons.length > 0 && (
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(220, 201, 169, 0.05)' }}>
                <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--accent)', letterSpacing: '0.1em', fontWeight: 800, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Select Season</label>
                <select 
                  value={activeSeason}
                  onChange={(e) => {
                    setActiveSeason(Number(e.target.value));
                    setActiveEpisode(1);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.6rem 1rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(220, 201, 169, 0.1)',
                    borderRadius: '10px',
                    color: 'var(--color-cream)',
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.8rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {seasons.map((s) => (
                    <option key={s.season_number} value={s.season_number} style={{ background: '#111' }}>
                      Season {s.season_number} ({s.episode_count} Episodes)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className={styles.episodeGrid}>
              {movie.mediaType === 'tv' ? (
                // Render TV Episodes list based on active season's count
                Array.from({ length: seasons.find(s => s.season_number === activeSeason)?.episode_count || 0 }).map((_, idx) => {
                  const epNum = idx + 1;
                  const isActive = activeEpisode === epNum;
                  return (
                    <button
                      key={epNum}
                      className={`${styles.episodeItem} ${isActive ? styles.active : ''}`}
                      onClick={() => setActiveEpisode(epNum)}
                    >
                      <span className={styles.num}>{epNum}</span>
                      <span className={styles.name}>Episode {epNum}</span>
                      {isActive && (
                        <div className={styles.playIcon}>
                          <Play size={12} fill="currentColor" />
                        </div>
                      )}
                    </button>
                  );
                })
              ) : (
                // Show Movie Info in sidebar since there are no multiple episodes
                <div style={{ padding: '1.5rem', color: 'rgba(220, 201, 169, 0.6)', fontSize: '0.85rem', lineHeight: '1.6', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <span style={{ color: 'var(--accent)', fontWeight: 800, display: 'block', fontSize: '0.7rem', letterSpacing: '0.05em' }}>TITLE</span>
                    {movie.title}
                  </div>
                  {releaseYear && (
                    <div>
                      <span style={{ color: 'var(--accent)', fontWeight: 800, display: 'block', fontSize: '0.7rem', letterSpacing: '0.05em' }}>RELEASE YEAR</span>
                      {releaseYear}
                    </div>
                  )}
                  {movie.rating !== undefined && movie.rating > 0 && (
                    <div>
                      <span style={{ color: 'var(--accent)', fontWeight: 800, display: 'block', fontSize: '0.7rem', letterSpacing: '0.05em' }}>TMDB RATING</span>
                      ⭐ {movie.rating.toFixed(1)} / 10
                    </div>
                  )}
                  <div>
                    <span style={{ color: 'var(--accent)', fontWeight: 800, display: 'block', fontSize: '0.7rem', letterSpacing: '0.05em' }}>STATUS</span>
                    Available for streaming
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommended Section at the bottom */}
        {recommended && recommended.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={styles.recommendedSection}
          >
            <div className={styles.sectionHeaderLine}>
              <div className={styles.accentBox}></div>
              <h2>RECOMMENDED FOR YOU</h2>
            </div>
            <div className={styles.recommendedGrid}>
              {recommended.slice(0, 12).map((rec, index) => (
                <motion.div
                  key={rec.id}
                  className={styles.recCard}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.15, ease: "easeOut" } }}
                >
                  <Link to={`/cinema/watch/${rec.id}?type=${rec.mediaType}`} className={styles.cardLink}>
                    <div className={styles.posterPlaceholder}>
                      <SmartImage src={rec.imageUrl} aria-hidden="true" className={styles.recPosterGlow} draggable={false} />
                      <SmartImage src={rec.imageUrl} alt={rec.title} className={styles.recPosterImg} draggable={false} />
                    </div>
                    <div className={styles.recInfo}>
                      <h3 className={styles.recTitle}>{rec.title}</h3>
                      <p className={styles.recMeta}>{rec.mediaType === 'movie' ? 'Movie' : 'TV Show'}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CinemaWatch;
