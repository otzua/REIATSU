import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Film, Tv, Star, Flame } from 'lucide-react';
import { cinemaApi } from '../services/cinemaApi';
import type { CinemaMovie } from '../services/cinemaApi';
import SmartImage from './SmartImage';
import styles from './TopMovies.module.css';

const CinemaMovies = () => {
  const [movies, setMovies] = useState<CinemaMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'movie' | 'tv'>('movie');
  
  const loadTrending = () => {
    setLoading(true);
    const fetchPromise = activeTab === 'movie' 
      ? cinemaApi.getTrendingMovies() 
      : cinemaApi.getTrendingTV();

    fetchPromise
      .then(setMovies)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  // Fetch trending movies or TV on mount or tab change
  useEffect(() => {
    loadTrending();
  }, [activeTab]);

  return (
    <section className={styles.section}>
      {/* Tabs Selector */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginBottom: '3rem'
      }}>
        <button
          onClick={() => setActiveTab('movie')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: activeTab === 'movie' ? 'var(--accent)' : 'rgba(255, 255, 255, 0.03)',
            border: '1px solid',
            borderColor: activeTab === 'movie' ? 'var(--accent)' : 'rgba(220, 201, 169, 0.08)',
            color: '#fff',
            padding: '0.75rem 1.75rem',
            borderRadius: '14px',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            letterSpacing: '0.08em',
            transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: activeTab === 'movie' ? '0 6px 20px rgba(184, 58, 45, 0.3)' : 'none',
            transform: activeTab === 'movie' ? 'translateY(-2px)' : 'none'
          }}
        >
          <Film size={16} />
          TRENDING MOVIES
        </button>

        <button
          onClick={() => setActiveTab('tv')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: activeTab === 'tv' ? 'var(--accent)' : 'rgba(255, 255, 255, 0.03)',
            border: '1px solid',
            borderColor: activeTab === 'tv' ? 'var(--accent)' : 'rgba(220, 201, 169, 0.08)',
            color: '#fff',
            padding: '0.75rem 1.75rem',
            borderRadius: '14px',
            fontFamily: 'var(--font-heading)',
            fontSize: '0.85rem',
            fontWeight: 800,
            cursor: 'pointer',
            letterSpacing: '0.08em',
            transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: activeTab === 'tv' ? '0 6px 20px rgba(184, 58, 45, 0.3)' : 'none',
            transform: activeTab === 'tv' ? 'translateY(-2px)' : 'none'
          }}
        >
          <Tv size={16} />
          TRENDING SHOWS
        </button>
      </div>

      {/* Header section */}
      <div className={styles.header}>
        <div className={styles.accentBox}></div>
        <h2 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Flame size={24} style={{ color: 'var(--accent)' }} />
          {activeTab === 'movie' ? 'TRENDING MOVIES' : 'TRENDING TV SERIES'}
        </h2>
      </div>

      {/* Grid or Skeletons */}
      <div className={styles.grid}>
        {loading
          ? Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className={`${styles.animeCard} ${styles.skeleton}`} style={{ height: '320px' }} />
            ))
          : movies.map((movie, index) => {
              const releaseYear = movie.releaseDate ? movie.releaseDate.split('-')[0] : '';
              return (
                <motion.div
                  key={`${movie.id}-${index}`}
                  className={styles.animeCard}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.15, ease: "easeOut" } }}
                >
                  <Link to={`/cinema/details/${movie.id}?type=${movie.mediaType}`} className={styles.cardLink}>                    <div className={styles.posterPlaceholder}>
                      <div className={styles.badge} style={{ textTransform: 'uppercase' }}>
                        {movie.mediaType}
                      </div>
                      {movie.imageUrl ? (
                        <>
                          <SmartImage src={movie.imageUrl} aria-hidden="true" className={styles.posterGlow} draggable={false} />
                          <SmartImage src={movie.imageUrl} alt={movie.title} className={styles.posterImg} draggable={false} />
                        </>
                      ) : (
                        <div style={{ color: 'rgba(220, 201, 169, 0.2)', fontSize: '0.8rem', fontFamily: 'var(--font-heading)' }}>
                          NO POSTER
                        </div>
                      )}
                    </div>
                    <div className={styles.info}>
                      <h3 className={styles.animeTitle} title={movie.title}>{movie.title}</h3>
                      <div className={styles.episodesMeta} style={{ justifyContent: 'space-between', width: '100%' }}>
                        {releaseYear && <span className={styles.type}>{releaseYear}</span>}
                        {movie.rating !== undefined && movie.rating > 0 && (
                          <span className={styles.type} style={{ borderColor: 'rgba(184, 58, 45, 0.2)', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <Star size={10} fill="currentColor" /> {movie.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
      </div>
    </section>
  );
};

export default CinemaMovies;
