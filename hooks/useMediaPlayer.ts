import { useState, useEffect, useCallback } from 'react';

export type MediaProvider = 'spotify' | 'apple_music' | 'demo';

export interface TrackInfo {
  title: string;
  artist: string;
  albumArt: string;
  durationMs: number;
  progressMs: number;
}

const DEMO_TRACKS: TrackInfo[] = [
  {
    title: 'Night Rider',
    artist: 'Synthwave Squadron',
    albumArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&auto=format&fit=crop&q=80',
    durationMs: 240000,
    progressMs: 0,
  },
  {
    title: 'Neon Streets',
    artist: 'Midnight Cruiser',
    albumArt: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=300&auto=format&fit=crop&q=80',
    durationMs: 180000,
    progressMs: 0,
  },
  {
    title: 'Tokyo Drift',
    artist: 'JDM Legends',
    albumArt: 'https://images.unsplash.com/photo-1542044896530-05d85be9b11a?w=300&auto=format&fit=crop&q=80',
    durationMs: 215000,
    progressMs: 0,
  }
];

export function useMediaPlayer() {
  const [provider, setProvider] = useState<MediaProvider>('demo');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [progressMs, setProgressMs] = useState(0);
  const [isConnected, setIsConnected] = useState(true); // Demo mode starts connected

  const currentTrack = {
    ...DEMO_TRACKS[currentTrackIndex],
    progressMs,
  };

  // Sync to navigator.mediaSession
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        artwork: [
          { src: currentTrack.albumArt, sizes: '300x300', type: 'image/jpeg' },
        ],
      });
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [currentTrack.title, currentTrack.artist, currentTrack.albumArt, isPlaying]);

  // Handle media session actions
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
      navigator.mediaSession.setActionHandler('previoustrack', () => playPrevious());
      navigator.mediaSession.setActionHandler('nexttrack', () => playNext());
    }
    return () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
        navigator.mediaSession.setActionHandler('previoustrack', null);
        navigator.mediaSession.setActionHandler('nexttrack', null);
      }
    };
  }, []);

  // Progress timer for demo
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgressMs((prev) => {
          if (prev >= currentTrack.durationMs) {
            playNext();
            return 0;
          }
          return prev + 1000;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack.durationMs]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const playNext = useCallback(() => {
    setCurrentTrackIndex((prev) => (prev + 1) % DEMO_TRACKS.length);
    setProgressMs(0);
    setIsPlaying(true);
  }, []);

  const playPrevious = useCallback(() => {
    setCurrentTrackIndex((prev) => (prev - 1 + DEMO_TRACKS.length) % DEMO_TRACKS.length);
    setProgressMs(0);
    setIsPlaying(true);
  }, []);

  const connectProvider = (newProvider: MediaProvider) => {
    // In a real implementation, this would trigger OAuth flow
    setProvider(newProvider);
    setIsConnected(true);
  };

  return {
    provider,
    currentTrack,
    isPlaying,
    isConnected,
    togglePlayPause,
    playNext,
    playPrevious,
    connectProvider,
  };
}
