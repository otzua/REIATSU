import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './AnimeFacts.module.css';

const dummyFacts = [
  { id: 1, anime: 'One Piece', fact: 'Did you know that Eiichiro Oda intended for One Piece to last only 5 years?' },
  { id: 2, anime: 'Naruto', fact: 'The creator of Naruto, Masashi Kishimoto, originally wanted Naruto to be a chef.' },
  { id: 3, anime: 'Attack on Titan', fact: 'The titans in Attack on Titan were inspired by drunk people the creator met at a cafe.' },
  { id: 4, anime: 'Bleach', fact: 'Bleach was initially rejected by Shonen Jump because it was too similar to Yu Yu Hakusho.' },
  { id: 5, anime: 'Death Note', fact: 'The concept of the Death Note was originally going to be a magic eraser that could bring people back to life.' },
  { id: 6, anime: 'Fullmetal Alchemist', fact: 'The author, Hiromu Arakawa, studied real alchemy books to create the magic system.' },
  { id: 7, anime: 'Dragon Ball Z', fact: 'Goku has only killed two major villains in the entire DBZ series.' },
  { id: 8, anime: 'Hunter x Hunter', fact: 'The creator of Hunter x Hunter is married to the creator of Sailor Moon.' },
  { id: 9, anime: 'Jujutsu Kaisen', fact: 'The author has stated that the series is heavily inspired by Bleach and Neon Genesis Evangelion.' },
  { id: 10, anime: 'My Hero Academia', fact: 'Deku was originally conceptualized as an adult salaryman without any powers.' },
  { id: 11, anime: 'Cowboy Bebop', fact: 'The iconic opening theme "Tank!" was almost rejected for not sounding "anime enough".' },
  { id: 12, anime: 'Demon Slayer', fact: 'The iconic earrings Tanjiro wears were slightly redesigned in the anime for the Chinese and South Korean broadcasts.' },
];

const BATCH_SIZE = 3;
const ROTATION_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
const STORAGE_KEY = 'reiatsu_facts_state';

const AnimeFacts = () => {
  const [batchIndex, setBatchIndex] = useState(0);
  
  useEffect(() => {
    const syncState = () => {
      const now = Date.now();
      const stored = localStorage.getItem(STORAGE_KEY);
      
      if (stored) {
        try {
          const { startTime, index } = JSON.parse(stored);
          const elapsed = now - startTime;
          
          if (elapsed >= ROTATION_INTERVAL_MS) {
            const intervalsPassed = Math.floor(elapsed / ROTATION_INTERVAL_MS);
            const newIndex = (index + intervalsPassed) % Math.ceil(dummyFacts.length / BATCH_SIZE);
            const newStartTime = startTime + (intervalsPassed * ROTATION_INTERVAL_MS);
            
            setBatchIndex(newIndex);
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ startTime: newStartTime, index: newIndex }));
          } else {
            setBatchIndex(index);
          }
        } catch (e) {
          // Reset if corrupted
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ startTime: now, index: 0 }));
          setBatchIndex(0);
        }
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ startTime: now, index: 0 }));
        setBatchIndex(0);
      }
    };

    // Run immediately on mount
    syncState();

    // Check every minute if we need to rotate
    const interval = setInterval(syncState, 60000);
    return () => clearInterval(interval);
  }, []);

  const currentFacts = dummyFacts.slice(batchIndex * BATCH_SIZE, (batchIndex + 1) * BATCH_SIZE);

  return (
    <section className={styles.factsSection}>
      <div className={styles.header}>
        <div className={styles.accentBar}></div>
        <h2 className={styles.title}>ANIME FACTS</h2>
        <div className={styles.accentBar}></div>
      </div>
      
      <div className={styles.gridWrapper}>
        <AnimatePresence mode="wait">
          <motion.div 
            key={batchIndex}
            className={styles.grid}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
          >
            {currentFacts.map((fact) => (
              <motion.div 
                key={fact.id}
                className={styles.factCard}
                whileHover={{ y: -5, borderColor: 'var(--color-cream)' }}
              >
                <div className={styles.animeTag}>{fact.anime}</div>
                <p className={styles.factText}>{fact.fact}</p>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default AnimeFacts;
