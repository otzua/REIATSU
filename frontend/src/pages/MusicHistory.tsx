import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, Disc } from 'lucide-react';
import SmartImage from '../components/SmartImage';
import HalftoneWave from '../components/HalftoneWave';
import { useMusic } from '../context/MusicContext';
import cwStyles from '../components/ContinueWatching.module.css';
import pageStyles from './Home.module.css';

const MusicHistory = () => {
  const { recentlyPlayed, playTrack, isPlaying, currentTrack } = useMusic();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className={pageStyles.homeContainer}>
      <HalftoneWave />
      <div className={pageStyles.content} style={{ paddingTop: '2rem' }}>
        <section className={cwStyles.section}>
          <div className={cwStyles.header} style={{ marginBottom: '2rem' }}>
            <Link to="/music" style={{ color: 'var(--color-cream)', marginRight: '1rem', display: 'flex', alignItems: 'center' }}>
              <ArrowLeft size={24} />
            </Link>
            <div className={cwStyles.accentBox}></div>
            <h2 className={cwStyles.title}>LISTENING HISTORY</h2>
          </div>

          {recentlyPlayed.length === 0 ? (
            <div style={{ color: 'rgba(220, 201, 169, 0.6)', fontSize: '1.2rem', marginTop: '2rem' }}>
              Your music history is empty.
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '1.5rem',
              marginTop: '1.5rem' 
            }}>
              {recentlyPlayed.map((item, index) => {
                const isActive = currentTrack?.id === item.id;
                
                return (
                  <motion.div 
                    key={item.id + index}
                    className={cwStyles.card}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (index % 10) * 0.05 }}
                    whileHover={{ y: -5, scale: 1.01, transition: { duration: 0.15, ease: "easeOut" } }}
                    style={{ 
                      width: '100%', 
                      maxWidth: 'none', 
                      cursor: 'pointer',
                      borderColor: isActive ? 'var(--accent)' : 'rgba(220, 201, 169, 0.1)'
                    }}
                    onClick={() => playTrack(item, recentlyPlayed)}
                  >
                    <div className={cwStyles.cardLink}>
                      <div className={cwStyles.posterWrapper}>
                         <SmartImage src={item.poster} className={cwStyles.poster} />
                         <div className={cwStyles.overlay} style={{ opacity: isActive && isPlaying ? 1 : '' }}>
                           <div className={cwStyles.playBtn} style={{ background: isActive && isPlaying ? 'rgba(0,0,0,0.5)' : 'var(--accent)' }}>
                             {isActive && isPlaying ? (
                               <Disc size={24} className="spin" style={{ animation: 'spin 2s linear infinite' }} />
                             ) : (
                               <Play size={24} fill="currentColor" />
                             )}
                           </div>
                         </div>
                      </div>
                      <div className={cwStyles.info} style={{ flex: 1, minWidth: 0 }}>
                        <p className={cwStyles.epInfo}>
                          TRACK
                        </p>
                        <h3 className={cwStyles.animeName} title={item.name} style={{ maxWidth: '100%' }}>{item.name}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', marginTop: '0.1rem' }}>
                          <p className={cwStyles.epTitle} title={item.artist} style={{ maxWidth: '100%' }}>
                            {item.artist}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spin { animation: spin 2s linear infinite; }
      `}</style>
    </div>
  );
};

export default MusicHistory;
