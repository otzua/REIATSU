import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Repeat1, Volume2, VolumeX, ListMusic, ChevronDown, Download, Loader2, MoreHorizontal, Mic2 } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { musicApi } from '../../services/musicApi';
import type { LyricsResult } from '../../services/musicApi';
import SmartImage from '../SmartImage';
import styles from './ExpandedPlayer.module.css';

interface LrcLine {
  time: number;
  text: string;
}

function parseLrc(raw: string): LrcLine[] {
  const lines: LrcLine[] = [];
  for (const line of raw.split('\n')) {
    const match = line.match(/^\[(\d+):(\d+)\.(\d+)\](.*)/);
    if (match) {
      const mins = parseInt(match[1]);
      const secs = parseInt(match[2]);
      const fraction = parseFloat('0.' + match[3]);
      const time = mins * 60 + secs + fraction;
      const text = match[4].trim();
      if (text) lines.push({ time, text });
    }
  }
  return lines.sort((a, b) => a.time - b.time);
}

const ExpandedPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    loadingStream,
    volume,
    muted,
    duration,
    shuffle,
    repeat,
    isExpanded,
    setIsExpanded,
    togglePlay,
    skipForward,
    skipBack,
    setVolume,
    setMuted,
    seek,
    toggleShuffle,
    toggleRepeat,
    setIsQueueOpen,
    audioRef
  } = useMusic();

  const navigate = useNavigate();
  const [resolvedArtistId, setResolvedArtistId] = useState<string | null>(null);

  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState<LyricsResult | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [syncTime, setSyncTime] = useState(0);

  const lyricsScrollRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();

  useEffect(() => {
    if (!currentTrack) return;
    const timer = setTimeout(() => setResolvedArtistId(null), 0);
    musicApi.resolveArtistId(currentTrack.artist)
      .then(res => { if (res?.id) setResolvedArtistId(res.id); })
      .catch(err => console.error('Error resolving artist', err));
    return () => clearTimeout(timer);
  }, [currentTrack]);

  useEffect(() => {
    if (!currentTrack) return;
    setLyrics(null);
    setShowLyrics(false);
    let isMounted = true;

    const prefetch = async () => {
      setLoadingLyrics(true);
      try {
        const res = await musicApi.lyrics(currentTrack.name, currentTrack.artist);
        if (isMounted) setLyrics(res);
      } catch (err) {
        console.error('Failed to prefetch lyrics', err);
      } finally {
        if (isMounted) setLoadingLyrics(false);
      }
    };
    prefetch();
    return () => { isMounted = false; };
  }, [currentTrack]);

  const lrcLines = useMemo<LrcLine[]>(() => {
    if (lyrics?.syncedLyrics) return parseLrc(lyrics.syncedLyrics);
    return [];
  }, [lyrics]);

  useEffect(() => {
    if (!showLyrics || !isPlaying || !audioRef.current) return;
    
    const updateTime = () => {
      if (audioRef.current) {
        setSyncTime(audioRef.current.currentTime);
      }
      rafRef.current = requestAnimationFrame(updateTime);
    };
    
    rafRef.current = requestAnimationFrame(updateTime);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [showLyrics, isPlaying, audioRef]);

  const activeLineIndex = useMemo(() => {
    if (!lrcLines.length) return -1;
    let idx = 0;
    // Tiny offset to make lyrics appear right exactly as sung
    const lookaheadTime = syncTime + 0.1;
    for (let i = 0; i < lrcLines.length; i++) {
      if (lookaheadTime >= lrcLines[i].time) idx = i;
      else break;
    }
    return idx;
  }, [lrcLines, syncTime]);

  useEffect(() => {
    if (!showLyrics || activeLineIndex < 0 || !activeLineRef.current || !lyricsScrollRef.current) return;
    
    // Custom smooth scroll implementation for better Apple Music feel
    const container = lyricsScrollRef.current;
    const activeEl = activeLineRef.current;
    
    // Calculate the position to center the active element
    const containerHeight = container.clientHeight;
    const activeElTop = activeEl.offsetTop;
    const activeElHeight = activeEl.offsetHeight;
    
    const targetScroll = activeElTop - (containerHeight / 2) + (activeElHeight / 2);
    
    container.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  }, [activeLineIndex, showLyrics]);

  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(0);

  // For the seekbar, we can still use the precise syncTime to be smooth, or fallback to standard
  const displayTime = isDragging ? dragValue : (audioRef.current?.currentTime || 0);

  if (!currentTrack) return null;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const hasLyrics = lyrics && (lyrics.syncedLyrics || lyrics.plainLyrics);

  return (
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={styles.container}
        >
          <div className={styles.background}>
            <SmartImage src={currentTrack.poster} alt="" className={styles.bgImage} />
            <div className={styles.overlay} />
          </div>

          {/* Top Header */}
          <div className={styles.header}>
            <button className={styles.iconButton} onClick={() => setIsExpanded(false)}>
              <ChevronDown size={28} />
            </button>
            <div className={styles.headerTitle}>
              <span>NOW PLAYING</span>
              <strong>{currentTrack.album}</strong>
            </div>
            <button className={styles.iconButton}>
              <MoreHorizontal size={24} />
            </button>
          </div>

          {/* Main Layout Area - Two Columns when lyrics are shown */}
          <div className={`${styles.mainLayout} ${showLyrics ? styles.showLyricsLayout : ''}`}>
            
            {/* Left Column (Player Controls & Art) */}
            <div className={styles.playerColumn}>
              <div className={`${styles.artworkContainer} ${showLyrics ? styles.artworkSmall : ''}`}>
                 <motion.div
                   key="artwork"
                   animate={{ scale: isPlaying ? 1 : 0.95, opacity: 1 }}
                   transition={{ type: 'spring', damping: 20 }}
                   className={styles.artwork}
                 >
                   <SmartImage src={currentTrack.poster} alt={currentTrack.name} />
                 </motion.div>
              </div>

              {/* Track Details */}
              <div className={styles.trackDetails}>
                <div className={styles.info}>
                  <h1>{currentTrack.name}</h1>
                  <h2
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (resolvedArtistId) { setIsExpanded(false); navigate(`/music/artist/${resolvedArtistId}`); return; }
                      try {
                        const res = await musicApi.resolveArtistId(currentTrack.artist);
                        if (res?.id) { setIsExpanded(false); navigate(`/music/artist/${res.id}`); }
                      } catch (err) { console.error('Failed to navigate to artist profile', err); }
                    }}
                    title={`View ${currentTrack.artist} Profile`}
                  >
                    {currentTrack.artist}
                  </h2>
                </div>
              </div>

              {/* Controls */}
              <div className={styles.controlsSection}>
                <div className={styles.seekBarContainer}>
                  <input
                    type="range" min={0} max={duration || 100} value={displayTime}
                    onChange={(e) => { setDragValue(parseFloat(e.target.value)); if (!isDragging) setIsDragging(true); }}
                    onMouseDown={() => { setIsDragging(true); setDragValue(audioRef.current?.currentTime || 0); }}
                    onMouseUp={() => { setIsDragging(false); seek(dragValue); }}
                    onTouchStart={() => { setIsDragging(true); setDragValue(audioRef.current?.currentTime || 0); }}
                    onTouchEnd={() => { setIsDragging(false); seek(dragValue); }}
                    className={styles.seekBar}
                    style={{ '--progress': `${(displayTime / (duration || 1)) * 100}%` } as React.CSSProperties}
                  />
                  <div className={styles.timeDisplay}>
                    <span>{formatTime(displayTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                <div className={styles.mainControls}>
                  <button className={`${styles.smallButton} ${shuffle ? styles.active : ''}`} onClick={toggleShuffle}>
                    <Shuffle size={20} />
                  </button>
                  <button className={styles.mediaButton} onClick={skipBack}>
                    <SkipBack size={32} fill="currentColor" />
                  </button>
                  <button className={styles.playButton} onClick={togglePlay} disabled={loadingStream}>
                    {loadingStream ? (
                      <Loader2 className={styles.spinnerIcon} size={32} />
                    ) : isPlaying ? (
                      <Pause size={40} fill="currentColor" />
                    ) : (
                      <Play size={40} fill="currentColor" className={styles.playIconOffset} />
                    )}
                  </button>
                  <button className={styles.mediaButton} onClick={skipForward}>
                    <SkipForward size={32} fill="currentColor" />
                  </button>
                  <button className={`${styles.smallButton} ${repeat !== 'none' ? styles.active : ''}`} onClick={toggleRepeat}>
                    {repeat === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
                  </button>
                </div>

                <div className={styles.bottomSection}>
                  <div className={styles.volumeContainer}>
                    <button className={styles.iconButton} onClick={() => setMuted(!muted)}>
                      {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                    <input
                      type="range" min={0} max={1} step={0.01} value={muted ? 0 : volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className={styles.volumeSlider}
                    />
                  </div>

                  <div className={styles.actions}>
                    <button
                      className={`${styles.iconButton} ${showLyrics ? styles.activeIcon : ''}`}
                      onClick={() => setShowLyrics(!showLyrics)}
                      title={loadingLyrics ? 'Loading lyrics...' : hasLyrics ? 'Lyrics' : 'No lyrics available'}
                    >
                      {loadingLyrics && !showLyrics
                        ? <Loader2 size={22} className={styles.spinnerIcon} />
                        : <Mic2 size={22} />
                      }
                    </button>
                    <button className={styles.iconButton} onClick={() => { setIsQueueOpen(true); setIsExpanded(false); }}>
                      <ListMusic size={22} />
                    </button>
                    <button className={styles.iconButton}>
                      <Download size={22} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (Lyrics) */}
            <AnimatePresence>
              {showLyrics && (
                <motion.div
                  key="lyrics-col"
                  initial={{ opacity: 0, x: 20, width: 0 }}
                  animate={{ opacity: 1, x: 0, width: '50%' }}
                  exit={{ opacity: 0, x: 20, width: 0 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className={styles.lyricsColumn}
                >
                  <div className={styles.lyricsContainer}>
                    {loadingLyrics ? (
                      <div className={styles.lyricsLoading}>
                        <Loader2 className={styles.spinnerIcon} size={32} />
                        <p>Searching for lyrics...</p>
                      </div>
                    ) : hasLyrics ? (
                      lrcLines.length > 0 ? (
                        <div className={styles.lyricsScrollBox} ref={lyricsScrollRef}>
                          <div className={styles.lyricsSpacer} />
                          {lrcLines.map((line, i) => {
                            const isActive = i === activeLineIndex;
                            const isPast = i < activeLineIndex;
                            return (
                              <div
                                key={i}
                                ref={isActive ? activeLineRef : null}
                                className={`${styles.lrcLine} ${isActive ? styles.lrcLineActive : ''} ${isPast ? styles.lrcLinePast : ''}`}
                                onClick={() => seek(line.time)}
                              >
                                {line.text}
                              </div>
                            );
                          })}
                          <div className={styles.lyricsSpacer} />
                        </div>
                      ) : (
                        <div className={styles.lyricsScrollBox} ref={lyricsScrollRef}>
                          <p className={styles.lyricsText}>{lyrics.plainLyrics}</p>
                        </div>
                      )
                    ) : (
                      <div className={styles.lyricsEmpty}>
                        <Mic2 size={48} opacity={0.2} />
                        <p>No lyrics found for this track.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExpandedPlayer;
