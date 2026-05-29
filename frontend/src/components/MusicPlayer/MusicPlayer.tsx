import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Repeat1, Volume2, VolumeX, ListMusic, Loader2, ChevronUp, AlertCircle, X, Music2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMusic } from '../../context/MusicContext';
import { musicApi } from '../../services/musicApi';
import SmartImage from '../SmartImage';
import QueueDrawer from './QueueDrawer';
import ExpandedPlayer from './ExpandedPlayer';
import styles from './MusicPlayer.module.css';

// Routes where we show the full bottom bar
const MUSIC_ROUTES = ['/music'];

// Routes where music auto-stops when video plays (handled inside watch pages via stopMusic())
// We just hide the player entirely on these routes once music stops
const WATCH_ROUTES = ['/watch/', '/cinema/watch/', '/beyond/watch/'];

const MusicPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    loadingStream,
    streamError,
    setStreamError,
    volume,
    muted,
    currentTime,
    duration,
    shuffle,
    repeat,
    isQueueOpen,
    setIsQueueOpen,
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
  } = useMusic();

  const navigate = useNavigate();
  const location = useLocation();
  const [resolvedArtistId, setResolvedArtistId] = useState<string | null>(null);
  const [miniExpanded, setMiniExpanded] = useState(false);

  const currentTimeRef = useRef(currentTime);
  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  // Determine display mode
  const path = location.pathname;
  const isMusicSection = MUSIC_ROUTES.some(r => path.startsWith(r));
  const isWatchPage = WATCH_ROUTES.some(r => path.includes(r));

  // Keyboard shortcuts — only active in music section or when mini player is visible
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['input', 'textarea', 'select'].includes(target.tagName.toLowerCase())) return;

      const key = e.key.toLowerCase();
      if (key === ' ') {
        if (target.tagName.toLowerCase() === 'button') return;
        e.preventDefault();
        togglePlay();
      } else if (key === 'f') {
        if (isMusicSection) {
          e.preventDefault();
          setIsExpanded(!isExpanded);
        }
      } else if (key === 'm') {
        if (target.tagName.toLowerCase() === 'input') return;
        e.preventDefault();
        setMuted(!muted);
      } else if (key === 'arrowright') {
        if (target.tagName.toLowerCase() === 'input') return;
        e.preventDefault();
        seek(Math.min(currentTimeRef.current + 10, duration));
      } else if (key === 'arrowleft') {
        if (target.tagName.toLowerCase() === 'input') return;
        e.preventDefault();
        seek(Math.max(currentTimeRef.current - 10, 0));
      }
    };

    if (currentTrack) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTrack, isExpanded, isMusicSection, setIsExpanded, togglePlay, seek, duration, muted, setMuted]);

  useEffect(() => {
    if (!currentTrack) return;
    const timer = setTimeout(() => {
      setResolvedArtistId(null);
    }, 0);
    musicApi.resolveArtistId(currentTrack.artist)
      .then(res => {
        if (res && res.id) setResolvedArtistId(res.id);
      })
      .catch(err => console.error('Error resolving artist', err));
    return () => clearTimeout(timer);
  }, [currentTrack]);

  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(0);

  // Don't render anything if no track, or on watch pages
  if (!currentTrack || isWatchPage) return null;

  const displayTime = isDragging ? dragValue : currentTime;
  const progressPct = (displayTime / (duration || 1)) * 100;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ── MINI FLOATING PILL (all non-music sections) ──────────────────────────
  if (!isMusicSection) {
    return (
      <>
        <AnimatePresence>
          {streamError && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95, x: '-50%' }}
              animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
              exit={{ opacity: 0, y: 20, scale: 0.95, x: '-50%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={styles.errorToast}
            >
              <div className={styles.errorIcon}><AlertCircle size={20} /></div>
              <div className={styles.errorContent}>
                <div className={styles.errorTitle}>Playback Error</div>
                <div className={styles.errorMessage}>{streamError}</div>
              </div>
              <button className={styles.errorClose} onClick={() => setStreamError(null)}>
                <X size={16} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className={`${styles.miniPlayer} ${miniExpanded ? styles.miniExpanded : ''}`}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', damping: 24, stiffness: 260 }}
          layout
        >
          {/* Progress bar along the top */}
          <div className={styles.miniProgress}>
            <div
              className={styles.miniProgressFill}
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className={styles.miniInner}>
            {/* Artwork */}
            <div
              className={styles.miniArt}
              onClick={() => navigate('/music')}
              title="Go to Music"
            >
              {currentTrack.poster ? (
                <SmartImage src={currentTrack.poster} alt={currentTrack.name} className={styles.miniArtImg} />
              ) : (
                <div className={styles.miniArtFallback}>
                  <Music2 size={16} />
                </div>
              )}
            </div>

            {/* Info — only visible when expanded */}
            <AnimatePresence>
              {miniExpanded && (
                <motion.div
                  className={styles.miniInfo}
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={styles.miniName}>{currentTrack.name}</div>
                  <div className={styles.miniArtist}>{currentTrack.artist}</div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls */}
            <div className={styles.miniControls}>
              {miniExpanded && (
                <button className={styles.miniBtn} onClick={skipBack} title="Previous">
                  <SkipBack size={14} fill="currentColor" />
                </button>
              )}

              <button className={styles.miniPlayBtn} onClick={togglePlay} disabled={loadingStream}>
                {loadingStream ? (
                  <Loader2 size={16} className={styles.spinnerIcon} />
                ) : isPlaying ? (
                  <Pause size={16} fill="currentColor" />
                ) : (
                  <Play size={16} fill="currentColor" />
                )}
              </button>

              {miniExpanded && (
                <button className={styles.miniBtn} onClick={skipForward} title="Next">
                  <SkipForward size={14} fill="currentColor" />
                </button>
              )}

              <button
                className={styles.miniBtn}
                onClick={() => setMiniExpanded(v => !v)}
                title={miniExpanded ? 'Collapse' : 'Expand'}
              >
                <ChevronUp
                  size={14}
                  style={{
                    transform: miniExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </button>
            </div>
          </div>
        </motion.div>
      </>
    );
  }

  // ── FULL BOTTOM BAR (music section) ─────────────────────────────────────
  return (
    <>
      <QueueDrawer />
      <ExpandedPlayer />
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: isExpanded ? 100 : 0 }}
        exit={{ y: 100 }}
        className={`${styles.playerBar} glass`}
      >
        <div
          className={styles.trackInfo}
          onClick={() => setIsExpanded(true)}
        >
          <div className={styles.thumbnail}>
            {currentTrack.poster ? (
              <SmartImage src={currentTrack.poster} alt={currentTrack.name} className={styles.thumbnailImg} />
            ) : (
              <div className={styles.fallbackThumbnail}>
                <ListMusic size={24} opacity={0.3} />
              </div>
            )}
          </div>
          <div className={styles.details}>
            <div className={styles.name}>{currentTrack.name}</div>
            <div
              className={styles.artist}
              onClick={async (e) => {
                e.stopPropagation();
                if (resolvedArtistId) {
                  navigate(`/music/artist/${resolvedArtistId}`);
                  return;
                }
                try {
                  const res = await musicApi.resolveArtistId(currentTrack.artist);
                  if (res && res.id) navigate(`/music/artist/${res.id}`);
                } catch (err) {
                  console.error('Failed to navigate to artist profile', err);
                }
              }}
              title={`View ${currentTrack.artist} Profile`}
            >
              {currentTrack.artist}
            </div>
          </div>
          <ChevronUp size={20} className={styles.expandIcon} />
        </div>

        <div className={styles.controlsContainer}>
          <div className={styles.mainControls}>
            <button
              className={`${styles.controlButton} ${shuffle ? styles.active : ''}`}
              onClick={toggleShuffle}
              title="Shuffle"
            >
              <Shuffle size={18} />
            </button>

            <button className={styles.controlButton} onClick={skipBack}>
              <SkipBack size={22} fill="currentColor" />
            </button>

            <button className={styles.playPauseButton} onClick={togglePlay} disabled={loadingStream}>
              {loadingStream ? (
                <Loader2 className={styles.spinnerIcon} size={22} />
              ) : isPlaying ? (
                <Pause size={22} fill="currentColor" />
              ) : (
                <Play size={22} fill="currentColor" className={styles.playIconOffset} />
              )}
            </button>

            <button className={styles.controlButton} onClick={skipForward}>
              <SkipForward size={22} fill="currentColor" />
            </button>

            <button
              className={`${styles.controlButton} ${repeat !== 'none' ? styles.active : ''}`}
              onClick={toggleRepeat}
              title={`Repeat: ${repeat}`}
            >
              {repeat === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
            </button>
          </div>

          <div className={styles.progressBar}>
            <span className={styles.time}>{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={displayTime}
              onChange={(e) => {
                setDragValue(parseFloat(e.target.value));
                if (!isDragging) setIsDragging(true);
              }}
              onMouseDown={() => { setIsDragging(true); setDragValue(currentTime); }}
              onMouseUp={() => { setIsDragging(false); seek(dragValue); }}
              onTouchStart={() => { setIsDragging(true); setDragValue(currentTime); }}
              onTouchEnd={() => { setIsDragging(false); seek(dragValue); }}
              className={styles.seekBar}
              style={{ '--progress': `${progressPct}%` } as React.CSSProperties}
            />
            <span className={styles.time}>{formatTime(duration)}</span>
          </div>
        </div>

        <div className={styles.sideControls}>
          <div className={styles.volumeBar}>
            <button className={styles.controlButton} onClick={() => setMuted(!muted)}>
              {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className={styles.volumeSlider}
            />
          </div>
          <button
            className={`${styles.controlButton} ${isQueueOpen ? styles.active : ''}`}
            onClick={() => setIsQueueOpen(!isQueueOpen)}
            title="Queue"
          >
            <ListMusic size={20} />
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {streamError && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95, x: '-50%' }}
            animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, y: 20, scale: 0.95, x: '-50%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={styles.errorToast}
          >
            <div className={styles.errorIcon}><AlertCircle size={20} /></div>
            <div className={styles.errorContent}>
              <div className={styles.errorTitle}>Playback Error</div>
              <div className={styles.errorMessage}>{streamError}</div>
            </div>
            <button className={styles.errorClose} onClick={() => setStreamError(null)}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MusicPlayer;
