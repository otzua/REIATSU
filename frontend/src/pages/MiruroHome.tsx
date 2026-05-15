import HalftoneWave from '../components/HalftoneWave';
import Hero from '../components/Hero';
import ContinueWatching from '../components/ContinueWatching';
import AiringAnime from '../components/AiringAnime';
import UpcomingAnime from '../components/UpcomingAnime';
import TopMovies from '../components/TopMovies';
import TopAnime from '../components/TopAnime';
import AnimeFacts from '../components/AnimeFacts';
import styles from './Home.module.css';

const MiruroHome = () => {
  return (
    <div className={styles.homeContainer}>
      <HalftoneWave />
      <div className={styles.content}>
        <Hero provider="miruro" />
        <ContinueWatching />
        <AiringAnime provider="miruro" />
        <UpcomingAnime provider="miruro" />
        <TopMovies provider="miruro" />
        <TopAnime provider="miruro" />
        <AnimeFacts />
      </div>
    </div>
  );
};

export default MiruroHome;
