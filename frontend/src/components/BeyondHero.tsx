import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import type { BeyondVideo } from '../services/beyondApi';
import SmartImage from './SmartImage';
import styles from './Hero.module.css';

interface BeyondHeroProps {
  videos: BeyondVideo[];
  onVideoSelect: (video: BeyondVideo) => void;
}

const BeyondHero = ({ videos, onVideoSelect }: BeyondHeroProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const slides = videos.slice(0, 6);

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

  if (slides.length === 0) {
    return <div className={styles.hero}><div className={styles.sliderContainer + ' ' + styles.skeleton}></div></div>;
  }

  return (
    <section className={styles.hero}>
      <SmartImage
        src={slides[currentSlide]?.thumbnail}
        aria-hidden="true"
        className={styles.heroGlow}
        draggable={false}
      />
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
            <div key={`${slide.id}-${index}`} className={styles.slide} onClick={() => !isDragging && onVideoSelect(slide)}>
              <div className={styles.backdropWrapper}>
                <SmartImage
                  src={slide.thumbnail}
                  aria-hidden="true"
                  className={styles.posterGlow}
                  draggable={false}
                />
                <SmartImage
                  src={slide.thumbnail}
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
                    <Flame size={12} fill="currentColor" />
                    TRENDING
                  </span>
                  <span className={styles.genreTag} style={{ textTransform: 'uppercase' }}>PREMIUM</span>
                  <span className={styles.genreTag}>THE BEYOND</span>
                </div>
                <h1 className={styles.title}>{slide.title}</h1>
                <p className={styles.description}>{slide.description || 'Step into the depth. Discover premium uncensored and high-quality titles in complete immersion.'}</p>
                <div className={styles.episodePills}>
                  <span className={styles.pill} style={{ background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.5rem' }}>
                    <Play size={16} fill="currentColor" />
                    WATCH NOW
                  </span>
                </div>
              </div>
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

      <div className={styles.indicators}>
        {slides.map((_, i) => (
          <div
            key={i}
            className={`${styles.indicator} ${currentSlide === i ? styles.activeIndicator : ''}`}
            onClick={() => setCurrentSlide(i)}
          />
        ))}
      </div>
    </section>
  );
};

export default BeyondHero;
