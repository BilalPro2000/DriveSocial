'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Music,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  Shuffle,
  ListMusic,
  ChevronDown,
  ChevronUp,
  Radio,
  Sparkles,
  X,
  Disc,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { useMediaPlayer, MediaProvider } from '@/hooks/useMediaPlayer';
import { triggerHaptic } from '@/lib/haptics';

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function MediaPlayerWidget() {
  const {
    provider,
    currentTrack,
    currentTrackIndex,
    tracks,
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
  } = useMediaPlayer();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const handlePlayPause = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(10);
    togglePlayPause();
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(10);
    playNext();
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(10);
    playPrevious();
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const targetMs = ratio * currentTrack.durationMs;
    triggerHaptic(15);
    seekTo(targetMs);
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(10);
    setIsMuted(!isMuted);
  };

  const handleCycleRepeat = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(10);
    if (isRepeat === 'off') setIsRepeat('all');
    else if (isRepeat === 'all') setIsRepeat('one');
    else setIsRepeat('off');
  };

  const handleToggleShuffle = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(10);
    setIsShuffle(!isShuffle);
  };

  const progressPercent = (progressMs / currentTrack.durationMs) * 100;

  // Provider Setup Screen
  if (!isConnected || showConnectModal) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0D121F]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 w-72 shadow-2xl text-white z-50"
      >
        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#FF3B30]" /> Audio Integration
          </h3>
          {isConnected && (
            <button
              onClick={() => setShowConnectModal(false)}
              className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="space-y-2">
          <button
            onClick={() => {
              triggerHaptic(15);
              connectProvider('demo');
              setShowConnectModal(false);
            }}
            className={`w-full p-2.5 rounded-xl text-left border flex items-center gap-3 transition-all ${
              provider === 'demo'
                ? 'bg-[#FF3B30]/20 border-[#FF3B30] text-white'
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
            }`}
          >
            <Sparkles className="w-5 h-5 text-[#FF3B30]" />
            <div>
              <div className="text-xs font-bold">Drive Synth Soundtrack</div>
              <div className="text-[10px] text-gray-400">Native ambient beats & Web Audio synth</div>
            </div>
          </button>

          <button
            onClick={() => {
              triggerHaptic(15);
              connectProvider('spotify');
              setShowConnectModal(false);
            }}
            className={`w-full p-2.5 rounded-xl text-left border flex items-center gap-3 transition-all ${
              provider === 'spotify'
                ? 'bg-[#1DB954]/20 border-[#1DB954] text-white'
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-[#1DB954] text-black font-bold text-[10px] flex items-center justify-center">
              S
            </div>
            <div>
              <div className="text-xs font-bold">Spotify Connect</div>
              <div className="text-[10px] text-gray-400">Sync with active Spotify playback</div>
            </div>
          </button>

          <button
            onClick={() => {
              triggerHaptic(15);
              connectProvider('apple_music');
              setShowConnectModal(false);
            }}
            className={`w-full p-2.5 rounded-xl text-left border flex items-center gap-3 transition-all ${
              provider === 'apple_music'
                ? 'bg-[#FA243C]/20 border-[#FA243C] text-white'
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
            }`}
          >
            <Music className="w-5 h-5 text-[#FA243C]" />
            <div>
              <div className="text-xs font-bold">Apple Music</div>
              <div className="text-[10px] text-gray-400">Stream via MusicKit integration</div>
            </div>
          </button>

          <button
            onClick={() => {
              triggerHaptic(15);
              connectProvider('bluetooth');
              setShowConnectModal(false);
            }}
            className={`w-full p-2.5 rounded-xl text-left border flex items-center gap-3 transition-all ${
              provider === 'bluetooth'
                ? 'bg-blue-500/20 border-blue-500 text-white'
                : 'bg-white/5 border-white/10 hover:bg-white/10 text-gray-300'
            }`}
          >
            <Smartphone className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-xs font-bold">Bluetooth / Car Audio</div>
              <div className="text-[10px] text-gray-400">Pass-through device media controls</div>
            </div>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="relative">
      {/* COMPACT FLOATING HUD PILL */}
      {!isExpanded ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          onClick={() => {
            triggerHaptic(10);
            setIsExpanded(true);
          }}
          className="bg-[#0D121F]/90 backdrop-blur-2xl border border-white/15 rounded-2xl p-2.5 w-72 shadow-2xl text-white cursor-pointer hover:border-white/30 transition-all group"
        >
          <div className="flex items-center gap-3">
            {/* Album Cover with Animated Visualizer Overlay */}
            <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 relative border border-white/10 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentTrack.albumArt}
                alt={currentTrack.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-0.5">
                  <motion.div
                    animate={{ height: [3, 12, 3] }}
                    transition={{ repeat: Infinity, duration: 0.5, ease: 'easeInOut' }}
                    className="w-0.5 bg-[#FF3B30] rounded-full"
                  />
                  <motion.div
                    animate={{ height: [8, 4, 10] }}
                    transition={{ repeat: Infinity, duration: 0.6, ease: 'easeInOut' }}
                    className="w-0.5 bg-white rounded-full"
                  />
                  <motion.div
                    animate={{ height: [4, 11, 3] }}
                    transition={{ repeat: Infinity, duration: 0.4, ease: 'easeInOut' }}
                    className="w-0.5 bg-[#FF3B30] rounded-full"
                  />
                </div>
              )}
            </div>

            {/* Track Metadata & Mini Controls */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase text-[#FF3B30] tracking-wider">
                  {provider.replace('_', ' ')}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
              </div>

              <h4 className="text-xs font-bold text-white truncate leading-snug">{currentTrack.title}</h4>
              <p className="text-[10px] text-gray-400 truncate">{currentTrack.artist}</p>
            </div>

            {/* Play / Pause Toggle Button */}
            <button
              onClick={handlePlayPause}
              className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all flex-shrink-0"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-black" />
              ) : (
                <Play className="w-4 h-4 fill-black translate-x-0.5" />
              )}
            </button>
          </div>

          {/* Progress Bar Indicator */}
          <div className="mt-2.5 h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF3B30] to-orange-400 transition-all duration-300 ease-linear rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </motion.div>
      ) : (
        /* EXPANDED FULL HUD MEDIA CONSOLE */
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="bg-[#0D121F]/95 backdrop-blur-2xl border border-white/20 rounded-3xl p-4 w-80 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-white z-50 overflow-hidden"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <button
              onClick={() => {
                triggerHaptic(10);
                setShowConnectModal(true);
              }}
              className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-[10px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5 transition-all"
            >
              <Disc className="w-3 h-3 text-[#FF3B30]" />
              {provider.replace('_', ' ')}
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  triggerHaptic(10);
                  setShowPlaylist(!showPlaylist);
                }}
                className={`p-1.5 rounded-xl transition-colors ${
                  showPlaylist ? 'bg-[#FF3B30] text-white' : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
                title="Playlist / Queue"
              >
                <ListMusic className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  triggerHaptic(10);
                  setIsExpanded(false);
                }}
                className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-colors"
                title="Minimize Widget"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* PLAYLIST QUEUE DRAWER */}
          <AnimatePresence>
            {showPlaylist && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-b border-white/10 my-2"
              >
                <div className="py-2 space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">
                    Driving Playlist ({tracks.length})
                  </div>
                  {tracks.map((t, idx) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        triggerHaptic(15);
                        selectTrack(idx);
                        setShowPlaylist(false);
                      }}
                      className={`w-full p-2 rounded-xl text-left flex items-center gap-2.5 transition-all ${
                        currentTrackIndex === idx
                          ? 'bg-[#FF3B30]/20 border border-[#FF3B30]/50 text-white font-bold'
                          : 'bg-white/5 hover:bg-white/10 text-gray-300'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={t.albumArt} alt={t.title} className="w-7 h-7 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs truncate">{t.title}</div>
                        <div className="text-[10px] text-gray-400 truncate">{t.artist}</div>
                      </div>
                      <span className="text-[9px] text-gray-500">{formatTime(t.durationMs)}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Album Art & Track Info */}
          <div className="py-3 flex flex-col items-center text-center">
            <div className="relative w-44 h-44 rounded-2xl overflow-hidden border border-white/20 shadow-2xl mb-3 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentTrack.albumArt}
                alt={currentTrack.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
                  <div className="p-3 bg-black/60 rounded-full border border-white/20 animate-pulse">
                    <Disc className="w-8 h-8 text-[#FF3B30] animate-spin" style={{ animationDuration: '4s' }} />
                  </div>
                </div>
              )}
            </div>

            <h3 className="text-sm font-black text-white truncate max-w-full tracking-tight">
              {currentTrack.title}
            </h3>
            <p className="text-xs text-gray-300 font-medium truncate max-w-full mt-0.5">
              {currentTrack.artist}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="px-2 py-0.5 rounded-full bg-white/10 text-[9px] font-bold text-gray-400 uppercase">
                {currentTrack.genre}
              </span>
              {currentTrack.bpm && (
                <span className="px-2 py-0.5 rounded-full bg-[#FF3B30]/20 text-[#FF3B30] text-[9px] font-bold uppercase">
                  {currentTrack.bpm} BPM
                </span>
              )}
            </div>
          </div>

          {/* Interactive Progress Bar & Timers */}
          <div className="space-y-1 my-2">
            <div
              onClick={handleSeek}
              className="h-2.5 bg-white/10 hover:bg-white/20 rounded-full cursor-pointer relative overflow-hidden transition-all group"
            >
              <div
                className="h-full bg-gradient-to-r from-[#FF3B30] to-orange-400 rounded-full transition-all duration-150 relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 font-bold px-0.5">
              <span>{formatTime(progressMs)}</span>
              <span>-{formatTime(currentTrack.durationMs - progressMs)}</span>
            </div>
          </div>

          {/* Primary Controls */}
          <div className="flex items-center justify-between my-3 px-2">
            <button
              onClick={handleToggleShuffle}
              className={`p-2 rounded-xl transition-all ${
                isShuffle ? 'text-[#FF3B30] bg-[#FF3B30]/20' : 'text-gray-400 hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={handlePrev}
              className="p-2 text-gray-300 hover:text-white active:scale-95 transition-all"
              title="Previous Track"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={handlePlayPause}
              className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-105 active:scale-95 transition-all"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6 fill-black" />
              ) : (
                <Play className="w-6 h-6 fill-black translate-x-0.5" />
              )}
            </button>

            <button
              onClick={handleNext}
              className="p-2 text-gray-300 hover:text-white active:scale-95 transition-all"
              title="Next Track"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>

            <button
              onClick={handleCycleRepeat}
              className={`p-2 rounded-xl transition-all relative ${
                isRepeat !== 'off' ? 'text-[#FF3B30] bg-[#FF3B30]/20' : 'text-gray-400 hover:text-white'
              }`}
              title="Repeat Mode"
            >
              {isRepeat === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            </button>
          </div>

          {/* Volume Control Slider */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/10 px-1">
            <button
              onClick={handleToggleMute}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-red-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                const newVol = parseFloat(e.target.value);
                setVolume(newVol);
                if (isMuted && newVol > 0) setIsMuted(false);
              }}
              className="flex-1 accent-[#FF3B30] h-1.5 bg-white/20 rounded-lg cursor-pointer"
            />

            <span className="text-[10px] font-mono text-gray-400 w-7 text-right">
              {Math.round((isMuted ? 0 : volume) * 100)}%
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
