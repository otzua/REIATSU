import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import SmartImage from './SmartImage';
import styles from './AiringAnime.module.css'; // Reusing styles for consistency

interface ToonGridProps {
  title: string;
  items: any[];
  loading: boolean;
  isEpisodes?: boolean;
}

const ToonGrid = ({ title, items, loading, isEpisodes }: ToonGridProps) => {
  if (!loading && (!items || items.length === 0)) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.accentBox} style={{ background: 'linear-gradient(to bottom, #ff725e, #b83a2d)' }}></div>
        <h2 className={styles.title}>{title}</h2>
      </div>

      <div className={styles.grid}>
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`${styles.animeCard} ${styles.skeleton}`} style={{ height: '300px' }} />
            ))
          : items.map((item, index) => (
            <motion.div
              key={`${item.url}-${index}`}
              className={styles.animeCard}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.15, ease: "easeOut" } }}
            >
              <div className={styles.cardLink}>
                <div className={styles.posterPlaceholder}>
                  {isEpisodes && (
                    <div className={styles.airingBadge} style={{ background: 'var(--accent)' }}>
                      {item.episodeNumber?.full || 'EP'}
                    </div>
                  )}
                  {item.image && (
                    <>
                      <SmartImage src={item.image} aria-hidden="true" className={styles.posterGlow} draggable={false} />
                      <SmartImage src={item.image} alt={item.title} className={styles.posterImg} draggable={false} />
                    </>
                  )}
                </div>
                <div className={styles.info}>
                  <h3 className={styles.animeTitle} title={item.title}>{item.title}</h3>
                  <div className={styles.episodesMeta}>
                    {isEpisodes ? (
                      <span className={styles.sub}>{item.timeAgo}</span>
                    ) : (
                      <span className={styles.type}>SERIES</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
      </div>
    </section>
  );
};

export default ToonGrid;
