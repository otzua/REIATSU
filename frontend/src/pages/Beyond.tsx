import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { History, Flame, RefreshCw } from 'lucide-react';
import { beyondApi } from '../services/beyondApi';
import type { BeyondVideo } from '../services/beyondApi';
import HalftoneWave from '../components/HalftoneWave';
import BeyondHero from '../components/BeyondHero';
import BeyondGrid from '../components/BeyondGrid';
import SmartImage from '../components/SmartImage';
import pageStyles from './Home.module.css';
import styles from './Beyond.module.css';

const pureRandomSort = <T,>(array: T[]): T[] => {
  let seed = 42;
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
  
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
};

const getPadSlice = (arr: BeyondVideo[], start: number, length: number) => {
  if (arr.length === 0) return [];
  const result: BeyondVideo[] = [];
  let currentIndex = start % arr.length;
  for (let i = 0; i < length; i++) {
    result.push(arr[currentIndex]);
    currentIndex = (currentIndex + 1) % arr.length;
  }
  return result;
};

const Beyond = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<BeyondVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [server, setServer] = useState<'hanime1' | 'watchhentai'>(() => {
    const saved = localStorage.getItem('beyond_provider');
    if (saved === 'hanime1' || saved === 'watchhentai') {
      return saved;
    }
    localStorage.setItem('beyond_provider', 'watchhentai');
    return 'watchhentai';
  });
  const [continueWatching, setContinueWatching] = useState<BeyondVideo[]>(() => {
    const saved = localStorage.getItem('beyond_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        console.error('Failed to parse history');
      }
    }
    return [];
  });

  const fetchFeed = useCallback((targetServer: 'hanime1' | 'watchhentai' = server) => {
    setLoading(true);
    setError(null);
    beyondApi.getFeed(targetServer)
      .then((data) => {
        setVideos(data);
      })
      .catch((err) => {
        console.error('Failed to load feed:', err);
        setError(`Connection to the Beyond sector failed: ${err.message || String(err)}. Please ensure the portal is active.`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [server]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const timer = setTimeout(() => {
      fetchFeed();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchFeed]);

  const handleVideoSelect = (video: BeyondVideo) => {
    setContinueWatching((prev) => {
      const filtered = prev.filter((v) => v.id !== video.id);
      const updated = [video, ...filtered].slice(0, 10);
      localStorage.setItem('beyond_history', JSON.stringify(updated));
      return updated;
    });
    navigate(`/beyond/watch/${video.id}`);
  };

  const heroVideos = useMemo(() => getPadSlice(videos, 0, 6), [videos]);
  const hotVideos = useMemo(() => getPadSlice(videos, 6, 10), [videos]);
  const newVideos = useMemo(() => getPadSlice(videos, 16, 10), [videos]);
  const famousVideos = useMemo(() => getPadSlice(pureRandomSort(videos), 0, 10), [videos]);

  return (
    <div className={pageStyles.homeContainer}>
      <HalftoneWave />

      <div className={pageStyles.content}>

        {/* Provider toggle + refresh */}
        <div className={styles.portalControls}>
          <div className={styles.providerRow}>
            <span className={styles.providerLabel}>PROVIDER:</span>
            <div className={styles.serverToggle}>
              <button
                className={`${styles.serverBtn} ${server === 'hanime1' ? styles.active : ''}`}
                onClick={() => { setServer('hanime1'); localStorage.setItem('beyond_provider', 'hanime1'); fetchFeed('hanime1'); }}
              >
                HANIME1
              </button>
              <button
                className={`${styles.serverBtn} ${server === 'watchhentai' ? styles.active : ''}`}
                onClick={() => { setServer('watchhentai'); localStorage.setItem('beyond_provider', 'watchhentai'); fetchFeed('watchhentai'); }}
              >
                WATCHHENTAI
              </button>
            </div>
          </div>
          <button onClick={() => fetchFeed(server)} className={styles.refreshBtn} title="Refresh Portal">
            <RefreshCw size={16} className={loading ? styles.spinning : ''} />
          </button>
        </div>

        {/* Error state */}
        {error && (
          <div className={styles.errorContainer}>
            <div className={styles.errorContent}>
              <p>{error}</p>
              <button onClick={() => fetchFeed(server)} className={styles.retryBtn}>
                <RefreshCw size={16} /> RECONNECT
              </button>
            </div>
          </div>
        )}

        {/* Loading skeletons */}
        {loading && !error && (
          <div className={styles.sectionsContainer}>
            <div className={`${styles.skeleton} ${styles.heroSkeleton}`} />
            <div className={styles.skeletonGrid}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className={`${styles.skeleton} ${styles.cardSkeleton}`} />
              ))}
            </div>
          </div>
        )}

        {/* Main content — only render once loaded with data */}
        {!loading && !error && videos.length > 0 && (
          <>
            <BeyondHero
              videos={heroVideos}
              onVideoSelect={handleVideoSelect}
              onRandom={() => {
                if (videos.length === 0) return;
                const random = videos[Math.floor(Math.random() * videos.length)];
                handleVideoSelect(random);
              }}
            />

            {/* Continue Watching */}
            {continueWatching.length > 0 && (
              <section className={styles.miniSection}>
                <div className={styles.miniHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <History size={20} className={styles.historyIcon} />
                    <span>CONTINUE WATCHING</span>
                  </div>
                  <Link to="/beyond/history" className={styles.historyLink}>
                    VIEW FULL HISTORY
                  </Link>
                </div>
                <div className={styles.miniGrid}>
                  {continueWatching.map((video) => (
                    <div key={video.id} className={styles.miniCard} onClick={() => handleVideoSelect(video)}>
                      <div className={styles.miniThumbWrapper}>
                        <SmartImage src={video.thumbnail} alt={video.title} className={styles.miniThumb} />
                        <div className={styles.miniPlayOverlay}><Flame size={24} /></div>
                      </div>
                      <div className={styles.miniInfo}>
                        <div className={styles.miniTitle}>{video.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <BeyondGrid videos={hotVideos} onVideoSelect={handleVideoSelect} title="HOT TRENDS" />
            <BeyondGrid videos={newVideos} onVideoSelect={handleVideoSelect} title="NEW RELEASES" />
            <BeyondGrid videos={famousVideos} onVideoSelect={handleVideoSelect} title="ALL TIME FAMOUS" />
          </>
        )}

        {/* Empty state — only if loaded successfully but nothing came back */}
        {!loading && !error && videos.length === 0 && (
          <div className={styles.emptyContainer}>
            PORTAL IS EMPTY. AWAITING FEED...
          </div>
        )}

      </div>
    </div>
  );
};

export default Beyond;
