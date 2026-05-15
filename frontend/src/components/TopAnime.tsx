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

  const LEGENDARY_IDS = [
    'one-piece-odmau',
    'naruto-shippuden-c8gov',
    'fullmetal-alchemist-brotherhood-9s0fl',
    'hunter-x-hunter-tjlki',
    'death-note-fc8mq',
    'attack-on-titan-final-season-part-2-bures',
    'code-geass-lelouch-of-the-rebellion-mtskz',
    'cowboy-bebop-kb7hu',
    'demon-slayer-kimetsu-no-yaiba-rzepv',
    'neon-genesis-evangelion-d0uqe',
    'dragon-ball-z-3gzan',
    'chainsaw-man-efeig'
  ];

  useEffect(() => {
    let mounted = true;
    const fetchAnimes = async () => {
      try {
        if (provider) {
          // For specific providers like miruro, we use their home data's top 10
          const data = await animeApi.getHome(provider);
          if (mounted) {
            setAnimes((data.top10Animes?.month || data.latestEpisodeAnimes || []).slice(0, 12));
          }
        } else {
          // Standard legends for default provider
          const promises = LEGENDARY_IDS.map(id => animeApi.getAnime(id).catch(() => null));
          const details = await Promise.all(promises);
          
          const valid = details
            .filter(d => d && d.anime)
            .map(d => ({
              id: d!.anime.id,
              name: d!.anime.name,
              jname: null,
              poster: d!.anime.poster,
              type: d!.anime.type,
              episodes: d!.anime.episodes
            }));
            
          if (mounted) {
            if (valid.length > 0) {
              setAnimes(valid);
            } else {
              const data = await animeApi.getHome();
              setAnimes((data.top10Animes?.month || data.topUpcomingAnimes || []).slice(0, 12));
            }
          }
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
        <h2 className={styles.title}>ALL-TIME LEGENDS</h2>
      </div>

      <div className={styles.grid}>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`${styles.animeCard} ${styles.skeleton}`} style={{ height: '350px' }} />
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
              <Link to={`/anime/${anime.id}${provider ? `?provider=${provider}` : ''}`} className={styles.cardLink}>
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
