import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, Activity, 
  Search, Loader2, Repeat, Shuffle, VolumeX, Disc
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

const CURATED_STREAMS: Track[] = [
  {
    id: 'curated_1',
    title: 'Lo-Fi Chill Beats',
    artist: 'Lofi Records',
    album: 'Study Session',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    cover: 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?q=80&w=600&auto=format&fit=crop',
    format: 'MPEG Hifi',
    bitrate: '320 kbps',
    sampleRate: '44.1 kHz / 16-bit',
    accentColor: 'hsla(180, 70%, 40%, 0.4)'
  },
  {
    id: 'curated_2',
    title: 'Deep House Midnight',
    artist: 'Hifi Club Nodes',
    album: 'Club Anthems',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop',
    format: 'MPEG Hifi',
    bitrate: '320 kbps',
    sampleRate: '48.0 kHz / 24-bit',
    accentColor: 'hsla(120, 60%, 40%, 0.4)'
  },
  {
    id: 'curated_3',
    title: 'Acoustic Guitar Oasis',
    artist: 'String Symphony',
    album: 'Acoustics Lane',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
    cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=600&auto=format&fit=crop',
    format: 'MPEG Hifi',
    bitrate: '320 kbps',
    sampleRate: '44.1 kHz / 16-bit',
    accentColor: 'hsla(200, 70%, 45%, 0.4)'
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
  const [audioSourceCreated, setAudioSourceCreated] = useState(false);
  
  // Playback Modes
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Track[]>([]);
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
      if (nextIndex === currentTrackIndex && playlist.length > 1) {
        nextIndex = (currentTrackIndex + 1) % playlist.length;
      }
    } else if (direction === 'next') {
      nextIndex = (currentTrackIndex + 1) % playlist.length;
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

  // Play target track directly
  const playTrackDirectly = (_targetTrack: Track, targetPlaylist: Track[], index: number) => {
    setPlaylist(targetPlaylist);
    setCurrentTrackIndex(index);
    setIsPlaying(false);
    setIsAudioLoading(true);
    setCurrentTime(0);

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.load();
        initAudioEngine();
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => console.log('Track playback failed:', err));
      }
    }, 150);
  };

  // Media Session API Integration (Metadata)
  useEffect(() => {
    if ('mediaSession' in navigator && typeof MediaMetadata !== 'undefined' && activeTrack) {
      try {
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
      } catch (e) {
        console.warn('Failed to set MediaSession metadata:', e);
      }
    }
  }, [activeTrack]);

  // Media Session Control Handlers
  useEffect(() => {
    if ('mediaSession' in navigator && typeof navigator.mediaSession.setActionHandler === 'function') {
      try {
        navigator.mediaSession.setActionHandler('play', handlePlayPause);
        navigator.mediaSession.setActionHandler('pause', handlePlayPause);
      } catch (e) {
        console.warn('Failed to register MediaSession action play/pause:', e);
      }
    }
    return () => {
      if ('mediaSession' in navigator && typeof navigator.mediaSession.setActionHandler === 'function') {
        try {
          navigator.mediaSession.setActionHandler('play', null);
          navigator.mediaSession.setActionHandler('pause', null);
        } catch (e) {}
      }
    };
  }, [handlePlayPause]);

  useEffect(() => {
    if ('mediaSession' in navigator && typeof navigator.mediaSession.setActionHandler === 'function') {
      try {
        navigator.mediaSession.setActionHandler('previoustrack', () => handleSkip('prev'));
        navigator.mediaSession.setActionHandler('nexttrack', () => handleSkip('next'));
      } catch (e) {
        console.warn('Failed to register MediaSession action prev/next:', e);
      }
    }
    return () => {
      if ('mediaSession' in navigator && typeof navigator.mediaSession.setActionHandler === 'function') {
        try {
          navigator.mediaSession.setActionHandler('previoustrack', null);
          navigator.mediaSession.setActionHandler('nexttrack', null);
        } catch (e) {}
      }
    };
  }, [handleSkip]);

  // Update System playbackState
  useEffect(() => {
    if ('mediaSession' in navigator && 'playbackState' in navigator.mediaSession) {
      try {
        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
      } catch (e) {}
    }
  }, [isPlaying]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

        const mappedTracks: Track[] = results.map((song: any, idx: number) => {
          const downloadObj = song.downloadUrl?.find((d: any) => d.quality === '320kbps') ||
                             song.downloadUrl?.find((d: any) => d.quality === '160kbps') ||
                             song.downloadUrl?.[song.downloadUrl.length - 1];

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

        setSearchResults(mappedTracks);
        
        // Auto-play the first result in search results list
        playTrackDirectly(mappedTracks[0], mappedTracks, 0);

      } else {
        throw new Error('Invalid JSON response format.');
      }
    } catch (err) {
      console.error('API Streaming failure:', err);
      setApiErrorMessage('Hifi streaming search failed. Local offline files are fully active.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Real-time Canvas Equalizer inside bottom deck
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = 80 * dpr;
    canvas.height = 28 * dpr;
    ctx.scale(dpr, dpr);

    const render = () => {
      ctx.clearRect(0, 0, 80, 28);

      const resolvedAccent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#b83a2d';
      const grad = ctx.createLinearGradient(0, 28, 0, 0);
      grad.addColorStop(0, 'rgba(184, 58, 45, 0.2)');
      grad.addColorStop(1, resolvedAccent);

      if (analyserRef.current && isPlaying) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        const activeBins = 16;
        const barGap = 2;
        const barWidth = (80 - (activeBins - 1) * barGap) / activeBins;

        for (let i = 0; i < activeBins; i++) {
          const barHeight = (dataArray[i] / 255) * 28 * 0.85;
          ctx.fillStyle = grad;
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(i * (barWidth + barGap), 28 - Math.max(barHeight, 2), barWidth, Math.max(barHeight, 2), [1.5, 1.5, 0, 0]);
          } else {
            ctx.rect(i * (barWidth + barGap), 28 - Math.max(barHeight, 2), barWidth, Math.max(barHeight, 2));
          }
          ctx.fill();
        }
      } else {
        // Flat idle bars
        const activeBins = 16;
        const barGap = 2;
        const barWidth = (80 - (activeBins - 1) * barGap) / activeBins;
        const time = Date.now() * 0.003;

        for (let i = 0; i < activeBins; i++) {
          const idleHeight = 3 + Math.sin(time + i * 0.4) * 2.5;
          ctx.fillStyle = 'rgba(220, 201, 169, 0.25)';
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(i * (barWidth + barGap), 28 - idleHeight, barWidth, idleHeight, [1, 1, 0, 0]);
          } else {
            ctx.rect(i * (barWidth + barGap), 28 - idleHeight, barWidth, idleHeight);
          }
          ctx.fill();
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
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

      <div className={styles.content}>
        
        {/* Featured Hero Banner */}
        <div className={styles.heroSection}>
          <div className={styles.heroCoverWrapper}>
            <img src={activeTrack.cover} alt={activeTrack.title} className={styles.heroCover} />
          </div>
          <div className={styles.heroInfo}>
            <div className={styles.badge}>PREMIUM HIFI MUSIC</div>
            <h1 className={styles.heroTitle}>{activeTrack.title}</h1>
            <p className={styles.heroArtist}>{activeTrack.artist}</p>
            
            <div className={styles.heroMetaRow}>
              <div className={styles.heroMetaItem}>
                <Disc size={14} style={{ color: 'var(--accent)' }} />
                <span>ALBUM: {activeTrack.album}</span>
              </div>
              <div className={styles.heroMetaItem}>
                <Activity size={14} style={{ color: 'var(--accent)' }} />
                <span>{activeTrack.format} • {activeTrack.bitrate} • {activeTrack.sampleRate}</span>
              </div>
            </div>

            {/* Inline Audio Search matching Cinema search */}
            <div className={styles.searchContainer}>
              <form onSubmit={handleSearch} className={styles.searchForm}>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search over 15 million lossless songs, artists, albums..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className={styles.searchButton}>
                  {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                </button>
              </form>
              {apiErrorMessage && <p className={styles.errorText} style={{ marginTop: '0.5rem', marginLeft: '1rem' }}>{apiErrorMessage}</p>}
            </div>
          </div>
        </div>

        {/* Dynamic Search Results Section (Renders only on active search results) */}
        {searchResults.length > 0 && (
          <div className={styles.laneSection}>
            <div className={styles.laneHeader}>
              <div>
                <h2 className={styles.laneTitle}>SEARCH RESULTS</h2>
                <span className={styles.laneSubtitle}>HIFI Streaming matches</span>
              </div>
            </div>
            <div className={styles.cardGrid}>
              {searchResults.map((song, idx) => (
                <div 
                  key={song.id} 
                  className={`${styles.musicCard} ${playlist === searchResults && currentTrackIndex === idx ? styles.musicCardActive : ''}`}
                  onClick={() => playTrackDirectly(song, searchResults, idx)}
                >
                  <div className={styles.cardCoverWrapper}>
                    <img src={song.cover} alt={song.title} className={styles.cardCover} loading="lazy" />
                    <div className={styles.playOverlay}>
                      <div className={styles.playBtnCircle}>
                        {playlist === searchResults && currentTrackIndex === idx && isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" style={{ marginLeft: 3 }} />}
                      </div>
                    </div>
                  </div>
                  <div className={styles.cardMeta}>
                    <h3 className={styles.cardTitle}>{song.title}</h3>
                    <p className={styles.cardArtist}>{song.artist}</p>
                  </div>
                  <span className={styles.cardBadge}>{song.format}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lane 1: Local Lossless FLAC Cache */}
        <div className={styles.laneSection}>
          <div className={styles.laneHeader}>
            <div>
              <h2 className={styles.laneTitle}>HIFI HITS & CLASSICS</h2>
              <span className={styles.laneSubtitle}>Master quality local cache</span>
            </div>
          </div>
          <div className={styles.cardGrid}>
            {OFFLINE_SONGS.map((song, idx) => (
              <div 
                key={song.id} 
                className={`${styles.musicCard} ${playlist === OFFLINE_SONGS && currentTrackIndex === idx ? styles.musicCardActive : ''}`}
                onClick={() => playTrackDirectly(song, OFFLINE_SONGS, idx)}
              >
                <div className={styles.cardCoverWrapper}>
                  <img src={song.cover} alt={song.title} className={styles.cardCover} loading="lazy" />
                  <div className={styles.playOverlay}>
                    <div className={styles.playBtnCircle}>
                      {playlist === OFFLINE_SONGS && currentTrackIndex === idx && isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" style={{ marginLeft: 3 }} />}
                    </div>
                  </div>
                </div>
                <div className={styles.cardMeta}>
                  <h3 className={styles.cardTitle}>{song.title}</h3>
                  <p className={styles.cardArtist}>{song.artist}</p>
                </div>
                <span className={styles.cardBadge}>{song.format}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lane 2: Premium Curated Streams */}
        <div className={styles.laneSection}>
          <div className={styles.laneHeader}>
            <div>
              <h2 className={styles.laneTitle}>CURATED RADIO STREAMS</h2>
              <span className={styles.laneSubtitle}>Ambient atmospheric nodes</span>
            </div>
          </div>
          <div className={styles.cardGrid}>
            {CURATED_STREAMS.map((song, idx) => (
              <div 
                key={song.id} 
                className={`${styles.musicCard} ${playlist === CURATED_STREAMS && currentTrackIndex === idx ? styles.musicCardActive : ''}`}
                onClick={() => playTrackDirectly(song, CURATED_STREAMS, idx)}
              >
                <div className={styles.cardCoverWrapper}>
                  <img src={song.cover} alt={song.title} className={styles.cardCover} loading="lazy" />
                  <div className={styles.playOverlay}>
                    <div className={styles.playBtnCircle}>
                      {playlist === CURATED_STREAMS && currentTrackIndex === idx && isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" style={{ marginLeft: 3 }} />}
                    </div>
                  </div>
                </div>
                <div className={styles.cardMeta}>
                  <h3 className={styles.cardTitle}>{song.title}</h3>
                  <p className={styles.cardArtist}>{song.artist}</p>
                </div>
                <span className={styles.cardBadge}>{song.format}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Spotify/Apple Music Style Premium Bottom Player */}
      <div className={styles.playerBar}>
        
        {/* Left Side: Track Cover & Meta */}
        <div className={styles.playerLeft}>
          <img src={activeTrack.cover} alt={activeTrack.title} className={styles.playerCover} />
          <div className={styles.playerTrackInfo}>
            <h4 className={styles.playerTitle}>{activeTrack.title}</h4>
            <p className={styles.playerArtist}>{activeTrack.artist}</p>
          </div>
        </div>

        {/* Center Side: Media Controls & Seeker */}
        <div className={styles.playerCenter}>
          <div className={styles.playerControls}>
            <button 
              className={`${styles.controlBtn} ${isShuffle ? styles.controlBtnActive : ''}`}
              onClick={() => setIsShuffle(!isShuffle)}
              title="Shuffle"
            >
              <Shuffle size={16} />
            </button>
            <button 
              className={styles.controlBtn} 
              onClick={() => handleSkip('prev')}
              title="Previous"
            >
              <SkipBack size={18} fill="currentColor" />
            </button>
            <button 
              className={styles.playPauseBtn} 
              onClick={handlePlayPause}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isAudioLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : isPlaying ? (
                <Pause size={18} fill="currentColor" />
              ) : (
                <Play size={18} fill="currentColor" style={{ marginLeft: 2 }} />
              )}
            </button>
            <button 
              className={styles.controlBtn} 
              onClick={() => handleSkip('next')}
              title="Next"
            >
              <SkipForward size={18} fill="currentColor" />
            </button>
            <button 
              className={`${styles.controlBtn} ${repeatMode !== 'none' ? styles.controlBtnActive : ''}`}
              onClick={toggleRepeat}
              title={`Repeat: ${repeatMode}`}
            >
              <Repeat size={16} />
            </button>
          </div>

          <div className={styles.progressWrapper}>
            <span>{formatTime(currentTime)}</span>
            <input 
              type="range"
              className={styles.progressBar}
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Side: Equalizer Canvas, High-res badge, Volume */}
        <div className={styles.playerRight}>
          <canvas ref={canvasRef} className={styles.miniEqualizerCanvas} title="Hifi Equalizer" />
          
          <div className={styles.metricsBadge}>
            {activeTrack.format} • {activeTrack.bitrate}
          </div>

          <div className={styles.volumeWrapper}>
            <button className={styles.volumeBtn} onClick={toggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input 
              type="range"
              className={styles.volumeBar}
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  componentDidMount() {
    const handleError = (e: ErrorEvent) => {
      this.setState({ hasError: true, error: e.error || new Error(e.message) });
    };
    const handleRejection = (e: PromiseRejectionEvent) => {
      this.setState({ hasError: true, error: new Error(`Unhandled Promise Rejection: ${e.reason}`) });
    };
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    (window as any)._errorCleanup = () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }

  componentWillUnmount() {
    if ((window as any)._errorCleanup) {
      (window as any)._errorCleanup();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 20px',
          background: '#09090a',
          color: '#ff4d4d',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 99999
        }}>
          <div style={{
            background: 'rgba(255, 77, 77, 0.05)',
            border: '1px solid rgba(255, 77, 77, 0.15)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '640px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(20px)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#ff4d4d', margin: '0 0 16px 0', letterSpacing: '-0.02em' }}>
              MUSIC SECTION EXCEPTION
            </h1>
            <p style={{ color: '#a0a0ab', fontSize: '15px', lineHeight: '1.6', margin: '0 0 24px 0' }}>
              Reiatsu's sandbox caught an unhandled browser runtime error. The stack trace below will identify the exact line or feature blocked by the browser.
            </p>
            <div style={{
              background: '#121214',
              border: '1px solid #27272a',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'left',
              marginBottom: '24px',
              overflow: 'auto',
              maxHeight: '240px'
            }}>
              <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '14px', marginBottom: '8px', fontFamily: 'monospace' }}>
                {this.state.error?.name || 'Error'}: {this.state.error?.message || 'Unknown Exception'}
              </div>
              <pre style={{ margin: 0, fontSize: '12px', color: '#e4e4e7', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: '1.5' }}>
                {this.state.error?.stack || 'No stack trace available'}
              </pre>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button 
                onClick={() => window.location.reload()} 
                style={{
                  padding: '12px 24px',
                  background: '#ff4d4d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px',
                  transition: 'background 0.2s'
                }}
              >
                Reload Interface
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const SafeMusic = () => {
  return (
    <ErrorBoundary>
      <Music />
    </ErrorBoundary>
  );
};

export default SafeMusic;
