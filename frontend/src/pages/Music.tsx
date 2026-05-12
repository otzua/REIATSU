import React from 'react';
import styles from './Music.module.css';

const Music = () => {
  return (
    <div className={styles.musicContainer}>
      <div className={styles.placeholder}>
        <div className={styles.kanji}>音</div>
        <h1 className={styles.title}>HIFI MUSIC SECTION</h1>
        <p className={styles.description}>
          The music interface is currently under reconstruction. 
          Everything has been wiped clean for a fresh start.
        </p>
      </div>
    </div>
  );
};

export default Music;
