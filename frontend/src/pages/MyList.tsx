import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bookmark, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SmartImage from '../components/SmartImage';
import HalftoneWave from '../components/HalftoneWave';
import styles from './MyList.module.css';

export interface MyListItem {
  id: string;
  title: string;
  type: 'anime' | 'cinema';
  poster: string;
  url: string;
  addedAt: number;
}

const MyList = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isCinemaList = searchParams.get('type') === 'cinema';

  const [list, setList] = useState<MyListItem[]>(() => {
    const saved = localStorage.getItem('reiatsu_mylist');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as MyListItem[];
        const seenByUrl = new Map<string, MyListItem>();
        for (const item of parsed) {
          const key = item.url;
          const existing = seenByUrl.get(key);
          if (!existing || item.addedAt > existing.addedAt) {
            const urlId = item.url.split('/').filter(Boolean).pop()?.split('?')[0] ?? item.id;
            seenByUrl.set(key, { ...item, id: urlId });
          }
        }
        const deduped = Array.from(seenByUrl.values()).sort((a, b) => b.addedAt - a.addedAt);
        localStorage.setItem('reiatsu_mylist', JSON.stringify(deduped));
        return deduped;
      } catch (e) {
        console.error('Failed to parse My List', e);
      }
    }
    return [];
  });

  const removeFromList = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const newList = list.filter(item => item.id !== id);
    setList(newList);
    localStorage.setItem('reiatsu_mylist', JSON.stringify(newList));
  };

  const filteredList = useMemo(() => {
    return list.filter(item => isCinemaList ? item.type === 'cinema' : item.type === 'anime');
  }, [list, isCinemaList]);

  return (
    <div className={styles.container}>
      <HalftoneWave />
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.accentLine} />
          <h1 className={styles.title}>{isCinemaList ? 'MY MOVIES & TV' : 'MY ANIME'}</h1>
        </div>

        {filteredList.length === 0 ? (
          <div className={styles.emptyState}>
            <Bookmark size={48} className={styles.emptyIcon} />
            <div className={styles.emptyText}>Your list is empty</div>
            <p style={{ marginTop: '1rem', opacity: 0.7 }}>Save {isCinemaList ? 'movies and TV shows' : 'anime'} to watch them later.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            <AnimatePresence>
              {filteredList.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.15, ease: 'easeOut' } }}
                  whileTap={{ scale: 0.98 }}
                  className={styles.card}
                >
                  <Link to={item.url} className={styles.cardLink}>
                    <div className={styles.posterWrapper}>
                      <SmartImage src={item.poster} alt={item.title} className={styles.poster} />
                      <div className={styles.info}>
                        <h3 className={styles.cardTitle}>{item.title}</h3>
                      </div>
                    </div>
                  </Link>
                  <button
                    className={styles.removeBtn}
                    onClick={(e) => removeFromList(item.id, e)}
                    title="Remove from List"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyList;
