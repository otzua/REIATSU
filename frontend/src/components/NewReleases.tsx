import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { animeApi } from '../services/animeApi';
import type { AnimeCard } from '../services/animeApi';
import styles from './NewReleases.module.css';

const SkeletonCard = () => (
  <div className={styles.animeCard}>
    <div className={`${styles.posterPlaceholder} ${styles.skeleton}`} />
    <div className={styles.info}>
      <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
      <div className={`${styles.skeletonLine} ${styles.skeletonEp}`} />
    </div>
  </div>
);

const NewReleases = () => {
  const [animes, setAnimes] = useState<AnimeCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    animeApi.getHome()
      .then((data) => {
        const items = data.latestEpisodeAnimes?.length
          ? data.latestEpisodeAnimes
          : data.newReleases ?? [];
        setAnimes(items.slice(0, 12));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className={styles.releasesSection}>
      <div className={styles.header}>
        <div className={styles.accentBox}></div>
        <h2 className={styles.title}>NEWLY RELEASED</h2>
      </div>

      <div className={styles.grid}>
        {loading
          ? Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
          : animes.map((anime, index) => (
            <motion.div
              key={anime.id}
              className={styles.animeCard}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              whileHover={{ y: -8 }}
            >
              <div className={styles.posterPlaceholder}>
                {anime.poster
                  ? <img src={anime.poster} alt={anime.name} className={styles.posterImg} draggable={false} />
                  : null}
                <div className={styles.badge}>NEW</div>
                <div className={styles.episodeOverlay}>
                  {anime.episodes.sub != null && <span>SUB {anime.episodes.sub}</span>}
                  {anime.episodes.dub != null && <span>DUB {anime.episodes.dub}</span>}
                </div>
              </div>
              <div className={styles.info}>
                <h3 className={styles.animeTitle}>{anime.name}</h3>
                <p className={styles.episode}>{anime.type ?? 'Anime'}</p>
              </div>
            </motion.div>
          ))}
      </div>
    </section>
  );
};

export default NewReleases;
