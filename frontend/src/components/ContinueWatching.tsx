import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import SmartImage from './SmartImage';
import styles from './ContinueWatching.module.css';

interface CWData {
  animeId: string;
  animeName: string;
  animePoster: string;
  episodeNumber: number;
  episodeTitle: string;
}

const ContinueWatching = () => {
  const [cwData, setCwData] = useState<CWData | null>(null);

  useEffect(() => {
    const data = localStorage.getItem('reiatsu_continue_watching');
    if (data) {
      try {
        setCwData(JSON.parse(data));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  if (!cwData) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.accentBox}></div>
        <h2 className={styles.title}>CONTINUE WATCHING</h2>
      </div>

      <motion.div 
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        whileHover={{ y: -5, scale: 1.01, transition: { duration: 0.15, ease: "easeOut" } }}
      >
        <Link to={`/watch/${cwData.animeId}?ep=${cwData.episodeNumber}`} className={styles.cardLink}>
          <div className={styles.posterWrapper}>
             <SmartImage src={cwData.animePoster} className={styles.poster} />
             <div className={styles.overlay}>
               <div className={styles.playBtn}>
                 <Play size={24} fill="currentColor" />
               </div>
             </div>
          </div>
          <div className={styles.info}>
            <p className={styles.epInfo}>EPISODE {cwData.episodeNumber}</p>
            <h3 className={styles.animeName}>{cwData.animeName}</h3>
            <p className={styles.epTitle}>{cwData.episodeTitle}</p>
          </div>
        </Link>
      </motion.div>
    </section>
  );
};

export default ContinueWatching;
