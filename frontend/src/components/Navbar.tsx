import { useState, useEffect, useRef } from 'react';
import { Home, Search, Calendar, ArrowRightLeft, User, X, Lock, Sparkles, Download, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { animeApi } from '../services/animeApi';
import { cinemaApi, type CinemaMovie } from '../services/cinemaApi';
import { beyondApi, type BeyondVideo } from '../services/beyondApi';
import { musicApi, type Track } from '../services/musicApi';
import type { AnimeCard, SearchResult } from '../services/animeApi';
import SmartImage from './SmartImage';
import styles from './Navbar.module.css';
import { useMusic } from '../context/MusicContext';
import MusicDownloadModal from './MusicDownloadModal';
import AboutMe from './AboutMe';

const Navbar = () => {
  const { playTrack } = useMusic();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const isCinema = location.pathname.startsWith('/cinema') || 
                   (location.pathname === '/schedule' && searchParams.get('type') === 'cinema') ||
                   (location.pathname === '/mylist' && searchParams.get('type') === 'cinema');
  const isMusic = location.pathname.startsWith('/music');
  const isBeyond = location.pathname.startsWith('/beyond');

  const routeProvider = searchParams.get('provider');
  const isAnimeKaiGlobally = location.pathname.startsWith('/animekai') || routeProvider === 'animekai';

  const [searchOpen, setSearchOpen] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  const [query, setQuery] = useState('');
  const [animeResults, setAnimeResults] = useState<AnimeCard[]>([]);
  const [cinemaResults, setCinemaResults] = useState<CinemaMovie[]>([]);
  const [beyondResults, setBeyondResults] = useState<BeyondVideo[]>([]);
  const [musicResults, setMusicResults] = useState<Track[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchFilter, setSearchFilter] = useState<'all' | 'anime' | 'cinema'>('all');
  const [suggestion, setSuggestion] = useState('');
  const [didYouMean, setDidYouMean] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Secret portal unlocking states
  const [beyondUnlocked, setBeyondUnlocked] = useState(() => localStorage.getItem('beyond_unlocked') === 'true');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const logoClicksRef = useRef({ count: 0, timer: 0 });

  const getHomePath = () => {
    if (isCinema) return '/cinema';
    if (isMusic) return '/music';
    if (isBeyond) return '/beyond';
    if (routeProvider) return `/${routeProvider}`;

    if (isAnimeKaiGlobally) return '/animekai';
    return '/anime';
  };

  const getLogoKanji = () => {
    if (isCinema) return '映';
    if (isMusic) return '音';
    if (isBeyond) return '過';
    return '霊';
  };

  const navItems = [
    { id: 'home', path: getHomePath(), icon: Home },
    { 
      id: isMusic ? 'download' : 'schedule', 
      path: isMusic ? '#download' : (isCinema ? '/schedule?type=cinema' : '/schedule'), 
      icon: isMusic ? Download : Calendar 
    },
    { id: 'search', path: '#search', icon: Search },
    ...(!isMusic && !isBeyond ? [{ id: 'mylist', path: isCinema ? '/mylist?type=cinema' : '/mylist', icon: Bookmark }] : []),
    { id: 'switch', path: '#switch', icon: ArrowRightLeft },
  ];

  const activeTab = searchOpen 
    ? 'search' 
    : switchOpen
    ? 'switch'
    : navItems.find(item => location.pathname === item.path)?.id || 'home';

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
    setSuggestion('');
    setAnimeResults([]);
    setCinemaResults([]);
    setBeyondResults([]);
    setMusicResults([]);
  };

  const handleSearchClick = () => {
    if (switchOpen) setSwitchOpen(false);
    if (searchOpen) {
      closeSearch();
    } else {
      setSearchOpen(true);
      // Set initial filter based on current context
      if (isCinema) setSearchFilter('cinema');
      else if (isMusic) setSearchFilter('all');
      else if (isBeyond) setSearchFilter('all');
      else setSearchFilter('anime');
      
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  // Auto-dismiss secret toast
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Direct shortcut 'h' / 'H' to instantly activate and open/close Portal
      if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        if (e.key === 'h' || e.key === 'H') {
          e.preventDefault();
          if (location.pathname.startsWith('/beyond')) {
            navigate('/');
            setToastMsg('Portal Closed');
            setShowToast(true);
          } else {
            localStorage.setItem('beyond_unlocked', 'true');
            setBeyondUnlocked(true);
            setToastMsg('Entering Portal...');
            setShowToast(true);
            navigate('/beyond');
          }
          return;
        }
      }

      if (e.key === '/' && !searchOpen && !switchOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      } else if (e.key === '/' && searchOpen) {
        e.preventDefault();
        closeSearch();
      } else if ((e.key === 's' || e.key === 'S') && !searchOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setSwitchOpen(!switchOpen);
      } else if (e.key === 'Escape') {
        closeSearch();
        setSwitchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, switchOpen, beyondUnlocked, location.pathname, navigate]);

  const handleLogoClick = () => {
    const now = Date.now();
    const clicks = logoClicksRef.current;
    if (now - clicks.timer > 3000) {
      clicks.count = 1;
    } else {
      clicks.count += 1;
    }
    clicks.timer = now;

    if (clicks.count >= 5) {
      const newState = !beyondUnlocked;
      localStorage.setItem('beyond_unlocked', String(newState));
      setBeyondUnlocked(newState);
      setToastMsg(newState ? 'Interface Unlocked' : 'Interface Hidden');
      setShowToast(true);
      clicks.count = 0;
    }
  };

  const handleSwitchClick = () => {
    if (searchOpen) closeSearch();
    setSwitchOpen(!switchOpen);
  };

  // Fast suggestion typeahead (150ms) — fetches first result for ghost text
  useEffect(() => {
    let active = true;
    let localTimer: ReturnType<typeof setTimeout> | null = null;
    
    if (suggestionDebounceRef.current) clearTimeout(suggestionDebounceRef.current);

    if (!query.trim() || query.length < 2) {
      localTimer = setTimeout(() => {
        if (active) setSuggestion('');
      }, 0);
    } else if (!isMusic) {
      // Music already does a full search — skip the suggestion call to avoid double-fetching
      suggestionDebounceRef.current = setTimeout(async () => {
        try {
          let topName = '';
          if (isBeyond) {
            const data = await beyondApi.search(query).catch(() => []);
            topName = data[0]?.title || '';
          } else if (isCinema) {
            const data = await cinemaApi.search(query).catch(() => []);
            topName = data[0]?.title || '';
          } else {
            const data = await animeApi.search(query, 1).catch(() => ({ animes: [] }));
            topName = data.animes?.[0]?.name || '';
          }
          if (!active) return;
          // Only show suggestion if the top result starts with the user's query (case-insensitive)
          if (topName && topName.toLowerCase().startsWith(query.toLowerCase())) {
            setSuggestion(topName);
          } else {
            setSuggestion('');
          }
        } catch {
          if (active) setSuggestion('');
        }
      }, 150);
    }

    return () => {
      active = false;
      if (localTimer) clearTimeout(localTimer);
    };
  }, [query, isMusic, isBeyond, isCinema]);

  // Full results fetch (400ms debounce)
  useEffect(() => {
    let active = true;
    let localTimer: ReturnType<typeof setTimeout> | null = null;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    if (!query.trim()) {
      localTimer = setTimeout(() => {
        if (active) {
          setAnimeResults([]);
          setCinemaResults([]);
          setBeyondResults([]);
          setSuggestion('');
        }
      }, 0);
    } else {
      debounceRef.current = setTimeout(async () => {
        if (active) setSearching(true);
        try {
          const promises: Promise<Track[] | SearchResult | BeyondVideo[] | CinemaMovie[]>[] = [];
          
          // Context-aware API calls
          if (isMusic) {
            promises.push(musicApi.search(query).catch(() => []));
            promises.push(Promise.resolve({ animes: [], totalPages: 0, currentPage: 1 }));
            promises.push(Promise.resolve([]));
            promises.push(Promise.resolve([]));
          } else if (isBeyond) {
            promises.push(Promise.resolve([]));
            promises.push(Promise.resolve({ animes: [], totalPages: 0, currentPage: 1 }));
            promises.push(beyondApi.search(query).catch(() => []));
            promises.push(Promise.resolve([]));
          } else if (isCinema) {
            promises.push(Promise.resolve([]));
            promises.push(Promise.resolve({ animes: [], totalPages: 0, currentPage: 1 }));
            promises.push(Promise.resolve([]));
            promises.push(cinemaApi.search(query).catch(() => []));
          } else {
            promises.push(Promise.resolve([]));
            promises.push(animeApi.search(query, 1).catch(() => ({ animes: [], totalPages: 0, currentPage: 1 })));
            promises.push(Promise.resolve([]));
            promises.push(cinemaApi.search(query).catch(() => []));
          }

          const [musicData, animeData, beyondData, cinemaData] = await Promise.all(promises);
          if (!active) return;

          const queryLower = query.toLowerCase();
          const aData = animeData as SearchResult & { suggestion?: string };
          
          // Handle "Did you mean?" from API
          setDidYouMean(aData?.suggestion || '');
          
          // Final sanity filter on frontend to catch any backend leaks
          setAnimeResults(aData.animes?.slice(0, 4) ?? []);
          
          // Cinema results often contain noise (trending) if search is broad, filter it strictly
          setCinemaResults(
            (cinemaData as CinemaMovie[])
              .filter(item => (item.title || '').toLowerCase().includes(queryLower))
              .slice(0, 4)
          );
          
          setBeyondResults(
            (beyondData as BeyondVideo[])
              .filter(item => (item.title || '').toLowerCase().includes(queryLower))
              .slice(0, 4)
          );
          
          setMusicResults(
            (musicData as Track[])
              .filter(item => (item.name || '').toLowerCase().includes(queryLower))
              .slice(0, 6)
          );
        } catch (err) {
          console.error('Search error:', err);
        } finally {
          if (active) setSearching(false);
        }
      }, 400);
    }

    return () => {
      active = false;
      if (localTimer) clearTimeout(localTimer);
    };
  }, [query, beyondUnlocked, isBeyond, isCinema, isMusic]);

  return (
    <>
      <div className={styles.navbarContainer}>
        <div className={`${styles.logoCapsule} glass`} onClick={() => { closeSearch(); setSwitchOpen(false); handleLogoClick(); }} style={{ cursor: 'pointer' }}>
          <span className={styles.logoKanji}>{getLogoKanji()}</span>
        </div>

        <nav className={`${styles.navCapsule} glass`}>
          {navItems.map((item) => {
            if (item.id === 'download') {
              return (
                <button
                  key={item.id}
                  className={`${styles.navItem} ${activeTab === item.id ? styles.activeText : ''}`}
                  onClick={() => setDownloadModalOpen(true)}
                >
                  {activeTab === item.id && (
                    <motion.div layoutId="navIndicator" className={styles.activeIndicator} transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
                  )}
                  <item.icon size={22} strokeWidth={2} style={{ position: 'relative', zIndex: 1 }} />
                </button>
              );
            }
            if (item.id === 'search') {
              return (
                <button
                  key={item.id}
                  className={`${styles.navItem} ${activeTab === item.id ? styles.activeText : ''}`}
                  onClick={handleSearchClick}
                >
                  {activeTab === item.id && (
                    <motion.div layoutId="navIndicator" className={styles.activeIndicator} transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
                  )}
                  <item.icon size={22} strokeWidth={2} style={{ position: 'relative', zIndex: 1 }} />
                </button>
              );
            }
            if (item.id === 'switch') {
              return (
                <button
                  key={item.id}
                  className={`${styles.navItem} ${activeTab === item.id ? styles.activeText : ''}`}
                  onClick={handleSwitchClick}
                >
                  {activeTab === item.id && (
                    <motion.div layoutId="navIndicator" className={styles.activeIndicator} transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
                  )}
                  <item.icon size={22} strokeWidth={2} style={{ position: 'relative', zIndex: 1 }} />
                </button>
              );
            }
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`${styles.navItem} ${activeTab === item.id ? styles.activeText : ''}`}
                onClick={() => { closeSearch(); setSwitchOpen(false); }}
              >
                {activeTab === item.id && (
                  <motion.div layoutId="navIndicator" className={styles.activeIndicator} transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
                )}
                <item.icon size={22} strokeWidth={2} style={{ position: 'relative', zIndex: 1 }} />
              </Link>
            );
          })}
        </nav>

        <div className={`${styles.accountCapsule} glass`}>
          <button className={styles.accountBtn} onClick={() => setAboutOpen(true)}>
            <User size={22} strokeWidth={2} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {(searchOpen || switchOpen) && (
          <motion.div
            key="backdrop"
            className={styles.searchBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { closeSearch(); setSwitchOpen(false); }}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {switchOpen && (
          <motion.div
            key="switch-overlay"
            className={`${styles.switchOverlay} glass`}
            initial={{ opacity: 0, y: '-40%', x: '-50%' }}
            animate={{ opacity: 1, y: '-50%', x: '-50%' }}
            exit={{ opacity: 0, y: '-40%', x: '-50%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className={styles.switchHeader}>
              <div>
                <h3>SELECT INTERFACE</h3>
                <div style={{ fontSize: '0.6rem', color: 'rgba(220, 201, 169, 0.3)', marginTop: '0.2rem', fontWeight: 700 }}>PRESS 'S' TO TOGGLE</div>
              </div>
              <button className={styles.closeBtn} onClick={() => setSwitchOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className={styles.switchOptions}>
              <button 
                className={`${styles.switchBtn} ${(!isCinema && !isMusic && !isBeyond) ? styles.activeInterface : ''}`} 
                onClick={() => { navigate('/'); setSwitchOpen(false); }}
              >
                <div className={styles.interfaceIcon}>霊</div>
                <div className={styles.interfaceInfo}>
                  <h4>ANIME REIATSU</h4>
                  <p>{(!isCinema && !isMusic && !isBeyond) ? 'Current Interface' : 'Switch to Anime'}</p>
                </div>
              </button>
              <button 
                className={`${styles.switchBtn} ${isCinema ? styles.activeInterface : ''}`} 
                onClick={() => { navigate('/cinema'); setSwitchOpen(false); }}
              >
                <div className={styles.interfaceIcon}>映</div>
                <div className={styles.interfaceInfo}>
                  <h4>CINEMA</h4>
                  <p>{isCinema ? 'Current Interface' : 'Switch to Movies'}</p>
                </div>
              </button>
              <button 
                className={`${styles.switchBtn} ${isMusic ? styles.activeInterface : ''}`} 
                onClick={() => { navigate('/music'); setSwitchOpen(false); }}
              >
                <div className={styles.interfaceIcon}>音</div>
                <div className={styles.interfaceInfo}>
                  <h4>HIFI MUSIC</h4>
                  <p>{isMusic ? 'Current Interface' : 'Switch to Music'}</p>
                </div>
              </button>

              {beyondUnlocked && (
                <button 
                  className={`${styles.switchBtn} ${isBeyond ? styles.activeInterface : ''}`} 
                  onClick={() => { navigate('/beyond'); setSwitchOpen(false); }}
                  style={{
                    border: isBeyond ? '1px solid rgba(0, 245, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div className={styles.interfaceIcon} style={{ background: 'linear-gradient(135deg, #2c3e50, #000000)', color: '#fff' }}>過</div>
                  <div className={styles.interfaceInfo}>
                    <h4>THE BEYOND</h4>
                    <p>{isBeyond ? 'Current Interface' : 'Switch to Beyond'}</p>
                  </div>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            key="search-overlay"
            className={styles.searchOverlay}
            initial={{ opacity: 0, scale: 0.95, y: -20, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, y: -20, x: '-50%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className={styles.searchBar}>
              <Search size={24} className={styles.searchIcon} />
              <div className={styles.searchInputWrapper}>
                {/* Ghost text layer — sits behind the real input */}
                {suggestion && query && (
                  <div className={styles.ghostText} aria-hidden="true">
                    <span style={{ visibility: 'hidden' }}>{query}</span>
                    <span className={styles.ghostCompletion}>{suggestion.slice(query.length)}</span>
                  </div>
                )}
                <input
                  ref={inputRef}
                  className={styles.searchInput}
                  placeholder="Search..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    // Clear suggestion if user deletes text
                    if (e.target.value.length < query.length) setSuggestion('');
                  }}
                  onKeyDown={(e) => {
                    // Tab or ArrowRight accepts the ghost suggestion
                    if ((e.key === 'Tab' || e.key === 'ArrowRight') && suggestion && query) {
                      e.preventDefault();
                      setQuery(suggestion);
                      setSuggestion('');
                      return;
                    }
                    if (e.key === 'Enter' && query.trim()) {
                      if (isMusic) {
                        navigate(`/music/search?q=${encodeURIComponent(query.trim())}`);
                        closeSearch();
                      } else if (!isBeyond) {
                        navigate(`/search?q=${encodeURIComponent(query.trim())}&type=${searchFilter}`);
                        closeSearch();
                      }
                    }
                  }}
                />
              </div>
              {suggestion && query ? (
                <div className={styles.tabHint}>
                  <span className={styles.keyBadge}>TAB</span>
                  <span>to complete</span>
                </div>
              ) : (
                <div className={styles.keyBadge} style={{ opacity: query ? 0 : 0.5, fontSize: '0.6rem', padding: '0.2rem 0.5rem' }}>ESC TO CLOSE</div>
              )}
                <button className={styles.closeBtn} onClick={closeSearch}>
                  <X size={20} />
                </button>
              </div>

              {!isMusic && !isBeyond && (
                <div className={styles.searchToggles}>
                  {(['all', 'anime', 'cinema'] as const).map((filter) => (
                    <button
                      key={filter}
                      className={`${styles.toggleBtn} ${searchFilter === filter ? styles.activeToggle : ''}`}
                      onClick={() => setSearchFilter(filter)}
                    >
                      {searchFilter === filter && (
                        <motion.div 
                          layoutId="searchFilterIndicator" 
                          className={styles.toggleIndicator}
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span className={styles.toggleText}>{filter.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              )}

            {(animeResults.length > 0 || cinemaResults.length > 0 || beyondResults.length > 0 || musicResults.length > 0 || searching || didYouMean) ? (
              <div className={styles.searchResults}>
                {searching && (
                  <div className={styles.searchHint}>Searching for "{query}"...</div>
                )}

                {didYouMean && !searching && animeResults.length === 0 && (
                  <div className={styles.didYouMean}>
                    Did you mean <button onClick={() => setQuery(didYouMean)}>{didYouMean}</button>?
                  </div>
                )}

                {isMusic ? (
                  <>
                    {musicResults.length > 0 && (
                      <div className={styles.searchSection}>
                        <div className={styles.sectionLabel}>Music Results</div>
                        {musicResults.map((item) => (
                          <div 
                            key={item.id + 'music'} 
                            className={styles.resultItem}
                            onClick={() => {
                              closeSearch();
                              playTrack(item, musicResults);
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            {item.poster && (
                              <SmartImage src={item.poster} alt={item.name} className={styles.resultThumb} />
                            )}
                            <div className={styles.resultInfo}>
                              <span className={styles.resultName}>{item.name}</span>
                              <div className={styles.resultMetaWrapper}>
                                <span className={styles.resultMeta}>{item.artist}</span>
                              </div>
                            </div>
                            <div className={styles.keyboardHint}>
                              <span>Play</span>
                              <span className={styles.keyBadge}>↵</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : isBeyond ? (
                  <div className={styles.searchSection}>
                    <div className={styles.sectionLabel}>Beyond Results</div>
                    {beyondResults.length > 0 ? beyondResults.map((item) => (
                      <div 
                        key={item.id + 'beyond'} 
                        className={styles.resultItem}
                        onClick={() => {
                          closeSearch();
                          navigate(`/beyond/watch/${item.id}`);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        {item.thumbnail && (
                          <SmartImage src={item.thumbnail} alt={item.title} className={styles.resultThumb} />
                        )}
                        <div className={styles.resultInfo}>
                          <span className={styles.resultName}>{item.title}</span>
                          <div className={styles.resultMetaWrapper}>
                            <span className={styles.resultMeta}>BEYOND</span>
                          </div>
                        </div>
                      </div>
                    )) : <div className={styles.searchHint}>No results in Beyond</div>}
                  </div>
                ) : (
                  <>
                    {(searchFilter === 'all' || searchFilter === 'anime') && animeResults.length > 0 && (
                      <div className={styles.searchSection}>
                        <div className={styles.sectionLabel}>Anime Results</div>
                        {animeResults.map((item) => {
                          return (
                            <Link 
                              key={`anime-${item.id}`} 
                              to={routeProvider ? `/${routeProvider}/anime/${item.id}` : `/anime/${item.id}`}
                              className={styles.resultItem}
                              onClick={closeSearch}
                            >
                              {item.poster && (
                                <SmartImage src={item.poster} alt={item.name} className={styles.resultThumb} />
                              )}
                              <div className={styles.resultInfo}>
                                <span className={styles.resultName}>{item.name}</span>
                                <div className={styles.resultMetaWrapper}>
                                  <span className={styles.resultMeta}>{item.type ?? 'Anime'}</span>
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
 
                    {(searchFilter === 'all' || searchFilter === 'cinema') && cinemaResults.length > 0 && (
                      <div className={styles.searchSection} style={{ borderTop: (searchFilter === 'all' && animeResults.length > 0) ? '1px solid rgba(220, 201, 169, 0.1)' : 'none' }}>
                        <div className={styles.sectionLabel} style={{ opacity: 0.6 }}>Cinema Results</div>
                        {cinemaResults.map((item) => (
                          <Link 
                            key={item.id + 'cinema'} 
                            to={`/cinema/details/${item.id}?type=${item.mediaType}`} 
                            className={styles.resultItem}
                            onClick={closeSearch}
                          >
                            {item.imageUrl && (
                              <SmartImage src={item.imageUrl} alt={item.title} className={styles.resultThumb} />
                            )}
                            <div className={styles.resultInfo}>
                              <span className={styles.resultName}>{item.title}</span>
                              <div className={styles.resultMetaWrapper}>
                                <span className={styles.resultMeta}>{item.mediaType}</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : query && !searching ? (
              <div className={styles.searchResults}>
                <div className={styles.emptyState}>
                  <Search size={48} className={styles.emptyIcon} />
                  <span className={styles.emptyText}>No results found for "{query}"</span>
                </div>
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showToast && (
          <motion.div
            className={styles.secretToast}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          >
            <span className={styles.secretToastIcon}>
              {toastMsg.includes('Closed') || toastMsg.includes('Hidden') ? <Lock size={16} /> : <Sparkles size={16} />}
            </span>
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>
      <MusicDownloadModal 
        isOpen={downloadModalOpen} 
        onClose={() => setDownloadModalOpen(false)} 
      />
      <AboutMe 
        isOpen={aboutOpen} 
        onClose={() => setAboutOpen(false)} 
      />
    </>
  );
};

export default Navbar;
