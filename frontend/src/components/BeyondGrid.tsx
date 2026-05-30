import { motion } from 'framer-motion';
import { Play, Flame } from 'lucide-react';
import type { BeyondVideo } from '../services/beyondApi';
import SmartImage from './SmartImage';
import styles from './BeyondGrid.module.css';

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
        <h2 className={styles.title}>
          <Flame size={24} className={styles.titleIcon} />
          {title}
        </h2>
      </div>

      <div className={styles.grid}>
        {videos.map((video, index) => {
          const pubYear = video.pubDate ? new Date(video.pubDate).getFullYear() : '';
          return (
            <motion.div
              key={`${video.id}-${index}`}
              className={styles.card}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ y: -6, transition: { duration: 0.15, ease: 'easeOut' } }}
              onClick={() => onVideoSelect(video)}
            >
              <div className={styles.thumb}>
                <SmartImage src={video.thumbnail} aria-hidden="true" className={styles.thumbGlow} draggable={false} />
                <SmartImage src={video.thumbnail} alt={video.title} className={styles.thumbImg} draggable={false} />
                <div className={styles.playOverlay}>
                  <Play size={28} fill="currentColor" />
                </div>
                <span className={styles.badge}>PREMIUM</span>
              </div>
              <div className={styles.info}>
                <h3 className={styles.cardTitle} title={video.title}>{video.title}</h3>
                <div className={styles.meta}>
                  {pubYear && <span className={styles.pill}>{pubYear}</span>}
                  <span className={styles.watchPill}>
                    <Play size={9} fill="currentColor" /> WATCH
                  </span>
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
