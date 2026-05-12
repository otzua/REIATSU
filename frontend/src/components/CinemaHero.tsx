import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cinemaApi } from '../services/cinemaApi';
import type { CinemaMovie } from '../services/cinemaApi';
import SmartImage from './SmartImage';
import styles from './Hero.module.css';

const TOP_TIER_MOVIE_IDS = [
  { id: '550', type: 'movie' },    // Fight Club
  { id: '157336', type: 'movie' }, // Interstellar
  { id: '155', type: 'movie' },    // The Dark Knight
  { id: '27205', type: 'movie' },  // Inception
  { id: '238', type: 'movie' },    // The Godfather
  { id: '680', type: 'movie' },    // Pulp Fiction
] as const;

const CinemaHero = () => {
  const [slides, setSlides] = useState<CinemaMovie[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopMovies = async () => {
      setLoading(true);
      try {
        const moviePromises = TOP_TIER_MOVIE_IDS.map(m => 
          cinemaApi.getMovieDetails(m.id, m.type as 'movie' | 'tv')
        );
        const movieDetails = await Promise.all(moviePromises);
        
        const heroSlides: CinemaMovie[] = movieDetails.map(m => ({
          id: m.id,
          title: m.title,
          imageUrl: m.imageUrl,
          backdropUrl: m.backdropUrl,
          mediaType: m.mediaType,
          releaseDate: m.releaseDate,
          rating: m.rating,
          overview: m.description
        }));
        
        setSlides(heroSlides);
      } catch (err) {
        console.error('Error fetching hero movies:', err);
        // Fallback to trending if specific ones fail
        const trending = await cinemaApi.getTrendingMovies();
        setSlides(trending.slice(0, 10));
      } finally {
        setLoading(false);
      }
    };

    fetchTopMovies();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % (slides.length || 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + (slides.length || 1)) % (slides.length || 1));
  }, [slides.length]);

  useEffect(() => {
    if (isDragging || slides.length === 0) return;
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, [isDragging, slides.length, nextSlide]);

  if (loading) {
    return <div className={styles.hero}><div className={styles.sliderContainer + ' ' + styles.skeleton}></div></div>;
  }

  return (
    <section className={styles.hero}>
      {slides.length > 0 && (
        <SmartImage
          src={slides[currentSlide]?.backdropUrl || slides[currentSlide]?.imageUrl}
          aria-hidden="true"
          className={styles.heroGlow}
          draggable={false}
        />
      )}
      <div className={styles.sliderContainer}>
        <motion.div
          className={styles.slidesRow}
          animate={{ x: `-${currentSlide * 100}%` }}
          transition={{ type: 'tween', ease: [0.25, 1, 0.5, 1], duration: 0.8 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={(_, info) => {
            setIsDragging(false);
            if (info.offset.x < -50) nextSlide();
            else if (info.offset.x > 50) prevSlide();
          }}
        >
          {slides.map((slide, index) => (
            <div key={`${slide.id}-${index}`} className={styles.slide}>
              <Link to={`/cinema/watch/${slide.id}?type=${slide.mediaType}`} className={styles.slideLink} onClick={(e) => isDragging && e.preventDefault()}>
                <div className={styles.backdropWrapper}>
                  <SmartImage
                    src={slide.backdropUrl || slide.imageUrl}
                    aria-hidden="true"
                    className={styles.posterGlow}
                    draggable={false}
                  />
                  <SmartImage
                    src={slide.backdropUrl || slide.imageUrl}
                    alt={slide.title}
                    className={styles.poster}
                    loading="eager"
                    fetchPriority="high"
                    draggable={false}
                  />
                </div>
                <div className={styles.overlay} />
                <div className={styles.slideContent}>
                  <div className={styles.tagRow}>
                    <span className={styles.rankBadge} style={{ background: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={12} fill="currentColor" />
                      {slide.rating?.toFixed(1)}
                    </span>
                    <span className={styles.genreTag} style={{ textTransform: 'uppercase' }}>{slide.mediaType}</span>
                    {slide.releaseDate && <span className={styles.genreTag}>{slide.releaseDate.split('-')[0]}</span>}
                  </div>
                  <h1 className={styles.title}>{slide.title}</h1>
                  <p className={styles.description}>{slide.overview?.slice(0, 180)}...</p>
                  <div className={styles.episodePills}>
                    <span className={styles.pill} style={{ background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.5rem' }}>
                      <Play size={16} fill="currentColor" />
                      WATCH NOW
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </motion.div>
      </div>

      <button className={`${styles.arrowBtn} ${styles.left}`} onClick={prevSlide}>
        <ChevronLeft size={28} />
      </button>
      <button className={`${styles.arrowBtn} ${styles.right}`} onClick={nextSlide}>
        <ChevronRight size={28} />
      </button>
    </section>
  );
};

export default CinemaHero;
