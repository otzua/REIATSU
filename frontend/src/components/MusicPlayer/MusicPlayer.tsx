import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Repeat1, Volume2, VolumeX, ListMusic, Loader2, ChevronUp, AlertCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMusic } from '../../context/MusicContext';
import { musicApi } from '../../services/musicApi';
import SmartImage from '../SmartImage';
import QueueDrawer from './QueueDrawer';
import ExpandedPlayer from './ExpandedPlayer';
import styles from './MusicPlayer.module.css';

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
  const [resolvedArtistId, setResolvedArtistId] = useState<string | null>(null);
  
  const currentTimeRef = useRef(currentTime);
  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const target = e.target as HTMLElement;
      if (['input', 'textarea', 'select'].includes(target.tagName.toLowerCase())) return;

      const key = e.key.toLowerCase();
      
      if (key === ' ') {
        if (target.tagName.toLowerCase() === 'button') return;
        e.preventDefault();
        togglePlay();
      } else if (key === 'f') {
        e.preventDefault();
        setIsExpanded(!isExpanded);
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
    
    // Only listen if a track is actually loaded (MusicPlayer is active)
    if (currentTrack) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTrack, isExpanded, setIsExpanded, togglePlay, seek, duration, muted, setMuted]);

  useEffect(() => {
    if (!currentTrack) return;
    setResolvedArtistId(null);
    musicApi.resolveArtistId(currentTrack.artist)
      .then(res => {
        if (res && res.id) {
          setResolvedArtistId(res.id);
        }
      })
      .catch(err => console.error("Error background resolving artist", err));
  }, [currentTrack]);

  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(0);

  if (!currentTrack) return null;

  const displayTime = isDragging ? dragValue : currentTime;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
          style={{ cursor: 'pointer' }}
        >
          <div className={styles.thumbnail}>
            {currentTrack.poster ? (
              <SmartImage src={currentTrack.poster} alt={currentTrack.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ background: '#333', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                  if (res && res.id) {
                    navigate(`/music/artist/${res.id}`);
                  }
                } catch (err) {
                  console.error("Failed to navigate to artist profile", err);
                }
              }}
              style={{ cursor: 'pointer', pointerEvents: 'auto' }}
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
              <Loader2 className="animate-spin" size={22} />
            ) : isPlaying ? (
              <Pause size={22} fill="currentColor" />
            ) : (
              <Play size={22} fill="currentColor" style={{ marginLeft: '3px' }} />
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
            onMouseDown={() => {
              setIsDragging(true);
              setDragValue(currentTime);
            }}
            onMouseUp={() => {
              setIsDragging(false);
              seek(dragValue);
            }}
            onTouchStart={() => {
              setIsDragging(true);
              setDragValue(currentTime);
            }}
            onTouchEnd={() => {
              setIsDragging(false);
              seek(dragValue);
            }}
            className={styles.seekBar}
            style={{ '--progress': `${(displayTime / (duration || 1)) * 100}%` } as React.CSSProperties}
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

      <style>{`
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
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
          <div className={styles.errorIcon}>
            <AlertCircle size={20} />
          </div>
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
