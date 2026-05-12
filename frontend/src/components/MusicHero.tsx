import { useState, useEffect, useCallback } from 'react';
import { Play, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import SmartImage from './SmartImage';
import type { Track } from '../services/musicApi';
import styles from './Hero.module.css';

const PLACEHOLDER_MUSIC_SLIDES: Track[] = [
  {
    id: 'm1',
    name: 'Neon Horizon',
    artist: 'Antigravity Studio',
    album: 'Neon Horizon',
    poster: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1200&auto=format&fit=crop',
    url: ''
  },
  {
    id: 'm2',
    name: 'Midnight Melodies',
    artist: 'Lofi Records',
    album: 'Midnight Melodies',
    poster: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1200&auto=format&fit=crop',
    url: ''
  },
  {
    id: 'm3',
    name: 'Brutalist Beats',
    artist: 'Concrete Jungle',
    album: 'Brutalist Beats',
    poster: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=1200&auto=format&fit=crop',
    url: ''
  }
];

interface MusicHeroProps {
  onPlay?: (track: Track, queue: Track[]) => void;
}

const MusicHero: React.FC<MusicHeroProps> = ({ onPlay }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % PLACEHOLDER_MUSIC_SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const slide = PLACEHOLDER_MUSIC_SLIDES[currentSlide];

  return (
    <section className={styles.hero}>
      <SmartImage
        src={slide.poster}
        aria-hidden="true"
        className={styles.heroGlow}
        style={{ '--accent-color': '#ff0055' } as any}
      />
      <div className={styles.sliderContainer}>
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
          className={styles.slide}
        >
          <div className={styles.slideLink}>
            <SmartImage
              src={slide.poster}
              aria-hidden="true"
              className={styles.posterGlow}
            />
            <SmartImage
              src={slide.poster}
              alt={slide.name}
              className={styles.poster}
            />
            <div className={styles.overlay} />
            <div className={styles.slideContent}>
              <div className={styles.tagRow}>
                <span className={styles.genreTag}>Synthwave / Electronic</span>
              </div>
              <h1 className={styles.title}>{slide.name}</h1>
              <h2 style={{ color: 'var(--color-cream)', opacity: 0.8, marginBottom: '1rem', fontSize: '1.2rem' }}>{slide.artist}</h2>
              <p className={styles.description}>Enjoy premium high-fidelity electronic and chill rhythms handcrafted for your listening session.</p>
              
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button 
                  onClick={() => onPlay?.(slide, PLACEHOLDER_MUSIC_SLIDES)}
                  style={{
                    background: 'var(--color-cream)',
                    color: '#000',
                    padding: '12px 24px',
                    borderRadius: '4px',
                    border: 'none',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Play size={20} fill="currentColor" /> PLAY NOW
                </button>
                <button style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)'
                }}>
                  <Info size={20} /> DETAILS
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MusicHero;
