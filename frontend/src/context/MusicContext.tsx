import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { musicApi, type Track } from '../services/musicApi';

interface MusicContextType {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  loadingStream: boolean;
  streamError: string | null;
  setStreamError: (error: string | null) => void;
  volume: number;
  muted: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  shuffle: boolean;
  repeat: 'none' | 'one' | 'all';
  isQueueOpen: boolean;
  setIsQueueOpen: (isOpen: boolean) => void;
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
  playTrack: (track: Track, newQueue?: Track[]) => Promise<void>;
  stopMusic: () => void;
  togglePlay: () => void;
  skipForward: () => void;
  skipBack: () => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
  seek: (time: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  clearQueue: () => void;
  recentlyPlayed: Track[];
  clearHistory: () => void;
  removeFromHistory: (trackId: string) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loadingStream, setLoadingStream] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [volume, setVolumeState] = useState(1.0);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<'none' | 'one' | 'all'>('none');
  const [isQueueOpen, setIsQueueOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>(() => {
    try {
      const stored = localStorage.getItem('reiatsu_recently_played');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const audioRef = useRef<HTMLAudioElement>(new Audio());

  const setVolume = (v: number) => {
    setVolumeState(v);
    audioRef.current.volume = v;
  };

  const playTrack = async (track: Track, newQueue?: Track[]) => {
    if (newQueue) setQueue(newQueue);
    
    setLoadingStream(true);
    setStreamError(null);
    setCurrentTrack(track);

    // Track recently played
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(t => t.id !== track.id);
      const updated = [track, ...filtered].slice(0, 10);
      localStorage.setItem('reiatsu_recently_played', JSON.stringify(updated));
      return updated;
    });

    // Reset audio source to completely prevent overlapping stream playback and race conditions
    try {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    } catch (e) {
      console.warn('REIATSU: Error resetting audio before playback:', e);
    }

    console.log(`REIATSU: Attempting to play track: ${track.artist} - ${track.name}`);

    try {
      const { stream_url, direct_url } = await musicApi.stream(track);
      console.log(`REIATSU: Resolved stream URL: ${stream_url}`);
      
      audioRef.current.src = stream_url;
      audioRef.current.load();
      
      try {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) await playPromise;
        console.log('REIATSU: Playback started successfully (direct)');
        setIsPlaying(true);
      } catch (directErr) {
        // Direct URL failed — try via Cloudflare audio-proxy
        console.warn('REIATSU: Direct playback failed, trying proxied URL:', directErr);
        if (direct_url) {
          audioRef.current.src = direct_url;
          audioRef.current.load();
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) await playPromise;
          console.log('REIATSU: Playback started via Cloudflare proxy');
          setIsPlaying(true);
        } else {
          throw directErr;
        }
      }
    } catch (err) {
      console.error('REIATSU: Stream error:', err);
      const axiosErr = err as { response?: { data?: { detail?: string } }; message?: string };
      const errorMsg = axiosErr.response?.data?.detail || axiosErr.message || 'Failed to load stream';
      setStreamError(`Failed to load stream: ${errorMsg}. YouTube might be blocking the request.`);
      setIsPlaying(false);
    } finally {
      setLoadingStream(false);
    }
  };


  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  };

  const skipForward = useCallback(() => {
    if (queue.length === 0) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    let nextIndex;

    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = (currentIndex + 1) % queue.length;
      if (nextIndex === 0 && repeat === 'none' && currentIndex !== -1) {
        setIsPlaying(false);
        return;
      }
    }

    playTrack(queue[nextIndex]);
  }, [queue, currentTrack, shuffle, repeat]);

  const skipBack = () => {
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }

    if (queue.length === 0) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    playTrack(queue[prevIndex]);
  };

  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = muted ? 0 : volume;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.currentTime / audio.duration || 0);
    };

    const handleDurationChange = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      if (repeat === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        skipForward();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [volume, muted, repeat, queue, currentTrack, skipForward]);

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      setProgress(time / audioRef.current.duration || 0);
    }
  };

  const toggleShuffle = () => setShuffle(!shuffle);
  const toggleRepeat = () => {
    const modes: ('none' | 'one' | 'all')[] = ['none', 'all', 'one'];
    const nextMode = modes[(modes.indexOf(repeat) + 1) % modes.length];
    setRepeat(nextMode);
  };

  const addToQueue = (track: Track) => {
    setQueue(prev => [...prev, track]);
  };

  const removeFromQueue = (trackId: string) => {
    setQueue(prev => prev.filter(t => t.id !== trackId));
  };

  const clearQueue = () => setQueue([]);

  const stopMusic = () => {
    try {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    } catch (e) {
      console.warn('REIATSU: Error stopping music:', e);
    }
    setIsPlaying(false);
    setCurrentTrack(null);
    setQueue([]);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
  };

  const clearHistory = () => {
    setRecentlyPlayed([]);
    localStorage.removeItem('reiatsu_recently_played');
  };

  const removeFromHistory = (trackId: string) => {
    setRecentlyPlayed(prev => {
      const updated = prev.filter(t => t.id !== trackId);
      localStorage.setItem('reiatsu_recently_played', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <MusicContext.Provider value={{
      currentTrack, queue, isPlaying, loadingStream, streamError, setStreamError,
      volume, muted, progress, currentTime, duration, shuffle, repeat,
      isQueueOpen, setIsQueueOpen, isExpanded, setIsExpanded,
      playTrack, stopMusic, togglePlay, skipForward, skipBack, setVolume, setMuted, seek,
      toggleShuffle, toggleRepeat, addToQueue, removeFromQueue, clearQueue,
      recentlyPlayed, clearHistory, removeFromHistory, audioRef
    }}>
      {children}
    </MusicContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useMusic = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
