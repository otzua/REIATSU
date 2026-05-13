import { useState, useEffect, useRef } from 'react';
import { Home, Search, Calendar, ArrowRightLeft, User, X, Lock, Sparkles, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { animeApi } from '../services/animeApi';
import { cinemaApi } from '../services/cinemaApi';
import { beyondApi } from '../services/beyondApi';
import { musicApi } from '../services/musicApi';
import type { AnimeCard } from '../services/animeApi';
import SmartImage from './SmartImage';
import styles from './Navbar.module.css';
import { useMusic } from '../context/MusicContext';
import MusicDownloadModal from './MusicDownloadModal';

const Navbar = () => {
  const { playTrack } = useMusic();
  const location = useLocation();
  const navigate = useNavigate();
  const isCinema = location.pathname.startsWith('/cinema');
  const isMusic = location.pathname.startsWith('/music');
  const isBeyond = location.pathname.startsWith('/beyond');

  const [searchOpen, setSearchOpen] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [animeResults, setAnimeResults] = useState<any[]>([]);
  const [cinemaResults, setCinemaResults] = useState<any[]>([]);
  const [beyondResults, setBeyondResults] = useState<any[]>([]);
  const [musicResults, setMusicResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Secret portal unlocking states
  const [beyondUnlocked, setBeyondUnlocked] = useState(() => localStorage.getItem('beyond_unlocked') === 'true');
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const logoClicksRef = useRef({ count: 0, timer: 0 });

  const getHomePath = () => {
    if (isCinema) return '/cinema';
    if (isMusic) return '/music';
    if (isBeyond) return '/beyond';
    return '/';
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
      path: isMusic ? '#download' : '/schedule', 
      icon: isMusic ? Download : Calendar 
    },
    { id: 'search', path: '#search', icon: Search },
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

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    if (!query.trim()) {
      setAnimeResults([]);
      setCinemaResults([]);
      setBeyondResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const [animeData, cinemaData, beyondData, musicData] = await Promise.all([
          animeApi.search(query).catch(() => ({ animes: [] })),
          cinemaApi.search(query).catch(() => []),
          beyondUnlocked ? beyondApi.search(query).catch(() => []) : Promise.resolve([]),
          musicApi.search(query).catch(() => [])
        ]);

        setAnimeResults((animeData as { animes: AnimeCard[] }).animes?.slice(0, 4) ?? []);
        setCinemaResults(cinemaData.slice(0, 4));
        setBeyondResults(beyondData.slice(0, 4));
        setMusicResults(musicData.slice(0, 6));
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, [query, beyondUnlocked]);

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
          <button className={styles.accountBtn}>
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
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
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
                className={`${styles.switchBtn} ${(!location.pathname.startsWith('/cinema') && !location.pathname.startsWith('/music') && !location.pathname.startsWith('/beyond')) ? styles.activeInterface : ''}`} 
                onClick={() => { navigate('/'); setSwitchOpen(false); }}
              >
                <div className={styles.interfaceIcon}>霊</div>
                <div className={styles.interfaceInfo}>
                  <h4>ANIME REIATSU</h4>
                  <p>{(!location.pathname.startsWith('/cinema') && !location.pathname.startsWith('/music') && !location.pathname.startsWith('/beyond')) ? 'Current Interface' : 'Switch to Anime'}</p>
                </div>
              </button>
              <button 
                className={`${styles.switchBtn} ${location.pathname.startsWith('/cinema') ? styles.activeInterface : ''}`} 
                onClick={() => { navigate('/cinema'); setSwitchOpen(false); }}
              >
                <div className={styles.interfaceIcon}>映</div>
                <div className={styles.interfaceInfo}>
                  <h4>CINEMA</h4>
                  <p>{location.pathname.startsWith('/cinema') ? 'Current Interface' : 'Switch to Movies'}</p>
                </div>
              </button>
              <button 
                className={`${styles.switchBtn} ${location.pathname.startsWith('/music') ? styles.activeInterface : ''}`} 
                onClick={() => { navigate('/music'); setSwitchOpen(false); }}
              >
                <div className={styles.interfaceIcon}>音</div>
                <div className={styles.interfaceInfo}>
                  <h4>HIFI MUSIC</h4>
                  <p>{location.pathname.startsWith('/music') ? 'Current Interface' : 'Switch to Music'}</p>
                </div>
              </button>
              {beyondUnlocked && (
                <button 
                  className={`${styles.switchBtn} ${location.pathname.startsWith('/beyond') ? styles.activeInterface : ''}`} 
                  onClick={() => { navigate('/beyond'); setSwitchOpen(false); }}
                  style={{
                    border: location.pathname.startsWith('/beyond') ? '1px solid rgba(0, 245, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div className={styles.interfaceIcon} style={{ background: 'linear-gradient(135deg, #2c3e50, #000000)', color: '#fff' }}>過</div>
                  <div className={styles.interfaceInfo}>
                    <h4>THE BEYOND</h4>
                    <p>{location.pathname.startsWith('/beyond') ? 'Current Interface' : 'Switch to Beyond'}</p>
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
            className={`${styles.searchOverlay} glass`}
            initial={{ opacity: 0, scale: 0.95, y: -20, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, y: -20, x: '-50%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className={styles.searchBar}>
              <Search size={24} className={styles.searchIcon} />
              <input
                ref={inputRef}
                className={styles.searchInput}
                placeholder="Search everything..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className={styles.keyBadge} style={{ opacity: query ? 0 : 0.5, fontSize: '0.6rem', padding: '0.2rem 0.5rem' }}>ESC TO CLOSE</div>
              <button className={styles.closeBtn} onClick={closeSearch}>
                <X size={20} />
              </button>
            </div>

            {(animeResults.length > 0 || cinemaResults.length > 0 || beyondResults.length > 0 || musicResults.length > 0 || searching) ? (
              <div className={styles.searchResults}>
                {searching && (
                  <div className={styles.searchHint}>Searching for "{query}"...</div>
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
                  <>
                    {beyondResults.length > 0 && (
                      <div className={styles.searchSection}>
                        <div className={styles.sectionLabel}>Beyond Results</div>
                        {beyondResults.map((item) => (
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
                            <div className={styles.keyboardHint}>
                              <span>Open</span>
                              <span className={styles.keyBadge}>↵</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : isCinema ? (
                  <>
                    {cinemaResults.length > 0 && (
                      <div className={styles.searchSection}>
                        <div className={styles.sectionLabel}>Cinema Results</div>
                        {cinemaResults.map((item) => {
                          return (
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
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {animeResults.length > 0 && (
                      <div className={styles.searchSection}>
                        <div className={styles.sectionLabel}>Anime Results</div>
                        {animeResults.map((item) => (
                          <Link 
                            key={item.id + 'anime'} 
                            to={`/anime/${item.id}`} 
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
                        ))}
                      </div>
                    )}

                    {cinemaResults.length > 0 && (
                      <div className={styles.searchSection} style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
                        <div className={styles.sectionLabel} style={{ opacity: 0.5 }}>From Cinema</div>
                        {cinemaResults.map((item) => {
                          return (
                            <Link 
                              key={item.id + 'cinema'} 
                              to={`/cinema/details/${item.id}?type=${item.mediaType}`} 
                              className={styles.resultItem}
                              onClick={closeSearch}
                              style={{ opacity: 0.7 }}
                            >
                              {item.imageUrl && (
                                <SmartImage src={item.imageUrl} alt={item.title} className={styles.resultThumb} />
                              )}
                              <div className={styles.resultInfo}>
                                <span className={styles.resultName}>{item.title}</span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}

                    {beyondUnlocked && beyondResults.length > 0 && (
                      <div className={styles.searchSection} style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
                        <div className={styles.sectionLabel} style={{ opacity: 0.5 }}>From Beyond</div>
                        {beyondResults.map((item) => (
                          <div 
                            key={item.id + 'beyond'} 
                            className={styles.resultItem}
                            onClick={() => {
                              closeSearch();
                              navigate(`/beyond/watch/${item.id}`);
                            }}
                            style={{ cursor: 'pointer', opacity: 0.7 }}
                          >
                            {item.thumbnail && (
                              <SmartImage src={item.thumbnail} alt={item.title} className={styles.resultThumb} />
                            )}
                            <div className={styles.resultInfo}>
                              <span className={styles.resultName}>{item.title}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {musicResults.length > 0 && (
                      <div className={styles.searchSection} style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
                        <div className={styles.sectionLabel} style={{ opacity: 0.5 }}>From Music</div>
                        {musicResults.map((item) => (
                          <div 
                            key={item.id + 'music-alt'} 
                            className={styles.resultItem}
                            onClick={() => {
                              closeSearch();
                              playTrack(item, musicResults);
                            }}
                            style={{ cursor: 'pointer', opacity: 0.7 }}
                          >
                            {item.poster && (
                              <SmartImage src={item.poster} alt={item.name} className={styles.resultThumb} />
                            )}
                            <div className={styles.resultInfo}>
                              <span className={styles.resultName}>{item.name}</span>
                              <span className={styles.resultMeta} style={{ fontSize: '0.7rem', opacity: 0.5 }}>{item.artist}</span>
                            </div>
                          </div>
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
    </>
  );
};

export default Navbar;
