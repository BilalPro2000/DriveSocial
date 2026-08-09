'use client';

import { useDriveStore } from '@/store/useDriveStore';
import { motion, AnimatePresence } from 'motion/react';
import { StopCircle, AlertTriangle, Settings2, Gauge, Maximize2, Minimize2 } from 'lucide-react';
import { useState } from 'react';
import { PostDriveSummaryModal } from './PostDriveSummaryModal';
import { triggerHaptic } from '@/lib/haptics';

interface SpeedometerHUDProps {
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export function SpeedometerHUD({ isExpanded = true, onToggleExpand }: SpeedometerHUDProps) {
  const telemetry = useDriveStore((state) => state.telemetry);
  const driveMode = useDriveStore((state) => state.driveMode);
  const setDriveMode = useDriveStore((state) => state.setDriveMode);
  
  const [isImperial, setIsImperial] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [viewMode, setViewMode] = useState<'digital' | 'analog'>('digital');

  const speedMultiplier = isImperial ? 0.621371 : 1;
  const distMultiplier = isImperial ? 0.621371 : 1;
  const speedUnit = isImperial ? 'MPH' : 'KM/H';
  const distUnit = isImperial ? 'MI' : 'KM';

  const currentSpeed = Math.round(telemetry.speedKmh * speedMultiplier);
  const topSpeed = Math.round(telemetry.topSpeedKmh * speedMultiplier);
  const avgSpeed = Math.round(telemetry.avgSpeedKmh * speedMultiplier);
  const distance = (telemetry.distanceKm * distMultiplier).toFixed(2);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Speed limit calculation
  const speedLimit = isImperial ? 65 : 100;
  const isSpeeding = currentSpeed > speedLimit;

  // Analog calculations
  const maxAnalogSpeed = 300;
  const rotationDegrees = -135 + (Math.min(currentSpeed, maxAnalogSpeed) / maxAnalogSpeed) * 270;

  return (
    <>
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          /* COMPACT / MINIMAL SINGLE-LINE HUD GLASS BAR */
          <motion.div
            key="compact-hud"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            onClick={() => {
              triggerHaptic(10);
              if (onToggleExpand) onToggleExpand();
            }}
            className="w-[calc(100%-2rem)] max-w-md mx-auto mb-6 bg-[#0B0F17]/85 backdrop-blur-2xl border border-white/20 rounded-full px-4 py-2 shadow-[0_10px_35px_rgba(0,0,0,0.8)] flex items-center justify-between gap-3 pointer-events-auto cursor-pointer hover:bg-[#0B0F17]/95 transition-all select-none"
          >
            {/* Speed badge */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setIsImperial(!isImperial);
                triggerHaptic(10);
              }}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full border border-white/10 transition-colors"
            >
              <span className={`text-xl font-black tracking-tight ${isSpeeding ? 'text-red-500' : 'text-white'}`}>
                {currentSpeed}
              </span>
              <span className="text-[10px] font-bold text-[#FF3B30] uppercase">
                {speedUnit}
              </span>
            </div>

            {/* Navigation status / Route progress */}
            <div className="flex-1 flex items-center justify-center gap-2 overflow-hidden px-1">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span className="text-xs font-semibold text-gray-200 truncate">
                {driveMode} • {distance} {distUnit}
              </span>
            </div>

            {/* Quick Action Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic([20, 30, 20]);
                  setShowSummaryModal(true);
                }}
                className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-500 border border-red-500/40 rounded-full transition-all active:scale-95"
                title="Finish Drive"
              >
                <StopCircle className="w-4 h-4" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  triggerHaptic(10);
                  if (onToggleExpand) onToggleExpand();
                }}
                className="p-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-full transition-all active:scale-95"
                title="Expand HUD"
              >
                <Maximize2 className="w-4 h-4 text-[#FF3B30]" />
              </button>
            </div>
          </motion.div>
        ) : (
          /* EXPANDED FULL HUD CARD */
          <motion.div
            key="expanded-hud"
            initial={{ y: 150, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 150, opacity: 0 }}
            className="w-[calc(100%-2rem)] max-w-xl mx-auto mb-6 bg-slate-900/60 backdrop-blur-2xl border border-white/15 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col items-center overflow-hidden pointer-events-auto relative"
          >
            {/* Top Collapse Drag Handle */}
            <div 
              onClick={() => {
                triggerHaptic(10);
                if (onToggleExpand) onToggleExpand();
              }}
              className="w-full flex items-center justify-center py-1 -mt-2 mb-2 cursor-pointer group"
              title="Minimize HUD"
            >
              <div className="w-12 h-1.5 bg-white/20 group-hover:bg-white/40 rounded-full transition-colors" />
            </div>

            {/* Top Controls */}
            <div className="w-full flex items-center justify-between mb-4">
              <select
                value={driveMode}
                onChange={(e) => setDriveMode(e.target.value as any)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-[#FF3B30] uppercase tracking-wider cursor-pointer"
              >
                <option value="Casual Cruise">Casual Cruise</option>
                <option value="Telemetry Track">Telemetry Track</option>
                <option value="Convoy Run">Convoy Run</option>
              </select>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode(viewMode === 'digital' ? 'analog' : 'digital')}
                  className="p-2 bg-white/5 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                  title="Toggle Display Mode"
                >
                  {viewMode === 'digital' ? <Gauge className="w-4 h-4" /> : <Settings2 className="w-4 h-4" />}
                </button>

                {onToggleExpand && (
                  <button
                    onClick={() => {
                      triggerHaptic(10);
                      onToggleExpand();
                    }}
                    className="p-2 bg-white/5 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
                    title="Minimize HUD"
                  >
                    <Minimize2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Speed Limit Badge */}
            <div className="absolute top-12 right-6 flex items-center gap-2">
              {isSpeeding && (
                <span className="bg-red-500/20 text-red-500 border border-red-500/50 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 animate-pulse">
                  <AlertTriangle className="w-3 h-3" /> Over Limit
                </span>
              )}
              <div className="w-10 h-10 bg-white border-2 border-red-600 rounded-lg flex flex-col items-center justify-center text-black shadow-md">
                <span className="text-[7px] font-bold uppercase leading-none">Limit</span>
                <span className="text-base font-black leading-none">{speedLimit}</span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center w-full space-y-6 mt-2">
              {/* Speedometer Area */}
              <div
                className="relative flex flex-col items-center justify-center cursor-pointer select-none"
                onClick={() => setIsImperial(!isImperial)}
              >
                {viewMode === 'analog' ? (
                  <div className="relative w-44 h-44 rounded-full border-4 border-white/10 bg-black/50 shadow-inner overflow-hidden">
                    <div className="absolute inset-0 rounded-full border-[10px] border-transparent border-t-[#FF3B30]/30 border-r-[#FF3B30]/30 transform rotate-45"></div>
                    <motion.div
                      className="absolute bottom-1/2 left-1/2 w-1 h-18 bg-[#FF3B30] origin-bottom shadow-[0_0_10px_rgba(255,59,48,0.8)]"
                      style={{ transform: `translateX(-50%) rotate(${rotationDegrees}deg)` }}
                    />
                    <div className="absolute bottom-8 left-0 right-0 text-center">
                      <span className="text-3xl font-bold text-white">{currentSpeed}</span>
                      <span className="text-[10px] block font-bold text-gray-400 uppercase">{speedUnit}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-end gap-2">
                    <span className={`text-[4.5rem] leading-none font-black tracking-tighter transition-colors ${isSpeeding ? 'text-red-500' : 'text-white'}`}>
                      {currentSpeed}
                    </span>
                    <span className="text-sm font-bold text-[#FF3B30] tracking-widest uppercase mb-2">
                      {speedUnit}
                    </span>
                  </div>
                )}
              </div>

              <div className="w-full">
                {/* Telemetry Grid */}
                <div className="grid grid-cols-4 w-full gap-2 pt-4 border-t border-white/10">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Top</span>
                    <span className="text-base font-bold text-gray-100">{topSpeed}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Avg</span>
                    <span className="text-base font-bold text-gray-100">{avgSpeed}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Dist</span>
                    <span className="text-base font-bold text-gray-100">{distance}</span>
                    <span className="text-[8px] text-gray-400">{distUnit}</span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Time</span>
                    <span className="text-base font-bold text-gray-100 font-mono">
                      {formatDuration(telemetry.durationSeconds)}
                    </span>
                  </div>
                </div>

                {/* Finish Action Button */}
                <button
                  onClick={() => {
                    triggerHaptic([20, 30, 20]);
                    setShowSummaryModal(true);
                  }}
                  className="w-full h-12 bg-red-600/20 hover:bg-red-600/30 active:scale-[0.98] transition-all rounded-2xl flex items-center justify-center gap-2 border border-red-500/40 mt-5 cursor-pointer"
                >
                  <StopCircle className="w-5 h-5 text-[#FF3B30]" />
                  <span className="text-xs font-bold text-white tracking-widest uppercase">
                    Finish Drive
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showSummaryModal && (
        <PostDriveSummaryModal onClose={() => setShowSummaryModal(false)} />
      )}
    </>
  );
}
