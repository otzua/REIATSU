import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, Film, Tv, Clock, ArrowLeft, Trash2, X } from 'lucide-react';
import SmartImage from '../components/SmartImage';
import HalftoneWave from '../components/HalftoneWave';
import cwStyles from '../components/ContinueWatching.module.css';
import pageStyles from './Home.module.css';

interface CinemaCWData {
  id: string;
  title: string;
  poster: string;
  mediaType: 'movie' | 'tv';
  season?: number;
  episode?: number;
  timestamp: number;
}

const CinemaHistory = () => {
  const [history, setHistory] = useState<CinemaCWData[]>(() => {
    const data = localStorage.getItem('reiatsu_cinema_continue_watching');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        // ignore
      }
    }
    return [];
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('reiatsu_cinema_continue_watching');
  };

  const removeFromHistory = (e: React.MouseEvent, id: string, mediaType: string) => {
    e.preventDefault();
    e.stopPropagation();
    setHistory(prev => {
      const updated = prev.filter(t => !(t.id === id && t.mediaType === mediaType));
      localStorage.setItem('reiatsu_cinema_continue_watching', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className={pageStyles.homeContainer}>
      <HalftoneWave />
      <div className={pageStyles.content} style={{ paddingTop: '2rem' }}>
        <section className={cwStyles.section}>
          <div className={cwStyles.header} style={{ marginBottom: '3rem', justifyContent: 'flex-start', gap: '2rem' }}>
            <Link to="/cinema" className={cwStyles.backBtn}>
              <ArrowLeft size={24} />
            </Link>
            <div className={cwStyles.titleGroup}>
              <div className={cwStyles.accentBox}></div>
              <h2 className={cwStyles.title} style={{ flex: 1 }}>CINEMA HISTORY</h2>
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
            <div style={{ color: 'rgba(220, 201, 169, 0.6)', fontSize: '1.2rem', marginTop: '2rem' }}>
              Your cinema history is empty.
            </div>
          ) : (
            <div className={cwStyles.cwGrid}>
              {history.map((item, index) => {
                const watchLink = item.mediaType === 'tv' 
                  ? `/cinema/watch/${item.id}?type=tv&season=${item.season}&episode=${item.episode}`
                  : `/cinema/watch/${item.id}?type=movie`;

                return (
                  <motion.div 
                    key={item.id + item.timestamp}
                    className={cwStyles.card}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (index % 10) * 0.05 }}
                    whileHover={{ y: -5, scale: 1.01, transition: { duration: 0.15, ease: "easeOut" } }}
                    style={{ position: 'relative' }}
                  >
                    <button
                      onClick={(e) => removeFromHistory(e, item.id, item.mediaType)}
                      className={cwStyles.deleteBtn}
                      title="Remove from history"
                    >
                      <X size={14} />
                    </button>
                    <Link to={watchLink} className={cwStyles.cardLink}>
                      <div className={cwStyles.posterWrapper}>
                         <SmartImage src={item.poster} className={cwStyles.poster} />
                         <div className={cwStyles.overlay}>
                           <div className={cwStyles.playBtn}>
                             <Play size={24} fill="currentColor" />
                           </div>
                         </div>
                      </div>
                      <div className={cwStyles.info} style={{ flex: 1, minWidth: 0 }}>
                        <p className={cwStyles.epInfo}>
                          {item.mediaType === 'tv' ? <Tv size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> : <Film size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />}
                          {item.mediaType === 'tv' ? `S${item.season} E${item.episode}` : 'MOVIE'}
                        </p>
                        <h3 className={cwStyles.animeName} title={item.title} style={{ maxWidth: '100%' }}>{item.title}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                          <p className={cwStyles.epTitle}>{item.mediaType === 'movie' ? 'Cinema Movie' : 'TV Series'}</p>
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
          )}
        </section>
      </div>
    </div>
  );
};

export default CinemaHistory;
