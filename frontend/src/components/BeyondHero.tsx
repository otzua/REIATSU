import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Flame } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import type { BeyondVideo } from '../services/beyondApi';
import SmartImage from './SmartImage';
import styles from './Hero.module.css';

interface BeyondHeroProps {
  videos: BeyondVideo[];
  onVideoSelect: (video: BeyondVideo) => void;
}

const BeyondHero = ({ videos, onVideoSelect }: BeyondHeroProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const slides = videos.slice(0, 6);

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

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  if (slides.length === 0) {
    return (
      <div className={styles.hero}>
        <div className={`${styles.sliderContainer} ${styles.skeleton}`}></div>
      </div>
    );
  }

  return (
    <section className={styles.hero}>
      <SmartImage
        src={slides[selectedIndex]?.thumbnail}
        aria-hidden="true"
        className={styles.heroGlow}
        draggable={false}
      />
      
      <div className={styles.sliderContainer} ref={emblaRef}>
        <div className={styles.emblaContainer}>
          {slides.map((slide, index) => (
            <div key={`${slide.id}-${index}`} className={styles.emblaSlide}>
              <div className={styles.slide} onClick={() => onVideoSelect(slide)}>
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
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "low"}
                    draggable={false}
                  />
                </div>
                
                <div className={styles.overlay} />
                
                <div className={styles.slideContent}>
                  <div className={styles.tagRow}>
                    <span className={styles.rankBadge}>
                      <Flame size={12} fill="currentColor" />
                      TRENDING
                    </span>
                    <span className={styles.genreTag}>PREMIUM</span>
                    <span className={styles.genreTag}>THE BEYOND</span>
                  </div>
                  <h1 className={styles.title}>{slide.title}</h1>
                  <p className={styles.description}>{slide.description || 'Step into the depth. Discover premium uncensored and high-quality titles in complete immersion.'}</p>
                  <div className={styles.episodePills}>
                    <span className={styles.watchPill}>
                      <Play size={16} fill="currentColor" />
                      WATCH NOW
                    </span>
                  </div>
                </div>
              </div>
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

export default BeyondHero;
