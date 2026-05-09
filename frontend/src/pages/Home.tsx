import HalftoneWave from '../components/HalftoneWave';
import Hero from '../components/Hero';
import AnimeFacts from '../components/AnimeFacts';
import NewReleases from '../components/NewReleases';
import TheBigThree from '../components/TheBigThree';
import AiringAnime from '../components/AiringAnime';
import TopAnime from '../components/TopAnime';
import styles from './Home.module.css';

const Home = () => {
  return (
    <div className={styles.homeContainer}>
      <HalftoneWave />
      <div className={styles.content}>
        <Hero />
        <AiringAnime />
        <NewReleases />
        <TheBigThree />
        <TopAnime />
        <AnimeFacts />
      </div>
    </div>
  );
};

export default Home;
