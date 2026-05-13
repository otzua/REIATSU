import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Loader2, CheckCircle2, AlertCircle, Music2 } from 'lucide-react';
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

  // Download section state
  const [dlUrl, setDlUrl] = useState('');
  const [dlStatus, setDlStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [dlMsg, setDlMsg] = useState('');

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = dlUrl.trim();
    if (!trimmed) return;
    setDlStatus('loading');
    setDlMsg('Connecting to SpotiFLAC engine...');
    try {
      const res = await musicApi.download(trimmed);
      setDlStatus('success');
      setDlMsg(res.message || 'Download queued successfully!');
      setDlUrl('');
      setTimeout(() => { setDlStatus('idle'); setDlMsg(''); }, 4000);
    } catch {
      setDlStatus('error');
      setDlMsg('Failed — check the Spotify URL and that the music API is online.');
    }
  };

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

              {/* ── SpotiFLAC Download Section ── */}
              <div id="download" style={{
                padding: '2rem 5%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    background: 'rgba(220,201,169,0.06)', border: '1px solid rgba(220,201,169,0.12)',
                    borderRadius: '999px', padding: '0.35rem 1rem', marginBottom: '0.8rem',
                    fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(220,201,169,0.5)',
                    fontFamily: 'var(--font-heading)',
                  }}>
                    <Music2 size={12} />
                    SPOTIFLAC ENGINE
                  </div>
                  <h2 style={{
                    fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                    color: 'var(--color-cream)', letterSpacing: '0.2em', margin: 0,
                  }}>LOSSLESS DOWNLOAD</h2>
                  <p style={{
                    color: 'rgba(220,201,169,0.4)', fontSize: '0.8rem', marginTop: '0.4rem',
                    letterSpacing: '0.05em',
                  }}>Paste a Spotify track, album or playlist link to download in Hi-Res FLAC</p>
                </div>

                <form onSubmit={handleDownload} style={{
                  display: 'flex', gap: '0.75rem', width: '100%', maxWidth: '600px',
                  flexWrap: 'wrap', justifyContent: 'center',
                }}>
                  <input
                    type="text"
                    placeholder="https://open.spotify.com/track/..."
                    value={dlUrl}
                    onChange={(e) => setDlUrl(e.target.value)}
                    disabled={dlStatus === 'loading'}
                    style={{
                      flex: 1, minWidth: '260px',
                      background: 'rgba(220,201,169,0.05)',
                      border: '1px solid rgba(220,201,169,0.15)',
                      borderRadius: '0.75rem',
                      padding: '0.8rem 1.2rem',
                      color: 'var(--color-cream)',
                      fontSize: '0.85rem',
                      fontFamily: 'var(--font-body)',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(220,201,169,0.4)'}
                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(220,201,169,0.15)'}
                  />
                  <button
                    type="submit"
                    disabled={dlStatus === 'loading' || !dlUrl.trim()}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.8rem 1.5rem',
                      background: dlStatus === 'loading' ? 'rgba(220,201,169,0.1)' : 'rgba(220,201,169,0.12)',
                      border: '1px solid rgba(220,201,169,0.2)',
                      borderRadius: '0.75rem',
                      color: 'var(--color-cream)',
                      fontSize: '0.85rem',
                      fontFamily: 'var(--font-heading)',
                      letterSpacing: '0.08em',
                      cursor: dlStatus === 'loading' || !dlUrl.trim() ? 'not-allowed' : 'pointer',
                      opacity: !dlUrl.trim() ? 0.5 : 1,
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {dlStatus === 'loading'
                      ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /><span>Queuing...</span></>
                      : <><Download size={16} /><span>DOWNLOAD</span></>}
                  </button>
                </form>

                <AnimatePresence>
                  {dlMsg && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.6rem 1.2rem',
                        borderRadius: '0.5rem',
                        background: dlStatus === 'success'
                          ? 'rgba(100,200,120,0.08)'
                          : 'rgba(220,80,80,0.08)',
                        border: `1px solid ${dlStatus === 'success' ? 'rgba(100,200,120,0.2)' : 'rgba(220,80,80,0.2)'}`,
                        color: dlStatus === 'success' ? 'rgba(140,220,140,0.9)' : 'rgba(220,140,140,0.9)',
                        fontSize: '0.8rem',
                      }}
                    >
                      {dlStatus === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                      <span>{dlMsg}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div style={{
                  display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center',
                }}>
                  {['24-bit FLAC', 'Tidal → Qobuz → Deezer', 'Auto Metadata', 'Track / Album / Playlist'].map(badge => (
                    <span key={badge} style={{
                      fontSize: '0.6rem', letterSpacing: '0.12em',
                      color: 'rgba(220,201,169,0.3)',
                      fontFamily: 'var(--font-heading)',
                      border: '1px solid rgba(220,201,169,0.08)',
                      borderRadius: '999px', padding: '0.25rem 0.75rem',
                    }}>{badge}</span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Music;
