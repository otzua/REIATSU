import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Loader2, Music as MusicIcon, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HalftoneWave from '../components/HalftoneWave';
import MusicHero from '../components/MusicHero';
import MusicGrid from '../components/MusicGrid';
import SmartImage from '../components/SmartImage';
import { musicApi, type Track } from '../services/musicApi';
import styles from './Home.module.css';

const Music = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingStream, setLoadingStream] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  // Downloading states
  const [downloadingTrackId, setDownloadingTrackId] = useState<string | null>(null);
  const [downloadMessage, setDownloadMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const handleDownload = async (track: Track, e?: React.MouseEvent) => {
    if (e) e.stopPropagation(); // Avoid triggering track playback if clicked on a card
    setDownloadingTrackId(track.id);
    setDownloadMessage({ text: `Extracting metadata & downloading "${track.name}" as FLAC...`, type: 'info' });

    try {
      await musicApi.download(track);
      setDownloadMessage({ text: `Successfully queued FLAC download for "${track.name}"!`, type: 'success' });
    } catch (err) {
      setDownloadMessage({ text: `Failed to start FLAC download for "${track.name}".`, type: 'error' });
    } finally {
      // Keep downloading spinner for visual feedback, then reset
      setTimeout(() => {
        setDownloadingTrackId(null);
      }, 1500);
    }
  };

  useEffect(() => {
    if (downloadMessage) {
      const timer = setTimeout(() => {
        setDownloadMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [downloadMessage]);

  // Tab Navigation for Lossless Library Sync
  const [activeTab, setActiveTab] = useState<'search' | 'sync'>('search');
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [syncing, setSyncing] = useState(false);

  const handlePlaylistSync = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = spotifyUrl.trim();
    if (!trimmedUrl) return;

    if (!trimmedUrl.includes('spotify.com') && !trimmedUrl.includes('youtu')) {
      setDownloadMessage({ text: 'Please enter a valid Spotify or YouTube link.', type: 'error' });
      return;
    }

    setSyncing(true);
    setDownloadMessage({ text: 'Initializing Lossless FLAC Sync...', type: 'info' });

    try {
      await musicApi.download({
        id: `sync-${Date.now()}`,
        name: 'Link Sync',
        artist: 'System',
        album: 'Sync',
        poster: '',
        url: trimmedUrl,
      });
      setDownloadMessage({ text: 'Lossless FLAC Sync successfully started in background!', type: 'success' });
      setSpotifyUrl('');
    } catch {
      setDownloadMessage({ text: 'Failed to start sync. Is the backend music server online?', type: 'error' });
    } finally {
      setSyncing(false);
    }
  };

  // Player state
  const [progress, setProgress] = useState(0); // 0-1
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // ─── Search ───────────────────────────────────────────────────────────────
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setSearchError(null);
    try {
      const tracks = await musicApi.search(query);
      setSearchResults(tracks);
      if (tracks.length === 0) setSearchError('No tracks found. Try a different search.');
    } catch {
      setSearchError('Failed to reach the music API. Is it running?');
    } finally {
      setSearching(false);
    }
  };

  // ─── Playback ─────────────────────────────────────────────────────────────
  const playTrack = useCallback(async (track: Track, trackQueue?: Track[]) => {
    // Toggle if same track is clicked
    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audioRef.current?.pause();
      } else {
        audioRef.current?.play().catch(console.error);
      }
      return;
    }

    setCurrentTrack(track);
    setIsPlaying(false);
    setLoadingStream(true);
    setStreamError(null);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);

    if (trackQueue) setQueue(trackQueue);

    try {
      const result = await musicApi.stream(track);
      if (audioRef.current) {
        audioRef.current.src = result.stream_url;
        audioRef.current.volume = muted ? 0 : volume;
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch {
      setStreamError(`Couldn't stream "${track.name}". Try another track.`);
    } finally {
      setLoadingStream(false);
    }
  }, [currentTrack, isPlaying, volume, muted]);

  const skipForward = () => {
    if (!currentTrack || queue.length === 0) return;
    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    if (idx >= 0 && idx < queue.length - 1) {
      playTrack(queue[idx + 1], queue);
    }
  };

  const skipBack = () => {
    if (!currentTrack) return;
    // If more than 3 seconds in, restart the track
    if (currentTime > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
      return;
    }
    if (queue.length === 0) return;
    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    if (idx > 0) playTrack(queue[idx - 1], queue);
  };

  // ─── Audio events ─────────────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    };
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => { setIsPlaying(false); skipForward(); };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, [skipForward]);

  // Volume sync
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume;
    }
  }, [volume, muted]);

  // ─── Progress bar seek ────────────────────────────────────────────────────
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressRef.current;
    if (!bar || !audioRef.current || !duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = ratio * duration;
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const fmt = (secs: number) => {
    if (!secs || isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className={styles.homeContainer}>
      <HalftoneWave />

      <div className={styles.content} style={{ paddingBottom: '120px' }}>
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '1.5rem', padding: '0 5%', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('search')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'search' ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === 'search' ? '#fff' : 'rgba(255,255,255,0.45)',
              paddingBottom: '0.75rem',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '0.05em',
            }}
          >
            SEARCH & PLAY
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sync')}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'sync' ? '2px solid var(--accent)' : '2px solid transparent',
              color: activeTab === 'sync' ? '#fff' : 'rgba(255,255,255,0.45)',
              paddingBottom: '0.75rem',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '0.05em',
            }}
          >
            LOSSLESS SYNC (PLAYLIST DOWNLOADER)
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'search' ? (
            <motion.div
              key="search-section"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
            >
              {/* Search Bar */}
              <section style={{ padding: '0 5%', marginBottom: '2rem' }}>
                <form onSubmit={handleSearch} style={{ position: 'relative', maxWidth: '600px' }}>
                  <input
                    type="text"
                    placeholder="Search for tracks, artists, or albums..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{
                      width: '100%',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      padding: '1.2rem 1.5rem 1.2rem 3.5rem',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '1rem',
                      outline: 'none',
                      backdropFilter: 'blur(10px)',
                      boxSizing: 'border-box',
                    }}
                  />
                  <Search
                    style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}
                    size={20}
                  />
                  {searching && (
                    <Loader2
                      className="animate-spin"
                      style={{ position: 'absolute', right: '1.2rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}
                      size={20}
                    />
                  )}
                </form>
                {searchError && (
                  <p style={{ marginTop: '0.75rem', color: 'rgba(255,100,100,0.8)', fontSize: '0.85rem' }}>
                    {searchError}
                  </p>
                )}
              </section>

              {searchResults.length > 0 ? (
                <section style={{ padding: '0 5%', marginBottom: '4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: '12px', height: '12px', background: 'var(--accent)' }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em' }}>SEARCH RESULTS</h2>
                    <span style={{ fontSize: '0.75rem', opacity: 0.4, marginLeft: 'auto' }}>
                      {searchResults.length} tracks
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                      gap: '1.5rem',
                    }}
                  >
                    {searchResults.map((track) => {
                      const isActive = currentTrack?.id === track.id;
                      return (
                        <motion.div
                          key={track.id}
                          whileHover={{ y: -6, scale: 1.02 }}
                          onClick={() => playTrack(track, searchResults)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div
                            style={{
                              position: 'relative',
                              aspectRatio: '1/1',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              marginBottom: '0.8rem',
                              border: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                              transition: 'border-color 0.2s',
                            }}
                          >
                            <SmartImage
                              src={track.poster}
                              alt={track.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div
                              style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(0,0,0,0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: isActive ? 1 : 0,
                                transition: 'opacity 0.2s',
                              }}
                              className="hoverOverlay"
                            >
                              {loadingStream && isActive ? (
                                <Loader2 className="animate-spin" size={32} color="white" />
                              ) : isActive && isPlaying ? (
                                <Pause fill="white" size={32} />
                              ) : (
                                <Play fill="white" size={32} />
                              )}
                            </div>
                            {/* Floating Download FLAC button */}
                            <motion.button
                              whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.95)', color: '#000' }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => handleDownload(track, e)}
                              style={{
                                position: 'absolute',
                                top: '8px',
                                right: '8px',
                                zIndex: 10,
                                background: 'rgba(0, 0, 0, 0.65)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: '#fff',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                backdropFilter: 'blur(4px)',
                                transition: 'background-color 0.2s, color 0.2s, border-color 0.2s',
                              }}
                              title="Download FLAC"
                            >
                              {downloadingTrackId === track.id ? (
                                <Loader2 className="animate-spin" size={14} />
                              ) : (
                                <Download size={14} />
                              )}
                            </motion.button>
                          </div>
                          <h3
                            style={{
                              fontSize: '0.9rem',
                              fontWeight: 600,
                              marginBottom: '0.2rem',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              color: isActive ? 'var(--accent)' : undefined,
                              transition: 'color 0.2s',
                            }}
                          >
                            {track.name}
                          </h3>
                          <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>{track.artist}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                </section>
              ) : (
                <div key="home">
                  <MusicHero onPlay={playTrack} />
                  <MusicGrid 
                    title="TRENDING ALBUMS" 
                    category="trending" 
                    onPlay={playTrack} 
                    currentTrackId={currentTrack?.id} 
                    isPlaying={isPlaying} 
                  />
                  <MusicGrid 
                    title="LATEST RELEASES" 
                    category="latest" 
                    onPlay={playTrack} 
                    currentTrackId={currentTrack?.id} 
                    isPlaying={isPlaying} 
                  />
                  <MusicGrid 
                    title="POPULAR ARTISTS" 
                    category="artists" 
                    isCircular 
                    onPlay={playTrack} 
                    currentTrackId={currentTrack?.id} 
                    isPlaying={isPlaying} 
                  />
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="sync-section"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              style={{ padding: '0 5%', maxWidth: '800px', margin: '0 auto' }}
            >
              {/* Lossless Library Sync Section */}
              <div
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  padding: '2.5rem',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
                  <div style={{ width: '12px', height: '12px', background: 'var(--accent)' }} />
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.1em' }}>LOSSLESS LIBRARY SYNC</h2>
                </div>
                <p style={{ opacity: 0.6, fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '2rem', color: '#fff' }}>
                  Paste any public Spotify Playlist, Album, or Track link below to initiate a high-fidelity FLAC sync directly to your server. 
                  The backend will download, tag, and organize all tracks in the background. (Note: Apple Music links are skipped to maintain peak metadata mapping and reliability).
                </p>

                <form onSubmit={handlePlaylistSync} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="https://open.spotify.com/playlist/... or album/track link"
                      value={spotifyUrl}
                      onChange={(e) => setSpotifyUrl(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        padding: '1.2rem 1.5rem 1.2rem 3.5rem',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                        boxSizing: 'border-box',
                      }}
                    />
                    <MusicIcon
                      style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}
                      size={20}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={syncing || !spotifyUrl.trim()}
                    style={{
                      background: '#fff',
                      color: '#000',
                      border: 'none',
                      padding: '1.1rem 2rem',
                      borderRadius: '8px',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      cursor: (syncing || !spotifyUrl.trim()) ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.75rem',
                      opacity: !spotifyUrl.trim() ? 0.5 : 1,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    {syncing ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>INITIALIZING SYNC...</span>
                      </>
                    ) : (
                      <>
                        <Download size={18} />
                        <span>START LOSSLESS SYNC</span>
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Info Card Guides */}
                <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>✓ PLAYLIST SYNC</h4>
                    <p style={{ fontSize: '0.75rem', opacity: 0.5, lineHeight: '1.5' }}>Synchronizes every single track in the Spotify playlist, complete with metadata tags and high-resolution covers.</p>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>✓ ALBUM SYNC</h4>
                    <p style={{ fontSize: '0.75rem', opacity: 0.5, lineHeight: '1.5' }}>Downloads entire music albums, preserving original track orders, album details, and year parameters.</p>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent)', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>✓ INDIVIDUAL TRACKS</h4>
                    <p style={{ fontSize: '0.75rem', opacity: 0.5, lineHeight: '1.5' }}>Simply paste a track link to instantly cache it as a lossless FLAC in your backend downloader folder.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stream error toast */}
      <AnimatePresence>
        {streamError && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'fixed',
              bottom: currentTrack ? '110px' : '2rem',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(200,50,50,0.9)',
              color: '#fff',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              zIndex: 1100,
              maxWidth: '90vw',
              textAlign: 'center',
            }}
            onClick={() => setStreamError(null)}
          >
            {streamError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Download state toast */}
      <AnimatePresence>
        {downloadMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'fixed',
              bottom: currentTrack ? '110px' : '2rem',
              left: '50%',
              transform: 'translateX(-50%)',
              background: downloadMessage.type === 'success' 
                ? 'rgba(29, 185, 84, 0.95)' 
                : downloadMessage.type === 'error' 
                ? 'rgba(200, 50, 50, 0.95)' 
                : 'rgba(20, 20, 20, 0.95)',
              border: downloadMessage.type === 'info' ? '1px solid rgba(255,255,255,0.1)' : 'none',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              color: '#fff',
              padding: '0.85rem 1.75rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              zIndex: 1100,
              maxWidth: '90vw',
              textAlign: 'center',
              backdropFilter: 'blur(12px)',
              cursor: 'pointer',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
            onClick={() => setDownloadMessage(null)}
          >
            {downloadMessage.type === 'info' && <Loader2 className="animate-spin" size={16} />}
            <span>{downloadMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Global Player Bar ── */}
      <AnimatePresence>
        {currentTrack && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              width: '100%',
              background: 'rgba(8, 8, 8, 0.97)',
              backdropFilter: 'blur(24px)',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              padding: '0 5%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 1000,
              height: '90px',
              gap: '1rem',
            }}
          >
            {/* Track info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '28%', minWidth: 0 }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {currentTrack.poster ? (
                  <SmartImage
                    src={currentTrack.poster}
                    alt={currentTrack.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      background: 'rgba(255,255,255,0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <MusicIcon size={24} opacity={0.4} />
                  </div>
                )}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h4
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginBottom: '0.1rem',
                  }}
                >
                  {currentTrack.name}
                </h4>
                <p style={{ fontSize: '0.78rem', opacity: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {currentTrack.artist}
                </p>
              </div>
              {/* Premium FLAC Download Action in Player Bar */}
              <motion.button
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.12)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDownload(currentTrack)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--accent, #fff)',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                }}
                title="Download Lossless FLAC to local library"
              >
                {downloadingTrackId === currentTrack.id ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Download size={16} />
                )}
              </motion.button>
            </div>

            {/* Controls + progress */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.6rem',
                flex: 1,
                maxWidth: '500px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <button onClick={skipBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', opacity: 0.7 }}>
                  <SkipBack size={20} />
                </button>
                <button
                  onClick={() => {
                    if (loadingStream) return;
                    if (isPlaying) {
                      audioRef.current?.pause();
                    } else {
                      audioRef.current?.play().catch(console.error);
                    }
                  }}
                  style={{
                    background: '#fff',
                    color: '#000',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: loadingStream ? 'wait' : 'pointer',
                    flexShrink: 0,
                  }}
                >
                  {loadingStream ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : isPlaying ? (
                    <Pause size={20} fill="black" />
                  ) : (
                    <Play size={20} fill="black" />
                  )}
                </button>
                <button onClick={skipForward} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', opacity: 0.7 }}>
                  <SkipForward size={20} />
                </button>
              </div>

              {/* Progress bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
                <span style={{ fontSize: '0.7rem', opacity: 0.45, flexShrink: 0, minWidth: '32px', textAlign: 'right' }}>
                  {fmt(currentTime)}
                </span>
                <div
                  ref={progressRef}
                  onClick={handleSeek}
                  style={{
                    flex: 1,
                    height: '4px',
                    background: 'rgba(255,255,255,0.12)',
                    borderRadius: '2px',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      background: 'var(--accent, #fff)',
                      width: `${progress * 100}%`,
                      borderRadius: '2px',
                      transition: 'width 0.1s linear',
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.7rem', opacity: 0.45, flexShrink: 0, minWidth: '32px' }}>
                  {fmt(duration)}
                </span>
              </div>
            </div>

            {/* Volume */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '18%', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setMuted((m) => !m)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', opacity: 0.7 }}
              >
                {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setVolume(v);
                  if (v > 0) setMuted(false);
                }}
                style={{
                  width: '80px',
                  accentColor: 'var(--accent, #fff)',
                  cursor: 'pointer',
                }}
              />
            </div>

            <audio ref={audioRef} />
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .hoverOverlay:hover { opacity: 1 !important; }
        input[type="range"] { appearance: none; height: 4px; border-radius: 2px; background: rgba(255,255,255,0.15); }
        input[type="range"]::-webkit-slider-thumb { appearance: none; width: 12px; height: 12px; border-radius: 50%; background: #fff; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default Music;
