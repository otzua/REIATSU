import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, ArrowLeft, Play } from 'lucide-react';
import SmartImage from '../components/SmartImage';
import HalftoneWave from '../components/HalftoneWave';
import type { BeyondVideo } from '../services/beyondApi';
import cwStyles from '../components/ContinueWatching.module.css';
import pageStyles from './Home.module.css';

const BeyondHistory = () => {
  const [history, setHistory] = useState<BeyondVideo[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const saved = localStorage.getItem('beyond_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  const handleVideoSelect = (video: BeyondVideo) => {
    // Save to history to make it first again
    const filtered = history.filter((v) => v.id !== video.id);
    const updated = [video, ...filtered].slice(0, 100);
    localStorage.setItem('beyond_history', JSON.stringify(updated));
    navigate(`/beyond/watch/${video.id}`);
  };

  return (
    <div className={pageStyles.homeContainer}>
      <HalftoneWave />
      <div className={pageStyles.content} style={{ paddingTop: '2rem' }}>
        <section className={cwStyles.section}>
          <div className={cwStyles.header} style={{ marginBottom: '2rem' }}>
            <Link to="/beyond" style={{ color: 'var(--color-cream)', marginRight: '1rem', display: 'flex', alignItems: 'center' }}>
              <ArrowLeft size={24} />
            </Link>
            <div className={cwStyles.accentBox}></div>
            <h2 className={cwStyles.title}>BEYOND HISTORY</h2>
          </div>

          {history.length === 0 ? (
            <div style={{ color: 'rgba(220, 201, 169, 0.6)', fontSize: '1.2rem', marginTop: '2rem' }}>
              Your beyond history is empty.
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '1.5rem',
              marginTop: '1.5rem' 
            }}>
              {history.map((item, index) => {
                return (
                  <motion.div 
                    key={item.id + index}
                    className={cwStyles.card}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (index % 10) * 0.05 }}
                    whileHover={{ y: -5, scale: 1.01, transition: { duration: 0.15, ease: "easeOut" } }}
                    style={{ width: '100%', maxWidth: 'none', cursor: 'pointer' }}
                    onClick={() => handleVideoSelect(item)}
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
                      <div className={cwStyles.info} style={{ flex: 1, minWidth: 0 }}>
                        <p className={cwStyles.epInfo}>
                          <Flame size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                          BEYOND
                        </p>
                        <h3 className={cwStyles.animeName} title={item.title} style={{ maxWidth: '100%' }}>{item.title}</h3>
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
