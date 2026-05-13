import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, RefreshCw, CheckCircle2, AlertCircle, Loader2, Music } from 'lucide-react';
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
    if (!spotifyUrl.trim()) return;

    setStatus('syncing');
    setMessage('Connecting to SpotiFLAC lossless engine...');

    try {
      const response = await musicApi.download(spotifyUrl);
      setStatus('success');
      setMessage(response.message || 'Lossless download started successfully!');
      setSpotifyUrl('');
      
      // Auto close after success? Or let them see the message.
      // Let's keep it open for a bit then close.
      setTimeout(() => {
        onClose();
        setStatus('idle');
        setMessage('');
      }, 3000);
    } catch (err) {
      console.error('Download failed:', err);
      setStatus('error');
      setMessage('Failed to connect to SpotiFLAC engine. Check your API.');
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
                  <Download size={20} />
                </div>
                <div>
                  <h3>SpotiFLAC Download</h3>
                  <p>Paste Spotify link to download in High-Res FLAC</p>
                </div>
              </div>
              <button className={styles.closeBtn} onClick={onClose}>
                <X size={20} />
              </button>
            </div>

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
                    <Loader2 className="animate-spin" size={18} />
                    <span>Syncing Lossless...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={18} />
                    <span>Start Download</span>
                  </>
                )}
              </button>
            </form>

            <AnimatePresence>
              {message && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${styles.message} ${styles[status]}`}
                >
                  {status === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{message}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className={styles.footer}>
              <div className={styles.badge}>
                <Music size={12} />
                <span>24-bit Hi-Res</span>
              </div>
              <div className={styles.badge}>
                <RefreshCw size={12} />
                <span>Auto-Metadata</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MusicDownloadModal;
