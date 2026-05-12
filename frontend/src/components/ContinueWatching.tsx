import { useState, useEffect } from 'react';
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
  timestamp: number;
}

const decodeEntities = (text: string) => {
  if (!text) return '';
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

const ContinueWatching = () => {
  const [history, setHistory] = useState<AnimeCWData[]>([]);

  useEffect(() => {
    const data = localStorage.getItem('reiatsu_continue_watching');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        } else if (parsed && typeof parsed === 'object' && parsed.animeId) {
          // Gracefully convert legacy single-item structure to modern array format
          const legacyItem: AnimeCWData = {
            animeId: parsed.animeId,
            animeName: parsed.animeName,
            animePoster: parsed.animePoster,
            episodeNumber: parsed.episodeNumber,
            episodeTitle: parsed.episodeTitle,
            timestamp: parsed.timestamp || Date.now()
          };
          setHistory([legacyItem]);
          // Upgrade localStorage legacy key to array
          localStorage.setItem('reiatsu_continue_watching', JSON.stringify([legacyItem]));
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  if (history.length === 0) return null;

  return (
    <section className={styles.section} style={{ marginBottom: '4rem' }}>
      <div className={styles.header}>
        <div className={styles.accentBox}></div>
        <h2 className={styles.title}>CONTINUE WATCHING</h2>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '1.5rem',
        marginTop: '1.5rem' 
      }}>
        {history.slice(0, 6).map((item, index) => {
          const watchLink = `/watch/${item.animeId}?ep=${item.episodeNumber}`;

          return (
            <motion.div 
              key={item.animeId + (item.timestamp || index)}
              className={styles.card}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5, scale: 1.01, transition: { duration: 0.15, ease: "easeOut" } }}
              style={{ width: '100%', maxWidth: 'none' }} // Override max-width to let grid items expand nicely
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
                <div className={styles.info} style={{ flex: 1, minWidth: 0 }}>
                  <p className={styles.epInfo}>
                    <Tv size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                    EPISODE {item.episodeNumber}
                  </p>
                  <h3 className={styles.animeName} title={decodeEntities(item.animeName)} style={{ maxWidth: '100%' }}>
                    {decodeEntities(item.animeName)}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', marginTop: '0.1rem' }}>
                    <p className={styles.epTitle} title={decodeEntities(item.episodeTitle)} style={{ maxWidth: '100%' }}>
                      {decodeEntities(item.episodeTitle)}
                    </p>
                    {item.timestamp && (
                      <span style={{ fontSize: '0.65rem', color: 'rgba(220, 201, 169, 0.3)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.2rem' }}>
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
