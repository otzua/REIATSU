import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, List, ChevronLeft } from 'lucide-react';
import { animeApi } from '../services/animeApi';
import type { AnimeDetail, EpisodeData } from '../services/animeApi';
import HalftoneWave from '../components/HalftoneWave';
import styles from './Watch.module.css';

const Watch = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [anime, setAnime] = useState<AnimeDetail | null>(null);
  const [episodeData, setEpisodeData] = useState<EpisodeData | null>(null);
  const [currentEp, setCurrentEp] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeSource, setActiveSource] = useState<'sub' | 'dub'>('sub');
  const [refreshKey, setRefreshKey] = useState(0);

  // Load anime info + ALL episodes
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setCurrentEp(1);
    setEpisodeData(null);
    setAnime(null);

    Promise.all([
      animeApi.getAnime(id),
      animeApi.getEpisodes(id),
    ]).then(([info, eps]) => {
      setAnime(info);
      setEpisodeData(eps);
      setLoading(false);
      console.log('REIATSU DEBUG: Loaded episodes', eps.episodes.length);
    }).catch(err => {
      console.error('REIATSU ERROR:', err);
      setLoading(false);
    });
  }, [id, refreshKey]);

  // Derive the current episode object
  const currentEpisode = useMemo(() => {
    const ep = episodeData?.episodes.find(e => e.number === currentEp) ?? null;
    if (ep) console.log(`REIATSU DEBUG: Current Ep ${currentEp} sources:`, ep.sources);
    return ep;
  }, [episodeData, currentEp]);

  // Derive the video URL from the current episode object
  const videoUrl = useMemo(() => {
    if (!currentEpisode) return null;
    const sources = currentEpisode.sources as Record<string, string>;
    return sources?.[activeSource] || sources?.sub || null;
  }, [currentEpisode, activeSource]);

  if (loading) {
    return <div className={styles.container}><div className={styles.loading}>LOADING...</div></div>;
  }

  if (!anime || !episodeData) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>ERROR: UNABLE TO LOAD ANIME DATA</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <HalftoneWave />
      
      <div className={styles.content}>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>
          <ChevronLeft size={20} />
          <span>BACK TO EXPLORE</span>
        </button>

        <div className={styles.mainGrid}>
          {/* Video Player Section */}
          <div className={styles.playerSection}>
            <div className={styles.videoWrapper}>
              {videoUrl ? (
                <iframe
                  key={`${id}-${currentEp}-${activeSource}`}
                  src={videoUrl}
                  className={styles.iframe}
                  allowFullScreen
                  scrolling="no"
                  allow="autoplay; encrypted-media"
                />
              ) : (
                <div className={styles.playerPlaceholder}>
                  {currentEpisode ? 'NO STREAMING SOURCE AVAILABLE' : 'SELECT AN EPISODE'}
                </div>
              )}
            </div>

            <div className={styles.controls}>
              <div className={styles.epInfo}>
                <span className={styles.epBadge}>EPISODE {currentEp}</span>
                <h2 className={styles.epTitle}>{currentEpisode?.title || `Episode ${currentEp}`}</h2>
              </div>
              
              <div className={styles.actionGroup}>
                <button 
                  className={styles.iconBtn} 
                  onClick={() => setRefreshKey(k => k + 1)}
                  title="Refresh Data"
                >
                  RELOAD
                </button>

                <div className={styles.modeToggle}>
                  <button
                    className={`${styles.modeBtn} ${activeSource === 'sub' ? styles.activeMode : ''}`}
                    onClick={() => setActiveSource('sub')}
                  >
                    SUB
                  </button>
                  <button
                    className={`${styles.modeBtn} ${activeSource === 'dub' ? styles.activeMode : ''}`}
                    onClick={() => setActiveSource('dub')}
                    disabled={!currentEpisode?.sources?.dub}
                  >
                    DUB
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.animeInfo}>
              <h2 className={styles.animeName}>{anime?.anime.name}</h2>
              <p className={styles.desc}>{anime?.anime.description}</p>
            </div>
          </div>

          {/* Episode List Section */}
          <div className={styles.sideSection}>
            <div className={styles.epHeader}>
              <List size={18} />
              <span>EPISODES ({episodeData.totalEpisodes})</span>
            </div>
            <div className={styles.epList}>
              {episodeData.episodes.map((ep) => (
                <button
                  key={ep.number}
                  className={`${styles.epItem} ${currentEp === ep.number ? styles.activeEp : ''}`}
                  onClick={() => setCurrentEp(ep.number)}
                >
                  <span className={styles.epNum}>{ep.number}</span>
                  <span className={styles.epName}>{ep.title || `Episode ${ep.number}`}</span>
                  {currentEp === ep.number && <Play size={14} className={styles.playIcon} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Watch;
