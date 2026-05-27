import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Repeat1, Volume2, VolumeX, ListMusic, ChevronDown, Download, Loader2, MoreHorizontal } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import { musicApi } from '../../services/musicApi';
import SmartImage from '../SmartImage';
import styles from './ExpandedPlayer.module.css';

const ExpandedPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    loadingStream,
    volume,
    muted,
    currentTime,
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
    setIsQueueOpen
  } = useMusic();
  const navigate = useNavigate();
  const [resolvedArtistId, setResolvedArtistId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentTrack) return;
    const timer = setTimeout(() => {
      setResolvedArtistId(null);
    }, 0);
    musicApi.resolveArtistId(currentTrack.artist)
      .then(res => {
        if (res && res.id) {
          setResolvedArtistId(res.id);
        }
      })
      .catch(err => console.error("Error background resolving artist", err));
    return () => clearTimeout(timer);
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
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={styles.container}
        >
          {/* Background Blur */}
          <div className={styles.background}>
            <SmartImage src={currentTrack.poster} alt="" className={styles.bgImage} />
            <div className={styles.overlay} />
          </div>

          <div className={styles.content}>
            {/* Header */}
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

            {/* Artwork */}
            <div className={styles.artworkContainer}>
              <motion.div
                animate={{ scale: isPlaying ? 1 : 0.9, opacity: isPlaying ? 1 : 0.8 }}
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
                    if (resolvedArtistId) {
                      setIsExpanded(false);
                      navigate(`/music/artist/${resolvedArtistId}`);
                      return;
                    }
                    try {
                      const res = await musicApi.resolveArtistId(currentTrack.artist);
                      if (res && res.id) {
                        setIsExpanded(false);
                        navigate(`/music/artist/${res.id}`);
                      }
                    } catch (err) {
                      console.error("Failed to navigate to artist profile", err);
                    }
                  }}
                  title={`View ${currentTrack.artist} Profile`}
                >
                  {currentTrack.artist}
                </h2>
              </div>
            </div>

            {/* Controls */}
            <div className={styles.controlsSection}>
              {/* Seek Bar */}
              <div className={styles.seekBarContainer}>
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
                <div className={styles.timeDisplay}>
                  <span>{formatTime(displayTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Main Buttons */}
              <div className={styles.mainControls}>
                <button
                  className={`${styles.smallButton} ${shuffle ? styles.active : ''}`}
                  onClick={toggleShuffle}
                >
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

                <button
                  className={`${styles.smallButton} ${repeat !== 'none' ? styles.active : ''}`}
                  onClick={toggleRepeat}
                >
                  {repeat === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
                </button>
              </div>

              {/* Volume & Bottom Actions */}
              <div className={styles.bottomSection}>
                <div className={styles.volumeContainer}>
                  <button className={styles.iconButton} onClick={() => setMuted(!muted)}>
                    {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
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

                <div className={styles.actions}>
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
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExpandedPlayer;
