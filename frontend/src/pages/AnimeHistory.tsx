import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, Tv, Clock, ArrowLeft } from 'lucide-react';
import SmartImage from '../components/SmartImage';
import HalftoneWave from '../components/HalftoneWave';
import cwStyles from '../components/ContinueWatching.module.css';
import pageStyles from './Home.module.css';

interface AnimeCWData {
  animeId: string;
  animeName: string;
  animePoster: string;
  episodeNumber: number;
  episodeTitle: string;
  provider?: string;
  timestamp: number;
}

const decodeEntities = (text: string) => {
  if (!text) return '';
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

const AnimeHistory = () => {
  const [history, setHistory] = useState<AnimeCWData[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const data = localStorage.getItem('reiatsu_continue_watching');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        } else if (parsed && typeof parsed === 'object' && parsed.animeId) {
          const legacyItem: AnimeCWData = {
            animeId: parsed.animeId,
            animeName: parsed.animeName,
            animePoster: parsed.animePoster,
            episodeNumber: parsed.episodeNumber,
            episodeTitle: parsed.episodeTitle,
            timestamp: parsed.timestamp || Date.now()
          };
          setHistory([legacyItem]);
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  return (
    <div className={pageStyles.homeContainer}>
      <HalftoneWave />
      <div className={pageStyles.content} style={{ paddingTop: '2rem' }}>
        <section className={cwStyles.section}>
          <div className={cwStyles.header} style={{ marginBottom: '3rem', justifyContent: 'flex-start', gap: '2rem' }}>
            <Link to="/" className={cwStyles.backBtn}>
              <ArrowLeft size={24} />
            </Link>
            <div className={cwStyles.titleGroup}>
              <div className={cwStyles.accentBox}></div>
              <h2 className={cwStyles.title}>WATCH HISTORY</h2>
            </div>
          </div>

          {history.length === 0 ? (
            <div style={{ color: 'rgba(220, 201, 169, 0.6)', fontSize: '1.2rem', marginTop: '2rem' }}>
              Your anime history is empty.
            </div>
          ) : (
            <div className={cwStyles.grid}>
              {history.map((item, index) => {
                const watchLink = `/${item.provider || 'anime'}/watch/${item.animeId}?ep=${item.episodeNumber}`;

                return (
                  <motion.div 
                    key={item.animeId + (item.timestamp || index)}
                    className={cwStyles.card}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: (index % 10) * 0.05 }}
                    whileHover={{ y: -5, scale: 1.01, transition: { duration: 0.15, ease: "easeOut" } }}
                  >
                    <Link to={watchLink} className={cwStyles.cardLink}>
                      <div className={cwStyles.posterWrapper}>
                         <SmartImage src={item.animePoster} className={cwStyles.poster} />
                         <div className={cwStyles.overlay}>
                           <div className={cwStyles.playBtn}>
                             <Play size={24} fill="currentColor" />
                           </div>
                         </div>
                      </div>
                      <div className={cwStyles.info} style={{ flex: 1, minWidth: 0 }}>
                        <p className={cwStyles.epInfo}>
                          <Tv size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                          EPISODE {item.episodeNumber}
                        </p>
                        <h3 className={cwStyles.animeName} title={decodeEntities(item.animeName)} style={{ maxWidth: '100%' }}>
                          {decodeEntities(item.animeName)}
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', marginTop: '0.1rem' }}>
                          <p className={cwStyles.epTitle} title={decodeEntities(item.episodeTitle)} style={{ maxWidth: '100%' }}>
                            {decodeEntities(item.episodeTitle)}
                          </p>
                          {item.timestamp && (
                            <span style={{ fontSize: '0.65rem', color: 'rgba(220, 201, 169, 0.3)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.2rem' }}>
                              <Clock size={10} /> {new Date(item.timestamp).toLocaleDateString()}
                            </span>
                          )}
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

export default AnimeHistory;
