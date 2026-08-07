import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, SkipBack, SkipForward, Music } from 'lucide-react';
import { useMediaPlayer, MediaProvider } from '@/hooks/useMediaPlayer';
import { triggerHaptic } from '@/lib/haptics';
import { useState } from 'react';

export function MediaPlayerWidget() {
  const { provider, currentTrack, isPlaying, isConnected, togglePlayPause, playNext, playPrevious, connectProvider } = useMediaPlayer();
  const [showConnect, setShowConnect] = useState(false);

  const handlePlayPause = () => {
    triggerHaptic(10);
    togglePlayPause();
  };

  const handleNext = () => {
    triggerHaptic(10);
    playNext();
  };

  const handlePrev = () => {
    triggerHaptic(10);
    playPrevious();
  };

  if (!isConnected || showConnect) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 w-64 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Music className="w-4 h-4" /> Connect Media
          </h3>
          {isConnected && (
            <button onClick={() => setShowConnect(false)} className="text-xs text-gray-400">Cancel</button>
          )}
        </div>
        <div className="space-y-2">
          <button onClick={() => { connectProvider('spotify'); setShowConnect(false); }} className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-all">
            Spotify Connect
          </button>
          <button onClick={() => { connectProvider('apple_music'); setShowConnect(false); }} className="w-full bg-[#FA243C] hover:bg-[#ff3b53] text-white font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-all">
            Apple Music
          </button>
        </div>
      </motion.div>
    );
  }

  const progressPercent = (currentTrack.progressMs / currentTrack.durationMs) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-[#121824]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3 w-64 shadow-2xl"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={currentTrack.albumArt} alt="Album Art" className="w-full h-full object-cover" />
          {isPlaying && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-0.5">
              <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-white rounded-full" />
              <motion.div animate={{ height: [8, 4, 8] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-white rounded-full" />
              <motion.div animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 0.4 }} className="w-1 bg-white rounded-full" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0" onClick={() => setShowConnect(true)}>
          <h4 className="text-sm font-bold text-white truncate cursor-pointer">{currentTrack.title}</h4>
          <p className="text-xs text-gray-400 truncate">{currentTrack.artist}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-white transition-all duration-1000 ease-linear" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between px-2">
        <span className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">
          {provider === 'spotify' ? 'SPOTIFY' : provider === 'apple_music' ? 'APPLE MUSIC' : 'DEMO'}
        </span>
        <div className="flex items-center gap-3">
          <button onClick={handlePrev} className="text-gray-400 hover:text-white transition-colors">
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          <button onClick={handlePlayPause} className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
          </button>
          <button onClick={handleNext} className="text-gray-400 hover:text-white transition-colors">
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
