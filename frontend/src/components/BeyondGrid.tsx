import { motion } from 'framer-motion';
import { Play, Flame } from 'lucide-react';
import type { BeyondVideo } from '../services/beyondApi';
import SmartImage from './SmartImage';
import styles from './TopMovies.module.css';

interface BeyondGridProps {
  videos: BeyondVideo[];
  onVideoSelect: (video: BeyondVideo) => void;
  title: string;
}

const BeyondGrid = ({ videos, onVideoSelect, title }: BeyondGridProps) => {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.accentBox}></div>
        <h2 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Flame size={24} style={{ color: 'var(--accent)' }} />
          {title}
        </h2>
      </div>

      <div className={styles.grid}>
        {videos.map((video, index) => {
          const pubYear = video.pubDate ? new Date(video.pubDate).getFullYear() : '';
          return (
            <motion.div
              key={`${video.id}-${index}`}
              className={styles.animeCard}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.15, ease: "easeOut" } }}
              onClick={() => onVideoSelect(video)}
            >
              <div className={styles.cardLink}>
                <div className={styles.posterPlaceholder}>
                  <div className={styles.badge} style={{ textTransform: 'uppercase' }}>
                    PREMIUM
                  </div>
                  <SmartImage src={video.thumbnail} aria-hidden="true" className={styles.posterGlow} draggable={false} />
                  <SmartImage src={video.thumbnail} alt={video.title} className={styles.posterImg} draggable={false} />
                </div>
                <div className={styles.info}>
                  <h3 className={styles.animeTitle} title={video.title}>{video.title}</h3>
                  <div className={styles.episodesMeta} style={{ justifyContent: 'space-between', width: '100%' }}>
                    {pubYear && <span className={styles.type}>{pubYear}</span>}
                    <span className={styles.type} style={{ borderColor: 'rgba(220, 201, 169, 0.2)', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Play size={10} fill="currentColor" /> WATCH
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default BeyondGrid;
