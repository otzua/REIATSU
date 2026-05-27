import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, Tv, Clock, ArrowLeft } from 'lucide-react';
import SmartImage from '../components/SmartImage';
import HalftoneWave from '../components/HalftoneWave';
import cwStyles from '../components/ContinueWatching.module.css';
import pageStyles from './Home.module.css';
import styles from './AnimeHistory.module.css';

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

const AnimeHistory = () => {
  const [history] = useState<AnimeCWData[]>(() => {
    const data = localStorage.getItem('reiatsu_continue_watching');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed;
        } else if (parsed && typeof parsed === 'object' && parsed.animeId) {
          const legacyItem: AnimeCWData = {
            animeId: parsed.animeId,
            animeName: parsed.animeName,
            animePoster: parsed.animePoster,
            episodeNumber: parsed.episodeNumber,
            episodeTitle: parsed.episodeTitle,
            timestamp: parsed.timestamp || Date.now()
          };
          return [legacyItem];
        }
      } catch {
        // ignore
      }
    }
    return [];
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className={pageStyles.homeContainer}>
      <HalftoneWave />
      <div className={`${pageStyles.content} ${styles.contentPadding}`}>
        <section className={cwStyles.section}>
          <div className={cwStyles.header}>
            <Link to="/" className={cwStyles.backBtn}>
              <ArrowLeft size={24} />
            </Link>
            <div className={cwStyles.titleGroup}>
              <div className={cwStyles.accentBox}></div>
              <h2 className={cwStyles.title}>WATCH HISTORY</h2>
            </div>
          </div>

          {history.length === 0 ? (
            <div className={styles.emptyMessage}>
              Your anime history is empty.
            </div>
          ) : (
            <div className={cwStyles.grid}>
              {history.map((item, index) => {
                const watchLink = `/${item.provider || 'anime'}/watch/${item.animeId}?ep=${item.episodeNumber}`;

                return (
                  <motion.div
                    key={item.animeId + (item.timestamp || index)}
                    className={cwStyles.card}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (index % 10) * 0.05 }}
                    whileHover={{ y: -5, scale: 1.01, transition: { duration: 0.15, ease: 'easeOut' } }}
                  >
                    <Link to={watchLink} className={cwStyles.cardLink}>
                      <div className={cwStyles.posterWrapper}>
                        <SmartImage src={item.animePoster} className={cwStyles.poster} />
                        <div className={cwStyles.overlay}>
                          <div className={cwStyles.playBtn}>
                            <Play size={24} fill="currentColor" />
                          </div>
                        </div>
                      </div>
                      <div className={cwStyles.info}>
                        <p className={cwStyles.epInfo}>
                          <Tv size={12} className={cwStyles.tvIcon} />
                          EPISODE {item.episodeNumber}
                        </p>
                        <h3 className={cwStyles.animeName} title={decodeEntities(item.animeName)}>
                          {decodeEntities(item.animeName)}
                        </h3>
                        <div className={cwStyles.metaStack}>
                          <p className={cwStyles.epTitle} title={decodeEntities(item.episodeTitle)}>
                            {decodeEntities(item.episodeTitle)}
                          </p>
                          {item.timestamp && (
                            <span className={cwStyles.timestamp}>
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
          )}
        </section>
      </div>
    </div>
  );
};

export default AnimeHistory;
