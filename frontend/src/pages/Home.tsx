import HalftoneWave from '../components/HalftoneWave';
import Hero from '../components/Hero';
import AnimeFacts from '../components/AnimeFacts';
import NewReleases from '../components/NewReleases';
import styles from './Home.module.css';

const Home = () => {
  return (
    <div className={styles.homeContainer}>
      <HalftoneWave />
      <div className={styles.content}>
        <Hero />
        <AnimeFacts />
        <NewReleases />
      </div>
    </div>
  );
};

export default Home;
