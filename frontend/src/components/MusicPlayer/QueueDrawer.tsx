import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import SmartImage from '../SmartImage';
import styles from './QueueDrawer.module.css';

const QueueDrawer: React.FC = () => {
  const {
    queue,
    currentTrack,
    isQueueOpen,
    setIsQueueOpen,
    playTrack,
    removeFromQueue,
    clearQueue,
  } = useMusic();

  if (!isQueueOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={styles.drawer}
      >
        <div className={styles.drawerHeader}>
          <h2 className={styles.drawerTitle}>PLAY QUEUE</h2>
          <div className={styles.drawerActions}>
            <button
              onClick={() => clearQueue()}
              className={styles.iconBtn}
              title="Clear Queue"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={() => setIsQueueOpen(false)}
              className={styles.closeBtn}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className={styles.drawerBody}>
          {currentTrack && (
            <div className={styles.nowPlayingSection}>
              <p className={styles.sectionLabel}>NOW PLAYING</p>
              <div className={styles.nowPlayingCard}>
                <div className={styles.trackThumb}>
                  <SmartImage src={currentTrack.poster} alt={currentTrack.name} />
                </div>
                <div className={styles.trackInfo}>
                  <div className={styles.trackName}>{currentTrack.name}</div>
                  <div className={styles.trackArtist}>{currentTrack.artist}</div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.queueSection}>
            <p className={styles.sectionLabel}>NEXT IN QUEUE</p>
            {queue.length <= 1 && queue[0]?.id === currentTrack?.id ? (
              <p className={styles.emptyMessage}>Queue is empty</p>
            ) : (
              <div className={styles.queueList}>
                {queue.filter(t => t.id !== currentTrack?.id).map((track, idx) => (
                  <motion.div
                    key={`${track.id}-${idx}`}
                    layout
                    className={styles.queueItem}
                    onClick={() => playTrack(track)}
                  >
                    <div className={styles.queueThumb}>
                      <SmartImage src={track.poster} alt={track.name} />
                    </div>
                    <div className={styles.trackInfo}>
                      <div className={styles.queueTrackName}>{track.name}</div>
                      <div className={styles.queueTrackArtist}>{track.artist}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromQueue(track.id);
                      }}
                      className={styles.removeBtn}
                      title="Remove from queue"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QueueDrawer;
