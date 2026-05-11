import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { animeApi } from '../services/animeApi';
import type { SpotlightAnime } from '../services/animeApi';
import SmartImage from './SmartImage';
import styles from './Hero.module.css';

const Hero = () => {
  const [slides, setSlides] = useState<SpotlightAnime[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    animeApi.getHome()
      .then((data) => {
        console.log("REIATSU: Home data:", data);
        if (data.spotlightAnimes?.length) setSlides(data.spotlightAnimes.slice(0, 15));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % (slides.length || 1));
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + (slides.length || 1)) % (slides.length || 1));
  }, [slides.length]);

  useEffect(() => {
    if (isDragging || slides.length === 0) return;
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [isDragging, slides.length, nextSlide]);

  if (loading) {
    return <div className={styles.hero}><div className={styles.sliderContainer + ' ' + styles.skeleton}></div></div>;
  }

  return (
    <section className={styles.hero}>
      {slides.length > 0 && (
        <SmartImage
          src={slides[currentSlide]?.poster}
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
            <div key={`${slide.id || 'slide'}-${index}`} className={styles.slide}>
              <Link to={`/anime/${slide.id}`} className={styles.slideLink} onClick={(e) => isDragging && e.preventDefault()}>
                <SmartImage
                  src={slide.poster}
                  aria-hidden="true"
                  className={styles.posterGlow}
                  draggable={false}
                />
                <SmartImage
                  src={slide.poster}
                  alt={slide.name}
                  className={styles.poster}
                  loading="eager"
                  fetchPriority="high"
                  draggable={false}
                />
                <div className={styles.overlay} />
                <div className={styles.slideContent}>
                  <div className={styles.tagRow}>
                    <span className={styles.rankBadge}>#{slide.rank}</span>
                    {slide.genres?.slice(0, 3).map((g) => (
                      <span key={g} className={styles.genreTag}>{g}</span>
                    ))}
                  </div>
                  <h1 className={styles.title}>{slide.name}</h1>
                  <p className={styles.description}>{slide.description?.slice(0, 160)}...</p>
                  <div className={styles.episodePills}>
                    {slide.episodes.sub != null && <span className={styles.pill}>SUB {slide.episodes.sub}</span>}
                    {slide.episodes.dub != null && <span className={styles.pill}>DUB {slide.episodes.dub}</span>}
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

export default Hero;
