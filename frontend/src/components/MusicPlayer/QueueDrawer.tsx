import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { useMusic } from '../../context/MusicContext';
import SmartImage from '../SmartImage';

const QueueDrawer: React.FC = () => {
  const {
    queue,
    currentTrack,
    isQueueOpen,
    setIsQueueOpen,
    playTrack,
    removeFromQueue,
    clearQueue,
  } = useMusic();

  if (!isQueueOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '350px',
          height: '100dvh',
          background: 'rgba(12, 12, 12, 0.95)',
          backdropFilter: 'blur(30px)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
          zIndex: 1100,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
        }}
      >
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>PLAY QUEUE</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => clearQueue()}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
              title="Clear Queue"
            >
              <Trash2 size={18} />
            </button>
            <button
              onClick={() => setIsQueueOpen(false)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
          {currentTrack && (
            <div style={{ marginBottom: '2rem' }}>
              <p style={{ fontSize: '0.7rem', opacity: 0.5, fontWeight: 700, letterSpacing: '0.1em', marginBottom: '1rem' }}>NOW PLAYING</p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                  <SmartImage src={currentTrack.poster} alt={currentTrack.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentTrack.name}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentTrack.artist}</div>
                </div>
              </div>
            </div>
          )}

          <div>
            <p style={{ fontSize: '0.7rem', opacity: 0.5, fontWeight: 700, letterSpacing: '0.1em', marginBottom: '1rem' }}>NEXT IN QUEUE</p>
            {queue.length <= 1 && queue[0]?.id === currentTrack?.id ? (
              <p style={{ textAlign: 'center', padding: '2rem', opacity: 0.3, fontSize: '0.9rem' }}>Queue is empty</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {queue.filter(t => t.id !== currentTrack?.id).map((track, idx) => (
                  <motion.div
                    key={`${track.id}-${idx}`}
                    layout
                    whileHover={{ background: 'rgba(255,255,255,0.03)' }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.5rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                    onClick={() => playTrack(track)}
                  >
                    <div style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                      <SmartImage src={track.poster} alt={track.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.name}</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.artist}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromQueue(track.id);
                      }}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default QueueDrawer;
