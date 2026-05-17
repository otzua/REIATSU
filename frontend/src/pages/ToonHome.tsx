import { useState, useEffect } from 'react';
import HalftoneWave from '../components/HalftoneWave';
import ToonHero from '../components/ToonHero';
import ToonGrid from '../components/ToonGrid';
import { toonApi, type ToonHomeData } from '../services/toonApi';
import styles from './Home.module.css';

const ToonHome = () => {
  const [data, setData] = useState<ToonHomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchToonData = async () => {
      try {
        setLoading(true);
        const homeData = await toonApi.getHome();
        setData(homeData);
      } catch (err) {
        console.error('Failed to fetch toon data:', err);
        setError('Failed to load content. Please ensure the toon service is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchToonData();
  }, []);

  return (
    <div className={styles.homeContainer}>
      <HalftoneWave />
      <div className={styles.content}>
        <ToonHero />
        
        {error && (
          <div style={{ 
            padding: '2rem', 
            textAlign: 'center', 
            color: 'var(--accent)', 
            fontFamily: 'var(--font-heading)',
            fontSize: '1.2rem'
          }}>
            {error}
          </div>
        )}

        <ToonGrid 
          title="LATEST EPISODES" 
          items={data?.latestEpisodes || []} 
          loading={loading} 
          isEpisodes={true} 
        />

        <ToonGrid 
          title="POPULAR SERIES" 
          items={data?.latestSeries || []} 
          loading={loading} 
        />

        <ToonGrid 
          title="LATEST MOVIES" 
          items={data?.latestMovies || []} 
          loading={loading} 
        />
      </div>
    </div>
  );
};

export default ToonHome;
