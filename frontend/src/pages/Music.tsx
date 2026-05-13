import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import HalftoneWave from '../components/HalftoneWave';
import MusicHero from '../components/MusicHero';
import MusicGrid from '../components/MusicGrid';
import AlbumGrid from '../components/AlbumGrid';
import { useMusic } from '../context/MusicContext';
import { musicApi, type Track, type Album } from '../services/musicApi';
import styles from './Home.module.css';

const CACHE_KEY = 'reiatsu_music_cache_v3';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

const Music = () => {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    recentlyPlayed,
  } = useMusic();

  const [trending, setTrending] = useState<Track[]>([]);
  const [latest, setLatest] = useState<Track[]>([]);
  const [artists, setArtists] = useState<Track[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      // 1. Try to load from sessionStorage first for "Instant" feel
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { trending, latest, artists, albums, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            setTrending(trending || []);
            setLatest(latest || []);
            setArtists(artists || []);
            setAlbums(albums || []);
            return;
          }
        } catch (e) {
          console.error("Cache parse error", e);
        }
      }

      // 2. If no cache or expired, fetch from API
      try {
        const [trendingData, latestData, artistsData, albumsData] = await Promise.all([
          musicApi.trending(10).catch(() => []),
          musicApi.latest(10).catch(() => []),
          musicApi.popularArtists(10).catch(() => []),
          musicApi.albums().catch(() => [])
        ]);

        if (trendingData.length > 0) setTrending(trendingData);
        if (latestData.length > 0) setLatest(latestData);
        if (artistsData.length > 0) setArtists(artistsData);
        if (albumsData.length > 0) setAlbums(albumsData);

        // Save to cache
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          trending: trendingData,
          latest: latestData,
          artists: artistsData,
          albums: albumsData,
          timestamp: Date.now()
        }));
      } catch (err) {
        console.error('Failed to fetch music data:', err);
        setError('Failed to load music sections. Is the music API online?');
      }
    };

    loadData();
  }, []);

  const hollywoodAlbums = albums.filter(a => a.category === 'Hollywood');
  const bollywoodAlbums = albums.filter(a => a.category === 'Bollywood');

  return (
    <div className={styles.homeContainer}>
      <HalftoneWave />

      <div className={styles.content}>
        {error && trending.length === 0 ? (
          <div style={{ padding: '4rem 5%', textAlign: 'center', color: 'var(--accent)' }}>
            <p>{error}</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <MusicHero slides={trending.slice(0, 3)} onPlay={playTrack} />
            
            <div className={styles.gridsWrapper}>
              {recentlyPlayed.length > 0 && (
                <MusicGrid 
                  title="RECENTLY PLAYED" 
                  data={recentlyPlayed} 
                  onPlay={playTrack} 
                  currentTrackId={currentTrack?.id} 
                  isPlaying={isPlaying} 
                />
              )}

              <MusicGrid 
                title="TRENDING NOW" 
                data={trending} 
                onPlay={playTrack} 
                currentTrackId={currentTrack?.id} 
                isPlaying={isPlaying} 
              />

              {hollywoodAlbums.length > 0 && (
                <AlbumGrid 
                  title="TOP ALBUMS (HOLLYWOOD)" 
                  data={hollywoodAlbums} 
                />
              )}

              {bollywoodAlbums.length > 0 && (
                <AlbumGrid 
                  title="TOP ALBUMS (BOLLYWOOD)" 
                  data={bollywoodAlbums} 
                />
              )}

              <MusicGrid 
                title="LATEST RELEASES" 
                data={latest} 
                onPlay={playTrack} 
                currentTrackId={currentTrack?.id} 
                isPlaying={isPlaying} 
              />

              <MusicGrid 
                title="POPULAR ARTISTS" 
                data={artists} 
                isCircular 
                onPlay={playTrack} 
                currentTrackId={currentTrack?.id} 
                isPlaying={isPlaying} 
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Music;
