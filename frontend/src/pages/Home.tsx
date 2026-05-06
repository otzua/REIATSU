import React from 'react';
import HalftoneWave from '../components/HalftoneWave';
import styles from './Home.module.css';

const Home = () => {
  return (
    <div className={styles.homeContainer}>
      <HalftoneWave />
    </div>
  );
};

export default Home;
