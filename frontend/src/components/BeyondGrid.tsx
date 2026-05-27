import { motion } from 'framer-motion';
import { Play, Flame } from 'lucide-react';
import type { BeyondVideo } from '../services/beyondApi';
import SmartImage from './SmartImage';
import topStyles from './TopMovies.module.css';
import styles from './BeyondGrid.module.css';

interface BeyondGridProps {
  videos: BeyondVideo[];
  onVideoSelect: (video: BeyondVideo) => void;
  title: string;
}

const BeyondGrid = ({ videos, onVideoSelect, title }: BeyondGridProps) => {
  return (
    <section className={topStyles.section}>
      <div className={topStyles.header}>
        <div className={topStyles.accentBox}></div>
        <h2 className={`${topStyles.title} ${styles.titleRow}`}>
          <Flame size={24} className={styles.titleIcon} />
          {title}
        </h2>
      </div>

      <div className={topStyles.grid}>
        {videos.map((video, index) => {
          const pubYear = video.pubDate ? new Date(video.pubDate).getFullYear() : '';
          return (
            <motion.div
              key={`${video.id}-${index}`}
              className={topStyles.animeCard}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.15, ease: 'easeOut' } }}
              onClick={() => onVideoSelect(video)}
            >
              <div className={topStyles.cardLink}>
                <div className={topStyles.posterPlaceholder}>
                  <div className={topStyles.badge}>PREMIUM</div>
                  <SmartImage src={video.thumbnail} aria-hidden="true" className={topStyles.posterGlow} draggable={false} />
                  <SmartImage src={video.thumbnail} alt={video.title} className={topStyles.posterImg} draggable={false} />
                </div>
                <div className={topStyles.info}>
                  <h3 className={topStyles.animeTitle} title={video.title}>{video.title}</h3>
                  <div className={`${topStyles.episodesMeta} ${styles.episodesMeta}`}>
                    {pubYear && <span className={topStyles.type}>{pubYear}</span>}
                    <span className={`${topStyles.type} ${styles.watchBadge}`}>
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
