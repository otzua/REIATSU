import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';
import SmartImage from './SmartImage';
import type { Album } from '../services/musicApi';
import gridStyles from './MusicGrid.module.css';
import styles from './AlbumGrid.module.css';

interface AlbumGridProps {
  title: string;
  data: Album[];
}

const AlbumGrid: React.FC<AlbumGridProps> = ({ title, data }) => {
  const navigate = useNavigate();

  return (
    <section className={gridStyles.section}>
      <div className={gridStyles.header}>
        <div className={gridStyles.headerLeft}>
          <div className={gridStyles.accentBox} />
          <h2 className={gridStyles.title}>{title}</h2>
        </div>
      </div>

      <div className={gridStyles.grid}>
        {data.map((item, index) => {
          return (
            <motion.div
              key={`${item.id}-${index}`}
              className={`${gridStyles.card} ${gridStyles.circularCard}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.03 }}
              onClick={() => navigate(`/music/album/${item.id}`)}
            >
              <div className={gridStyles.artworkWrapper}>
                <SmartImage src={item.poster} alt={item.name} className={gridStyles.artworkImg} />

                <div className={gridStyles.overlay}>
                  <div className={styles.overlayContent}>
                    <Eye color="white" size={36} className={gridStyles.playIcon} />
                    <span className={styles.viewLabel}>View Tracks</span>
                  </div>
                </div>

                {item.year && (
                  <div className={styles.yearBadge}>
                    {item.year}
                  </div>
                )}
              </div>

              <div className={gridStyles.info}>
                <h3 className={gridStyles.cardTitle}>{item.name}</h3>
                <p className={gridStyles.cardArtist}>{item.artist}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default AlbumGrid;
