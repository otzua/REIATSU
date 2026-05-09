import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { animeApi } from '../services/animeApi';
import type { AnimeCard } from '../services/animeApi';
import SmartImage from './SmartImage';
import styles from './AiringAnime.module.css';

const AiringAnime = () => {
  const [animes, setAnimes] = useState<AnimeCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    animeApi.getHome()
      .then((data) => {
        setAnimes((data.latestEpisodeAnimes || []).slice(0, 10));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (!loading && animes.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.accentBox}></div>
        <h2 className={styles.title}>CURRENTLY AIRING</h2>
      </div>

      <div className={styles.grid}>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`${styles.animeCard} ${styles.skeleton}`} style={{ height: '300px' }} />
            ))
          : animes.map((anime, index) => (
            <motion.div
              key={anime.id}
              className={styles.animeCard}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.15, ease: "easeOut" } }}
            >
              <Link to={`/anime/${anime.id}`} className={styles.cardLink}>
                <div className={styles.posterPlaceholder}>
                  <div className={styles.airingBadge}>
                    <div className={styles.dot} />
                    LIVE
                  </div>
                  {anime.poster && (
                    <>
                      <SmartImage src={anime.poster} aria-hidden="true" className={styles.posterGlow} draggable={false} />
                      <SmartImage src={anime.poster} alt={anime.name} className={styles.posterImg} draggable={false} />
                    </>
                  )}
                  <div className={styles.episodeOverlay}>
                    {anime.episodes.sub != null && <span>EPISODE {anime.episodes.sub}</span>}
                  </div>
                </div>
                <div className={styles.info}>
                  <h3 className={styles.animeTitle}>{anime.name}</h3>
                  <p className={styles.airingTime}>AIRING NOW</p>
                </div>
              </Link>
            </motion.div>
          ))}
      </div>
    </section>
  );
};

export default AiringAnime;
