import React from 'react';
import { motion } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import SmartImage from './SmartImage';
import type { Track } from '../services/musicApi';
import styles from './AiringAnime.module.css'; // Reusing established grid/card patterns

const PLACEHOLDER_ALBUMS: Track[] = [
  { id: 'a1', name: 'Echoes of the Void', artist: 'Solstice', album: 'Echoes', poster: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&auto=format&fit=crop', url: '' },
  { id: 'a2', name: 'Binary Sunset', artist: 'Data Drift', album: 'Binary', poster: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=400&auto=format&fit=crop', url: '' },
  { id: 'a3', name: 'Glitch in Reality', artist: 'System Fail', album: 'Glitch', poster: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=400&auto=format&fit=crop', url: '' },
  { id: 'a4', name: 'Neural Network', artist: 'AI Core', album: 'Neural', poster: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop', url: '' },
  { id: 'a5', name: 'Static Dreams', artist: 'White Noise', album: 'Static', poster: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=400&auto=format&fit=crop', url: '' },
  { id: 'a6', name: 'Cyberpunk Soul', artist: 'V-Tech', album: 'Cyber', poster: 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?q=80&w=400&auto=format&fit=crop', url: '' },
];

const PLACEHOLDER_ARTISTS: Track[] = [
  { id: 'r1', name: 'Aurora', artist: 'Aurora', album: '', poster: 'https://images.unsplash.com/photo-1516726817505-f5ed17467124?q=80&w=400&auto=format&fit=crop', url: '' },
  { id: 'r2', name: 'Kaelo', artist: 'Kaelo', album: '', poster: 'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?q=80&w=400&auto=format&fit=crop', url: '' },
  { id: 'r3', name: 'Lyra', artist: 'Lyra', album: '', poster: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=400&auto=format&fit=crop', url: '' },
  { id: 'r4', name: 'Zane', artist: 'Zane', album: '', poster: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?q=80&w=400&auto=format&fit=crop', url: '' },
  { id: 'r5', name: 'Mika', artist: 'Mika', album: '', poster: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop', url: '' },
  { id: 'r6', name: 'Jax', artist: 'Jax', album: '', poster: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?q=80&w=400&auto=format&fit=crop', url: '' },
];

interface MusicGridProps {
  title: string;
  category: string;
  isCircular?: boolean;
  onPlay?: (track: Track, queue: Track[]) => void;
  currentTrackId?: string;
  isPlaying?: boolean;
}

const MusicGrid: React.FC<MusicGridProps> = ({ title, category, isCircular, onPlay, currentTrackId, isPlaying }) => {
  const data = category === 'artists' ? PLACEHOLDER_ARTISTS : PLACEHOLDER_ALBUMS;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.accentBox} />
        <h2 className={styles.title}>{title}</h2>
      </div>

      <div className={styles.grid}>
        {data.map((item, index) => {
          const isActive = currentTrackId === item.id;
          return (
            <motion.div
              key={item.id}
              className={styles.animeCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -8, scale: 1.03 }}
              onClick={() => onPlay?.(item, data)}
            >
              <div className={styles.cardLink} style={{ cursor: 'pointer' }}>
                <div
                  className={styles.posterPlaceholder}
                  style={{
                    aspectRatio: '1/1',
                    borderRadius: isCircular ? '50%' : '4px',
                    overflow: 'hidden',
                    border: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <SmartImage src={item.poster} aria-hidden="true" className={styles.posterGlow} />
                  <SmartImage src={item.poster} alt={item.name} className={styles.posterImg} />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.45)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: isActive ? 1 : 0,
                      transition: 'opacity 0.2s',
                    }}
                    className="hoverOverlay"
                  >
                    {isActive && isPlaying ? <Pause fill="white" size={32} /> : <Play fill="white" size={32} />}
                  </div>
                </div>
                <div className={styles.info} style={{ textAlign: isCircular ? 'center' : 'left' }}>
                  <h3
                    className={styles.animeTitle}
                    style={{ color: isActive ? 'var(--accent)' : undefined, transition: 'color 0.2s' }}
                  >
                    {item.name}
                  </h3>
                  {item.artist && item.artist !== item.name && (
                    <p style={{ color: 'var(--color-cream)', opacity: 0.6, fontSize: '0.8rem' }}>{item.artist}</p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      <style>{`
        .${styles.animeCard}:hover .hoverOverlay {
          opacity: 1 !important;
        }
      `}</style>
    </section>
  );
};

export default MusicGrid;
