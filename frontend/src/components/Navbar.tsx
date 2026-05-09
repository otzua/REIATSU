import { useState, useRef, useEffect } from 'react';
import { Home, Search, Compass, Bookmark, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { animeApi } from '../services/animeApi';
import type { AnimeCard } from '../services/animeApi';
import styles from './Navbar.module.css';

const Navbar = () => {
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AnimeCard[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navItems = [
    { id: 'home', path: '/', icon: Home },
    { id: 'browse', path: '/explore', icon: Compass },
    { id: 'search', path: '#search', icon: Search },
    { id: 'list', path: '/watchlist', icon: Bookmark },
  ];

  const activeTab = searchOpen 
    ? 'search' 
    : navItems.find(item => location.pathname === item.path)?.id || 'home';

  const handleSearchClick = () => {
    if (searchOpen) {
      closeSearch();
    } else {
      setSearchOpen(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
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
        const data = await animeApi.search(query);
        setResults((data as { animes: AnimeCard[] }).animes?.slice(0, 6) ?? []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, [query]);

  return (
    <>
      <div className={styles.navbarContainer}>
        <Link to="/" className={styles.logoCapsule} onClick={closeSearch}>
          <span className={styles.logoKanji}>霊</span>
        </Link>

        <nav className={styles.navCapsule}>
          {navItems.map((item) => item.id !== 'search' ? (
            <Link
              key={item.id}
              to={item.path}
              className={`${styles.navItem} ${activeTab === item.id ? styles.activeText : ''}`}
              onClick={closeSearch}
            >
              {activeTab === item.id && (
                <motion.div layoutId="navIndicator" className={styles.activeIndicator} transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
              )}
              <item.icon size={22} strokeWidth={2} style={{ position: 'relative', zIndex: 1 }} />
            </Link>
          ) : (
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
          ))}
        </nav>

        <div className={styles.accountCapsule}>
          <button className={styles.accountBtn}>
            <User size={22} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Search Overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            key="backdrop"
            className={styles.searchBackdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
          />
        )}
      </AnimatePresence>
      
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
                placeholder="Search anime..."
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
                {results.map((anime) => (
                  <Link 
                    key={anime.id} 
                    to={`/anime/${anime.id}`} 
                    className={styles.resultItem}
                    onClick={closeSearch}
                  >
                    {anime.poster && (
                      <img src={anime.poster} alt={anime.name} className={styles.resultThumb} />
                    )}
                    <div className={styles.resultInfo}>
                      <span className={styles.resultName}>{anime.name}</span>
                      <span className={styles.resultMeta}>{anime.type ?? 'Anime'}</span>
                    </div>
                  </Link>
                ))}
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
