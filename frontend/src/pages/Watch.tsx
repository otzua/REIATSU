import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, ChevronLeft, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { animeApi } from '../services/animeApi';
import type { AnimeDetail, EpisodeData } from '../services/animeApi';
import HalftoneWave from '../components/HalftoneWave';
import styles from './Watch.module.css';

const Watch = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const playerWrapperRef = useRef<HTMLDivElement>(null);
  const [anime, setAnime] = useState<AnimeDetail | null>(null);
  const [episodeData, setEpisodeData] = useState<EpisodeData | null>(null);
  const [currentEp, setCurrentEp] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeSource, setActiveSource] = useState<'sub' | 'dub'>('sub');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedRange, setSelectedRange] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key.toLowerCase() === 'f') {
        if (!document.fullscreenElement) {
          playerWrapperRef.current?.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message}`);
          });
        } else {
          document.exitFullscreen();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(false);
    
    Promise.all([
      animeApi.getAnime(id),
      animeApi.getEpisodes(id),
    ])
      .then(([info, eps]) => {
        setAnime(info);
        setEpisodeData(eps);
        setCurrentEp(1);
        
        // Initialize range if many episodes (> 28)
        if (eps.totalEpisodes > 28) {
          setSelectedRange([1, Math.min(100, eps.totalEpisodes)]);
        } else {
          setSelectedRange(null);
        }
        
        setLoading(false);
      })
      .catch((err) => {
        console.error('REIATSU ERROR:', err);
        setLoading(false);
        setError(true);
      });
  }, [id, refreshKey]);

  const [activeServer, setActiveServer] = useState<'primary' | 'ani'>('primary');
  const [individualSource, setIndividualSource] = useState<{ ep: number; sources: Record<string, string> } | null>(null);
  const [fetchingSource, setFetchingSource] = useState(false);

  const decodeEntities = (text: string) => {
    if (!text) return '';
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  const currentEpisode = useMemo(
    () => episodeData?.episodes.find((e) => e.number === currentEp) ?? null,
    [episodeData, currentEp]
  );

  useEffect(() => {
    if (!id || !currentEpisode) return;
    
    let isSubscribed = true;
    
    const listSources = currentEpisode.sources as Record<string, string>;
    if (!listSources || Object.keys(listSources).length === 0) {
      setFetchingSource(true);
      // We let the previous source remain briefly until the new one loads or we fail
      animeApi.getEpisode(id, currentEp)
        .then(res => {
          if (isSubscribed) {
            setIndividualSource({ ep: currentEp, sources: res.episode.sources as Record<string, string> });
            setFetchingSource(false);
          }
        })
        .catch(() => {
          if (isSubscribed) setFetchingSource(false);
        });
    } else {
      setIndividualSource(null);
      setFetchingSource(false);
    }
    
    return () => {
      isSubscribed = false;
    };
  }, [id, currentEp, episodeData]);

  // Auto-sync episode range only when currentEp changes
  useEffect(() => {
    if (!episodeData || episodeData.totalEpisodes <= 28) return;
    
    const rangeSize = 100;
    const start = Math.floor((currentEp - 1) / rangeSize) * rangeSize + 1;
    const end = Math.min(start + rangeSize - 1, episodeData.totalEpisodes);
    
    setSelectedRange(prev => {
      if (!prev || currentEp < prev[0] || currentEp > prev[1]) {
        return [start, end];
      }
      return prev;
    });
  }, [currentEp, episodeData]);

  const videoUrl = useMemo(() => {
    if (!currentEpisode) return null;
    
    let src = currentEpisode.sources as Record<string, string>;
    // Only use individual source if it explicitly matches the current episode
    if (individualSource && individualSource.ep === currentEp) {
      src = individualSource.sources;
    }
    
    if (!src || Object.keys(src).length === 0) return null;

    if (activeServer === 'ani') {
      const aniKeyCamel = activeSource === 'sub' ? 'aniSub' : 'aniDub';
      const aniKeySnake = activeSource === 'sub' ? 'ani_sub' : 'ani_dub';
      // Attempt Mirror links first, strictly fallback to Primary
      return src[aniKeyCamel] || src[aniKeySnake] || src[activeSource] || src.sub || null;
    } else {
      const aniKeyCamel = activeSource === 'sub' ? 'aniSub' : 'aniDub';
      const aniKeySnake = activeSource === 'sub' ? 'ani_sub' : 'ani_dub';
      // Primary links first, fallback to Mirror
      return src[activeSource] || src.sub || src[aniKeyCamel] || src[aniKeySnake] || null;
    }
  }, [currentEpisode, individualSource, activeSource, activeServer, currentEp]);

  const handleNextEp = () => {
    if (episodeData && currentEp < episodeData.totalEpisodes) {
      setCurrentEp(prev => prev + 1);
    }
  };

  const handlePrevEp = () => {
    if (currentEp > 1) {
      setCurrentEp(prev => prev - 1);
    }
  };

  const episodeRanges = useMemo(() => {
    if (!episodeData || episodeData.totalEpisodes <= 28) return [];
    const ranges: [number, number][] = [];
    const rangeSize = 100;
    for (let i = 1; i <= episodeData.totalEpisodes; i += rangeSize) {
      ranges.push([i, Math.min(i + rangeSize - 1, episodeData.totalEpisodes)]);
    }
    return ranges;
  }, [episodeData]);

  const filteredEpisodes = useMemo(() => {
    if (!episodeData) return [];
    let items = episodeData.episodes;
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(ep => 
        ep.number.toString().includes(q) || 
        ep.title?.toLowerCase().includes(q)
      );
    } else if (selectedRange) {
      items = items.filter(
        ep => ep.number >= selectedRange[0] && ep.number <= selectedRange[1]
      );
    }
    
    return items;
  }, [episodeData, selectedRange, searchQuery]);


  if (loading) {
    return (
      <div className={styles.container}>
        <HalftoneWave />
        <div className={styles.content}>
          <div className={styles.loadingWrapper}>
            <div className={styles.loading}>LOADING ANIME...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !anime || !episodeData) {
    return (
      <div className={styles.container}>
        <HalftoneWave />
        <div className={styles.content}>
          <div className={styles.errorBox}>
            <h2>FAILED TO LOAD DATA</h2>
            <button onClick={() => setRefreshKey(k => k + 1)}>RETRY</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <HalftoneWave />

      <div className={styles.content}>
        <div className={styles.topNav}>
          <button onClick={() => navigate(-1)} className={styles.backBtn}>
            <ChevronLeft size={18} />
            <span>BACK</span>
          </button>
          <div className={styles.breadcrumb}>
            <Link to={`/anime/${anime.anime.id}`} className={styles.animeNameLink}>{anime.anime.name}</Link>
            <span className={styles.sep}>/</span>
            <span className={styles.activeEpName}>EPISODE {currentEp}</span>
          </div>
        </div>

        <div className={styles.mainGrid}>
          <div className={styles.playerSection}>
            <div ref={playerWrapperRef} className={styles.videoWrapper}>
              {videoUrl ? (
                <iframe
                  key={`${id}-${activeSource}-${activeServer}`}
                  src={videoUrl}
                  className={styles.iframe}
                  allowFullScreen
                  scrolling="no"
                  allow="autoplay; encrypted-media"
                />
              ) : (
                <div className={styles.playerPlaceholder}>
                  {fetchingSource ? 'LOCATING STREAMS...' : 'NO SOURCE FOUND'}
                </div>
              )}
            </div>

            <div className={styles.playerControls}>
              <div className={styles.epMeta}>
                <span className={styles.epCount}>EPISODE {currentEp}</span>
                <h1 className={styles.epTitle}>
                  {decodeEntities(currentEpisode?.title || `Episode ${currentEp}`)}
                </h1>
              </div>

              <div className={styles.playerActions}>
                <div className={styles.navButtons}>
                  <button 
                    onClick={handlePrevEp} 
                    disabled={currentEp <= 1}
                    className={styles.navBtn}
                  >
                    PREV
                  </button>
                  <button 
                    onClick={handleNextEp} 
                    disabled={currentEp >= episodeData.totalEpisodes}
                    className={styles.navBtn}
                  >
                    NEXT
                  </button>
                </div>

                <div className={styles.divider} />

                <div className={styles.controlsGroup}>
                  <div className={styles.toggleGroup}>
                    <button 
                      className={`${styles.toggleBtn} ${activeSource === 'sub' ? styles.active : ''}`}
                      onClick={() => setActiveSource('sub')}
                    >
                      SUB
                    </button>
                    <button 
                      className={`${styles.toggleBtn} ${activeSource === 'dub' ? styles.active : ''}`}
                      onClick={() => setActiveSource('dub')}
                    >
                      DUB
                    </button>
                  </div>

                  <div className={styles.serverToggle}>
                    <button 
                      className={`${styles.serverBtn} ${activeServer === 'primary' ? styles.active : ''}`}
                      onClick={() => setActiveServer('primary')}
                    >
                      PRIMARY
                    </button>
                    <button 
                      className={`${styles.serverBtn} ${activeServer === 'ani' ? styles.active : ''}`}
                      onClick={() => setActiveServer('ani')}
                    >
                      MIRROR
                    </button>
                  </div>
                </div>

              </div>
            </div>

            <div className={styles.animeDetails}>
              <div className={styles.animeMainInfo}>
                <img src={anime.anime.poster} alt="" className={styles.miniPoster} />
                <div className={styles.textInfo}>
                  <h2 className={styles.animeTitle}>{anime.anime.name}</h2>
                  <div className={styles.badges}>
                    <span className={styles.badge}>{anime.anime.type}</span>
                    <span className={styles.badge}>{anime.anime.status}</span>
                    <span className={styles.badge}>{anime.anime.rating}</span>
                  </div>
                  <p className={styles.description}>{anime.anime.description}</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.sidebar}>
            <div className={styles.sidebarSearch}>
              {showSearch ? (
                <div className={styles.searchWrapper}>
                  <Search size={14} className={styles.searchIcon} />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search episode number or title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                  <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className={styles.closeSearch}>
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className={styles.searchPrompt} onClick={() => setShowSearch(true)}>
                  <Search size={14} />
                  <span>Search Episodes</span>
                </div>
              )}
            </div>

            {episodeRanges.length > 0 && !searchQuery && (
              <div className={styles.rangeSelector}>
                <div className={styles.rangeScroll}>
                  {episodeRanges.map((range) => (
                    <button
                      key={`${range[0]}-${range[1]}`}
                      className={`${styles.rangeBtn} ${selectedRange?.[0] === range[0] ? styles.activeRange : ''}`}
                      onClick={() => setSelectedRange(range)}
                    >
                      {range[0]}-{range[1]}
                      {selectedRange?.[0] === range[0] && (
                        <motion.div 
                          layoutId="activeRange"
                          className={styles.activeRangeIndicator}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.episodeGrid}>
              <AnimatePresence mode="popLayout">
                {filteredEpisodes.map((ep) => (
                  <motion.button
                    key={ep.number}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className={`${styles.episodeItem} ${currentEp === ep.number ? styles.active : ''}`}
                    onClick={() => setCurrentEp(ep.number)}
                  >
                    <span className={styles.num}>{ep.number}</span>
                    <span className={styles.name}>{decodeEntities(ep.title) || `Episode ${ep.number}`}</span>
                    {currentEp === ep.number && (
                      <motion.div 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }}
                        className={styles.playIcon}
                      >
                        <Play size={12} fill="currentColor" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </AnimatePresence>
              
              {filteredEpisodes.length === 0 && (
                <div className={styles.noResults}>
                  NO EPISODES FOUND
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Watch;
