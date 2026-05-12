import HalftoneWave from '../components/HalftoneWave';
import CinemaHero from '../components/CinemaHero';
import CinemaMovies from '../components/CinemaMovies';
import styles from './Home.module.css';

const Cinema = () => {
  return (
    <div className={styles.homeContainer}>
      <HalftoneWave />
      <div className={styles.content}>
        <CinemaHero />
        <CinemaMovies />
      </div>
    </div>
  );
};

export default Cinema;
