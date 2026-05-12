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
  const [results, setResults] = useState<any[]>([]);
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
    setResults([]);
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    if (!query.trim()) {
      setTimeout(() => setResults([]), 0);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        if (isCinema) {
          const data = await cinemaApi.search(query);
          setResults(data.slice(0, 8));
        } else {
          const data = await animeApi.search(query);
          setResults((data as { animes: AnimeCard[] }).animes?.slice(0, 6) ?? []);
        }
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, [query, isCinema]);

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
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            transition={{ duration: 0.25 }}
          >
            <div className={styles.switchHeader}>
              <h3>SELECT INTERFACE</h3>
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

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            key="overlay"
            className={styles.searchOverlay}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
          >
            <div className={styles.searchBar}>
              <Search size={20} className={styles.searchIcon} />
              <input
                ref={inputRef}
                className={styles.searchInput}
                placeholder={isCinema ? "Search movies & series..." : "Search anime..."}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className={styles.closeBtn} onClick={closeSearch}>
                <X size={20} />
              </button>
            </div>

            {(results.length > 0 || searching) && (
              <div className={styles.searchResults}>
                {searching && <div className={styles.searchHint}>Searching...</div>}
                {results.map((item) => {
                  const isCinemaItem = 'title' in item;
                  const id = item.id;
                  const name = isCinemaItem ? item.title : item.name;
                  const poster = isCinemaItem ? item.imageUrl : item.poster;
                  const type = isCinemaItem ? item.mediaType : (item.type ?? 'Anime');
                  const releaseYear = isCinemaItem && item.releaseDate ? item.releaseDate.split('-')[0] : '';
                  const link = isCinemaItem 
                    ? `/cinema/watch/${id}?type=${item.mediaType}`
                    : `/anime/${id}`;

                  return (
                    <Link 
                      key={id + (isCinemaItem ? 'cinema' : 'anime')} 
                      to={link} 
                      className={styles.resultItem}
                      onClick={closeSearch}
                    >
                      {poster && (
                        <SmartImage src={poster} alt={name} className={styles.resultThumb} />
                      )}
                      <div className={styles.resultInfo}>
                        <span className={styles.resultName}>{name}</span>
                        <div className={styles.resultMetaWrapper} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className={styles.resultMeta} style={{ textTransform: 'uppercase' }}>{type}</span>
                          {releaseYear && <span className={styles.resultYear} style={{ opacity: 0.5, fontSize: '0.85em' }}>{releaseYear}</span>}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {!searching && query && results.length === 0 && (
              <div className={styles.searchHint}>No results for "{query}"</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
