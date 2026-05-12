import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ChevronLeft, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { cinemaApi } from '../services/cinemaApi';
import type { CinemaMovieDetail, CinemaMovie } from '../services/cinemaApi';
import HalftoneWave from '../components/HalftoneWave';
import SmartImage from '../components/SmartImage';
import styles from './AnimeDetails.module.css';

const CinemaDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mediaTypeParam = (searchParams.get('type') || 'movie') as 'movie' | 'tv';
  
  const [movie, setMovie] = useState<CinemaMovieDetail | null>(null);
  const [recommended, setRecommended] = useState<CinemaMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    // Scroll to top when ID changes
    window.scrollTo(0, 0);

    setLoading(true);
    Promise.all([
      cinemaApi.getMovieDetails(id, mediaTypeParam),
      cinemaApi.getRecommendations(id, mediaTypeParam)
    ])
      .then(([movieData, recData]) => {
        setMovie(movieData);
        setRecommended(recData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('REIATSU ERROR:', err);
        setLoading(false);
        setError(true);
      });
  }, [id, mediaTypeParam]);

  if (loading) {
    return (
      <div className={styles.container}>
        <HalftoneWave />
        <div className={styles.content}>
          <div className={styles.loadingWrapper}>
            <div className={styles.loading}>LOADING CINEMA...</div>
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
            <h2>FAILED TO LOAD DATA</h2>
            <button onClick={() => window.location.reload()}>RETRY</button>
          </div>
        </div>
      </div>
    );
  }

  const releaseYear = movie.releaseDate ? movie.releaseDate.split('-')[0] : '';
  const watchLink = `/cinema/watch/${movie.id}?type=${movie.mediaType}`;

  return (
    <div className={styles.wrapper}>
      {/* Immersive Blurred Background */}
      <div className={styles.immersiveBg}>
        <SmartImage src={movie.backdropUrl || movie.imageUrl} alt="" className={styles.bgImage} loading="eager" />
        <div className={styles.bgOverlay} />
      </div>

      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.topNav}>
            <button onClick={() => navigate(-1)} className={styles.backBtn}>
              <ChevronLeft size={18} />
              <span>BACK</span>
            </button>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.detailsBox}
          >
            <div className={styles.mainInfo}>
              <div className={styles.posterWrapper}>
                <SmartImage src={movie.imageUrl} alt={movie.title} className={styles.poster} loading="eager" />
                <div className={styles.actionsMobile}>
                  <Link to={watchLink} className={styles.watchBtn}>
                    <Play fill="currentColor" size={20} />
                    <span>WATCH NOW</span>
                  </Link>
                </div>
              </div>

              <div className={styles.textInfo}>
                <h1 className={styles.title}>{movie.title}</h1>
                
                <div className={styles.badges}>
                  <span className={styles.badge} style={{ textTransform: 'uppercase' }}>{movie.mediaType}</span>
                  <span className={styles.badge}>CINEMA</span>
                  {releaseYear && <span className={styles.badge}>{releaseYear}</span>}
                  {movie.rating !== undefined && movie.rating > 0 && (
                    <span className={styles.badge} style={{ borderColor: 'rgba(184, 58, 45, 0.3)', color: 'var(--accent)' }}>
                      ⭐ {movie.rating.toFixed(1)}
                    </span>
                  )}
                  {movie.mediaType === 'tv' && movie.seasons && (
                    <span className={styles.badge}>{movie.seasons.filter(s => s.season_number > 0).length} SEASONS</span>
                  )}
                </div>

                <div className={styles.descriptionBox}>
                  <h3>SYNOPSIS</h3>
                  <p className={styles.description}>{movie.description}</p>
                </div>

                <div className={styles.actionsDesktop}>
                  <Link to={watchLink} className={styles.watchBtn}>
                    <Play fill="currentColor" size={20} />
                    <span>WATCH NOW</span>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recommended Section */}
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
              <div className={styles.grid}>
                {recommended.slice(0, 12).map((rec, index) => (
                  <motion.div
                    key={rec.id}
                    className={styles.animeCard}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.15, ease: "easeOut" } }}
                    >
                    <Link to={`/cinema/details/${rec.id}?type=${rec.mediaType}`} className={styles.cardLink}>
                      <div className={styles.posterPlaceholder}>
                        {rec.imageUrl && (
                          <>
                            <SmartImage src={rec.imageUrl} aria-hidden="true" className={styles.recPosterGlow} draggable={false} />
                            <SmartImage src={rec.imageUrl} alt={rec.title} className={styles.recPosterImg} draggable={false} />
                          </>
                        )}
                      </div>
                      <div className={styles.info}>
                        <h3 className={styles.animeTitle}>{rec.title}</h3>
                        <p className={styles.episode}>{rec.mediaType === 'movie' ? 'Movie' : 'TV Series'}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CinemaDetails;
