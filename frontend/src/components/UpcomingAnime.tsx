import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { animeApi } from '../services/animeApi';
import type { AnimeCard } from '../services/animeApi';
import SmartImage from './SmartImage';
import styles from './TopMovies.module.css';

const UpcomingAnime = ({ provider }: { provider?: string }) => {
  const [animes, setAnimes] = useState<AnimeCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    animeApi.getHome(provider)
      .then((data) => {
        setAnimes((data.topUpcomingAnimes || []).slice(0, 12));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [provider]);

  if (!loading && animes.length === 0) return null;

  return (
    <section className={styles.section} style={{ marginTop: '4rem' }}>
      <div className={styles.header}>
        <div className={styles.accentBox} style={{ background: '#a855f7' }}></div>
        <h2 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Calendar size={24} style={{ color: '#a855f7' }} />
          UPCOMING ANIME
        </h2>
      </div>

      <div className={styles.grid}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
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
              <Link to={`/${provider || 'anime'}/${provider ? 'anime/' : ''}${anime.id}`} className={styles.cardLink}>
                <div className={styles.posterPlaceholder}>
                  <div className={styles.badge} style={{ background: '#a855f7' }}>SOON</div>
                  <div className={styles.cardBadges} style={{ left: 'unset', right: '1rem' }}>
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
                    <span className={styles.type} style={{ borderColor: 'rgba(168, 85, 247, 0.2)', color: '#a855f7' }}>
                      COMING SOON
                    </span>
                    <span className={styles.type}>{anime.type || 'TV'}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
      </div>
    </section>
  );
};

export default UpcomingAnime;
