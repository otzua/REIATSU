import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Link } from 'react-router-dom';
import { toonApi, type ToonFeatured } from '../services/toonApi';
import SmartImage from './SmartImage';
import styles from './Hero.module.css';

const ToonHero = () => {
  const [slides, setSlides] = useState<ToonFeatured[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 30, skipSnaps: false },
    [Autoplay({ delay: 6000, stopOnInteraction: false })]
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
    toonApi.getHome()
      .then((data) => {
        if (data.featured?.length) setSlides(data.featured);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
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
          src={slides[selectedIndex]?.image}
          aria-hidden="true"
          className={styles.heroGlow}
          draggable={false}
        />
      )}
      
      <div className={styles.sliderContainer} ref={emblaRef}>
        <div className={styles.emblaContainer}>
          {slides.map((slide, index) => (
            <div key={`${index}`} className={styles.emblaSlide}>
              <div className={styles.slideLink}>
                <div className={styles.backdropWrapper}>
                  <SmartImage
                    src={slide.image}
                    aria-hidden="true"
                    className={styles.posterGlow}
                    draggable={false}
                  />
                  <SmartImage
                    src={slide.image}
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
                    <span className={styles.rankBadge}>TOON</span>
                    <span className={styles.genreTag}>Featured</span>
                  </div>
                  <h1 className={styles.title}>{slide.title}</h1>
                  <div className={styles.ctaRow} style={{ marginTop: '2.5rem' }}>
                    <span className={styles.watchPill}>
                      <Play size={16} fill="currentColor" />
                      EXPLORE NOW
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

export default ToonHero;
