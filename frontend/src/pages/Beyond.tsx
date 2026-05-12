import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, Flame } from 'lucide-react';
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
  
  // Continue Watching state
  const [continueWatching, setContinueWatching] = useState<BeyondVideo[]>([]);

  useEffect(() => {
    // Scroll to top on mount
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

    // Fetch feed
    beyondApi.getFeed()
      .then((data) => {
        setVideos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load feed:', err);
        setError('Failed to load content. Please make sure the local server is running.');
        setLoading(false);
      });
  }, []);

  const handleVideoSelect = (video: BeyondVideo) => {
    // Save to history
    setContinueWatching((prev) => {
      const filtered = prev.filter((v) => v.id !== video.id);
      const updated = [video, ...filtered].slice(0, 10);
      localStorage.setItem('beyond_history', JSON.stringify(updated));
      return updated;
    });
    
    // Navigate to dedicated watch page
    navigate(`/beyond/watch/${video.id}`);
  };

  // Sections logic
  const heroVideos = videos.slice(0, 6);
  const hotVideos = videos.slice(6, 18);
  const newVideos = videos.slice(18, 30);
  const famousVideos = [...videos].sort(() => 0.5 - Math.random()).slice(0, 12);

  return (
    <div className={pageStyles.homeContainer}>
      <HalftoneWave />
      
      <div className={pageStyles.content}>
        {error && (
          <div className={styles.errorContainer}>
            {error}
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className={styles.sectionsContainer}>
            <div className={`${styles.skeleton} ${styles.heroSkeleton}`} />
            <div className={styles.skeletonGrid}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className={`${styles.skeleton} ${styles.cardSkeleton}`} />
              ))}
            </div>
          </div>
        )}

        {!loading && !error && videos.length === 0 && (
          <div className={styles.emptyContainer}>
            No content found in the portal.
          </div>
        )}

        {!loading && !error && videos.length > 0 && (
          <>
            <BeyondHero videos={heroVideos} onVideoSelect={handleVideoSelect} />
            
            <div className={styles.sectionsContainer}>
              {/* Continue Watching */}
              {continueWatching.length > 0 && (
                <section className={styles.miniSection}>
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

              {/* Hot Section */}
              <BeyondGrid 
                videos={hotVideos} 
                onVideoSelect={handleVideoSelect} 
                title="HOT TRENDS" 
              />

              {/* New Section */}
              <BeyondGrid 
                videos={newVideos} 
                onVideoSelect={handleVideoSelect} 
                title="NEW RELEASES" 
              />

              {/* Famous Section */}
              <BeyondGrid 
                videos={famousVideos} 
                onVideoSelect={handleVideoSelect} 
                title="ALL TIME FAMOUS" 
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Beyond;
