import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { Link } from 'react-router-dom';
import { animeApi } from '../services/animeApi';
import type { SpotlightAnime } from '../services/animeApi';
import SmartImage from './SmartImage';
import styles from './Hero.module.css';

const Hero = ({ provider }: { provider?: string }) => {
  const [slides, setSlides] = useState<SpotlightAnime[]>([]);
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
    animeApi.getHome(provider)
      .then((data) => {
        if (data.spotlightAnimes?.length) setSlides(data.spotlightAnimes.slice(0, 15));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [provider]);

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
          src={slides[selectedIndex]?.poster}
          aria-hidden="true"
          className={styles.heroGlow}
          draggable={false}
        />
      )}
      
      <div className={styles.sliderContainer} ref={emblaRef}>
        <div className={styles.emblaContainer}>
          {slides.map((slide, index) => (
            <div key={`${slide.id}-${index}`} className={styles.emblaSlide}>
              <Link to={`/${provider || 'anime'}/${provider ? 'anime/' : ''}${slide.id}`} className={styles.slideLink}>
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
                    fetchPriority={index === 0 ? "high" : "low"}
                    draggable={false}
                  />
                </div>
                
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
                  <div className={styles.episodeContainer}>
                    <div className={styles.mainCapsule}>
                      {(() => {
                        const subCount = slide.episodes.sub || 0;
                        const dubCount = slide.episodes.dub || 0;
                        const mainCount = Math.max(subCount, dubCount);
                        
                        const otherInfoCount = slide.otherInfo?.find(info => 
                          (info.toLowerCase().includes('eps') || info.toLowerCase().includes('episode')) && 
                          /\d+/.test(info)
                        );
                        
                        if (otherInfoCount) return otherInfoCount;
                        
                        const potentialNum = slide.otherInfo?.find(info => /^\d+$/.test(info) && parseInt(info) > 1);
                        if (potentialNum) return `${potentialNum} Episodes`;

                        return mainCount > 0 ? `${mainCount} ${mainCount === 1 ? 'Episode' : 'Episodes'}` : 'TBA';
                      })()}
                    </div>
                    <div className={styles.subDubRow}>
                      {slide.episodes.sub != null && slide.episodes.sub > 0 && (
                        <div className={`${styles.badgeCapsule} ${styles.sub}`}>SUB</div>
                      )}
                      {slide.episodes.dub != null && slide.episodes.dub > 0 && (
                        <div className={`${styles.badgeCapsule} ${styles.dub}`}>DUB</div>
                      )}
                    </div>
                  </div>
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

export default Hero;
