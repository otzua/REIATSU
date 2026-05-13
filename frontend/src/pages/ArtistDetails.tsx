import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, ChevronLeft, Disc, Clock, Plus, Download, Check, AlertCircle, Users, Heart, Share2 } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { musicApi, type Artist, type Track } from '../services/musicApi';
import SmartImage from '../components/SmartImage';
import styles from './ArtistDetails.module.css';

const ArtistDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, togglePlay, addToQueue } = useMusic();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<Record<string, boolean>>({});
  const [downloadedIds, setDownloadedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!id) return;

    const fetchArtistDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await musicApi.getArtist(id);
        setArtist(data);
      } catch (err: any) {
        console.error('Failed to fetch artist details:', err);
        setError('Failed to load artist profile. Please make sure the music API is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchArtistDetails();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <Disc size={48} className={styles.loadingSpinner} />
        </motion.div>
        <p className={styles.loadingText}>Tuning into Artist Profile...</p>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle size={48} className={styles.errorIcon} />
        <h3 className={styles.errorTitle}>Oops!</h3>
        <p className={styles.errorText}>{error || 'Artist profile not found.'}</p>
        <button onClick={() => navigate('/music')} className={styles.backHomeBtn}>
          Back to Music
        </button>
      </div>
    );
  }

  const tracks = artist.tracks || [];
  const isCurrentArtistPlaying = tracks.some(t => t.id === currentTrack?.id);

  const handlePlayArtist = () => {
    if (tracks.length === 0) return;
    
    if (isCurrentArtistPlaying) {
      togglePlay();
    } else {
      playTrack(tracks[0], tracks);
    }
  };

  const handlePlayTrack = (track: Track) => {
    const trackIndex = tracks.findIndex(t => t.id === track.id);
    const queue = trackIndex !== -1 ? [...tracks.slice(trackIndex), ...tracks.slice(0, trackIndex)] : tracks;
    playTrack(track, queue);
  };

  const handleDownloadTrack = async (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    if (downloadingIds[track.id] || downloadedIds[track.id]) return;

    try {
      setDownloadingIds(prev => ({ ...prev, [track.id]: true }));
      await musicApi.download(track);
      setDownloadedIds(prev => ({ ...prev, [track.id]: true }));
    } catch (err) {
      console.error("Failed to download track", err);
    } finally {
      setDownloadingIds(prev => ({ ...prev, [track.id]: false }));
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return '--:--';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <motion.div 
      className={styles.container}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Immersive blurred backdrop */}
      <motion.div 
        className={styles.blurredBg} 
        style={{ backgroundImage: `url(${artist.poster})` }}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 0.6, scale: 1 }}
        transition={{ duration: 1.5 }}
      />

      {/* Navigation Bar */}
      <nav className={styles.navBar}>
        <button className={styles.backBtn} onClick={() => navigate('/music')}>
          <ChevronLeft size={20} />
          <span>Artist Profile</span>
        </button>
      </nav>

      {/* Cinematic Artist Profile Header */}
      <header className={styles.header}>
        <motion.div 
          className={styles.posterWrapper}
          variants={itemVariants}
        >
          <SmartImage 
            src={artist.poster} 
            alt={artist.name} 
            className={styles.posterImg} 
          />
        </motion.div>
        
        <div className={styles.meta}>
          <motion.span 
            className={styles.typeBadge}
            variants={itemVariants}
          >
            VERIFIED ARTIST
          </motion.span>
          
          <motion.h1 
            className={styles.albumTitle}
            variants={itemVariants}
          >
            {artist.name}
          </motion.h1>
          
          <motion.div className={styles.artistRow} variants={itemVariants}>
            <span className={styles.artistName}>
              <Users size={18} style={{ marginRight: '8px' }} />
              {artist.followers} Monthly Listeners
            </span>
            <span className={styles.dot}>•</span>
            <span className={styles.trackCount}>{tracks.length} Discography Highlights</span>
          </motion.div>

          <motion.p className={styles.artistDescription} variants={itemVariants}>
            {artist.description || `${artist.name} is one of the most influential artists on Reiatsu, bringing unique energy and soulful melodies to listeners worldwide.`}
          </motion.p>

          <motion.div className={styles.actionRow} variants={itemVariants}>
            <button 
              className={styles.mainPlayBtn} 
              onClick={handlePlayArtist}
            >
              {isCurrentArtistPlaying && isPlaying ? (
                <>
                  <Pause fill="currentColor" size={20} />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play fill="currentColor" size={20} />
                  <span>Shuffle Play</span>
                </>
              )}
            </button>
            
            <button className={styles.secondaryBtn}>
              <Heart size={20} />
            </button>
            
            <button className={styles.secondaryBtn}>
              <Share2 size={20} />
            </button>
          </motion.div>
        </div>
      </header>

      {/* Artist Best Hits Tracklist Section */}
      <main className={styles.tracksSection}>
        <motion.div className={styles.tableHeader} variants={itemVariants}>
          <div className={styles.indexCol}>#</div>
          <div className={styles.titleCol}>SONG</div>
          <div className={styles.durationCol}>
            <Clock size={16} />
          </div>
          <div className={styles.actionsCol}></div>
        </motion.div>

        <div className={styles.trackList}>
          {tracks.map((track, idx) => {
            const isThisTrackPlaying = currentTrack?.id === track.id;
            
            return (
              <motion.div 
                key={track.id} 
                className={`${styles.trackRow} ${isThisTrackPlaying ? styles.activeRow : ''}`}
                variants={itemVariants}
                onClick={() => handlePlayTrack(track)}
                whileHover={{ x: 8, background: 'rgba(255,255,255,0.08)' }}
                whileTap={{ scale: 0.99 }}
              >
                {/* Number / Hover Controls */}
                <div className={styles.indexCol}>
                  <span className={styles.trackIndex}>{idx + 1}</span>
                  <button className={styles.rowPlayBtn}>
                    {isThisTrackPlaying && isPlaying ? (
                      <Pause size={16} fill="currentColor" />
                    ) : (
                      <Play size={16} fill="currentColor" />
                    )}
                  </button>
                </div>

                {/* Song Info */}
                <div className={styles.titleCol}>
                  <div className={styles.trackArtwork}>
                    <SmartImage src={track.poster} alt={track.name} className={styles.artworkImg} />
                  </div>
                  <div className={styles.trackInfo}>
                    <h3 className={styles.trackName}>{track.name}</h3>
                    <p className={styles.trackArtist}>{track.artist}</p>
                  </div>
                </div>

                {/* Duration */}
                <div className={styles.durationCol}>
                  {formatDuration(track.duration_ms)}
                </div>

                {/* Action Buttons */}
                <div className={styles.actionsCol} onClick={(e) => e.stopPropagation()}>
                  <button 
                    className={styles.rowActionBtn}
                    onClick={() => addToQueue(track)}
                    title="Add to Queue"
                  >
                    <Plus size={18} />
                  </button>

                  <button 
                    className={`${styles.rowActionBtn} ${downloadedIds[track.id] ? styles.downloaded : ''}`}
                    onClick={(e) => handleDownloadTrack(e, track)}
                    disabled={downloadingIds[track.id]}
                  >
                    {downloadingIds[track.id] ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Disc size={16} />
                      </motion.div>
                    ) : downloadedIds[track.id] ? (
                      <Check size={18} />
                    ) : (
                      <Download size={18} />
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </motion.div>
  );
};

export default ArtistDetails;
