'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Fuel, Crosshair, Users, Plus, Play, Layers } from 'lucide-react';
import { useDriveStore } from '@/store/useDriveStore';
import { triggerHaptic } from '@/lib/haptics';

interface MapCanvasToolsProps {
  onRecenter: () => void;
  onOpenSettings: () => void;
}

export function MapCanvasTools({ onRecenter, onOpenSettings }: MapCanvasToolsProps) {
  const [showPingMenu, setShowPingMenu] = useState(false);
  const addWaypoint = useDriveStore((state) => state.addWaypoint);
  const isActive = useDriveStore((state) => state.isActive);
  const routeCoords = useDriveStore((state) => state.telemetry.routeCoords);

  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.log('Audio chime error:', e);
    }
  };

  const handlePing = (type: 'hazard' | 'rest_stop' | 'custom', label: string) => {
    triggerHaptic([20, 30, 20]);
    playChime();
    const loc = routeCoords.length > 0 ? routeCoords[routeCoords.length - 1] : [-122.4194, 37.7749];
    addWaypoint({
      id: `wp_${Date.now()}`,
      lng: loc[0],
      lat: loc[1],
      type,
      label,
    });
    setShowPingMenu(false);
  };

  return (
    <>
      <AnimatePresence>
        {showPingMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowPingMenu(false)}
          >
            <div className="relative w-64 h-64 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: -80, opacity: 1 }}
                onClick={() => handlePing('hazard', 'Traffic')}
                className="absolute w-16 h-16 bg-amber-500 rounded-full flex flex-col items-center justify-center text-white font-bold shadow-[0_0_20px_rgba(245,158,11,0.6)]"
              >
                <AlertTriangle className="w-6 h-6 mb-0.5" />
                <span className="text-[9px] uppercase">Traffic</span>
              </motion.button>

              <motion.button
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: -80, opacity: 1 }}
                onClick={() => handlePing('hazard', 'Speed Trap')}
                className="absolute w-16 h-16 bg-red-600 rounded-full flex flex-col items-center justify-center text-white font-bold shadow-[0_0_20px_rgba(220,38,38,0.6)]"
              >
                <Crosshair className="w-6 h-6 mb-0.5" />
                <span className="text-[9px] uppercase">Radar</span>
              </motion.button>

              <motion.button
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 80, opacity: 1 }}
                onClick={() => handlePing('rest_stop', 'Gas Stop')}
                className="absolute w-16 h-16 bg-blue-500 rounded-full flex flex-col items-center justify-center text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.6)]"
              >
                <Fuel className="w-6 h-6 mb-0.5" />
                <span className="text-[9px] uppercase">Fuel</span>
              </motion.button>

              <motion.button
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 80, opacity: 1 }}
                onClick={() => handlePing('custom', 'Regroup')}
                className="absolute w-16 h-16 bg-emerald-500 rounded-full flex flex-col items-center justify-center text-white font-bold shadow-[0_0_20px_rgba(16,185,129,0.6)]"
              >
                <Users className="w-6 h-6 mb-0.5" />
                <span className="text-[9px] uppercase">Regroup</span>
              </motion.button>

              <button
                onClick={() => setShowPingMenu(false)}
                className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20"
              >
                <Crosshair className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute right-4 bottom-32 flex flex-col gap-3 z-10">
        <button
          onClick={() => {
            triggerHaptic(15);
            onOpenSettings();
          }}
          className="w-12 h-12 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors shadow-lg"
          title="Map Settings"
        >
          <Layers className="w-5 h-5" />
        </button>

        {isActive && (
          <button
            onClick={() => {
              triggerHaptic([15, 25]);
              setShowPingMenu(true);
            }}
            className="w-12 h-12 bg-amber-500/20 backdrop-blur-md rounded-2xl border border-amber-500/50 flex items-center justify-center text-amber-500 hover:bg-amber-500/30 transition-colors shadow-lg"
            title="Drop Ping"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}

        <button
          onClick={() => {
            triggerHaptic(15);
            onRecenter();
          }}
          className="w-12 h-12 bg-blue-600/20 backdrop-blur-md rounded-2xl border border-blue-500/50 flex items-center justify-center text-blue-500 hover:bg-blue-600/30 transition-colors shadow-lg"
          title="Recenter Map"
        >
          <Crosshair className="w-5 h-5" />
        </button>
      </div>
    </>
  );
}
