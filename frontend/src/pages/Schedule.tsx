import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { animeApi } from '../services/animeApi';
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

const convertJSTtoLocal = (timeStr: string) => {
  if (!timeStr || timeStr === 'Unknown') return 'TBA';
  try {
    const [hours, minutes] = timeStr.split(':');
    const d = new Date();
    // JST is UTC+9. We set the UTC time by subtracting 9 hours from JST.
    d.setUTCHours(parseInt(hours, 10) - 9, parseInt(minutes, 10), 0, 0);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return timeStr;
  }
};

const Schedule = () => {
  const days = generateDays();
  const [selectedDay, setSelectedDay] = useState(days[3]); // Default to today
  const [animes, setAnimes] = useState<ScheduleAnime[]>([]);
  const [loading, setLoading] = useState(true);
  const [navigatingId, setNavigatingId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
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
  }, [selectedDay.apiFilter]);

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
      alert(`Failed to find ${anime.title}.`);
    } finally {
      setNavigatingId(null);
    }
  };

  return (
    <div className={styles.container}>
      <HalftoneWave />
      
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.accentBox}></div>
          <h1 className={styles.title}>RELEASE SCHEDULE</h1>
        </div>

        <div className={styles.timeline}>
          {days.map((day) => (
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
          ))}
        </div>

        <div className={styles.scheduleGrid}>
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`${styles.animeCard} ${styles.skeleton}`} />
            ))
          ) : animes.length === 0 ? (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Schedule;
