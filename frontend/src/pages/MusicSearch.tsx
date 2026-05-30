import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Music2, Play, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { musicApi, type Track } from '../services/musicApi';
import { useMusic } from '../context/MusicContext';
import SmartImage from '../components/SmartImage';
import HalftoneWave from '../components/HalftoneWave';
import styles from './MusicSearch.module.css';

const MusicSearch = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { playTrack } = useMusic();

  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const [prevQuery, setPrevQuery] = useState(query);
  if (prevQuery !== query) {
    setPrevQuery(query);
    if (!query.trim()) setResults([]);
  }

  useEffect(() => {
    if (!query.trim()) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    
    let isMounted = true;

    const run = async () => {
      setLoading(true);
      try {
        const data = await musicApi.search(query, 40);
        if (isMounted) setResults(data);
      } catch {
        if (isMounted) setResults([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    run();

    return () => {
      isMounted = false;
      abortRef.current?.abort();
    };
  }, [query]);

  const formatDuration = (ms?: number) => {
    if (!ms) return '';
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className={styles.page}>
      <HalftoneWave />
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <Music2 size={32} className={styles.titleIcon} />
          <h1>Music Search</h1>
        </div>
        <p className={styles.queryDisplay}>
          Results for "<span>{query}</span>"
        </p>
      </header>

      <main className={styles.main}>
        {loading ? (
          <div className={styles.loader}>
            <Loader2 size={40} className={styles.spin} />
            <p>Searching tracks...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {results.length === 0 ? (
              <motion.div
                key="no-results"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className={styles.noResults}
              >
                <Search size={64} opacity={0.1} />
                <h2>No tracks found</h2>
                <p>Try a different song name or artist.</p>
                <Link to="/music" className={styles.backHome}>Back to Music</Link>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={styles.list}
              >
                {results.map((track, index) => (
                  <motion.div
                    key={track.id + index}
                    variants={itemVariants}
                    className={styles.row}
                    onClick={() => playTrack(track, results)}
                  >
                    <span className={styles.index}>{index + 1}</span>
                    <div className={styles.thumb}>
                      <SmartImage src={track.poster} alt={track.name} className={styles.thumbImg} />
                      <div className={styles.thumbOverlay}>
                        <Play size={18} fill="currentColor" />
                      </div>
                    </div>
                    <div className={styles.info}>
                      <span className={styles.trackName}>{track.name}</span>
                      <span className={styles.artist}>{track.artist}</span>
                    </div>
                    <span className={styles.album}>{track.album}</span>
                    <span className={styles.duration}>{formatDuration(track.duration_ms)}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
};

export default MusicSearch;
