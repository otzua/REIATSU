import HalftoneWave from '../components/HalftoneWave';
import CinemaHero from '../components/CinemaHero';
import CinemaContinueWatching from '../components/CinemaContinueWatching';
import UpcomingMovies from '../components/UpcomingMovies';
import TopRatedMovies from '../components/TopRatedMovies';
import CinemaMovies from '../components/CinemaMovies';
import styles from './Home.module.css';

const Cinema = () => {
  return (
    <div className={styles.homeContainer}>
      <HalftoneWave />
      <div className={styles.content}>
        <CinemaHero />
        <CinemaContinueWatching />
        <UpcomingMovies />
        <CinemaMovies />
        <TopRatedMovies />
      </div>
    </div>
  );
};

export default Cinema;
