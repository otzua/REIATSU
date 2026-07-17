/* eslint-disable react-hooks/set-state-in-effect, react-hooks/purity */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { History, Flame, RefreshCw, Search, X } from 'lucide-react';
import { epornerApi } from '../services/epornerApi';
import type { ErosVideo } from '../services/epornerApi';
import HalftoneWave from '../components/HalftoneWave';
import BeyondHero from '../components/BeyondHero';
import BeyondGrid from '../components/BeyondGrid';
import SmartImage from '../components/SmartImage';
import pageStyles from './Home.module.css';
import styles from './Beyond.module.css';

// Convert ErosVideo to BeyondVideo shape for component reuse
import type { BeyondVideo } from '../services/beyondApi';

const erosToBeyond = (v: ErosVideo): BeyondVideo => ({
  id: v.id,
  title: v.title,
  thumbnail: v.thumb || v.default_thumb || v.thumbnail || '',
  embedUrl: v.embed,
  pubDate: v.added,
  description: v.keywords
    ? v.keywords.split(',').slice(0, 5).map(t => t.trim()).filter(Boolean).join(' • ')
    : undefined,
});

const SORT_OPTIONS = [
  { label: 'TOP RATED', value: 'top-rated' },
  { label: 'LATEST', value: 'latest' },
  { label: 'LONGEST', value: 'longest' },
  { label: 'MOST VIEWED', value: 'most-viewed' },
];

const Eros = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<ErosVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<string>(() => localStorage.getItem('eros_order') || 'top-rated');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [continueWatching, setContinueWatching] = useState<ErosVideo[]>(() => {
    try {
      const saved = localStorage.getItem('eros_history');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });

  const fetchFeed = useCallback((targetOrder: string = order) => {
    setLoading(true);
    setError(null);
    setSearchActive(false);
    setSearchQuery('');
    epornerApi.getFeed(targetOrder)
      .then(data => setVideos(data))
      .catch(err => {
        console.error('Eros feed failed:', err);
        setError(`Connection to the Eros sector failed: ${err.message || String(err)}.`);
      })
      .finally(() => setLoading(false));
  }, [order]);

  const handleSearch = useCallback((q: string) => {
    if (!q.trim()) { fetchFeed(); return; }
    setLoading(true);
    setError(null);
    setSearchActive(true);
    epornerApi.search(q)
      .then(data => setVideos(data))
      .catch(err => setError(`Search failed: ${err.message || String(err)}.`))
      .finally(() => setLoading(false));
  }, [fetchFeed]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchFeed();
  }, [fetchFeed]);

  const handleVideoSelect = (video: BeyondVideo) => {
    const original = videos.find(v => v.id === video.id);
    if (!original) return;
    setContinueWatching(prev => {
      const filtered = prev.filter(v => v.id !== original.id);
      const updated = [original, ...filtered].slice(0, 10);
      localStorage.setItem('eros_history', JSON.stringify(updated));
      return updated;
    });
    navigate(`/eros/watch/${video.id}`);
  };

  const beyondVideos = useMemo(() => videos.map(erosToBeyond), [videos]);
  const heroVideos = useMemo(() => beyondVideos.slice(0, 6), [beyondVideos]);
  const hotVideos = useMemo(() => beyondVideos.slice(0, 10), [beyondVideos]);
  const newVideos = useMemo(() => beyondVideos.slice(6, 16), [beyondVideos]);
  const randomVideos = useMemo(() => [...beyondVideos].sort(() => Math.random() - 0.5).slice(0, 10), [beyondVideos]);

  return (
    <div className={pageStyles.homeContainer}>
      <HalftoneWave />
      <div className={pageStyles.content}>

        {/* Controls */}
        <div className={styles.portalControls}>
          <div className={styles.providerRow}>
            <span className={styles.providerLabel}>SORT:</span>
            <div className={styles.serverToggle}>
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  className={`${styles.serverBtn} ${order === opt.value && !searchActive ? styles.active : ''}`}
                  onClick={() => {
                    setOrder(opt.value);
                    localStorage.setItem('eros_order', opt.value);
                    fetchFeed(opt.value);
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <form
              onSubmit={e => { e.preventDefault(); handleSearch(searchQuery); }}
              className={styles.searchForm}
            >
              <Search size={16} className={styles.searchIcon} />
              <input
                className={styles.searchInput}
                placeholder="SEARCH EROS..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button type="button" className={styles.clearBtn} onClick={() => fetchFeed()}>
                  <X size={14} />
                </button>
              )}
            </form>
            <button onClick={() => fetchFeed(order)} className={styles.refreshBtn} title="Refresh">
              <RefreshCw size={16} className={loading ? styles.spinning : ''} />
            </button>
          </div>
        </div>

        {error && (
          <div className={styles.errorContainer}>
            <div className={styles.errorContent}>
              <p>{error}</p>
              <button onClick={() => fetchFeed(order)} className={styles.retryBtn}>
                <RefreshCw size={16} /> RECONNECT
              </button>
            </div>
          </div>
        )}

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

        {!loading && !error && beyondVideos.length > 0 && (
          <>
            {!searchActive && (
              <BeyondHero
                videos={heroVideos}
                onVideoSelect={handleVideoSelect}
                onRandom={() => {
                  if (!beyondVideos.length) return;
                  handleVideoSelect(beyondVideos[Math.floor(Math.random() * beyondVideos.length)]);
                }}
              />
            )}

            {continueWatching.length > 0 && !searchActive && (
              <section className={styles.miniSection}>
                <div className={styles.miniHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <History size={20} className={styles.historyIcon} />
                    <span>CONTINUE WATCHING</span>
                  </div>
                  <Link to="/eros/history" className={styles.historyLink}>VIEW FULL HISTORY</Link>
                </div>
                <div className={styles.miniGrid}>
                  {continueWatching.map(video => (
                    <div key={video.id} className={styles.miniCard} onClick={() => handleVideoSelect(erosToBeyond(video))}>
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

            {searchActive ? (
              <BeyondGrid videos={beyondVideos} onVideoSelect={handleVideoSelect} title={`RESULTS FOR "${searchQuery.toUpperCase()}"`} />
            ) : (
              <>
                <BeyondGrid videos={hotVideos} onVideoSelect={handleVideoSelect} title="TOP PICKS" />
                <BeyondGrid videos={newVideos} onVideoSelect={handleVideoSelect} title="FRESH DROPS" />
                <BeyondGrid videos={randomVideos} onVideoSelect={handleVideoSelect} title="DISCOVER" />
              </>
            )}
          </>
        )}

        {!loading && !error && beyondVideos.length === 0 && (
          <div className={styles.emptyContainer}>PORTAL IS EMPTY. AWAITING FEED...</div>
        )}
      </div>
    </div>
  );
};

export default Eros;
