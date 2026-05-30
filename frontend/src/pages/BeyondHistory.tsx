import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, ArrowLeft, Play, Trash2, X } from 'lucide-react';
import SmartImage from '../components/SmartImage';
import HalftoneWave from '../components/HalftoneWave';
import type { BeyondVideo } from '../services/beyondApi';
import cwStyles from '../components/ContinueWatching.module.css';
import pageStyles from './Home.module.css';
import styles from './BeyondHistory.module.css';

const BeyondHistory = () => {
  const [history, setHistory] = useState<BeyondVideo[]>(() => {
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

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('beyond_history');
  };

  const removeFromHistory = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setHistory(prev => {
      const updated = prev.filter(t => t.id !== id);
      localStorage.setItem('beyond_history', JSON.stringify(updated));
      return updated;
    });
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
              <h2 className={cwStyles.title} style={{ flex: 1 }}>BEYOND HISTORY</h2>
              {history.length > 0 && (
                <button 
                  onClick={clearHistory}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(255, 59, 48, 0.1)',
                    color: '#ff3b30',
                    border: '1px solid rgba(255, 59, 48, 0.2)',
                    padding: '0.5rem 1rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-heading)'
                  }}
                >
                  <Trash2 size={16} />
                  CLEAR
                </button>
              )}
            </div>
          </div>

          {history.length === 0 ? (
            <div className={styles.emptyMessage}>
              Your beyond history is empty.
            </div>
          ) : (
            <div className={cwStyles.cwGrid}>
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
                    style={{ cursor: 'pointer', position: 'relative' }}
                  >
                    <button
                      onClick={(e) => removeFromHistory(e, item.id)}
                      className={cwStyles.deleteBtn}
                      title="Remove from history"
                    >
                      <X size={14} />
                    </button>
                    <div className={cwStyles.cardLink}>
                      <div className={`${cwStyles.posterWrapper} ${styles.horizontalPoster}`}>
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
