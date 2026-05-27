import HalftoneWave from '../components/HalftoneWave';
import Hero from '../components/Hero';
import ContinueWatching from '../components/ContinueWatching';
import AiringAnime from '../components/AiringAnime';
import UpcomingAnime from '../components/UpcomingAnime';
import TopMovies from '../components/TopMovies';
import TopAnime from '../components/TopAnime';
import AnimeFacts from '../components/AnimeFacts';
import styles from './Home.module.css';

const Home = () => {
  return (
    <div className={styles.homeContainer}>
      <HalftoneWave />
      <div className={styles.content}>
        <Hero />
        <div className={styles.gridsWrapper}>
          <ContinueWatching />
          <AiringAnime />
          <UpcomingAnime />
          <TopMovies />
          <TopAnime />
          <AnimeFacts />
        </div>
      </div>
    </div>
  );
};

export default Home;
