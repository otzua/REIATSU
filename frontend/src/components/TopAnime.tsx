import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { animeApi } from '../services/animeApi';
import type { AnimeCard } from '../services/animeApi';
import SmartImage from './SmartImage';
import styles from './TopAnime.module.css';

const TopAnime = ({ provider }: { provider?: string }) => {
  const [animes, setAnimes] = useState<AnimeCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchAnimes = async () => {
      try {
        // Always pull live top-10 data — never hardcoded
        const data = await animeApi.getHome(provider);
        if (mounted) {
          const live =
            data.top10Animes?.month?.length ? data.top10Animes.month :
            data.top10Animes?.week?.length  ? data.top10Animes.week  :
            data.latestEpisodeAnimes || [];
          setAnimes(live.slice(0, 12));
        }
      } catch (error) {
        console.error('Failed to fetch top anime', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchAnimes();
    return () => { mounted = false; };
  }, [provider]);

  if (!loading && animes.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.accentBox}></div>
        <h2 className={styles.title}>TOP THIS MONTH</h2>
      </div>

      <div className={styles.grid}>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`${styles.animeCard} ${styles.skeleton} ${styles.skeletonCard}`} />
            ))
          : animes.map((anime, index) => (
            <motion.div
              key={`${anime.id || 'anime'}-${index}`}
              className={styles.animeCard}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -10, scale: 1.05, transition: { duration: 0.15, ease: "easeOut" } }}
            >
              <Link to={`/${provider || 'anime'}/${provider ? 'anime/' : ''}${anime.id}`} className={styles.cardLink}>
                <div className={styles.posterPlaceholder}>
                  <div className={styles.rankBadge}>
                    {index + 1}
                  </div>
                  <div className={styles.cardBadges}>
                    {anime.episodes?.sub != null && <span className={styles.subBadge}>SUB {anime.episodes.sub}</span>}
                    {anime.episodes?.dub != null && <span className={styles.dubBadge}>DUB {anime.episodes.dub}</span>}
                  </div>
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
                    {anime.episodes?.dub != null && <span className={styles.dub}>DUB {anime.episodes.dub}</span>}
                    {(anime.episodes == null || (anime.episodes.sub == null && anime.episodes.dub == null)) && <span className={styles.type}>{anime.type ?? 'TV SERIES'}</span>}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
      </div>
    </section>
  );
};

export default TopAnime;
