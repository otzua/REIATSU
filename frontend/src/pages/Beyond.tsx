import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Flame, RefreshCw } from 'lucide-react';
import { beyondApi } from '../services/beyondApi';
import type { BeyondVideo } from '../services/beyondApi';
import HalftoneWave from '../components/HalftoneWave';
import BeyondHero from '../components/BeyondHero';
import BeyondGrid from '../components/BeyondGrid';
import SmartImage from '../components/SmartImage';
import pageStyles from './Home.module.css';
import styles from './Beyond.module.css';

const Beyond = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<BeyondVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [server, setServer] = useState<'hanime' | 'watchhentai'>('hanime');

  
  // Continue Watching state
  const [continueWatching, setContinueWatching] = useState<BeyondVideo[]>([]);

  const fetchFeed = (targetServer: 'hanime' | 'watchhentai' = server) => {
    setLoading(true);
    setError(null);
    beyondApi.getFeed(targetServer)
      .then((data) => {
        setVideos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load feed:', err);
        setError('Connection to the Beyond sector failed. Please ensure the portal is active.');
        setLoading(false);
      });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Load continue watching
    const saved = localStorage.getItem('beyond_history');
    if (saved) {
      try {
        setContinueWatching(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }

    fetchFeed();
  }, []);



  const handleVideoSelect = (video: BeyondVideo) => {
    // Save to history
    setContinueWatching((prev) => {
      const filtered = prev.filter((v) => v.id !== video.id);
      const updated = [video, ...filtered].slice(0, 10);
      localStorage.setItem('beyond_history', JSON.stringify(updated));
      return updated;
    });
    
    navigate(`/beyond/watch/${video.id}`);
  };

  // Sections logic
  const heroVideos = useMemo(() => videos.slice(0, 6), [videos]);
  const hotVideos = useMemo(() => videos.slice(6, 18), [videos]);
  const newVideos = useMemo(() => videos.slice(18, 30), [videos]);
  const famousVideos = useMemo(() => [...videos].sort(() => 0.5 - Math.random()).slice(0, 12), [videos]);

  return (
    <div className={pageStyles.homeContainer}>
      <HalftoneWave />
      
      <div className={pageStyles.content}>

        <div className={styles.portalControls}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(220, 201, 169, 0.4)', fontWeight: 800, letterSpacing: '0.1em' }}>PROVIDER:</span>
            <div className={styles.serverToggle}>
              <button 
                className={`${styles.serverBtn} ${server === 'hanime' ? styles.active : ''}`}
                onClick={() => { setServer('hanime'); fetchFeed('hanime'); }}
              >
                HANIME TV
              </button>
              <button 
                className={`${styles.serverBtn} ${server === 'watchhentai' ? styles.active : ''}`}
                onClick={() => { setServer('watchhentai'); fetchFeed('watchhentai'); }}
              >
                WATCHHENTAI
              </button>
            </div>
          </div>
          <button onClick={() => fetchFeed(server)} className={styles.refreshBtn} title="Refresh Portal">
            <RefreshCw size={16} className={loading ? styles.spinning : ''} />
          </button>
        </div>

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

        {/* Loading Skeletons */}
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

            {videos.length > 0 ? (
              <>
                <BeyondHero videos={heroVideos} onVideoSelect={handleVideoSelect} />
                
                {/* Continue Watching */}
                {continueWatching.length > 0 && (
                  <section className={styles.miniSection} style={{ padding: '0 var(--space-xl)' }}>
                    <div className={styles.miniHeader}>
                      <History size={20} style={{ color: 'var(--accent)' }} />
                      CONTINUE WATCHING
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

                <BeyondGrid 
                  videos={hotVideos} 
                  onVideoSelect={handleVideoSelect} 
                  title="HOT TRENDS" 
                />

                <BeyondGrid 
                  videos={newVideos} 
                  onVideoSelect={handleVideoSelect} 
                  title="NEW RELEASES" 
                />

                <BeyondGrid 
                  videos={famousVideos} 
                  onVideoSelect={handleVideoSelect} 
                  title="ALL TIME FAMOUS" 
                />
              </>
            ) : (
              <div className={styles.emptyContainer}>
                PORTAL IS EMPTY. AWAITING FEED...
              </div>
            )}
      </div>
    </div>
  );
};

export default Beyond;
