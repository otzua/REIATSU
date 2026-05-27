import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import SmartImage from './SmartImage';
import type { Album } from '../services/musicApi';
import styles from './MusicGrid.module.css'; // Leverage existing grid styles for perfect consistency!

interface AlbumGridProps {
  title: string;
  data: Album[];
}

const AlbumGrid: React.FC<AlbumGridProps> = ({ title, data }) => {
  const navigate = useNavigate();

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.accentBox} />
        <h2 className={styles.title}>{title}</h2>
      </div>

      <div className={styles.grid}>
        {data.map((item, index) => {
          return (
            <motion.div
              key={`${item.id}-${index}`}
              className={styles.card}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.03 }}
              onClick={() => navigate(`/music/album/${item.id}`)}
            >
              <div 
                className={styles.artworkWrapper} 
                style={{ borderRadius: '12px' }}
              >
                <SmartImage src={item.poster} alt={item.name} className={styles.artworkImg} />
                
                <div className={styles.overlay}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Eye color="white" size={36} className={styles.playIcon} />
                    <span style={{ color: '#fff', fontSize: '10px', fontWeight: 'bold', letterSpacing: '0.05rem', textTransform: 'uppercase' }}>View Tracks</span>
                  </div>
                </div>

                <div className={styles.actions}>
                  {item.year && (
                    <div style={{ background: 'rgba(0, 0, 0, 0.8)', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(4px)' }}>
                      {item.year}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.info}>
                <h3 className={styles.cardTitle}>{item.name}</h3>
                <p className={styles.cardArtist}>{item.artist}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default AlbumGrid;
