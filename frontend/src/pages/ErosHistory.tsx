import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Flame, ArrowLeft, Trash2, X } from 'lucide-react';
import SmartImage from '../components/SmartImage';
import HalftoneWave from '../components/HalftoneWave';
import type { ErosVideo } from '../services/epornerApi';
import pageStyles from './Home.module.css';
import styles from './BeyondHistory.module.css';

const ErosHistory = () => {
  const [history, setHistory] = useState<ErosVideo[]>(() => {
    try {
      const saved = localStorage.getItem('eros_history');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, []);

  const handleVideoSelect = (video: ErosVideo) => {
    const filtered = history.filter(v => v.id !== video.id);
    const updated = [video, ...filtered].slice(0, 100);
    localStorage.setItem('eros_history', JSON.stringify(updated));
    setHistory(updated);
    navigate(`/eros/watch/${video.id}`);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('eros_history');
  };

  const removeItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(v => v.id !== id);
    setHistory(updated);
    localStorage.setItem('eros_history', JSON.stringify(updated));
  };

  return (
    <div className={pageStyles.homeContainer}>
      <HalftoneWave />
      <div className={pageStyles.content} style={{ padding: '2rem var(--space-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => navigate('/eros')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: '1px solid rgba(220,201,169,0.1)', color: 'var(--color-cream)', padding: '0.5rem 1rem', borderRadius: '10px', cursor: 'pointer', fontFamily: 'var(--font-heading)', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.1em' }}
            >
              <ArrowLeft size={16} /> BACK TO EROS
            </button>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 900, letterSpacing: '0.1em', color: 'var(--color-cream)' }}>
              WATCH HISTORY
            </h1>
          </div>
          {history.length > 0 && (
            <button
              onClick={clearHistory}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(184,58,45,0.1)', border: '1px solid rgba(184,58,45,0.2)', color: 'var(--accent)', padding: '0.5rem 1rem', borderRadius: '10px', cursor: 'pointer', fontFamily: 'var(--font-heading)', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.1em' }}
            >
              <Trash2 size={14} /> CLEAR ALL
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className={styles.empty}>
            <Flame size={48} style={{ color: 'rgba(220,201,169,0.1)', marginBottom: '1rem' }} />
            <p>NO WATCH HISTORY YET.</p>
          </div>
        ) : (
          <div className={styles.historyGrid}>
            {history.map((video, index) => (
              <motion.div
                key={video.id}
                className={styles.historyCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => handleVideoSelect(video)}
              >
                <button className={styles.removeBtn} onClick={e => removeItem(video.id, e)} title="Remove">
                  <X size={14} />
                </button>
                <div className={styles.historyThumb}>
                  <SmartImage src={video.thumbnail} alt={video.title} className={styles.historyImg} />
                  <div className={styles.historyOverlay}><Flame size={24} /></div>
                </div>
                <div className={styles.historyInfo}>
                  <h3 className={styles.historyTitle}>{video.title}</h3>
                  <div className={styles.historyMeta}>
                    {video.rate && <span>★ {video.rate}%</span>}
                    {video.length && <span>{video.length}</span>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ErosHistory;
