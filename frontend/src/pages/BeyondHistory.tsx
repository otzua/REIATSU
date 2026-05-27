import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, ArrowLeft, Play } from 'lucide-react';
import SmartImage from '../components/SmartImage';
import HalftoneWave from '../components/HalftoneWave';
import type { BeyondVideo } from '../services/beyondApi';
import cwStyles from '../components/ContinueWatching.module.css';
import pageStyles from './Home.module.css';
import styles from './BeyondHistory.module.css';

const BeyondHistory = () => {
  const [history] = useState<BeyondVideo[]>(() => {
    const saved = localStorage.getItem('beyond_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        console.error('Failed to parse history');
      }
    }
    return [];
  });

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleVideoSelect = (video: BeyondVideo) => {
    const filtered = history.filter((v) => v.id !== video.id);
    const updated = [video, ...filtered].slice(0, 100);
    localStorage.setItem('beyond_history', JSON.stringify(updated));
    navigate(`/beyond/watch/${video.id}`);
  };

  return (
    <div className={pageStyles.homeContainer}>
      <HalftoneWave />
      <div className={`${pageStyles.content} ${styles.contentPadding}`}>
        <section className={cwStyles.section}>
          <div className={cwStyles.header}>
            <div className={cwStyles.titleGroup}>
              <Link to="/beyond" className={cwStyles.backBtn}>
                <ArrowLeft size={24} />
              </Link>
              <div className={cwStyles.accentBox}></div>
              <h2 className={cwStyles.title}>BEYOND HISTORY</h2>
            </div>
          </div>

          {history.length === 0 ? (
            <div className={styles.emptyMessage}>
              Your beyond history is empty.
            </div>
          ) : (
            <div className={cwStyles.grid}>
              {history.map((item, index) => {
                return (
                  <motion.div
                    key={item.id + index}
                    className={cwStyles.card}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (index % 10) * 0.05 }}
                    whileHover={{ y: -5, scale: 1.01, transition: { duration: 0.15, ease: 'easeOut' } }}
                    onClick={() => handleVideoSelect(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={cwStyles.cardLink}>
                      <div className={cwStyles.posterWrapper}>
                        <SmartImage src={item.thumbnail} className={cwStyles.poster} />
                        <div className={cwStyles.overlay}>
                          <div className={cwStyles.playBtn}>
                            <Play size={24} fill="currentColor" />
                          </div>
                        </div>
                      </div>
                      <div className={cwStyles.info}>
                        <p className={cwStyles.epInfo}>
                          <Flame size={12} className={styles.flameIcon} />
                          BEYOND
                        </p>
                        <h3 className={cwStyles.animeName} title={item.title}>{item.title}</h3>
                      </div>
                    </div>
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

export default BeyondHistory;
