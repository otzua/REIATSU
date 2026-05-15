import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, CheckCircle2, AlertCircle, Loader2, Music } from 'lucide-react';
import { musicApi } from '../services/musicApi';
import styles from './MusicDownloadModal.module.css';

interface MusicDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MusicDownloadModal = ({ isOpen, onClose }: MusicDownloadModalProps) => {
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = spotifyUrl.trim();
    if (!trimmed) return;

    setStatus('syncing');
    setMessage('Connecting to SpotiFLAC engine...');

    try {
      // 1. Start the download process (triggers background task)
      await musicApi.download(trimmed);
      
      // 2. Poll for status until completed or error
      let isDone = false;
      let attempts = 0;
      const maxAttempts = 240; // 20 minutes (5s interval)
      
      while (!isDone && attempts < maxAttempts) {
        attempts++;
        const statusData = await musicApi.downloadStatus(trimmed);
        
        if (statusData.status === 'completed') {
          isDone = true;
          setMessage(`Ready! Starting browser download...`);
          
          const link = document.createElement('a');
          link.href = `/api/music/download-file?url=${encodeURIComponent(trimmed)}`;
          link.setAttribute('download', statusData.file || 'music_download');
          document.body.appendChild(link);
          link.click();
          link.remove();
          
          setStatus('success');
          setMessage('Download complete! Check your files.');
          setSpotifyUrl('');
          
          // Auto-close after a delay on success
          setTimeout(() => {
            onClose();
            setStatus('idle');
            setMessage('');
          }, 4000);
          break;
        } else if (statusData.status === 'error') {
          throw new Error('Download failed on server');
        } else {
          // Update message with current progress
          setMessage(statusData.status);
          await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
        }
      }
      
      if (!isDone && attempts >= maxAttempts) {
        throw new Error('Download timed out');
      }

    } catch (err) {
      console.error('Download failed:', err);
      setStatus('error');
      setMessage('Failed — check the URL or try again later.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.9, y: 20, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, y: 20, x: '-50%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className={styles.header}>
              <div className={styles.titleInfo}>
                <div className={styles.iconBox}>
                  <Music size={20} />
                </div>
                <div>
                  <div className={styles.engineBadge}>SPOTIFLAC ENGINE</div>
                  <h3>Lossless Sync</h3>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <p className={styles.description}>
              Paste a Spotify link below. We'll search for the highest quality lossless versions across our high-fidelity providers.
            </p>

            <form onSubmit={handleSync} className={styles.form}>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  placeholder="https://open.spotify.com/track/..."
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                  disabled={status === 'syncing'}
                  autoFocus
                />
              </div>

              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={status === 'syncing' || !spotifyUrl.trim()}
              >
                {status === 'syncing' ? (
                  <>
                    <Loader2 className={styles.spinner} size={18} />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    <span>Initialize Download</span>
                  </>
                )}
              </button>
            </form>

            <AnimatePresence>
              {message && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`${styles.message} ${styles[status]}`}
                >
                  {status === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{message}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={styles.footer}>
              <div className={styles.badge}>
                <span>24-bit Hi-Res</span>
              </div>
              <div className={styles.badge}>
                <span>Auto-Metadata</span>
              </div>
              <div className={styles.badge}>
                <span>FLAC / ZIP</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MusicDownloadModal;
