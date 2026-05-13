import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Pause, ChevronLeft, Disc, Clock, Plus, Download, Check, AlertCircle, Users } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { musicApi, type Artist, type Track } from '../services/musicApi';
import SmartImage from '../components/SmartImage';
import styles from './AlbumDetails.module.css';

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
      // Play first top track and set artist tracks as the queue
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

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Immersive blurred backdrop */}
      <div 
        className={styles.blurredBg} 
        style={{ backgroundImage: `url(${artist.poster})` }} 
      />

      {/* Navigation Bar */}
      <div className={styles.navBar}>
        <button className={styles.backBtn} onClick={() => navigate('/music')}>
          <ChevronLeft size={20} />
          Back to Music
        </button>
      </div>

      {/* Premium Artist Profile Header */}
      <header className={styles.header}>
        <div className={styles.posterWrapper} style={{ borderRadius: '50%', overflow: 'hidden', boxShadow: '0 12px 30px rgba(0,0,0,0.5)' }}>
          <SmartImage 
            src={artist.poster} 
            alt={artist.name} 
            className={styles.posterImg} 
            style={{ borderRadius: '50%', transform: 'scale(1.02)' }}
          />
        </div>
        
        <div className={styles.meta}>
          <span className={styles.typeBadge} style={{ background: 'rgba(255, 0, 127, 0.2)', color: '#ff007f' }}>POPULAR ARTIST</span>
          <h1 className={styles.albumTitle} style={{ fontSize: '3.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-1px' }}>
            {artist.name}
          </h1>
          
          <div className={styles.artistRow}>
            <span className={styles.artistName} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={16} />
              {artist.followers}
            </span>
            <span className={styles.dot}>•</span>
            <span className={styles.trackCount}>{tracks.length} Best Songs</span>
          </div>

          {artist.description && (
            <p className={styles.artistDescription} style={{ 
              maxWidth: '600px', 
              fontSize: '0.9rem', 
              color: 'rgba(255,255,255,0.6)', 
              lineHeight: '1.5',
              marginTop: '12px',
              display: '-webkit-box',
              WebkitLineClamp: '2',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {artist.description}
            </p>
          )}

          <button 
            className={styles.mainPlayBtn} 
            onClick={handlePlayArtist}
            style={{ marginTop: '20px' }}
          >
            {isCurrentArtistPlaying && isPlaying ? (
              <>
                <Pause fill="currentColor" size={20} />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play fill="currentColor" size={20} />
                <span>Play Artist Hits</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Artist Best Hits Tracklist Section */}
      <main className={styles.tracksSection}>
        <div className={styles.tableHeader}>
          <div className={styles.indexCol}>#</div>
          <div className={styles.titleCol}>SONG</div>
          <div className={styles.durationCol}>
            <Clock size={16} />
          </div>
          <div className={styles.actionsCol}></div>
        </div>

        <div className={styles.trackList}>
          {tracks.map((track, idx) => {
            const isThisTrackPlaying = currentTrack?.id === track.id;
            
            return (
              <div 
                key={track.id} 
                className={`${styles.trackRow} ${isThisTrackPlaying ? styles.activeRow : ''}`}
                onClick={() => handlePlayTrack(track)}
              >
                {/* Number / Hover Controls */}
                <div className={styles.indexCol}>
                  <span className={styles.trackIndex}>{idx + 1}</span>
                  <button className={styles.rowPlayBtn}>
                    {isThisTrackPlaying && isPlaying ? (
                      <Pause size={14} fill="currentColor" />
                    ) : (
                      <Play size={14} fill="currentColor" style={{ marginLeft: '2px' }} />
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
                    <p className={styles.trackArtist}>{track.artist} • {track.album}</p>
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
                    <Plus size={16} />
                  </button>

                  <button 
                    className={`${styles.rowActionBtn} ${downloadedIds[track.id] ? styles.downloaded : ''}`}
                    onClick={(e) => handleDownloadTrack(e, track)}
                    disabled={downloadingIds[track.id]}
                    title={downloadedIds[track.id] ? "Downloaded Lossless FLAC" : "Download Lossless FLAC"}
                  >
                    {downloadingIds[track.id] ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className={styles.miniSpinner}
                      />
                    ) : downloadedIds[track.id] ? (
                      <Check size={16} className={styles.checkIcon} />
                    ) : (
                      <Download size={16} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </motion.div>
  );
};

export default ArtistDetails;
