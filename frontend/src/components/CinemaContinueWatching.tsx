import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, Film, Tv, Clock } from 'lucide-react';
import SmartImage from './SmartImage';
import styles from './ContinueWatching.module.css';

interface CinemaCWData {
  id: string;
  title: string;
  poster: string;
  mediaType: 'movie' | 'tv';
  season?: number;
  episode?: number;
  timestamp: number;
}

const CinemaContinueWatching = () => {
  const [history, setHistory] = useState<CinemaCWData[]>([]);

  useEffect(() => {
    const data = localStorage.getItem('reiatsu_cinema_continue_watching');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
          <div className={styles.accentBox}></div>
          <h2 className={styles.title}>CONTINUE WATCHING</h2>
        </div>
        <Link to="/cinema/history" className={styles.titleLink}>
          VIEW FULL HISTORY
        </Link>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '1.5rem',
        marginTop: '1.5rem' 
      }}>
        {history.slice(0, 8).map((item, index) => {
          const watchLink = item.mediaType === 'tv' 
            ? `/cinema/watch/${item.id}?type=tv&season=${item.season}&episode=${item.episode}`
            : `/cinema/watch/${item.id}?type=movie`;

          return (
            <motion.div 
              key={item.id + item.timestamp}
              className={styles.card}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5, scale: 1.01, transition: { duration: 0.15, ease: "easeOut" } }}
              style={{ width: '100%' }}
            >
              <Link to={watchLink} className={styles.cardLink}>
                <div className={styles.posterWrapper}>
                   <SmartImage src={item.poster} className={styles.poster} />
                   <div className={styles.overlay}>
                     <div className={styles.playBtn}>
                       <Play size={24} fill="currentColor" />
                     </div>
                   </div>
                </div>
                <div className={styles.info}>
                  <p className={styles.epInfo}>
                    {item.mediaType === 'tv' ? <Tv size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> : <Film size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />}
                    {item.mediaType === 'tv' ? `S${item.season} E${item.episode}` : 'MOVIE'}
                  </p>
                  <h3 className={styles.animeName} title={item.title}>{item.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                    <p className={styles.epTitle}>{item.mediaType === 'movie' ? 'Cinema Movie' : 'TV Series'}</p>
                    <span style={{ fontSize: '0.65rem', color: 'rgba(220, 201, 169, 0.2)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      • <Clock size={10} /> {new Date(item.timestamp).toLocaleDateString()}
                    </span>
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

export default CinemaContinueWatching;
