import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { animeApi } from '../services/animeApi';
import type { AnimeDetail, AnimeCard } from '../services/animeApi';
import HalftoneWave from '../components/HalftoneWave';
import SmartImage from '../components/SmartImage';
import styles from './AnimeDetails.module.css';

const AnimeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [animeInfo, setAnimeInfo] = useState<AnimeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    let isCancelled = false;
    
    // Scroll to top when ID changes
    window.scrollTo(0, 0);

    animeApi.getAnime(id)
      .then((info) => {
        if (isCancelled) return;
        setAnimeInfo(info);
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
  }, [id]);

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
                  <Link to={`/watch/${anime.id}`} className={styles.watchBtn}>
                    <Play fill="currentColor" size={20} />
                    <span>WATCH NOW</span>
                  </Link>
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
                  <Link to={`/watch/${anime.id}`} className={styles.watchBtn}>
                    <Play fill="currentColor" size={20} />
                    <span>WATCH NOW</span>
                  </Link>
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
                    <Link to={`/anime/${rel.id}`} className={styles.cardLink}>
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
                    <Link to={`/anime/${rec.id}`} className={styles.cardLink}>
                      <div className={styles.posterPlaceholder}>
                        {rec.poster && (
                          <>
                            <SmartImage src={rec.poster} aria-hidden="true" className={styles.recPosterGlow} draggable={false} />
                            <SmartImage src={rec.poster} alt={rec.name} className={styles.recPosterImg} draggable={false} />
                          </>
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
