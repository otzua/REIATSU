import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { animeApi } from '../services/animeApi';
import type { AnimeCard } from '../services/animeApi';
import SmartImage from './SmartImage';
import styles from './TopAnime.module.css';

const TopAnime = () => {
  const [animes, setAnimes] = useState<AnimeCard[]>([]);
  const [loading, setLoading] = useState(true);

  const LEGENDARY_IDS = [
    'fullmetal-alchemist-brotherhood-9s0fl',
    'steins-gate-mzlq0',
    'hunter-x-hunter-tjlki',
    'attack-on-titan-season-1-z6vx1',
    'one-piece-odmau',
    'death-note-fc8mq',
    'naruto-shippuden-c8gov',
    'code-geass-lelouch-of-the-rebellion-n7z05',
    'monster-n3622',
    'cowboy-bebop-t8nlj'
  ];

  useEffect(() => {
    const fetchLegends = async () => {
      try {
        const promises = LEGENDARY_IDS.map(id => animeApi.getAnime(id).catch(() => null));
        const details = await Promise.all(promises);
        const list: AnimeCard[] = details
          .filter(d => d && d.anime)
          .map(d => ({
            id: d!.anime.id,
            name: d!.anime.name,
            jname: null,
            poster: d!.anime.poster,
            type: d!.anime.type,
            episodes: d!.anime.episodes
          }));
        
        if (list.length > 0) {
          setAnimes(list);
        } else {
          const data = await animeApi.getHome();
          setAnimes((data.top10Animes?.month || data.topUpcomingAnimes || []).slice(0, 10));
        }
      } catch (error) {
        console.error('Failed to fetch legends', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLegends();
  }, []);

  if (!loading && animes.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.accentBox}></div>
        <h2 className={styles.title}>ALL-TIME LEGENDS</h2>
      </div>

      <div className={styles.grid}>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`${styles.animeCard} ${styles.skeleton}`} style={{ height: '350px' }} />
            ))
          : animes.map((anime, index) => (
            <motion.div
              key={anime.id}
              className={styles.animeCard}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -10, scale: 1.05, transition: { duration: 0.15, ease: "easeOut" } }}
            >
              <Link to={`/anime/${anime.id}`} className={styles.cardLink}>
                <div className={styles.posterPlaceholder}>
                  <div className={styles.rankBadge}>
                    {index + 1}
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
                  <p className={styles.type}>{anime.type ?? 'TV SERIES'}</p>
                </div>
              </Link>
            </motion.div>
          ))}
      </div>
    </section>
  );
};

export default TopAnime;
