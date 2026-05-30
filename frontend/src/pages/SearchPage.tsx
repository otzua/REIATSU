import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Film, Play, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { animeApi, type AnimeCard, type SearchResult } from '../services/animeApi';
import { cinemaApi, type CinemaMovie } from '../services/cinemaApi';
import SmartImage from '../components/SmartImage';
import HalftoneWave from '../components/HalftoneWave';
import styles from './SearchPage.module.css';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const typeParam = searchParams.get('type') || 'all';
  const provider = searchParams.get('provider') || undefined;
  
  const [animeResults, setAnimeResults] = useState<AnimeCard[]>([]);
  const [cinemaResults, setCinemaResults] = useState<CinemaMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [didYouMean, setDidYouMean] = useState('');
  
  const initialFilter = (typeParam === 'anime' || typeParam === 'cinema' || typeParam === 'all') ? typeParam : 'all';
  const [activeFilter, setActiveFilter] = useState<'all' | 'anime' | 'cinema'>(initialFilter);
  const [prevTypeParam, setPrevTypeParam] = useState(typeParam);

  if (typeParam !== prevTypeParam) {
    setPrevTypeParam(typeParam);
    if (typeParam === 'anime' || typeParam === 'cinema' || typeParam === 'all') {
      setActiveFilter(typeParam);
    }
  }

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const [animeData, cinemaData] = await Promise.all([
          animeApi.search(query, 1, provider).catch(() => ({ animes: [] })),
          cinemaApi.search(query).catch(() => [])
        ]);

        const aData = animeData as SearchResult & { suggestion?: string };
        
        // Handle "Did you mean?" from API
        setDidYouMean(aData?.suggestion || '');
        
        // Trust the API's fuzzy/relevance ranking — show all results it returns
        setAnimeResults(aData.animes || []);
        
        // For cinema, just pass through what the API returns
        setCinemaResults(cinemaData || []);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, provider]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={styles.searchPage}>
      <HalftoneWave />
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.searchTitle}>
            <Search size={32} className={styles.titleIcon} />
            <h1>Search Results</h1>
          </div>
          <p className={styles.queryDisplay}>Showing results for "<span>{query}</span>"</p>
          
          <AnimatePresence>
            {didYouMean && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.didYouMeanBanner}
              >
                <p>
                  Did you mean <Link to={`/search?q=${encodeURIComponent(didYouMean)}`}>{didYouMean}</Link>?
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={styles.filtersContainer}>
            <div className={styles.filters}>
              {([
                { id: 'all', label: 'All Results', count: animeResults.length + cinemaResults.length },
                { id: 'anime', label: 'Anime', count: animeResults.length },
                { id: 'cinema', label: 'Cinema', count: cinemaResults.length }
              ] as const).map((filter) => (
                <button 
                  key={filter.id}
                  className={`${styles.filterBtn} ${activeFilter === filter.id ? styles.active : ''}`}
                  onClick={() => setActiveFilter(filter.id)}
                >
                  <span className={styles.btnText}>
                    {filter.label}
                    <span className={styles.count}>{filter.count}</span>
                  </span>
                  {activeFilter === filter.id && (
                    <motion.div 
                      layoutId="activeFilter"
                      className={styles.activeIndicator}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className={styles.resultsGrid}>
        {loading ? (
          <div className={styles.loaderContainer}>
            <div className={styles.loader}></div>
            <p>Searching through the archives...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {(animeResults.length === 0 && cinemaResults.length === 0) ? (
              <motion.div 
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={styles.noResults}
              >
                <Search size={64} opacity={0.1} />
                <h2>No matches found</h2>
                <p>We couldn't find anything matching your search. Try different keywords.</p>
                <Link to="/" className={styles.backHome}>Return Home</Link>
              </motion.div>
            ) : (
              <motion.div 
                key="results-list"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={styles.gridContent}
              >
                {/* Prioritize results based on current filter */}
                {activeFilter === 'cinema' ? (
                  <>
                    {cinemaResults.length > 0 && (
                      <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                          <Film size={20} />
                          <h2>Cinema & TV</h2>
                        </div>
                        <div className={styles.grid}>
                          {cinemaResults.map((item) => (
                            <motion.div key={item.id} variants={itemVariants}>
                              <Link to={`/cinema/details/${item.id}?type=${item.mediaType}`} className={styles.card}>
                                <div className={styles.cardMedia}>
                                  <SmartImage src={item.imageUrl} alt={item.title} className={styles.cardPoster} />
                                  <div className={styles.cardOverlay}>
                                    <div className={styles.infoIcon}><Info size={24} /></div>
                                  </div>
                                  <div className={styles.cardBadges}>
                                    <span className={styles.typeBadge}>{item.mediaType === 'tv' ? 'SERIES' : 'MOVIE'}</span>
                                  </div>
                                </div>
                                <div className={styles.cardInfo}>
                                  <h3>{item.title}</h3>
                                  <div className={styles.cardMeta}>
                                    <span className={styles.cardType}>{item.mediaType === 'tv' ? 'TV Series' : 'Movie'}</span>
                                    {item.releaseDate && (
                                      <span className={styles.epCount}>{item.releaseDate.split('-')[0]}</span>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </section>
                    )}
                    {animeResults.length > 0 && (
                      <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                          <Play size={20} />
                          <h2>Anime Releases</h2>
                        </div>
                        <div className={styles.grid}>
                          {animeResults.map((anime) => (
                            <motion.div key={anime.id} variants={itemVariants}>
                              <Link to={`/${provider || 'anime'}/${provider ? 'anime/' : ''}${anime.id}`} className={styles.card}>
                                <div className={styles.cardMedia}>
                                  <SmartImage src={anime.poster} alt={anime.name} className={styles.cardPoster} />
                                  <div className={styles.cardOverlay}>
                                    <div className={styles.playIcon}><Play fill="white" size={24} /></div>
                                  </div>
                                  <div className={styles.cardBadges}>
                                    {anime.episodes.sub && <span className={styles.subBadge}>SUB {anime.episodes.sub}</span>}
                                    {anime.episodes.dub && <span className={styles.dubBadge}>DUB {anime.episodes.dub}</span>}
                                  </div>
                                </div>
                                <div className={styles.cardInfo}>
                                  <h3>{anime.name}</h3>
                                  <div className={styles.cardMeta}>
                                    <span className={styles.cardType}>{anime.type || 'Anime'}</span>
                                    {anime.episodes.sub && (
                                      <span className={styles.epCount}>{anime.episodes.sub} EP</span>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </section>
                    )}
                  </>
                ) : (
                  <>
                    {animeResults.length > 0 && (activeFilter === 'all' || activeFilter === 'anime') && (
                      <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                          <Play size={20} />
                          <h2>Anime Releases</h2>
                        </div>
                        <div className={styles.grid}>
                          {animeResults.map((anime) => (
                            <motion.div key={anime.id} variants={itemVariants}>
                              <Link to={`/${provider || 'anime'}/${provider ? 'anime/' : ''}${anime.id}`} className={styles.card}>
                                <div className={styles.cardMedia}>
                                  <SmartImage src={anime.poster} alt={anime.name} className={styles.cardPoster} />
                                  <div className={styles.cardOverlay}>
                                    <div className={styles.playIcon}><Play fill="white" size={24} /></div>
                                  </div>
                                  <div className={styles.cardBadges}>
                                    {anime.episodes.sub && <span className={styles.subBadge}>SUB {anime.episodes.sub}</span>}
                                    {anime.episodes.dub && <span className={styles.dubBadge}>DUB {anime.episodes.dub}</span>}
                                  </div>
                                </div>
                                <div className={styles.cardInfo}>
                                  <h3>{anime.name}</h3>
                                  <div className={styles.cardMeta}>
                                    <span className={styles.cardType}>{anime.type || 'Anime'}</span>
                                    {anime.episodes.sub && (
                                      <span className={styles.epCount}>{anime.episodes.sub} EP</span>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </section>
                    )}
                    {cinemaResults.length > 0 && activeFilter === 'all' && (
                      <section className={styles.section}>
                        <div className={styles.sectionHeader}>
                          <Film size={20} />
                          <h2>Cinema & TV</h2>
                        </div>
                        <div className={styles.grid}>
                          {cinemaResults.map((item) => (
                            <motion.div key={item.id} variants={itemVariants}>
                              <Link to={`/cinema/details/${item.id}?type=${item.mediaType}`} className={styles.card}>
                                <div className={styles.cardMedia}>
                                  <SmartImage src={item.imageUrl} alt={item.title} className={styles.cardPoster} />
                                  <div className={styles.cardOverlay}>
                                    <div className={styles.infoIcon}><Info size={24} /></div>
                                  </div>
                                  <div className={styles.cardBadges}>
                                    <span className={styles.typeBadge}>{item.mediaType === 'tv' ? 'SERIES' : 'MOVIE'}</span>
                                  </div>
                                </div>
                                <div className={styles.cardInfo}>
                                  <h3>{item.title}</h3>
                                  <div className={styles.cardMeta}>
                                    <span className={styles.cardType}>{item.mediaType === 'tv' ? 'TV Series' : 'Movie'}</span>
                                    {item.releaseDate && (
                                      <span className={styles.epCount}>{item.releaseDate.split('-')[0]}</span>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </section>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
