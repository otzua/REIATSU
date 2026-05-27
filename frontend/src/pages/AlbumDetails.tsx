import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Pause, ChevronLeft, Disc, Clock, Plus, Download, Check, AlertCircle } from 'lucide-react';
import { useMusic } from '../context/MusicContext';
import { musicApi, type Album, type Track } from '../services/musicApi';
import SmartImage from '../components/SmartImage';
import styles from './AlbumDetails.module.css';

const AlbumDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, togglePlay, addToQueue } = useMusic();

  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<Record<string, boolean>>({});
  const [downloadedIds, setDownloadedIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!id) return;

    const fetchAlbumDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await musicApi.getAlbum(id);
        setAlbum(data);
      } catch (err: any) {
        console.error('Failed to fetch album details:', err);
        setError('Failed to fetch album details. Please check your internet connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAlbumDetails();
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
        <p className={styles.loadingText}>Unpacking Album Masterpieces...</p>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className={styles.errorContainer}>
        <AlertCircle size={48} className={styles.errorIcon} />
        <h3 className={styles.errorTitle}>Oops!</h3>
        <p className={styles.errorText}>{error || 'Album not found.'}</p>
        <button onClick={() => navigate('/music')} className={styles.backHomeBtn}>
          Back to Music
        </button>
      </div>
    );
  }

  const tracks = album.tracks || [];
  const isCurrentAlbumPlaying = tracks.some(t => t.id === currentTrack?.id);

  const handlePlayAlbum = () => {
    if (tracks.length === 0) return;
    
    if (isCurrentAlbumPlaying) {
      togglePlay();
    } else {
      // Play the first track and set the whole album as the queue!
      playTrack(tracks[0], tracks);
    }
  };

  const handlePlayTrack = (track: Track) => {
    // Play selected track with the rest of the album as the queue starting from this track's position
    const trackIndex = tracks.findIndex(t => t.id === track.id);
    const queue = trackIndex !== -1 ? [...tracks.slice(trackIndex), ...tracks.slice(0, trackIndex)] : tracks;
    playTrack(track, queue);
  };

  const handleDownloadTrack = async (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    if (downloadingIds[track.id] || downloadedIds[track.id]) return;

    try {
      setDownloadingIds(prev => ({ ...prev, [track.id]: true }));
      const response: any = await musicApi.download(track);

      if (response && response.downloadUrl) {
        // Case 1: Backend returns a direct URL to the file
        const link = document.createElement('a');
        link.href = response.downloadUrl;
        link.setAttribute('download', `${track.artist} - ${track.name}.flac`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        // Case 2: Backend returns the file Blob or binary data
        const blob = response instanceof Blob ? response : new Blob([response.data || response]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${track.artist} - ${track.name}.flac`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }

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
      {/* Blurred artwork background for premium immersion */}
      <div 
        className={styles.blurredBg} 
        style={{ backgroundImage: `url(${album.poster})` }} 
      />

      {/* Navigation Bar */}
      <div className={styles.navBar}>
        <button className={styles.backBtn} onClick={() => navigate('/music')}>
          <ChevronLeft size={20} />
          Back to Music
        </button>
      </div>

      {/* Album Header Block */}
      <header className={styles.header}>
        <div className={styles.posterWrapper}>
          <SmartImage src={album.poster} alt={album.name} className={styles.posterImg} />
        </div>
        
        <div className={styles.meta}>
          <span className={styles.typeBadge}>ALBUM</span>
          <h1 className={styles.albumTitle}>{album.name}</h1>
          
          <div className={styles.artistRow}>
            <span className={styles.artistName}>{album.artist}</span>
            {album.year && (
              <>
                <span className={styles.dot}>•</span>
                <span className={styles.albumYear}>{album.year}</span>
              </>
            )}
            <span className={styles.dot}>•</span>
            <span className={styles.trackCount}>{tracks.length} Songs</span>
          </div>

          <button className={styles.mainPlayBtn} onClick={handlePlayAlbum}>
            {isCurrentAlbumPlaying && isPlaying ? (
              <>
                <Pause fill="currentColor" size={20} />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play fill="currentColor" size={20} />
                <span>Play Album</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Tracks Section */}
      <main className={styles.tracksSection}>
        <div className={styles.tableHeader}>
          <div className={styles.indexCol}>#</div>
          <div className={styles.titleCol}>TITLE</div>
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
                {/* Index / Play Hover */}
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

                {/* Track Details */}
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

                {/* Actions */}
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

export default AlbumDetails;
