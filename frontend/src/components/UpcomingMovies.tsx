import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { cinemaApi } from '../services/cinemaApi';
import type { CinemaMovie } from '../services/cinemaApi';
import SmartImage from './SmartImage';
import styles from './TopMovies.module.css';

const UpcomingMovies = () => {
  const [movies, setMovies] = useState<CinemaMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cinemaApi.getUpcoming()
      .then((data) => setMovies(data.slice(0, 12)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading && movies.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.accentBox} style={{ background: '#3b82f6' }}></div>
        <h2 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Calendar size={24} style={{ color: '#3b82f6' }} />
          UPCOMING RELEASES
        </h2>
      </div>

      <div className={styles.grid}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
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
                  <Link to={`/cinema/details/${movie.id}?type=${movie.mediaType}`} className={styles.cardLink}>
                    <div className={styles.posterPlaceholder}>
                      <div className={styles.badge} style={{ textTransform: 'uppercase', background: '#3b82f6' }}>
                        SOON
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
                        <span className={styles.type} style={{ borderColor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>
                           COMING SOON
                        </span>
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

export default UpcomingMovies;
