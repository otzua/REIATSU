import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Plus } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import SmartImage from './SmartImage';
import type { Track } from '../services/musicApi';
import { useMusic } from '../context/MusicContext';
import styles from './MusicGrid.module.css';

interface MusicGridProps {
  title: string;
  data: Track[];
  isCircular?: boolean;
  onPlay?: (track: Track, queue: Track[]) => void;
  currentTrackId?: string;
  isPlaying?: boolean;
  historyLink?: string;
}

const MusicGrid: React.FC<MusicGridProps> = ({ title, data, isCircular, onPlay, currentTrackId, isPlaying, historyLink }) => {
  const { addToQueue } = useMusic();
  const navigate = useNavigate();

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.accentBox} />
          <h2 className={styles.title}>{title}</h2>
        </div>
        {historyLink && (
          <Link to={historyLink} className={styles.historyLink}>
            VIEW FULL HISTORY
          </Link>
        )}
      </div>

      <div className={styles.grid}>
        {data.map((item, index) => {
          const isActive = currentTrackId === item.id;

          const handleCardClick = () => {
            if (isCircular) {
              navigate(`/music/artist/${item.id}`);
            } else {
              onPlay?.(item, data);
            }
          };

          return (
            <motion.div
              key={`${item.id}-${index}`}
              className={`${styles.card} ${isActive ? styles.activeCard : ''} ${isCircular ? styles.circularCard : ''}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.03 }}
              onClick={isCircular ? handleCardClick : undefined}
            >
              <div
                className={`${styles.artworkWrapper} ${isCircular ? styles.circularArtwork : ''}`}
                onClick={!isCircular ? handleCardClick : undefined}
              >
                <SmartImage src={item.poster} alt={item.name} className={styles.artworkImg} />

                {!isCircular && (
                  <>
                    <div className={styles.overlay}>
                      {isActive && isPlaying ? (
                        <Pause fill="white" size={40} className={styles.playIcon} />
                      ) : (
                        <Play fill="white" size={40} className={styles.playIcon} style={{ marginLeft: '4px' }} />
                      )}
                    </div>

                    <div className={styles.actions}>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          addToQueue(item);
                        }}
                        className={styles.actionBtn}
                        title="Add to Queue"
                      >
                        <Plus size={18} />
                      </motion.button>
                    </div>
                  </>
                )}
              </div>

              <div className={`${styles.info} ${isCircular ? styles.circularInfo : ''}`}>
                <h3 className={styles.cardTitle}>{item.name}</h3>
                {!isCircular && <p className={styles.cardArtist}>{item.artist}</p>}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default MusicGrid;
