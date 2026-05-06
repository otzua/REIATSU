import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, List, ChevronLeft, Maximize } from 'lucide-react';
import { animeApi } from '../services/animeApi';
import type { AnimeDetail, EpisodeData, EpisodeDetail } from '../services/animeApi';
import HalftoneWave from '../components/HalftoneWave';
import styles from './Watch.module.css';

const Watch = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [anime, setAnime] = useState<AnimeDetail | null>(null);
  const [episodeData, setEpisodeData] = useState<EpisodeData | null>(null);
  const [currentEp, setCurrentEp] = useState(1);
  const [epDetail, setEpDetail] = useState<EpisodeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [epLoading, setEpLoading] = useState(false);
  const [activeSource, setActiveSource] = useState<'sub' | 'dub'>('sub');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    
    Promise.all([
      animeApi.getAnime(id),
      animeApi.getEpisodes(id)
    ]).then(([info, eps]) => {
      setAnime(info);
      setEpisodeData(eps);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!id || !currentEp) return;
    setEpLoading(true);
    animeApi.getEpisode(id, currentEp)
      .then(detail => {
        setEpDetail(detail);
        setEpLoading(false);
      })
      .catch(err => {
        console.error(err);
        setEpLoading(false);
      });
  }, [id, currentEp]);

  const videoUrl = epDetail?.episode?.sources?.[activeSource] || epDetail?.episode?.sources?.sub;

  if (loading) {
    return <div className={styles.container}><div className={styles.loading}>LOADING...</div></div>;
  }

  if (!anime || !epDetail) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          {loading ? 'LOADING...' : 'ERROR: UNABLE TO LOAD ANIME DATA'}
        </div>
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
              {epLoading ? (
                <div className={styles.playerPlaceholder}>LOADING EPISODE...</div>
              ) : videoUrl ? (
                <iframe
                  src={videoUrl}
                  className={styles.iframe}
                  allowFullScreen
                  scrolling="no"
                  allow="autoplay; encrypted-media"
                />
              ) : (
                <div className={styles.playerPlaceholder}>
                  NO STREAMING SOURCE AVAILABLE
                </div>
              )}
            </div>

            <div className={styles.controls}>
              <div className={styles.epInfo}>
                <span className={styles.epBadge}>EPISODE {currentEp}</span>
                <h2 className={styles.epTitle}>{epDetail.episode.title || 'Untitled Episode'}</h2>
              </div>
              
              <div className={styles.actionGroup}>

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
                    disabled={!epDetail.episode.sources.dub}
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
              <span>EPISODES</span>
            </div>
            <div className={styles.epList}>
              {episodeData?.episodes.map((ep) => (
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
