import { useState, useEffect, useCallback } from 'react';
import { Play, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import SmartImage from './SmartImage';
import type { Track } from '../services/musicApi';
import { useMusic } from '../context/MusicContext';
import styles from './MusicHero.module.css';

interface MusicHeroProps {
  slides: Track[];
  onPlay?: (track: Track, queue: Track[]) => void;
}

const MusicHero: React.FC<MusicHeroProps> = ({ slides, onPlay }) => {
  const { addToQueue, currentTrack, isPlaying } = useMusic();
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

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  if (slides.length === 0) return null;

  return (
    <section className={styles.hero}>
      <SmartImage
        src={slides[selectedIndex]?.poster}
        aria-hidden="true"
        className={styles.heroGlow}
        draggable={false}
      />
      
      <div className={styles.sliderContainer} ref={emblaRef}>
        <div className={styles.emblaContainer}>
          {slides.map((slide, index) => {
            const isActive = currentTrack?.id === slide.id;
            return (
              <div key={`${slide.id}-${index}`} className={styles.emblaSlide}>
                <div className={styles.slide}>
                  <div className={styles.backdropWrapper}>
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
                      loading={index === 0 ? "eager" : "lazy"}
                      draggable={false}
                    />
                  </div>
                  
                  <div className={styles.overlay} />
                  
                  <div className={styles.slideContent}>
                    <div className={styles.tagRow}>
                      <span className={styles.featuredTag}>FEATURED TRENDING</span>
                    </div>
                    
                    <h1 className={styles.title}>
                      {slide.name}
                    </h1>
                    
                    <h2 className={styles.artist}>
                      {slide.artist}
                    </h2>
                    
                    <div className={styles.buttonRow}>
                      <button 
                        onClick={() => onPlay?.(slide, slides)}
                        className={styles.mainBtn}
                      >
                        <Play size={20} fill="currentColor" /> 
                        {isActive && isPlaying ? 'PLAYING NOW' : 'PLAY NOW'}
                      </button>
                      <button 
                        onClick={() => addToQueue(slide)}
                        className={styles.secondaryBtn}
                      >
                        <Plus size={20} /> ADD TO QUEUE
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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

export default MusicHero;
