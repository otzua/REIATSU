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
  const [error, setError] = useState(false);
  const [activeSource, setActiveSource] = useState<'sub' | 'dub'>('sub');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(false);
    setCurrentEp(1);
    setEpisodeData(null);
    setAnime(null);

    Promise.all([
      animeApi.getAnime(id),
      animeApi.getEpisodes(id),
    ])
      .then(([info, eps]) => {
        setAnime(info);
        setEpisodeData(eps);
        setLoading(false);
      })
      .catch((err) => {
        console.error('REIATSU ERROR:', err);
        setLoading(false);
        setError(true);
      });
  }, [id, refreshKey]);

  const [activeServer, setActiveServer] = useState<'primary' | 'ani'>('primary');
  const [individualSource, setIndividualSource] = useState<Record<string, string> | null>(null);
  const [fetchingSource, setFetchingSource] = useState(false);

  // Derive the current episode object
  const currentEpisode = useMemo(
    () => episodeData?.episodes.find((e) => e.number === currentEp) ?? null,
    [episodeData, currentEp]
  );

  // Auto-fetch source if missing in list
  useEffect(() => {
    if (!id || !currentEpisode) return;
    
    const listSources = currentEpisode.sources as Record<string, string>;
    if (!listSources || Object.keys(listSources).length === 0) {
      setFetchingSource(true);
      setIndividualSource(null);
      animeApi.getEpisode(id, currentEp)
        .then(res => {
          setIndividualSource(res.episode.sources as Record<string, string>);
          setFetchingSource(false);
        })
        .catch(() => setFetchingSource(false));
    } else {
      setIndividualSource(null);
      setFetchingSource(false);
    }
  }, [id, currentEp, episodeData]);

  // Server priority: Selected Server -> Primary Fallback
  const videoUrl = useMemo(() => {
    if (!currentEpisode) return null;
    const src = individualSource || (currentEpisode.sources as Record<string, string>);
    if (!src) return null;

    // Build potential keys based on server selection
    const targetKey = activeServer === 'primary' ? activeSource : `ani_${activeSource}`;
    
    // Try target -> fallback to primary sub -> fallback to mirror
    const url = src[targetKey] || src[activeSource] || src.sub || src.ani_sub || null;
    
    console.log(`REIATSU PLAYER: Ep ${currentEp} [Server: ${activeServer}, Mode: ${activeSource}] -> ${url ? 'VALID' : 'NULL'}`);
    return url;
  }, [currentEpisode, individualSource, activeSource, activeServer]);

  // ── Loading state ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.container}>
        <HalftoneWave />
        <div className={styles.content}>
          <div className={styles.loadingWrapper}>
            <div className={styles.loading}>LOADING ANIME DATA...</div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (error || !anime || !episodeData) {
    return (
      <div className={styles.container}>
        <HalftoneWave />
        <div className={styles.content}>
          <div className={styles.loadingWrapper}>
            <div className={styles.error}>
              FAILED TO LOAD ANIME
              <button className={styles.iconBtn} onClick={() => setRefreshKey((k) => k + 1)}>
                RETRY
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main view ──────────────────────────────────────────────────────────
  return (
    <div className={styles.container}>
      <HalftoneWave />

      <div className={styles.content}>
        <div style={{ color: '#ff4444', fontWeight: 900, marginBottom: '1rem', fontSize: '0.8rem' }}>
          REIATSU DEPLOYMENT: VERSION 2.0 (STABLE)
        </div>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>
          <ChevronLeft size={20} />
          <span>BACK TO EXPLORE</span>
        </button>

        <div className={styles.mainGrid}>

          {/* ── Video Player ─────────────────────────────── */}
          <div className={styles.playerSection}>
            <div className={styles.animeHeader}>
              <h1 className={styles.animeName}>
                {anime?.anime.name || id?.replace(/-/g, ' ')}
              </h1>
              <div className={styles.animeMeta}>
                <span>{anime?.anime.type}</span>
                <span className={styles.dot}>•</span>
                <span>{anime?.anime.status}</span>
              </div>
            </div>

            <div className={styles.videoWrapper}>
              {videoUrl ? (
                <iframe
                  key={`${id}-ep${currentEp}-${activeSource}-${activeServer}`}
                  src={videoUrl}
                  className={styles.iframe}
                  allowFullScreen
                  scrolling="no"
                  allow="autoplay; encrypted-media; picture-in-picture; clipboard-write"
                />
              ) : (
                <div className={styles.playerPlaceholder}>
                  {fetchingSource ? 'FETCHING SOURCE...' : (currentEpisode ? 'NO SOURCE AVAILABLE' : 'SELECT AN EPISODE')}
                </div>
              )}
            </div>

            <div className={styles.controls}>
              <div className={styles.epInfo}>
                <span className={styles.epBadge}>EPISODE {currentEp}</span>
                <h2 className={styles.epTitle}>
                  {currentEpisode?.title || `Episode ${currentEp}`}
                </h2>
              </div>

              <div className={styles.actionGroup}>
                <div className={styles.serverGroup}>
                  <button 
                    className={`${styles.serverBtn} ${activeServer === 'primary' ? styles.activeServer : ''}`}
                    onClick={() => setActiveServer('primary')}
                  >
                    PRIMARY
                  </button>
                  <button 
                    className={`${styles.serverBtn} ${activeServer === 'ani' ? styles.activeServer : ''}`}
                    onClick={() => setActiveServer('ani')}
                  >
                    MIRROR
                  </button>
                </div>

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
                  >
                    DUB
                  </button>
                </div>
                
                <button
                  className={styles.reloadBtn}
                  onClick={() => setRefreshKey((k) => k + 1)}
                  title="Force Reload Data"
                >
                  RELOAD
                </button>
              </div>
            </div>

            <div className={styles.animeInfo}>
              <h2 className={styles.animeName}>{anime.anime.name}</h2>
              <p className={styles.desc}>{anime.anime.description}</p>
            </div>
          </div>

          {/* ── Episode Sidebar ──────────────────────────── */}
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
