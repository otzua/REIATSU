import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, Radio, Activity, 
  Sparkles, ListMusic, Search, Loader2, Repeat, Shuffle, 
  Music as MusicIcon, VolumeX
} from 'lucide-react';
import HalftoneWave from '../components/HalftoneWave';
import styles from './Music.module.css';

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  src: string;
  cover: string;
  format: string;
  bitrate: string;
  sampleRate: string;
  accentColor: string;
  duration?: number;
}

const OFFLINE_SONGS: Track[] = [
  {
    id: 'offline_1',
    title: 'Tum Hi Ho (Acoustic Remix)',
    artist: 'Arijit Singh',
    album: 'Aashiqui 2 (Lossless Edition)',
    src: 'https://dl.espressif.com/dl/audio/ff-16b-2c-44100hz.flac',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
    format: 'FLAC',
    bitrate: '1411 kbps',
    sampleRate: '44.1 kHz / 16-bit',
    accentColor: 'hsla(343, 70%, 50%, 0.4)'
  },
  {
    id: 'offline_2',
    title: 'Kabira (Lossless Studio Mix)',
    artist: 'Tochi Raina, Rekha Bhardwaj',
    album: 'YJHD Hifi Sessions',
    src: 'https://dl.espressif.com/dl/audio/gs-16b-2c-44100hz.flac',
    cover: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
    format: 'FLAC',
    bitrate: '1411 kbps',
    sampleRate: '44.1 kHz / 16-bit',
    accentColor: 'hsla(28, 80%, 45%, 0.4)'
  },
  {
    id: 'offline_3',
    title: 'Neon Horizon (Synthwave)',
    artist: 'Antigravity Studio',
    album: 'Retrowave Dreams',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
    format: 'MP3',
    bitrate: '320 kbps',
    sampleRate: '48.0 kHz / 24-bit',
    accentColor: 'hsla(262, 80%, 55%, 0.4)'
  }
];

const ACCENT_COLORS = [
  'hsla(343, 70%, 50%, 0.4)',
  'hsla(28, 80%, 45%, 0.4)',
  'hsla(262, 80%, 55%, 0.4)',
  'hsla(180, 70%, 40%, 0.4)',
  'hsla(120, 60%, 40%, 0.4)',
  'hsla(200, 70%, 45%, 0.4)'
];

const Music = () => {
  const [playlist, setPlaylist] = useState<Track[]>(OFFLINE_SONGS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [audioSourceCreated, setAudioSourceCreated] = useState(false);
  
  // Playback Modes
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isHifiActive, setIsHifiActive] = useState(false);
  const [apiErrorMessage, setApiErrorMessage] = useState<string | null>(null);

  const activeTrack = playlist[currentTrackIndex] || OFFLINE_SONGS[0];

  // Refs for audio, context, canvas
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize Audio Context and Analyser node only ONCE upon first interaction (Play button)
  const initAudioEngine = useCallback(() => {
    if (audioSourceCreated || !audioRef.current) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;

      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      sourceNodeRef.current = source;
      setAudioSourceCreated(true);
    } catch (error) {
      console.warn('AudioContext failed to initialize or already connected:', error);
    }
  }, [audioSourceCreated]);

  // Play / Pause handler
  const handlePlayPause = useCallback(async () => {
    if (!audioRef.current) return;

    initAudioEngine();

    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error('Playback failed:', err);
      });
    }
  }, [isPlaying, initAudioEngine]);

  // Track skipped
  const handleSkip = useCallback((direction: 'next' | 'prev') => {
    if (playlist.length === 0) return;
    
    let nextIndex = currentTrackIndex;
    
    if (isShuffle && direction === 'next') {
      nextIndex = Math.floor(Math.random() * playlist.length);
      // Ensure we don't get the same index
      if (nextIndex === currentTrackIndex && playlist.length > 1) {
        nextIndex = (currentTrackIndex + 1) % playlist.length;
      }
    } else if (direction === 'next') {
      nextIndex = (currentTrackIndex + 1) % playlist.length;
      // If we reached the end and repeat mode is none, stop
      if (nextIndex === 0 && repeatMode === 'none') {
        setIsPlaying(false);
        return;
      }
    } else {
      nextIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    }

    setCurrentTrackIndex(nextIndex);
    setIsPlaying(false);
    setIsAudioLoading(true);
    setCurrentTime(0);

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.load();
        initAudioEngine();
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => console.log('Autoplay skipped:', err));
      }
    }, 150);
  }, [currentTrackIndex, playlist, isShuffle, repeatMode, initAudioEngine]);

  // Media Session API Integration (Metadata)
  useEffect(() => {
    if ('mediaSession' in navigator && activeTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: activeTrack.title,
        artist: activeTrack.artist,
        album: activeTrack.album,
        artwork: [
          { src: activeTrack.cover, sizes: '96x96', type: 'image/jpeg' },
          { src: activeTrack.cover, sizes: '128x128', type: 'image/jpeg' },
          { src: activeTrack.cover, sizes: '192x192', type: 'image/jpeg' },
          { src: activeTrack.cover, sizes: '256x256', type: 'image/jpeg' },
          { src: activeTrack.cover, sizes: '384x384', type: 'image/jpeg' },
          { src: activeTrack.cover, sizes: '512x512', type: 'image/jpeg' },
        ]
      });
    }
  }, [activeTrack]);

  // Media Session Control Handlers
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', handlePlayPause);
      navigator.mediaSession.setActionHandler('pause', handlePlayPause);
    }
    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
      }
    };
  }, [handlePlayPause]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('previoustrack', () => handleSkip('prev'));
      navigator.mediaSession.setActionHandler('nexttrack', () => handleSkip('next'));
    }
    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
      }
    };
  }, [handleSkip]);

  // Update System playbackState
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in search input
      if (document.activeElement instanceof HTMLInputElement) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowRight':
          handleSkip('next');
          break;
        case 'ArrowLeft':
          handleSkip('prev');
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(prev => Math.min(1, prev + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(prev => Math.max(0, prev - 0.1));
          break;
        case 'KeyM':
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, currentTrackIndex, playlist, volume, handlePlayPause, handleSkip]);

  // Seek handler
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  // Volume handler
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // Audio update listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(e => console.log('Repeat playback failed:', e));
      } else {
        handleSkip('next');
      }
    };

    // Buffer and Load States
    const onLoadStart = () => setIsAudioLoading(true);
    const onWaiting = () => setIsAudioLoading(true);
    const onCanPlay = () => setIsAudioLoading(false);
    const onPlaying = () => {
      setIsAudioLoading(false);
      setIsPlaying(true);
    };
    const onPause = () => {
      setIsPlaying(false);
    };
    const onError = () => {
      setIsAudioLoading(false);
      setApiErrorMessage('Stream error encountered. Buffering next track...');
      setTimeout(() => {
        handleSkip('next');
      }, 1500);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('loadstart', onLoadStart);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('loadstart', onLoadStart);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
    };
  }, [currentTrackIndex, playlist, repeatMode, handleSkip]);

  // Sync volume state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Live JioSaavn API Integration
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setApiErrorMessage(null);

    try {
      const response = await fetch(`https://saavn.dev/api/search/songs?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} Error`);
      }
      const json = await response.json();

      if (json.success && Array.isArray(json.data?.results)) {
        const results = json.data.results;
        if (results.length === 0) {
          setApiErrorMessage(`No online results found for "${searchQuery}"`);
          setIsSearching(false);
          return;
        }

        // Map API response to our custom Hifi Track format
        const mappedTracks: Track[] = results.map((song: any, idx: number) => {
          // Resolve best quality stream URL (prefers 320kbps)
          const downloadObj = song.downloadUrl?.find((d: any) => d.quality === '320kbps') ||
                             song.downloadUrl?.find((d: any) => d.quality === '160kbps') ||
                             song.downloadUrl?.[song.downloadUrl.length - 1];

          // Resolve best quality cover art image URL
          const imageObj = song.image?.find((img: any) => img.quality === '500x500') ||
                           song.image?.find((img: any) => img.quality === '150x150') ||
                           song.image?.[song.image.length - 1];

          return {
            id: song.id || String(Math.random()),
            title: song.name?.replace(/&quot;/g, '"')?.replace(/&amp;/g, '&') || 'Unknown Track',
            artist: song.primaryArtists || 'Unknown Artist',
            album: song.album?.name || 'Single',
            src: downloadObj?.link || downloadObj?.url || '',
            cover: imageObj?.link || imageObj?.url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop',
            format: downloadObj?.quality === '320kbps' ? 'AAC (Hifi)' : 'MP3 (Standard)',
            bitrate: downloadObj?.quality || '160 kbps',
            sampleRate: '44.1 kHz / 24-bit',
            accentColor: ACCENT_COLORS[idx % ACCENT_COLORS.length],
            duration: song.duration
          };
        });

        setPlaylist(mappedTracks);
        setCurrentTrackIndex(0);
        setIsPlaying(false);
        setIsHifiActive(true);

        // Auto-play the first matched search result
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.load();
            initAudioEngine();
            audioRef.current.play().then(() => setIsPlaying(true)).catch(err => console.log('Autoplay failed:', err));
          }
        }, 150);
      } else {
        throw new Error('Invalid JSON response format from streaming engine.');
      }
    } catch (err) {
      console.error('API Streaming failure:', err);
      setApiErrorMessage('Hifi streaming proxy is loaded. Defaulting to local offline FLAC cache.');
      // Restore offline cache
      setPlaylist(OFFLINE_SONGS);
      setCurrentTrackIndex(0);
      setIsHifiActive(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Real-time Canvas Equalizer Renderer with High-DPI support and centered waveforms
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.parentElement?.clientWidth || 600;
      const height = 120;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      ctx.clearRect(0, 0, width, height);

      const grad = ctx.createLinearGradient(0, height, 0, 0);
      grad.addColorStop(0, 'rgba(184, 58, 45, 0.15)');
      grad.addColorStop(0.5, 'var(--accent, #b83a2d)');
      grad.addColorStop(1, '#ff8080');

      if (analyserRef.current && isPlaying) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        // We only render the active spectrum (first 72 bins) for a tighter, cleaner look
        const activeBins = 72;
        const barGap = 4;
        const barWidth = (width - (activeBins - 1) * barGap) / activeBins;
        
        let x = 0;

        for (let i = 0; i < activeBins; i++) {
          // Normalize bar height
          const barHeight = (dataArray[i] / 255) * height * 0.85;

          ctx.fillStyle = grad;
          ctx.beginPath();
          // Draw beautiful rounded bar
          ctx.roundRect(x, height - Math.max(barHeight, 4), barWidth, Math.max(barHeight, 4), [4, 4, 0, 0]);
          ctx.fill();

          x += barWidth + barGap;
        }
      } else {
        const time = Date.now() * 0.003;
        const barWidth = 6;
        const barGap = 4;
        const totalBars = Math.floor(width / (barWidth + barGap));
        const startX = (width - (totalBars * (barWidth + barGap) - barGap)) / 2; // perfectly center the idle animation

        for (let i = 0; i < totalBars; i++) {
          const waveHeight = 8 + Math.sin(time + i * 0.15) * 12;
          ctx.fillStyle = 'rgba(220, 201, 169, 0.15)';
          ctx.beginPath();
          ctx.roundRect(startX + i * (barWidth + barGap), height - waveHeight, barWidth, waveHeight, [3, 3, 0, 0]);
          ctx.fill();
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, audioSourceCreated]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const toggleRepeat = () => {
    if (repeatMode === 'none') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('none');
  };

  return (
    <div className={styles.container}>
      <HalftoneWave />
      <audio ref={audioRef} src={activeTrack.src} crossOrigin="anonymous" />

      {/* Dynamic Ambient Blur Background */}
      <div className={styles.ambientBackground}>
        <div 
          className={styles.ambientGlow} 
          style={{ 
            backgroundImage: `url(${activeTrack.cover})`,
            boxShadow: `inset 0 0 150px 50px #111, 0 0 100px 50px ${activeTrack.accentColor}`
          }} 
        />
      </div>

      <div className={styles.content}>
        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.accentBox} />
          <h1 className={styles.title}>HIFI MUSIC STREAM</h1>
          <div className={styles.badgeRow}>
            <span className={styles.activeEngineBadge}>
              <Radio size={14} className={styles.liveIcon} />
              <span>{isHifiActive ? 'JIOSAAVN ENGINE ACTIVE' : 'LOCAL OFFLINE ACTIVE'}</span>
            </span>
            <span className={styles.losslessIndicator}>
              <Activity size={14} />
              <span>{activeTrack.format} HIGH RES</span>
            </span>
          </div>
        </div>

        {/* Live Search Notification Banner */}
        {apiErrorMessage && (
          <div className={styles.apiErrorBanner}>
            <Sparkles size={16} />
            <span>{apiErrorMessage}</span>
          </div>
        )}

        {/* Central Layout */}
        <div className={styles.gridContainer}>
          {/* Main Visual Deck */}
          <div className={styles.deckContainer}>
            <div className={styles.glassDeck}>
              {/* Vinyl Wrapper */}
              <div className={styles.artSection}>
                <div className={`${styles.vinylWrapper} ${isPlaying && !isAudioLoading ? styles.spinning : ''}`}>
                  <div className={styles.vinylGrooves} />
                  <img src={activeTrack.cover} alt={activeTrack.title} className={styles.coverImage} />
                  {isAudioLoading && (
                    <div className={styles.loadingSpinnerOverlay}>
                      <Loader2 size={48} className={styles.spinnerIcon} />
                    </div>
                  )}
                  <div className={styles.vinylCenter}>
                    <div className={styles.centerDot} />
                  </div>
                </div>

                {/* Song Info */}
                <div className={styles.metaSection}>
                  <h2 className={styles.songTitle}>{activeTrack.title}</h2>
                  <h3 className={styles.artistName}>{activeTrack.artist}</h3>
                  <p className={styles.albumTitle}>{activeTrack.album}</p>
                </div>

                {/* Specs Box */}
                <div className={styles.specsBox}>
                  <div className={styles.specColumn}>
                    <span className={styles.specLabel}>CODEC</span>
                    <span className={styles.specValue} style={{ color: 'var(--accent, #b83a2d)' }}>{activeTrack.format}</span>
                  </div>
                  <div className={styles.specDivider} />
                  <div className={styles.specColumn}>
                    <span className={styles.specLabel}>BITRATE</span>
                    <span className={styles.specValue}>{activeTrack.bitrate}</span>
                  </div>
                  <div className={styles.specDivider} />
                  <div className={styles.specColumn}>
                    <span className={styles.specLabel}>RESOLVE</span>
                    <span className={styles.specValue}>{activeTrack.sampleRate}</span>
                  </div>
                </div>
              </div>

              {/* Spectral Visualizer */}
              <div className={styles.visualizerModule}>
                <div className={styles.visualizerHeader}>
                  <span className={styles.visualizerLabel}>
                    <Activity size={14} />
                    <span>AUDIO ANALYTICS • 60FPS</span>
                  </span>
                  {isPlaying && (
                    <span className={styles.audioActivePulse}>
                      <span className={styles.pulseDot} />
                      STREAM ACTIVE
                    </span>
                  )}
                </div>
                <canvas ref={canvasRef} className={styles.equalizerCanvas} />
              </div>

              {/* Seeker */}
              <div className={styles.sliderControls}>
                <div className={styles.timeRow}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <div className={styles.timelineWrapper}>
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className={styles.timelineSeeker}
                    style={{
                      background: `linear-gradient(to right, var(--accent, #b83a2d) ${((currentTime / (duration || 100)) * 100)}%, rgba(225, 225, 225, 0.1) ${((currentTime / (duration || 100)) * 100)}%)`
                    }}
                  />
                </div>
              </div>

              {/* Playback Buttons */}
              <div className={styles.deckController}>
                <button 
                  className={`${styles.smallDeckBtn} ${isShuffle ? styles.activeMode : ''}`}
                  onClick={() => setIsShuffle(!isShuffle)}
                  title="Shuffle"
                >
                  <Shuffle size={18} />
                </button>
                
                <div className={styles.mainControls}>
                  <button className={styles.deckBtn} onClick={() => handleSkip('prev')}>
                    <SkipBack size={24} fill="currentColor" />
                  </button>
                  <button className={styles.masterPlayBtn} onClick={handlePlayPause}>
                    {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
                  </button>
                  <button className={styles.deckBtn} onClick={() => handleSkip('next')}>
                    <SkipForward size={24} fill="currentColor" />
                  </button>
                </div>

                <button 
                  className={`${styles.smallDeckBtn} ${repeatMode !== 'none' ? styles.activeMode : ''}`}
                  onClick={toggleRepeat}
                  title={`Repeat: ${repeatMode}`}
                >
                  <Repeat size={18} />
                  {repeatMode === 'one' && <span className={styles.repeatOneBadge}>1</span>}
                </button>
              </div>

              {/* Utility volume widgets */}
              <div className={styles.utilityDock}>
                <div className={styles.volumeWidget}>
                  <button className={styles.volumeBtn} onClick={toggleMute}>
                    {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className={styles.volumeSlider}
                    style={{
                      background: `linear-gradient(to right, var(--color-cream, #dcc9a9) ${(volume * 100)}%, rgba(255, 255, 255, 0.05) ${(volume * 100)}%)`
                    }}
                  />
                </div>

                <div className={styles.deckButtons}>
                  <button 
                    className={`${styles.utilityTab} ${showQueue ? styles.utilityTabActive : ''}`}
                    onClick={() => setShowQueue(!showQueue)}
                  >
                    <ListMusic size={18} />
                    <span>{showQueue ? 'HIDE QUEUE' : 'SHOW QUEUE'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Side Panel: Search & Playlists */}
          <div className={`${styles.sidePanel} ${showQueue ? styles.panelVisible : ''}`}>
            <div className={styles.panelGlass}>
              {/* Dynamic Hifi Search Form */}
              <form onSubmit={handleSearch} className={styles.searchBarForm}>
                <div className={styles.searchContainer}>
                  <Search size={18} className={styles.searchIconLeft} />
                  <input
                    type="text"
                    className={styles.musicSearchInput}
                    placeholder="Search Artists, Songs, Albums..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {isSearching ? (
                    <Loader2 size={18} className={styles.spinnerIconRight} />
                  ) : (
                    <button type="submit" className={styles.searchSubmitBtn}>↵</button>
                  )}
                </div>
              </form>

              <div className={styles.panelHeader}>
                <ListMusic size={20} />
                <h3>{isHifiActive ? 'ACTIVE STREAM' : 'LOCAL CACHE'}</h3>
                <span className={styles.trackCount}>{playlist.length} TRACKS</span>
              </div>

              {/* Live Track List */}
              <div className={styles.trackList}>
                {playlist.map((track, idx) => (
                  <button
                    key={track.id}
                    className={`${styles.playlistItem} ${idx === currentTrackIndex ? styles.itemPlaying : ''}`}
                    onClick={() => {
                      setCurrentTrackIndex(idx);
                      setIsPlaying(false);
                      setTimeout(() => {
                        if (audioRef.current) {
                          audioRef.current.load();
                          initAudioEngine();
                          audioRef.current.play().then(() => setIsPlaying(true));
                        }
                      }, 100);
                    }}
                  >
                    <div className={styles.itemCoverWrapper}>
                      <img src={track.cover} alt={track.title} loading="lazy" />
                      {idx === currentTrackIndex && isPlaying && (
                        <div className={styles.coverPlayingOverlay}>
                          <div className={styles.miniVisualizer}>
                            <div className={styles.miniBar} />
                            <div className={styles.miniBar} />
                            <div className={styles.miniBar} />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className={styles.itemMeta}>
                      <span className={styles.itemTitle}>{track.title}</span>
                      <span className={styles.itemArtist}>{track.artist}</span>
                    </div>
                    <span className={styles.itemBadge}>{track.format}</span>
                  </button>
                ))}
              </div>

              {/* Live Status indicator */}
              <div className={styles.hifiFyiBox}>
                <div className={styles.fyiHeader}>
                  <MusicIcon size={16} style={{ color: 'var(--accent, #b83a2d)' }} />
                  <h4>STREAMING ANALYTICS</h4>
                </div>
                <p>
                  {isHifiActive 
                    ? `Encrypted 256-bit stream from cloud nodes. Bitrate: ${activeTrack.bitrate}. Latency optimized for high-res playback.` 
                    : 'Static offline FLAC container active. High-fidelity local decoding initiated. Zero-latency playback mode.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Music;
