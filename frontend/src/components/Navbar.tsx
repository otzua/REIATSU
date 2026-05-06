import { useState, useRef, useEffect } from 'react';
import { Home, Search, Compass, Bookmark, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { animeApi } from '../services/animeApi';
import type { AnimeCard } from '../services/animeApi';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AnimeCard[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navItems = [
    { id: 'home', icon: Home },
    { id: 'browse', icon: Compass },
    { id: 'search', icon: Search },
    { id: 'list', icon: Bookmark },
  ];

  const handleSearchClick = () => {
    setSearchOpen(true);
    setActiveTab('search');
    setTimeout(() => inputRef.current?.focus(), 100);
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
        <div className={styles.logoCapsule}>
          <span className={styles.logoKanji}>霊</span>
        </div>

        <nav className={styles.navCapsule}>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.navItem} ${activeTab === item.id ? styles.active : ''}`}
              onClick={() => item.id === 'search' ? handleSearchClick() : setActiveTab(item.id)}
            >
              <item.icon size={22} strokeWidth={2} />
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
                    to={`/watch/${anime.id}`} 
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
