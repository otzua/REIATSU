import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Info, Calendar, History, Flame } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { beyondApi } from '../services/beyondApi';
import type { BeyondVideo, BeyondDetails } from '../services/beyondApi';
import HalftoneWave from '../components/HalftoneWave';
import BeyondHero from '../components/BeyondHero';
import BeyondGrid from '../components/BeyondGrid';
import SmartImage from '../components/SmartImage';
import pageStyles from './Home.module.css';
import styles from './Beyond.module.css';

const Beyond = () => {
  const location = useLocation();
  const [videos, setVideos] = useState<BeyondVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Selection and details state
  const [selectedVideo, setSelectedVideo] = useState<BeyondVideo | null>(null);
  const [details, setDetails] = useState<BeyondDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

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

  // Handle selection from search
  useEffect(() => {
    if (location.state?.selectedVideo) {
      setSelectedVideo(location.state.selectedVideo);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const updateHistory = (video: BeyondVideo) => {
    setContinueWatching((prev) => {
      const filtered = prev.filter((v) => v.id !== video.id);
      const updated = [video, ...filtered].slice(0, 10);
      localStorage.setItem('beyond_history', JSON.stringify(updated));
      return updated;
    });
  };

  // Fetch details
  useEffect(() => {
    if (!selectedVideo) {
      setDetails(null);
      return;
    }

    setDetailsLoading(true);
    beyondApi.getDetails(selectedVideo.id)
      .then((data) => {
        setDetails(data);
        updateHistory(selectedVideo);
      })
      .catch((err) => {
        console.error('Failed to load details for:', selectedVideo.id, err);
      })
      .finally(() => {
        setDetailsLoading(false);
      });
  }, [selectedVideo]);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
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
            <BeyondHero videos={heroVideos} onVideoSelect={setSelectedVideo} />
            
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
                      <div key={video.id} className={styles.miniCard} onClick={() => setSelectedVideo(video)}>
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
                onVideoSelect={setSelectedVideo} 
                title="HOT TRENDS" 
              />

              {/* New Section */}
              <BeyondGrid 
                videos={newVideos} 
                onVideoSelect={setSelectedVideo} 
                title="NEW RELEASES" 
              />

              {/* Famous Section */}
              <BeyondGrid 
                videos={famousVideos} 
                onVideoSelect={setSelectedVideo} 
                title="ALL TIME FAMOUS" 
              />
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              className={styles.modal}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <div className={styles.modalHeaderTitle}>
                  <div className={styles.modalAccent} />
                  <span className={styles.modalTitleText}>{selectedVideo.title}</span>
                </div>
                <button className={styles.closeBtn} onClick={() => setSelectedVideo(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className={styles.playerWrapper}>
                <iframe
                  src={selectedVideo.embedUrl}
                  title={selectedVideo.title}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  scrolling="no"
                />
              </div>

              <div className={styles.modalBody}>
                {detailsLoading && (
                  <div className={styles.spinnerWrapper}>
                    <div className={styles.spinner} />
                  </div>
                )}

                {!detailsLoading && (
                  <div className={styles.modalDetailsContent}>
                    <div className={styles.modalMainInfo}>
                      <h3 className={styles.sectionHeader}>
                        <Info size={18} style={{ color: 'var(--accent)' }} />
                        SYNOPSIS
                      </h3>
                      <p className={styles.modalDesc}>
                        {details?.info?.[0]?.description || selectedVideo.description || 'Step into the depth of this title. No detailed description available currently.'}
                      </p>

                      <h3 className={styles.sectionHeader} style={{ marginTop: '2.5rem' }}>
                        <Tag size={18} style={{ color: 'var(--accent)' }} />
                        TAGS
                      </h3>
                      <div className={styles.tagGroup}>
                        {(details?.genres && details.genres.length > 0) ? details.genres.map((g) => (
                          <span key={g.genre} className={styles.tag}>
                            {g.genre}
                          </span>
                        )) : (
                          <span className={styles.tag}>Premium</span>
                        )}
                      </div>
                    </div>

                    <div className={styles.modalSidebar}>
                      <h3 className={styles.sectionHeader}>
                        <Calendar size={18} style={{ color: 'var(--accent)' }} />
                        METADATA
                      </h3>
                      <div className={styles.modalMeta}>
                        <div className={styles.metaItem}>
                          <strong>Type</strong>
                          <span>Premium Uncensored</span>
                        </div>
                        {details?.info?.[0]?.releasedate && (
                          <div className={styles.metaItem}>
                            <strong>Release</strong>
                            <span>{formatDate(details.info[0].releasedate)}</span>
                          </div>
                        )}
                        <div className={styles.metaItem}>
                          <strong>Quality</strong>
                          <span>1080p Ultra HD</span>
                        </div>
                        <div className={styles.metaItem}>
                          <strong>Status</strong>
                          <span>Completed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Beyond;
