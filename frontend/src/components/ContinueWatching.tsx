import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, Tv, Clock } from 'lucide-react';
import SmartImage from './SmartImage';
import styles from './ContinueWatching.module.css';

interface AnimeCWData {
  animeId: string;
  animeName: string;
  animePoster: string;
  episodeNumber: number;
  episodeTitle: string;
  provider?: string;
  timestamp: number;
}

const decodeEntities = (text: string) => {
  if (!text) return '';
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

const ContinueWatching = ({ provider }: { provider?: string }) => {
  const [history] = useState<AnimeCWData[]>(() => {
    const data = localStorage.getItem('reiatsu_continue_watching');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed;
        } else if (parsed && typeof parsed === 'object' && parsed.animeId) {
          return [parsed as AnimeCWData];
        }
      } catch {
        // ignore
      }
    }
    return [];
  });

  const filteredHistory = useMemo(() => {
    let items = history;
    if (provider) {
      if (provider === 'miruro' || provider === 'beyond') {
        items = items.filter(item => item.provider === 'miruro' || item.provider === 'beyond');
      } else {
        items = items.filter(item => item.provider === provider);
      }
    }
    return items;
  }, [history, provider]);

  if (filteredHistory.length === 0) return null;

  return (
    <section className={`${styles.section} ${styles.sectionSpaced}`}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.accentBox}></div>
          <h2 className={styles.title}>CONTINUE WATCHING</h2>
        </div>
        <Link to="/anime/history" className={styles.titleLink}>
          VIEW FULL HISTORY
        </Link>
      </div>

      <div className={styles.cwGrid}>
        {filteredHistory.slice(0, 8).map((item, index) => {
          const watchLink = `/${item.provider || 'anime'}/watch/${item.animeId}?ep=${item.episodeNumber}`;

          return (
            <motion.div
              key={item.animeId + (item.timestamp || index)}
              className={`${styles.card} ${styles.cardFull}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5, scale: 1.01, transition: { duration: 0.15, ease: 'easeOut' } }}
            >
              <Link to={watchLink} className={styles.cardLink}>
                <div className={styles.posterWrapper}>
                  <SmartImage src={item.animePoster} className={styles.poster} />
                  <div className={styles.overlay}>
                    <div className={styles.playBtn}>
                      <Play size={24} fill="currentColor" />
                    </div>
                  </div>
                </div>
                <div className={styles.info}>
                  <p className={styles.epInfo}>
                    <Tv size={12} className={styles.tvIcon} />
                    EPISODE {item.episodeNumber}
                  </p>
                  <h3 className={styles.animeName} title={decodeEntities(item.animeName)}>
                    {decodeEntities(item.animeName)}
                  </h3>
                  <div className={styles.metaStack}>
                    <p className={styles.epTitle} title={decodeEntities(item.episodeTitle)}>
                      {decodeEntities(item.episodeTitle)}
                    </p>
                    {item.timestamp && (
                      <span className={styles.timestamp}>
                        <Clock size={10} /> {new Date(item.timestamp).toLocaleDateString()}
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

export default ContinueWatching;
