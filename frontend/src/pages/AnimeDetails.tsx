import { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Play, Bookmark, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { animeApi } from '../services/animeApi';
import type { AnimeDetail, AnimeCard } from '../services/animeApi';
import HalftoneWave from '../components/HalftoneWave';
import SmartImage from '../components/SmartImage';
import styles from './AnimeDetails.module.css';

const AnimeDetails = () => {
  const { id, provider: pathProvider } = useParams<{ id: string, provider?: string }>();
  const [searchParams] = useSearchParams();
  const provider = (pathProvider && pathProvider !== 'anime') ? pathProvider : (searchParams.get('provider') || undefined);
  const navigate = useNavigate();
  const [animeInfo, setAnimeInfo] = useState<AnimeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [prevId, setPrevId] = useState(id);

  if (id !== prevId) {
    setPrevId(id);
    setLoading(true);
    setAnimeInfo(null);
  }

  // Derive saved status from localStorage keyed on id (re-runs when id changes)
  const savedFromStorage = useMemo(() => {
    const savedList = localStorage.getItem('reiatsu_mylist');
    if (savedList && id) {
      try {
        const list = JSON.parse(savedList) as { id: string }[];
        return list.some(item => item.id === id);
      } catch {
        return false;
      }
    }
    return false;
  }, [id]);

  const [savedOverride, setSavedOverride] = useState<boolean | null>(null);
  const isSaved = savedOverride !== null ? savedOverride : savedFromStorage;
  const savingRef = useRef(false);

  // Reset override whenever the anime id changes
  if (id !== prevId) {
    if (savedOverride !== null) setSavedOverride(null);
  }

  const toggleSave = () => {
    if (!animeInfo || !id || savingRef.current) return;
    savingRef.current = true;
    const savedList = localStorage.getItem('reiatsu_mylist');
    let list: { id: string, title: string, type: string, poster: string, url: string, addedAt: number }[] = [];
    if (savedList) {
      try {
        list = JSON.parse(savedList);
      } catch {
        list = [];
      }
    }

    if (isSaved) {
      list = list.filter(item => item.id !== id);
      setSavedOverride(false);
    } else {
      // Always deduplicate before pushing
      list = list.filter(item => item.id !== id);
      list.push({
        id: id,                        // use URL param — same value used in the lookup
        title: animeInfo.anime.name,
        type: 'anime',
        poster: animeInfo.anime.poster,
        url: `/${provider || 'anime'}/anime/${id}`,
        addedAt: Date.now()
      });
      setSavedOverride(true);
    }
    localStorage.setItem('reiatsu_mylist', JSON.stringify(list));
    savingRef.current = false;
  };

  useEffect(() => {
    if (!id) return;
    let isCancelled = false;
    
    // Scroll to top when ID changes
    window.scrollTo(0, 0);

    animeApi.getAnime(id, provider)
      .then((info) => {
        if (isCancelled) return;
        setAnimeInfo(info);
        if (info.provider && info.provider !== provider && info.provider !== 'anikoto') {
          navigate(`/${info.provider}/anime/${id}`, { replace: true });
          return;
        }
        if (info.provider === 'anikoto' && provider && provider !== 'anime') {
          navigate(`/anime/${id}`, { replace: true });
          return;
        }
        setLoading(false);
      })
      .catch((err) => {
        if (isCancelled) return;
        console.error('REIATSU ERROR:', err);
        setLoading(false);
        setError(true);
      });

    return () => {
      isCancelled = true;
    };
  }, [id, provider, navigate]);

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

  if (error || !animeInfo) {
    return (
      <div className={styles.container}>
        <HalftoneWave />
        <div className={styles.content}>
          <div className={styles.errorBox}>
            <h2>FAILED TO LOAD DATA</h2>
            <button onClick={() => window.location.reload()}>RETRY</button>
          </div>
        </div>
      </div>
    );
  }

  const { anime, related, recommended } = animeInfo;

  return (
    <div className={styles.wrapper}>
      {/* Immersive Blurred Background */}
      <div className={styles.immersiveBg}>
        <SmartImage src={anime.poster} alt="" className={styles.bgImage} loading="eager" />
        <div className={styles.bgOverlay} />
      </div>

      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.topNav}>
            <button onClick={() => navigate(-1)} className={styles.backBtn}>
              <ChevronLeft size={18} />
              <span>BACK</span>
            </button>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.detailsBox}
          >
            <div className={styles.mainInfo}>
              <div className={styles.posterWrapper}>
                <SmartImage src={anime.poster} alt={anime.name} className={styles.poster} loading="eager" />
                <div className={styles.actionsMobile}>
                  <Link to={`/${provider || 'anime'}/watch/${anime.id}`} className={styles.watchBtn}>
                    <Play fill="currentColor" size={20} />
                    <span>WATCH NOW</span>
                  </Link>
                  <button onClick={toggleSave} className={`${styles.saveBtn}${isSaved ? ` ${styles.saved}` : ''}`}>
                    {isSaved ? <Check size={18} /> : <Bookmark size={18} />}
                    <span>{isSaved ? 'SAVED' : 'MY LIST'}</span>
                  </button>
                </div>
              </div>

              <div className={styles.textInfo}>
                <h1 className={styles.title}>{anime.name}</h1>
                
                <div className={styles.badges}>
                  {anime.type && <span className={styles.badge}>{anime.type}</span>}
                  {anime.status && <span className={styles.badge}>{anime.status}</span>}
                  {anime.episodes?.sub != null && (
                    <span className={`${styles.badge} ${styles.subBadge}`}>SUB {anime.episodes.sub}</span>
                  )}
                  {anime.episodes?.dub != null && (
                    <span className={`${styles.badge} ${styles.dubBadge}`}>DUB {anime.episodes.dub}</span>
                  )}
                  {anime.rating && (
                    <span className={styles.badge}>{anime.rating}</span>
                  )}
                </div>

                <div className={styles.genreList}>
                  {anime.genres?.map((genre) => (
                    <span key={genre} className={styles.genreBadge}>{genre}</span>
                  ))}
                </div>

                <div className={styles.infoGrid}>
                  {anime.studios && anime.studios.length > 0 && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>STUDIO</span>
                      <span className={styles.infoValue}>{anime.studios.join(', ')}</span>
                    </div>
                  )}
                  {anime.duration && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>DURATION</span>
                      <span className={styles.infoValue}>{anime.duration}</span>
                    </div>
                  )}
                  {anime.premiered && (
                    <div className={styles.infoItem}>
                      <span className={styles.infoLabel}>PREMIERED</span>
                      <span className={styles.infoValue}>{anime.premiered}</span>
                    </div>
                  )}
                </div>

                <div className={styles.descriptionBox}>
                  <h3>SYNOPSIS</h3>
                  <p className={styles.description}>{anime.description}</p>
                </div>

                <div className={styles.actionsDesktop}>
                  <Link to={`/${provider || 'anime'}/watch/${anime.id}`} className={styles.watchBtn}>
                    <Play fill="currentColor" size={20} />
                    <span>WATCH NOW</span>
                  </Link>
                  <button onClick={toggleSave} className={`${styles.saveBtn}${isSaved ? ` ${styles.saved}` : ''}`}>
                    {isSaved ? <Check size={18} /> : <Bookmark size={18} />}
                    <span>{isSaved ? 'SAVED' : 'MY LIST'}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Franchise & Related Section */}
          {related && related.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className={styles.recommendedSection}
            >
              <div className={styles.sectionHeaderLine}>
                <div className={styles.accentBox}></div>
                <h2>FRANCHISE & RELATED</h2>
              </div>
              <div className={styles.grid}>
                {related.slice(0, 12).map((rel: AnimeCard, index: number) => (
                  <motion.div
                    key={rel.id}
                    className={styles.animeCard}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.15, ease: "easeOut" } }}
                    >
                    <Link to={`/${provider || 'anime'}/${provider ? 'anime/' : ''}${rel.id}`} className={styles.cardLink}>
                      <div className={styles.posterPlaceholder}>
                        {rel.poster && (
                          <SmartImage src={rel.poster} alt={rel.name} className={styles.recPosterImg} draggable={false} />
                        )}
                        <div className={styles.episodeOverlay}>
                          {rel.episodes.sub != null && <span>SUB {rel.episodes.sub}</span>}
                          {rel.episodes.dub != null && <span>DUB {rel.episodes.dub}</span>}
                        </div>
                      </div>
                      <div className={styles.info}>
                        <h3 className={styles.animeTitle}>{rel.name}</h3>
                        <p className={styles.episode}>{rel.type ?? 'Anime'}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Recommended Section */}
          {recommended && recommended.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className={styles.recommendedSection}
            >
              <div className={styles.sectionHeaderLine}>
                <div className={styles.accentBox}></div>
                <h2>RECOMMENDED ANIMES</h2>
              </div>
              <div className={styles.grid}>
                {recommended.slice(0, 12).map((rec: AnimeCard, index: number) => (
                  <motion.div
                    key={rec.id}
                    className={styles.animeCard}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.15, ease: "easeOut" } }}
                    >
                    <Link to={`/${provider || 'anime'}/${provider ? 'anime/' : ''}${rec.id}`} className={styles.cardLink}>
                      <div className={styles.posterPlaceholder}>
                        {rec.poster && (
                          <SmartImage src={rec.poster} alt={rec.name} className={styles.recPosterImg} draggable={false} />
                        )}
                        <div className={styles.episodeOverlay}>
                          {rec.episodes.sub != null && <span>SUB {rec.episodes.sub}</span>}
                          {rec.episodes.dub != null && <span>DUB {rec.episodes.dub}</span>}
                        </div>
                      </div>
                      <div className={styles.info}>
                        <h3 className={styles.animeTitle}>{rec.name}</h3>
                        <p className={styles.episode}>{rec.type ?? 'Anime'}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AnimeDetails;
