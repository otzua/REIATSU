import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';
import { Play, ChevronLeft, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { animeApi } from '../services/animeApi';
import type { AnimeDetail, EpisodeData } from '../services/animeApi';
import HalftoneWave from '../components/HalftoneWave';
import SmartImage from '../components/SmartImage';
import NextEpisodeTimer from '../components/NextEpisodeTimer';
import DirectPlayer from '../components/DirectPlayer';
import styles from './Watch.module.css';

/** Returns true if the URL is a direct stream file (m3u8 / mp4 / cdn link), not an embed HTML page */
function isDirectStreamUrl(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return (
    lower.includes('.m3u8') ||
    lower.includes('.mp4') ||
    lower.includes('fast4speed') ||
    lower.includes('allmanga') ||
    lower.includes('proxy-m3u8') ||
    lower.includes('cdn.') ||
    // Fallback: URLs that are clearly not embed HTML pages
    (/\/media[0-9]?\//.test(lower) && !lower.includes('.html'))
  );
}

const Watch = () => {
  const { id, provider: pathProvider } = useParams<{ id: string, provider?: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const epParam = searchParams.get('ep');
  const location = useLocation();
  // Use route provider, fallback to miruro or animekai if path starts with them, else default provider
  let provider = (pathProvider && pathProvider !== 'anime') ? pathProvider : (searchParams.get('provider') || undefined);
  const providerMatch = location.pathname.match(/^\/(miruro|animekai)/);
  if (!provider && providerMatch) {
    provider = providerMatch[1];
  }
  
  const playerWrapperRef = useRef<HTMLDivElement>(null);
  const [anime, setAnime] = useState<AnimeDetail | null>(null);
  const [episodeData, setEpisodeData] = useState<EpisodeData | null>(null);
  const [currentEp, setCurrentEp] = useState(epParam ? parseInt(epParam, 10) : 1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | false>(false);
  const [activeSource, setActiveSource] = useState<'sub' | 'dub'>('sub');
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedRange, setSelectedRange] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [activeServer, setActiveServer] = useState<'primary' | 'ani'>('primary');
  const [individualSource, setIndividualSource] = useState<{ ep: number; sources: Record<string, string> } | null>(null);
  const [sourceFetchFailedEp, setSourceFetchFailedEp] = useState<number | null>(null);
  const [redirectingTo, setRedirectingTo] = useState<string | null>(null);
  

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

      if (e.key.toLowerCase() === 'n') {
        handleNextEp();
      }

      if (e.key.toLowerCase() === 'p') {
        handlePrevEp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!id) return;
    let isSubscribed = true;

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out. The server took too long to respond.')), 20000)
    );

    Promise.race([
      Promise.all([
        animeApi.getAnime(id, provider),
        animeApi.getEpisodes(id, provider),
      ]),
      timeout,
    ])
      .then(([info, eps]) => {
        if (!isSubscribed) return;
        console.log('[REIATSU] Watch Data:', { provider, infoProvider: info.provider, episodes: eps.totalEpisodes });

        if (eps.totalEpisodes === 0) {
          console.warn(`[REIATSU] ${provider || 'default'} provider returned 0 episodes. Staying on page for troubleshooting.`);
          // We do not navigate away so the user can troubleshoot the empty provider state
        }

        if (info.provider && info.provider !== provider && info.provider !== 'anikoto') {
          console.log(`[REIATSU] Redirecting to ${info.provider} watch page`);
          setRedirectingTo(info.provider);
          setTimeout(() => {
            navigate(`/${info.provider}/watch/${id}${epParam ? `?ep=${epParam}` : ''}`, { replace: true });
          }, 1500);
          return;
        }
        if (info.provider === 'anikoto' && provider && provider !== 'anime') {
          console.log(`[REIATSU] Redirecting to default watch page`);
          setRedirectingTo('anime');
          setTimeout(() => {
            navigate(`/anime/watch/${id}${epParam ? `?ep=${epParam}` : ''}`, { replace: true });
          }, 1500);
          return;
        }
        
        setAnime(info);
        setEpisodeData(eps);
        setCurrentEp(epParam ? parseInt(epParam, 10) : 1);
        setIndividualSource(null);
        setSourceFetchFailedEp(null);
        
        // Initialize range if many episodes (> 28)
        if (eps.totalEpisodes > 28) {
          const start = Math.floor((currentEp - 1) / 100) * 100 + 1;
          setSelectedRange([start, Math.min(start + 99, eps.totalEpisodes)]);
        } else {
          setSelectedRange(null);
        }
        
        setError(false);
        setLoading(false);
      })
      .catch((err) => {
        if (!isSubscribed) return;
        console.error('REIATSU ERROR:', err);
        setError(err.message || String(err));
        setLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [id, refreshKey, provider]);

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
    if (listSources && Object.keys(listSources).length > 0) return;
    if (individualSource?.ep === currentEp || sourceFetchFailedEp === currentEp) return;

    // We let the previous source remain briefly until the new one loads or we fail
    animeApi.getEpisode(id, currentEp, provider)
      .then(res => {
        if (isSubscribed) {
          setIndividualSource({ ep: currentEp, sources: res.episode.sources as Record<string, string> });
          setSourceFetchFailedEp(null);
        }
      })
      .catch(() => {
        if (isSubscribed) setSourceFetchFailedEp(currentEp);
      });
    
    return () => {
      isSubscribed = false;
    };
  }, [id, currentEp, currentEpisode, individualSource?.ep, sourceFetchFailedEp, provider]);

  // Save to Continue Watching History
  useEffect(() => {
    if (!anime || !episodeData) return;

    const cwItem = {
      animeId: anime.anime.id,
      animeName: anime.anime.name,
      animePoster: anime.anime.poster,
      episodeNumber: currentEp,
      episodeTitle: currentEpisode?.title || `Episode ${currentEp}`,
      provider: provider,
      timestamp: Date.now()
    };

    try {
      const existingRaw = localStorage.getItem('reiatsu_continue_watching');
      let history = [];
      if (existingRaw) {
        const parsed = JSON.parse(existingRaw);
        history = Array.isArray(parsed) ? parsed : [];
      }

      // Filter out previous record of the same anime
      history = history.filter((item: any) => item.animeId !== anime.anime.id);
      
      // Put new item at the beginning
      history.unshift(cwItem);
      
      // Store top 15 items
      localStorage.setItem('reiatsu_continue_watching', JSON.stringify(history.slice(0, 15)));
    } catch (e) {
      console.error('Failed to save to Continue Watching history:', e);
    }
  }, [anime, episodeData, currentEp, currentEpisode]);

  const fetchingSource = useMemo(() => {
    if (!currentEpisode) return false;
    const inlineSources = currentEpisode.sources as Record<string, string> | undefined;
    const hasInlineSources = !!inlineSources && Object.keys(inlineSources).length > 0;
    if (hasInlineSources) return false;
    if (individualSource?.ep === currentEp) return false;
    return sourceFetchFailedEp !== currentEp;
  }, [currentEpisode, individualSource?.ep, currentEp, sourceFetchFailedEp]);

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

  const syncRangeForEpisode = (nextEp: number) => {
    if (!episodeData || episodeData.totalEpisodes <= 28) return;
    if (selectedRange && nextEp >= selectedRange[0] && nextEp <= selectedRange[1]) return;

    const rangeSize = 100;
    const start = Math.floor((nextEp - 1) / rangeSize) * rangeSize + 1;
    const end = Math.min(start + rangeSize - 1, episodeData.totalEpisodes);
    setSelectedRange([start, end]);
  };

  const handleNextEp = () => {
    if (episodeData && currentEp < episodeData.totalEpisodes) {
      const nextEp = currentEp + 1;
      setCurrentEp(nextEp);
      syncRangeForEpisode(nextEp);
    }
  };

  const handlePrevEp = () => {
    if (currentEp > 1) {
      const nextEp = currentEp - 1;
      setCurrentEp(nextEp);
      syncRangeForEpisode(nextEp);
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


  if (redirectingTo) {
    return (
      <div className={styles.container}>
        <HalftoneWave />
        <div className={styles.content}>
          <div className={styles.loadingWrapper}>
            <div className={styles.loading}>TRANSFERRING TO {redirectingTo.toUpperCase()}...</div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} />
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <h2>FAILED TO LOAD DATA: ERROR: {error}, ANIME:{anime ? 'true' : 'false'}, EPS:{episodeData ? 'true' : 'false'} {episodeData?.episodes?.length}</h2>
            <button onClick={() => { setLoading(true); setError(false); setRefreshKey(k => k + 1); }}>RETRY</button>
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
            <Link to={`/${provider || 'anime'}/${provider ? 'anime/' : ''}${anime.anime.id}`} className={styles.animeNameLink}>{anime.anime.name}</Link>
            <span className={styles.sep}>/</span>
            <span className={styles.activeEpName}>EPISODE {currentEp}</span>
          </div>
        </div>

        <div className={styles.mainGrid}>
          <div className={styles.playerSection}>
            <div className={styles.videoWrapperContainer}>
              <SmartImage src={anime.anime.poster} aria-hidden="true" className={styles.playerGlow} />
              <div ref={playerWrapperRef} className={styles.videoWrapper}>
                {videoUrl ? (
                  isDirectStreamUrl(videoUrl) ? (
                    <DirectPlayer
                      key={`direct-${id}-${currentEp}-${activeSource}-${activeServer}`}
                      url={videoUrl}
                      poster={anime?.anime.poster}
                      className={styles.iframe}
                    />
                  ) : (
                    <iframe
                      key={`${id}-${activeSource}-${activeServer}`}
                      src={videoUrl}
                      className={styles.iframe}
                      allowFullScreen
                      scrolling="no"
                      allow="autoplay; encrypted-media"
                    />
                  )
                ) : (
                  <div className={styles.playerPlaceholder}>
                    {fetchingSource ? 'LOCATING STREAMS...' : 'NO SOURCE FOUND'}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.playerControls}>
              <div className={styles.playerControlsInner}>
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

              {anime.anime.status.toLowerCase().includes('airing') && currentEp === episodeData.totalEpisodes && (
                <div className={styles.timerWrapper}>
                  <NextEpisodeTimer animeName={anime.anime.name} />
                </div>
              )}
            </div>

            <div className={styles.animeDetails}>
              <div className={styles.animeMainInfo}>
                <div className={styles.miniPosterWrapper}>
                  <SmartImage src={anime.anime.poster} aria-hidden="true" className={styles.miniPosterGlow} />
                  <SmartImage src={anime.anime.poster} alt="" className={styles.miniPoster} loading="eager" />
                </div>
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
                    onClick={() => { setCurrentEp(ep.number); syncRangeForEpisode(ep.number); }}
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
        {/* Recommended Section at the bottom */}
        {anime.recommended && anime.recommended.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={styles.recommendedSection}
          >
            <div className={styles.sectionHeaderLine}>
              <div className={styles.accentBox}></div>
              <h2>RECOMMENDED FOR YOU</h2>
            </div>
            <div className={styles.recommendedGrid}>
              {anime.recommended.slice(0, 12).map((rec, index) => (
                <motion.div
                  key={rec.id}
                  className={styles.recCard}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.15, ease: "easeOut" } }}
                >
                  <Link to={`/${provider || 'anime'}/${provider ? 'anime/' : ''}${rec.id}`} className={styles.cardLink}>
                    <div className={styles.posterPlaceholder}>
                      <SmartImage src={rec.poster} aria-hidden="true" className={styles.recPosterGlow} draggable={false} />
                      <SmartImage src={rec.poster} alt={rec.name} className={styles.recPosterImg} draggable={false} />
                    </div>
                    <div className={styles.recInfo}>
                      <h3 className={styles.recTitle}>{rec.name}</h3>
                      <p className={styles.recMeta}>{rec.type || 'Anime'}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Watch;