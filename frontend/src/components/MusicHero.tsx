import { useState, useEffect, useCallback } from 'react';
import { Play, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
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
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (isDragging || slides.length === 0) return;
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, [isDragging, slides.length, nextSlide]);

  if (slides.length === 0) return null;

  return (
    <section className={styles.hero}>
      <SmartImage
        src={slides[currentSlide]?.poster}
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
          {slides.map((slide, index) => {
            const isActive = currentTrack?.id === slide.id;
            return (
              <div key={`${slide.id}-${index}`} className={styles.slide}>
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
                    draggable={false}
                  />
                </div>
                
                <div className={styles.overlay} />
                
                <div className={styles.slideContent}>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.tagRow}
                  >
                    <span className={styles.featuredTag}>FEATURED TRENDING</span>
                  </motion.div>
                  
                  <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={styles.title}
                  >
                    {slide.name}
                  </motion.h1>
                  
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={styles.artist}
                  >
                    {slide.artist}
                  </motion.h2>
                  
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={styles.buttonRow}
                  >
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
                  </motion.div>
                </div>
              </div>
            );
          })}
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
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`${styles.indicator} ${i === currentSlide ? styles.activeIndicator : ''}`}
          />
        ))}
      </div>
    </section>
  );
};

export default MusicHero;
