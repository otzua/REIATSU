import HalftoneWave from '../components/HalftoneWave';
import CinemaMovies from '../components/CinemaMovies';
import styles from './Home.module.css';

const Cinema = () => {
  return (
    <div className={styles.homeContainer}>
      <HalftoneWave />
      <div className={styles.content}>
        <div style={{ padding: '2rem 0', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', color: 'var(--accent)', marginBottom: '1rem' }}>CINEMA</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem' }}>Movies & Web Series from multiple providers</p>
        </div>
        <CinemaMovies />
      </div>
    </div>
  );
};

export default Cinema;
