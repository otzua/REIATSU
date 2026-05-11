import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { animeApi } from '../services/animeApi';
import type { AnimeCard } from '../services/animeApi';
import SmartImage from './SmartImage';
import styles from './TopMovies.module.css';

const TopMovies = () => {
  const [animes, setAnimes] = useState<AnimeCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    animeApi.getType('movie')
      .then((data) => {
        setAnimes((data.animes || []).slice(0, 12));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (!loading && animes.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.accentBox}></div>
        <h2 className={styles.title}>TOP MOVIES</h2>
      </div>

      <div className={styles.grid}>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`${styles.animeCard} ${styles.skeleton}`} style={{ height: '300px' }} />
            ))
          : animes.map((anime, index) => (
            <motion.div
              key={`${anime.id || 'anime'}-${index}`}
              className={styles.animeCard}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.15, ease: "easeOut" } }}
            >
              <Link to={`/anime/${anime.id}`} className={styles.cardLink}>
                <div className={styles.posterPlaceholder}>
                  <div className={styles.badge}>MOVIE</div>
                  {anime.poster && (
                    <>
                      <SmartImage src={anime.poster} aria-hidden="true" className={styles.posterGlow} draggable={false} />
                      <SmartImage src={anime.poster} alt={anime.name} className={styles.posterImg} draggable={false} />
                    </>
                  )}
                </div>
                <div className={styles.info}>
                  <h3 className={styles.animeTitle}>{anime.name}</h3>
                  <div className={styles.episodesMeta}>
                    {anime.episodes?.sub != null && <span className={styles.sub}>SUB {anime.episodes.sub}</span>}
                    {anime.episodes?.sub != null && anime.episodes?.dub != null && <span className={styles.divider}>|</span>}
                    {anime.episodes?.dub != null && <span className={styles.dub}>DUB {anime.episodes.dub}</span>}
                    {(anime.episodes == null || (anime.episodes.sub == null && anime.episodes.dub == null)) && <span className={styles.type}>MOVIE</span>}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
      </div>
    </section>
  );
};

export default TopMovies;
