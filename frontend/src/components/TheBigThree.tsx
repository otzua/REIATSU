import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { animeApi } from '../services/animeApi';
import type { AnimeDetail } from '../services/animeApi';
import SmartImage from './SmartImage';
import styles from './TheBigThree.module.css';

const BIG_THREE_IDS = ['one-piece-odmau', 'naruto-eybxz', 'bleach-yaa9n'];

const SkeletonCard = () => (
  <div className={styles.animeCard}>
    <div className={`${styles.posterPlaceholder} ${styles.skeleton}`} />
    <div className={styles.info}>
      <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
      <div className={`${styles.skeletonLine} ${styles.skeletonEp}`} />
    </div>
  </div>
);

const TheBigThree = () => {
  const [animes, setAnimes] = useState<AnimeDetail['anime'][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(BIG_THREE_IDS.map(id => animeApi.getAnime(id)))
      .then(responses => {
        setAnimes(responses.map(res => res.anime));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className={styles.bigThreeSection}>
      <div className={styles.header}>
        <div className={styles.accentBox}></div>
        <div className={styles.titleBlock}>
          <p className={styles.kicker}>Legacy Shonen Icons</p>
          <h2 className={styles.title}>THE BIG THREE</h2>
        </div>
      </div>

      <div className={styles.grid}>
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          : animes.map((anime, index) => (
            <motion.div
              key={anime.id}
              className={styles.animeCard}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.15, ease: "easeOut" } }}
            >
              <Link to={`/anime/${anime.id}`} className={styles.cardLink}>
                <div className={styles.posterPlaceholder}>
                  <span className={styles.rankBadge}>#{index + 1}</span>
                  {anime.poster
                    ? (
                      <>
                        <SmartImage src={anime.poster} aria-hidden="true" className={styles.posterGlow} draggable={false} />
                        <SmartImage src={anime.poster} alt={anime.name} className={styles.posterImg} draggable={false} />
                      </>
                    )
                    : null}
                  <div className={styles.episodeOverlay}>
                    {anime.episodes?.sub != null && <span>SUB {anime.episodes.sub}</span>}
                    {anime.episodes?.dub != null && <span>DUB {anime.episodes.dub}</span>}
                  </div>
                </div>
                <div className={styles.info}>
                  <h3 className={styles.animeTitle}>{anime.name}</h3>
                  <p className={styles.episode}>{anime.type ?? 'Anime'}</p>
                </div>
              </Link>
            </motion.div>
          ))}
      </div>
    </section>
  );
};

export default TheBigThree;
