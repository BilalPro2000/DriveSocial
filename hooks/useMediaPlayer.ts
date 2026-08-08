import { useState, useEffect, useCallback, useRef } from 'react';

export type MediaProvider = 'demo' | 'spotify' | 'apple_music' | 'bluetooth';

export interface TrackInfo {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  durationMs: number;
  genre: string;
  bpm?: number;
}

export const DEMO_TRACKS: TrackInfo[] = [
  {
    id: 'track_1',
    title: 'Night Rider (Midnight Cruise Edit)',
    artist: 'Synthwave Squadron',
    album: 'Neon Horizon',
    albumArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&auto=format&fit=crop&q=80',
    durationMs: 240000,
    genre: 'Synthwave',
    bpm: 120,
  },
  {
    id: 'track_2',
    title: 'Neon Streets & Turbo Spool',
    artist: 'Midnight Cruiser',
    album: 'Outrun 1986',
    albumArt: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&auto=format&fit=crop&q=80',
    durationMs: 180000,
    genre: 'Retrowave',
    bpm: 128,
  },
  {
    id: 'track_3',
    title: 'Tokyo Drift Apex Control',
    artist: 'JDM Legends',
    album: 'Shuto Expressway',
    albumArt: 'https://images.unsplash.com/photo-1542044896530-05d85be9b11a?w=400&auto=format&fit=crop&q=80',
    durationMs: 215000,
    genre: 'Phonk / Electronic',
    bpm: 135,
  },
  {
    id: 'track_4',
    title: 'Canyon Carver Acoustic Pulse',
    artist: 'Apex Predator',
    album: 'Mulholland Sunset',
    albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80',
    durationMs: 195000,
    genre: 'Chillwave',
    bpm: 110,
  },
  {
    id: 'track_5',
    title: 'Nürburgring Hotline',
    artist: 'Green Hell V8',
    album: 'Endurance 24H',
    albumArt: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&auto=format&fit=crop&q=80',
    durationMs: 260000,
    genre: 'High Voltage',
    bpm: 140,
  },
];

export function useMediaPlayer() {
  const [provider, setProvider] = useState<MediaProvider>('demo');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [progressMs, setProgressMs] = useState(0);
  const [isConnected, setIsConnected] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeat, setIsRepeat] = useState<'off' | 'all' | 'one'>('off');
  const [isShuffle, setIsShuffle] = useState(false);

  // Audio Context Ref for synthetic drive synth sound
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const currentTrack = DEMO_TRACKS[currentTrackIndex];

  // Helper callbacks
  const playNext = useCallback(() => {
    setCurrentTrackIndex((prev) => {
      if (isShuffle) {
        let randomIndex = Math.floor(Math.random() * DEMO_TRACKS.length);
        if (randomIndex === prev) randomIndex = (prev + 1) % DEMO_TRACKS.length;
        return randomIndex;
      }
      return (prev + 1) % DEMO_TRACKS.length;
    });
    setProgressMs(0);
    setIsPlaying(true);
  }, [isShuffle]);

  const playPrevious = useCallback(() => {
    setCurrentTrackIndex((prev) => (prev - 1 + DEMO_TRACKS.length) % DEMO_TRACKS.length);
    setProgressMs(0);
    setIsPlaying(true);
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const seekTo = useCallback((timeMs: number) => {
    const clamped = Math.max(0, Math.min(timeMs, currentTrack.durationMs));
    setProgressMs(clamped);
  }, [currentTrack.durationMs]);

  const selectTrack = useCallback((index: number) => {
    if (index >= 0 && index < DEMO_TRACKS.length) {
      setCurrentTrackIndex(index);
      setProgressMs(0);
      setIsPlaying(true);
    }
  }, []);

  // Web Audio Synth setup for ambient driving beats
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isPlaying && !isMuted && volume > 0) {
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            audioCtxRef.current = new AudioContextClass();
          }
        }

        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }

        if (audioCtxRef.current && !oscillatorRef.current) {
          const ctx = audioCtxRef.current;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          // Subtle ambient synth tone (A2 pitch = 110Hz, warm low frequency)
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(110 + (currentTrackIndex * 15), ctx.currentTime);

          const targetGain = isMuted ? 0 : volume * 0.05; // soft ambient tone
          gain.gain.setValueAtTime(targetGain, ctx.currentTime);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();

          oscillatorRef.current = osc;
          gainNodeRef.current = gain;
        } else if (gainNodeRef.current && audioCtxRef.current) {
          const targetGain = isMuted ? 0 : volume * 0.05;
          gainNodeRef.current.gain.setValueAtTime(targetGain, audioCtxRef.current.currentTime);
        }
      } catch (err) {
        console.warn('AudioContext playback notice:', err);
      }
    } else {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        } catch {}
        oscillatorRef.current = null;
      }
    }

    return () => {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        } catch {}
        oscillatorRef.current = null;
      }
    };
  }, [isPlaying, isMuted, volume, currentTrackIndex]);

  // Sync with Native MediaSession API
  useEffect(() => {
    if (typeof window !== 'undefined' && 'mediaSession' in navigator) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentTrack.title,
          artist: currentTrack.artist,
          album: currentTrack.album,
          artwork: [
            { src: currentTrack.albumArt, sizes: '96x96', type: 'image/jpeg' },
            { src: currentTrack.albumArt, sizes: '256x256', type: 'image/jpeg' },
            { src: currentTrack.albumArt, sizes: '512x512', type: 'image/jpeg' },
          ],
        });
        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
      } catch (err) {
        console.warn('MediaSession metadata error:', err);
      }
    }
  }, [currentTrack, isPlaying]);

  // Sync position state to MediaSession
  useEffect(() => {
    if (typeof window !== 'undefined' && 'mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
      try {
        navigator.mediaSession.setPositionState({
          duration: currentTrack.durationMs / 1000,
          playbackRate: 1.0,
          position: Math.min(progressMs / 1000, currentTrack.durationMs / 1000),
        });
      } catch {
        // Ignore position state sync mismatch errors
      }
    }
  }, [progressMs, currentTrack.durationMs]);

  // MediaSession Action Handlers
  useEffect(() => {
    if (typeof window === 'undefined' || !('mediaSession' in navigator)) return;

    const actionHandlers: [MediaSessionAction, MediaSessionActionHandler][] = [
      ['play', () => setIsPlaying(true)],
      ['pause', () => setIsPlaying(false)],
      ['previoustrack', playPrevious],
      ['nexttrack', playNext],
      ['seekto', (details) => {
        if (details.seekTime !== undefined) {
          seekTo(details.seekTime * 1000);
        }
      }],
      ['seekbackward', (details) => {
        const skip = (details.seekOffset || 10) * 1000;
        seekTo(progressMs - skip);
      }],
      ['seekforward', (details) => {
        const skip = (details.seekOffset || 10) * 1000;
        seekTo(progressMs + skip);
      }],
      ['stop', () => {
        setIsPlaying(false);
        setProgressMs(0);
      }],
    ];

    for (const [action, handler] of actionHandlers) {
      try {
        navigator.mediaSession.setActionHandler(action, handler);
      } catch {
        // Action unsupported on platform
      }
    }

    return () => {
      for (const [action] of actionHandlers) {
        try {
          navigator.mediaSession.setActionHandler(action, null);
        } catch {}
      }
    };
  }, [playNext, playPrevious, seekTo, progressMs]);

  // Progress Timer for Demo Playback
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgressMs((prev) => {
          if (prev >= currentTrack.durationMs) {
            if (isRepeat === 'one') {
              return 0;
            } else {
              playNext();
              return 0;
            }
          }
          return prev + 1000;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack.durationMs, isRepeat, playNext]);

  const connectProvider = (newProvider: MediaProvider) => {
    setProvider(newProvider);
    setIsConnected(true);
  };

  return {
    provider,
    currentTrack,
    currentTrackIndex,
    tracks: DEMO_TRACKS,
    isPlaying,
    isConnected,
    progressMs,
    volume,
    isMuted,
    isRepeat,
    isShuffle,
    setVolume,
    setIsMuted,
    setIsRepeat,
    setIsShuffle,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    selectTrack,
    connectProvider,
  };
}
