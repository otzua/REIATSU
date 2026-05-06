import React from 'react';
import { useMousePosition } from '../hooks/useMousePosition';
import styles from './Background.module.css';

const Background: React.FC = () => {
  // Update CSS variables for performance
  useMousePosition();

  return (
    <div className={styles.backgroundContainer}>
      {/* The Core Halftone Grid */}
      <div className={styles.halftoneLayer} />
      
      {/* Post-processing effects */}
      <div className={styles.scanlines} />
      <div className={styles.noise} />
    </div>
  );
};

export default Background;
