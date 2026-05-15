import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { animeApi } from '../services/animeApi';
import { cinemaApi } from '../services/cinemaApi';
import type { CinemaMovie } from '../services/cinemaApi';
import HalftoneWave from '../components/HalftoneWave';
import SmartImage from '../components/SmartImage';
import styles from './Schedule.module.css';

interface ScheduleAnime {
  mal_id: number;
  title: string;
  images: { jpg: { large_image_url: string } };
  broadcast: { time: string; string: string };
  genres: { name: string }[];
  synopsis: string;
}

const generateDays = () => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 3 + i);
    return {
      dateObj: d,
      dayName: d.toLocaleDateString('en-US', { weekday: 'long' }),
      shortName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      apiFilter: d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
      isToday: i === 3,
    };
  });
};

const generateMonths = () => {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-indexed
  
  return months.map((name, index) => ({
    name,
    index: index + 1, // 1-indexed for API
    isCurrent: index === currentMonth,
  }));
};

const convertJSTtoLocal = (timeStr: string) => {
  if (!timeStr || timeStr === 'Unknown') return 'TBA';
  try {
    const [hours, minutes] = timeStr.split(':');
    const d = new Date();
    d.setUTCHours(parseInt(hours, 10) - 9, parseInt(minutes, 10), 0, 0);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return timeStr;
  }
};

const Schedule = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'anime';
  const isCinema = type === 'cinema';

  const days = useMemo(() => generateDays(), []);
  const months = useMemo(() => generateMonths(), []);

  const [selectedDay, setSelectedDay] = useState(days[3]);
  const [selectedMonth, setSelectedMonth] = useState(months[new Date().getMonth()]);
  
  const [animes, setAnimes] = useState<ScheduleAnime[]>([]);
  const [movies, setMovies] = useState<CinemaMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [navigatingId, setNavigatingId] = useState<string | number | null>(null);
  const navigate = useNavigate();
  const timelineRef = useRef<HTMLDivElement>(null);

  const scrollTimeline = (direction: 'left' | 'right') => {
    if (timelineRef.current) {
      const scrollAmount = 300;
      timelineRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Add wheel scroll support for horizontal timeline
  useEffect(() => {
    const el = timelineRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        el.scrollBy({
          left: e.deltaY,
          behavior: 'auto'
        });
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  // Load Anime Schedule
  useEffect(() => {
    if (isCinema) return;
    setLoading(true);
    setAnimes([]);
    animeApi.getSchedule(selectedDay.apiFilter)
      .then((data) => {
        const valid = data.filter((a: any) => a.broadcast?.time && a.broadcast.time !== 'Unknown');
        valid.sort((a: any, b: any) => a.broadcast.time.localeCompare(b.broadcast.time));
        setAnimes(valid);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedDay.apiFilter, isCinema]);

  // Load Cinema Schedule
  useEffect(() => {
    if (!isCinema) return;
    setLoading(true);
    setMovies([]);
    const year = new Date().getFullYear();
    cinemaApi.getReleasesByMonth(year, selectedMonth.index)
      .then((data) => {
        setMovies(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedMonth.index, isCinema]);

  const handleAnimeClick = async (anime: ScheduleAnime) => {
    if (navigatingId) return;
    setNavigatingId(anime.mal_id);
    try {
      const res = await animeApi.search(anime.title);
      if (res && res.animes && res.animes.length > 0) {
        navigate(`/anime/${res.animes[0].id}`);
      } else {
        alert(`Stream not found for ${anime.title} in the database yet.`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setNavigatingId(null);
    }
  };

  const handleMovieClick = (movie: CinemaMovie) => {
    navigate(`/cinema/details/${movie.id}?type=${movie.mediaType}`);
  };

  return (
    <div className={styles.container}>
      <HalftoneWave />
      
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.accentBox}></div>
          <h1 className={styles.title}>
            {isCinema ? 'CINEMA RELEASES' : 'ANIME SCHEDULE'}
          </h1>
        </div>

        <div className={styles.timelineContainer}>
          {isCinema && (
            <button className={`${styles.navArrow} ${styles.left}`} onClick={() => scrollTimeline('left')}>
              <ChevronLeft size={20} />
            </button>
          )}
          
          <div className={styles.timeline} ref={timelineRef}>
            {isCinema ? (
              months.map((month) => (
                <button
                  key={month.name}
                  className={`${styles.dayBtn} ${selectedMonth.index === month.index ? styles.activeDay : ''} ${month.isCurrent ? styles.currentMonth : ''}`}
                  onClick={() => setSelectedMonth(month)}
                >
                  {selectedMonth.index === month.index && (
                    <motion.div 
                      layoutId="activeDay" 
                      className={styles.activeIndicator} 
                    />
                  )}
                  <span className={styles.dayName}>{month.name}</span>
                  {month.isCurrent && (
                    <span className={styles.todayDot} />
                  )}
                </button>
              ))
            ) : (
              days.map((day) => (
                <button
                  key={day.apiFilter}
                  className={`${styles.dayBtn} ${selectedDay.apiFilter === day.apiFilter ? styles.activeDay : ''}`}
                  onClick={() => setSelectedDay(day)}
                >
                  {selectedDay.apiFilter === day.apiFilter && (
                    <motion.div layoutId="activeDay" className={styles.activeIndicator} />
                  )}
                  <span className={styles.dayName}>{day.shortName}</span>
                  <span className={styles.dayNum}>{day.dayNum}</span>
                  {day.isToday && <span className={styles.todayDot} />}
                </button>
              ))
            )}
          </div>

          {isCinema && (
            <button className={`${styles.navArrow} ${styles.right}`} onClick={() => scrollTimeline('right')}>
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        <div className={styles.scheduleGrid}>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`${styles.animeCard} ${styles.skeleton}`} />
            ))
          ) : isCinema ? (
            movies.length === 0 ? (
              <div className={styles.noResults}>No movie releases found for this month.</div>
            ) : (
              <AnimatePresence mode="popLayout">
                {movies.map((movie, index) => (
                  <motion.div
                    key={movie.id}
                    className={styles.animeCard}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.02 }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    onClick={() => handleMovieClick(movie)}
                  >
                    <div className={styles.timeCapsule}>
                      <span className={styles.localTime}>
                        {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'TBA'}
                      </span>
                      <span className={styles.jstTime}>{movie.mediaType.toUpperCase()}</span>
                    </div>
                    
                    <div className={styles.posterPlaceholder}>
                      {movie.imageUrl && (
                        <>
                          <SmartImage src={movie.imageUrl} aria-hidden="true" className={styles.posterGlow} draggable={false} />
                          <SmartImage src={movie.imageUrl} alt={movie.title} className={styles.posterImg} draggable={false} />
                        </>
                      )}
                    </div>
                    
                    <div className={styles.info}>
                      <h3 className={styles.animeTitle}>{movie.title}</h3>
                      <div className={styles.genres}>
                        <span className={styles.genreTag}>{movie.rating ? `★ ${movie.rating.toFixed(1)}` : 'N/A'}</span>
                        <span className={styles.genreTag} style={{ textTransform: 'capitalize' }}>{movie.mediaType}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )
          ) : (
            animes.length === 0 ? (
              <div className={styles.noResults}>No schedule data found for this day.</div>
            ) : (
              <AnimatePresence mode="popLayout">
                {animes.map((anime, index) => (
                  <motion.div
                    key={anime.mal_id}
                    className={`${styles.animeCard} ${navigatingId === anime.mal_id ? styles.navigating : ''}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={navigatingId === anime.mal_id ? {} : { y: -8, scale: 1.03, transition: { duration: 0.15, ease: "easeOut" } }}
                    onClick={() => handleAnimeClick(anime)}
                  >
                    {navigatingId === anime.mal_id && (
                      <div className={styles.loadingOverlay}>
                        <div className={styles.spinner}></div>
                      </div>
                    )}

                    <div className={styles.timeCapsule}>
                      <span className={styles.localTime}>{convertJSTtoLocal(anime.broadcast.time)}</span>
                      <span className={styles.jstTime}>{anime.broadcast.time} JST</span>
                    </div>
                    
                    <div className={styles.posterPlaceholder}>
                      {anime.images?.jpg?.large_image_url && (
                        <>
                          <SmartImage src={anime.images.jpg.large_image_url} aria-hidden="true" className={styles.posterGlow} draggable={false} />
                          <SmartImage src={anime.images.jpg.large_image_url} alt={anime.title} className={styles.posterImg} draggable={false} />
                        </>
                      )}
                    </div>
                    
                    <div className={styles.info}>
                      <h3 className={styles.animeTitle}>{anime.title}</h3>
                      <div className={styles.genres}>
                        {anime.genres?.slice(0, 2).map((g: any) => (
                          <span key={g.name} className={styles.genreTag}>{g.name}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
