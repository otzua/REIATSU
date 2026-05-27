import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star, Play } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
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
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 30 },
    [Autoplay({ delay: 8000, stopOnInteraction: false })]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

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
        const trending = await cinemaApi.getTrendingMovies();
        setSlides(trending.slice(0, 10));
      } finally {
        setLoading(false);
      }
    };

    fetchTopMovies();
  }, []);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  if (loading) {
    return (
      <div className={styles.hero}>
        <div className={`${styles.sliderContainer} ${styles.skeleton}`}></div>
      </div>
    );
  }

  return (
    <section className={styles.hero}>
      {slides.length > 0 && (
        <SmartImage
          src={slides[selectedIndex]?.backdropUrl || slides[selectedIndex]?.imageUrl}
          aria-hidden="true"
          className={styles.heroGlow}
          draggable={false}
        />
      )}
      
      <div className={styles.sliderContainer} ref={emblaRef}>
        <div className={styles.emblaContainer}>
          {slides.map((slide, index) => (
            <div key={`${slide.id}-${index}`} className={styles.emblaSlide}>
              <Link to={`/cinema/details/${slide.id}?type=${slide.mediaType}`} className={styles.slideLink}>
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
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "low"}
                    draggable={false}
                  />
                </div>
                
                <div className={styles.overlay} />
                
                <div className={styles.slideContent}>
                  <div className={styles.tagRow}>
                    <span className={styles.rankBadge}>
                      <Star size={12} fill="currentColor" />
                      {slide.rating?.toFixed(1)}
                    </span>
                    <span className={styles.genreTag}>{slide.mediaType}</span>
                    {slide.releaseDate && <span className={styles.genreTag}>{slide.releaseDate.split('-')[0]}</span>}
                  </div>
                  <h1 className={styles.title}>{slide.title}</h1>
                  <p className={styles.description}>{slide.overview?.slice(0, 180)}...</p>
                  <div className={styles.ctaRow}>
                    <span className={styles.watchPill}>
                      <Play size={16} fill="currentColor" />
                      WATCH NOW
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <button className={`${styles.arrowBtn} ${styles.left}`} onClick={scrollPrev}>
        <ChevronLeft size={28} />
      </button>
      <button className={`${styles.arrowBtn} ${styles.right}`} onClick={scrollNext}>
        <ChevronRight size={28} />
      </button>

      <div className={styles.indicators}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className={`${styles.indicator} ${i === selectedIndex ? styles.activeIndicator : ''}`}
          />
        ))}
      </div>
    </section>
  );
};

export default CinemaHero;
