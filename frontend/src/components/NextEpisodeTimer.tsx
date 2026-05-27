import { useState, useEffect } from 'react';
import styles from './NextEpisodeTimer.module.css';
import { Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NextEpisodeTimerProps {
  animeName: string;
}

const dayMap: Record<string, number> = {
  'Sundays': 0, 'Mondays': 1, 'Tuesdays': 2, 'Wednesdays': 3,
  'Thursdays': 4, 'Fridays': 5, 'Saturdays': 6
};

const calculateTimeLeft = (broadcastDay: string, broadcastTime: string) => {
  if (!broadcastDay || !broadcastTime || broadcastTime === 'Unknown') return null;
  
  const targetDay = dayMap[broadcastDay];
  if (targetDay === undefined) return null;

  const [hours, minutes] = broadcastTime.split(':').map(Number);
  
  const now = new Date();
  
  // Calculate the broadcast time in JST for the current week
  const jstNow = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Tokyo"}));
  
  const targetJst = new Date(jstNow);
  targetJst.setHours(hours, minutes, 0, 0);
  
  const currentDay = jstNow.getDay();
  let daysToAdd = targetDay - currentDay;
  
  // If the target time has already passed today, or is on a previous day in the week, it's next week
  if (daysToAdd < 0 || (daysToAdd === 0 && jstNow.getTime() >= targetJst.getTime())) {
    daysToAdd += 7;
  }
  
  targetJst.setDate(targetJst.getDate() + daysToAdd);
  
  // Now targetJst is the correct Date object in JST time. We just compare timestamps.
  const difference = targetJst.getTime() - jstNow.getTime();
  
  if (difference <= 0) return null;

  const timeLeft = {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };

  return timeLeft;
};

const NextEpisodeTimer = ({ animeName }: NextEpisodeTimerProps) => {
  const [broadcast, setBroadcast] = useState<{ day: string; time: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch Broadcast Info from Jikan API
  useEffect(() => {
    let isMounted = true;
    const fetchBroadcast = async () => {
      try {
        const query = encodeURIComponent(animeName);
        const res = await fetch(`https://api.jikan.moe/v4/anime?q=${query}&status=airing&limit=1`);
        if (!res.ok) throw new Error('Network response was not ok');
        const data = await res.json();
        
        if (isMounted && data.data && data.data.length > 0) {
          const anime = data.data[0];
          if (anime.broadcast && anime.broadcast.day && anime.broadcast.time) {
            setBroadcast({
              day: anime.broadcast.day,
              time: anime.broadcast.time
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch broadcast data from Jikan:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBroadcast();

    return () => {
      isMounted = false;
    };
  }, [animeName]);

  // Update Countdown Timer
  useEffect(() => {
    if (!broadcast) return;

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft(broadcast.day, broadcast.time);
      setTimeLeft(remaining);
    }, 1000);
    
    // Defer initial call to prevent synchronous setState warning
    const initialTimer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft(broadcast.day, broadcast.time));
    }, 0);

    return () => {
      clearInterval(timer);
      clearTimeout(initialTimer);
    };
  }, [broadcast]);

  if (loading) return null; // Don't show anything while loading
  if (!broadcast || !timeLeft) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className={styles.timerContainer}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.timerHeader}>
          <Clock size={16} className={styles.icon} />
          <span>NEXT EPISODE RELEASES IN</span>
        </div>
        
        <div className={styles.countdown}>
          <div className={styles.timeBlock}>
            <span className={styles.value}>{timeLeft.days.toString().padStart(2, '0')}</span>
            <span className={styles.label}>DAYS</span>
          </div>
          <span className={styles.colon}>:</span>
          <div className={styles.timeBlock}>
            <span className={styles.value}>{timeLeft.hours.toString().padStart(2, '0')}</span>
            <span className={styles.label}>HRS</span>
          </div>
          <span className={styles.colon}>:</span>
          <div className={styles.timeBlock}>
            <span className={styles.value}>{timeLeft.minutes.toString().padStart(2, '0')}</span>
            <span className={styles.label}>MIN</span>
          </div>
          <span className={styles.colon}>:</span>
          <div className={styles.timeBlock}>
            <span className={styles.value}>{timeLeft.seconds.toString().padStart(2, '0')}</span>
            <span className={styles.label}>SEC</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NextEpisodeTimer;
