import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Star, Play } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Link } from 'react-router-dom';
import { cinemaApi } from '../services/cinemaApi';
import type { CinemaMovie } from '../services/cinemaApi';
import SmartImage from './SmartImage';
import styles from './Hero.module.css';


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
    const timer = setTimeout(() => {
      onSelect();
    }, 0);
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      clearTimeout(timer);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    const fetchHeroMovies = async () => {
      setLoading(true);
      try {
        // Always pull live trending data — no hardcoded list, always up to date
        const [trendingMovies, trendingTV] = await Promise.all([
          cinemaApi.getTrendingMovies(),
          cinemaApi.getTrendingTV(),
        ]);

        // Mix top movies and shows, sort by rating, pick the best 8
        const combined = [...trendingMovies.slice(0, 6), ...trendingTV.slice(0, 4)]
          .filter(m => m.backdropUrl || m.imageUrl)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 8);

        setSlides(combined);
      } catch (err) {
        console.error('Error fetching hero movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroMovies();
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
