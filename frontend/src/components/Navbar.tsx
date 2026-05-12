import { useState, useRef, useEffect } from 'react';
import { Home, Search, Calendar, ArrowRightLeft, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { animeApi } from '../services/animeApi';
import { cinemaApi } from '../services/cinemaApi';
import type { AnimeCard } from '../services/animeApi';
import SmartImage from './SmartImage';
import styles from './Navbar.module.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isCinema = location.pathname.startsWith('/cinema');

  const [searchOpen, setSearchOpen] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [animeResults, setAnimeResults] = useState<any[]>([]);
  const [cinemaResults, setCinemaResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navItems = [
    { id: 'home', path: isCinema ? '/cinema' : '/', icon: Home },
    { id: 'schedule', path: '/schedule', icon: Calendar },
    { id: 'search', path: '#search', icon: Search },
    { id: 'switch', path: '#switch', icon: ArrowRightLeft },
  ];

  const activeTab = searchOpen 
    ? 'search' 
    : switchOpen
    ? 'switch'
    : navItems.find(item => location.pathname === item.path)?.id || 'home';

  const handleSearchClick = () => {
    if (switchOpen) setSwitchOpen(false);
    if (searchOpen) {
      closeSearch();
    } else {
      setSearchOpen(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [searchOpen, switchOpen]);

  const handleSwitchClick = () => {
    if (searchOpen) closeSearch();
    setSwitchOpen(!switchOpen);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setQuery('');
    setAnimeResults([]);
    setCinemaResults([]);
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    if (!query.trim()) {
      setAnimeResults([]);
      setCinemaResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const [animeData, cinemaData] = await Promise.all([
          animeApi.search(query).catch(() => ({ animes: [] })),
          cinemaApi.search(query).catch(() => [])
        ]);

        setAnimeResults((animeData as { animes: AnimeCard[] }).animes?.slice(0, 4) ?? []);
        setCinemaResults(cinemaData.slice(0, 4));
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, [query]);

  return (
    <>
      <div className={styles.navbarContainer}>
        <Link to={isCinema ? "/cinema" : "/"} className={styles.logoCapsule} onClick={() => { closeSearch(); setSwitchOpen(false); }}>
          <span className={styles.logoKanji}>{isCinema ? '映' : '霊'}</span>
        </Link>

        <nav className={styles.navCapsule}>
          {navItems.map((item) => {
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

        <div className={styles.accountCapsule}>
          <button className={styles.accountBtn}>
            <User size={22} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Overlays Backdrop */}
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
      
      {/* Switch Overlay */}
      <AnimatePresence>
        {switchOpen && (
          <motion.div
            key="switch-overlay"
            className={styles.switchOverlay}
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
                className={`${styles.switchBtn} ${location.pathname !== '/cinema' ? styles.activeInterface : ''}`} 
                onClick={() => { navigate('/'); setSwitchOpen(false); }}
              >
                <div className={styles.interfaceIcon}>霊</div>
                <div className={styles.interfaceInfo}>
                  <h4>ANIME REIATSU</h4>
                  <p>{location.pathname !== '/cinema' ? 'Current Interface' : 'Switch to Anime'}</p>
                </div>
              </button>
              <button 
                className={`${styles.switchBtn} ${location.pathname === '/cinema' ? styles.activeInterface : ''}`} 
                onClick={() => { navigate('/cinema'); setSwitchOpen(false); }}
              >
                <div className={styles.interfaceIcon}>映</div>
                <div className={styles.interfaceInfo}>
                  <h4>CINEMA</h4>
                  <p>{location.pathname === '/cinema' ? 'Current Interface' : 'Switch to Movies'}</p>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Overlay (Command Palette) */}
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

            {(animeResults.length > 0 || cinemaResults.length > 0 || searching) ? (
              <div className={styles.searchResults}>
                {searching && (
                  <div className={styles.searchHint}>Searching for "{query}"...</div>
                )}
                
                {/* Primary Section Results */}
                {isCinema ? (
                  <>
                    {cinemaResults.length > 0 && (
                      <div className={styles.searchSection}>
                        <div className={styles.sectionLabel}>Cinema Results</div>
                        {cinemaResults.map((item) => {
                          const releaseYear = item.releaseDate ? item.releaseDate.split('-')[0] : '';
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
                                  {releaseYear && <span className={styles.resultYear}>{releaseYear}</span>}
                                </div>
                              </div>
                              <div className={styles.keyboardHint}>
                                <span>Open</span>
                                <span className={styles.keyBadge}>↵</span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                    
                    {animeResults.length > 0 && (
                      <div className={styles.searchSection} style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
                        <div className={styles.sectionLabel} style={{ opacity: 0.5 }}>From the Anime Section</div>
                        {animeResults.map((item) => (
                          <Link 
                            key={item.id + 'anime'} 
                            to={`/anime/${item.id}`} 
                            className={styles.resultItem}
                            onClick={closeSearch}
                            style={{ opacity: 0.7 }}
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
                            <div className={styles.keyboardHint}>
                              <span>Open</span>
                              <span className={styles.keyBadge}>↵</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {cinemaResults.length > 0 && (
                      <div className={styles.searchSection} style={{ background: 'rgba(255, 255, 255, 0.01)' }}>
                        <div className={styles.sectionLabel} style={{ opacity: 0.5 }}>From the Cinema Section</div>
                        {cinemaResults.map((item) => {
                          const releaseYear = item.releaseDate ? item.releaseDate.split('-')[0] : '';
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
                                <div className={styles.resultMetaWrapper}>
                                  <span className={styles.resultMeta}>{item.mediaType}</span>
                                  {releaseYear && <span className={styles.resultYear}>{releaseYear}</span>}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
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
    </>
  );
};

export default Navbar;
