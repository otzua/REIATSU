import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Flame, Tag } from 'lucide-react';
import { oceanApi } from '../services/oceanApi';
import type { OceanVideo, OceanDetails } from '../services/oceanApi';
import HalftoneWave from '../components/HalftoneWave';
import SmartImage from '../components/SmartImage';
import styles from './Ocean.module.css';

const Ocean = () => {
  const [videos, setVideos] = useState<OceanVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Selection and details state
  const [selectedVideo, setSelectedVideo] = useState<OceanVideo | null>(null);
  const [details, setDetails] = useState<OceanDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Keyboard cheat code check
  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Fetch RSS feed
    oceanApi.getFeed()
      .then((data) => {
        setVideos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load Ocean feed:', err);
        setError('Failed to load Ocean. Ensure music-api is online.');
        setLoading(false);
      });
  }, []);

  // Fetch single video details when selectedVideo changes
  useEffect(() => {
    if (!selectedVideo) {
      setDetails(null);
      return;
    }

    setDetailsLoading(true);
    oceanApi.getDetails(selectedVideo.id)
      .then((data) => {
        setDetails(data);
      })
      .catch((err) => {
        console.error('Failed to load details for:', selectedVideo.id, err);
      })
      .finally(() => {
        setDetailsLoading(false);
      });
  }, [selectedVideo]);

  const featured = videos[0];
  const gridVideos = videos.slice(1);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={styles.container}>
      <HalftoneWave />
      
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.accentBox}></div>
          <h1 className={styles.title}>DEEP OCEAN</h1>
        </div>

        {error && (
          <div className={styles.noResults} style={{ color: '#ff6b6b' }}>
            {error}
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <>
            <div className={`${styles.hero} ${styles.skeleton}`} style={{ height: '420px' }} />
            <div className={styles.grid}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`${styles.card} ${styles.skeleton}`} />
              ))}
            </div>
          </>
        )}

        {!loading && !error && videos.length === 0 && (
          <div className={styles.noResults}>
            No videos found in the deep ocean.
          </div>
        )}

        {!loading && !error && videos.length > 0 && (
          <>
            {/* Featured Hero Card */}
            {featured && (
              <div className={styles.hero} onClick={() => setSelectedVideo(featured)}>
                <div className={styles.heroBackground}>
                  <SmartImage 
                    src={featured.thumbnail} 
                    alt={featured.title} 
                    className={styles.heroImg} 
                    draggable={false} 
                  />
                </div>
                <div className={styles.heroOverlay}>
                  <div className={styles.heroBadge}>
                    <Flame size={12} style={{ marginRight: '0.4rem', verticalAlign: 'middle' }} />
                    Latest Release
                  </div>
                  <h2 className={styles.heroTitle}>{featured.title}</h2>
                  <p className={styles.heroDesc}>{featured.description || 'Step into the depth. Discover premium uncensored and high-quality titles in complete immersion.'}</p>
                  <button className={styles.playBtn}>
                    <Play size={18} fill="currentColor" />
                    Watch Now
                  </button>
                </div>
              </div>
            )}

            {/* Video Grid */}
            <div className={styles.grid}>
              {gridVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  className={styles.card}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.4 }}
                  onClick={() => setSelectedVideo(video)}
                >
                  <div className={styles.thumbnailContainer}>
                    <SmartImage src={video.thumbnail} alt={video.title} className={styles.thumbnail} />
                    <SmartImage src={video.thumbnail} aria-hidden="true" className={styles.cardGlow} />
                    <div className={styles.playHoverIcon}>
                      <Play size={20} fill="currentColor" style={{ marginLeft: '2px' }} />
                    </div>
                  </div>
                  
                  <div className={styles.info}>
                    <h3 className={styles.cardTitle}>{video.title}</h3>
                    <div className={styles.meta}>
                      <span className={styles.date}>{formatDate(video.pubDate)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Video Embed details/modal overlay */}
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
                <span className={styles.modalTitle}>{selectedVideo.title}</span>
                <button className={styles.closeBtn} onClick={() => setSelectedVideo(null)}>
                  <X size={20} />
                </button>
              </div>

              {/* Iframe 16:9 Player */}
              <div className={styles.playerWrapper}>
                <iframe
                  src={selectedVideo.embedUrl}
                  title={selectedVideo.title}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  scrolling="no"
                />
              </div>

              {/* Description and tags */}
              <div className={styles.modalBody}>
                {detailsLoading && (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                    <div className={styles.spinner} style={{ borderTopColor: '#00f5ff', width: '32px', height: '32px', borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', animation: 'spin 1s linear infinite' }} />
                  </div>
                )}

                {!detailsLoading && (
                  <>
                    <p className={styles.modalDesc}>
                      {details?.info?.[0]?.description || selectedVideo.description || 'No description available for this title.'}
                    </p>

                    {details?.genres && details.genres.length > 0 && (
                      <div className={styles.tagGroup}>
                        {details.genres.map((g) => (
                          <span key={g.genre} className={styles.tag}>
                            <Tag size={10} style={{ marginRight: '0.3rem', verticalAlign: 'middle' }} />
                            {g.genre}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className={styles.modalMeta}>
                      {details?.info?.[0]?.releasedate && (
                        <span className={styles.metaItem}>
                          <strong>Release Date:</strong> {formatDate(details.info[0].releasedate)}
                        </span>
                      )}
                      {details?.info?.[0]?.uploaddate && (
                        <span className={styles.metaItem}>
                          <strong>Upload Date:</strong> {formatDate(details.info[0].uploaddate)}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Dynamic Keyframe Injection for the inline spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Ocean;
