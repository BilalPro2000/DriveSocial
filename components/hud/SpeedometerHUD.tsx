'use client';

import { useDriveStore } from '@/store/useDriveStore';
import { motion, AnimatePresence } from 'motion/react';
import { StopCircle, AlertTriangle, Settings2, Gauge } from 'lucide-react';
import { useState } from 'react';
import { PostDriveSummaryModal } from './PostDriveSummaryModal';
import { triggerHaptic } from '@/lib/haptics';

interface SpeedometerHUDProps {
  isExpanded?: boolean;
}

export function SpeedometerHUD({ isExpanded = true }: SpeedometerHUDProps) {
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

  // Mock speed limit
  const speedLimit = isImperial ? 65 : 100;
  const isSpeeding = currentSpeed > speedLimit;

  // Analog calculations
  const maxAnalogSpeed = 300;
  const rotationDegrees = -135 + (Math.min(currentSpeed, maxAnalogSpeed) / maxAnalogSpeed) * 270;

  return (
    <>
      <motion.div
        initial={{ y: 200, opacity: 0 }}
        animate={{ y: isExpanded ? 0 : 'calc(100% - 100px)', opacity: 1 }}
        exit={{ y: 200, opacity: 0 }}
        className="w-full bg-[#0B0F17]/95 backdrop-blur-2xl border-t border-white/10 rounded-t-3xl p-6 pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] flex flex-col items-center"
      >
        {/* Top Controls */}
        <div className={`w-full flex items-center justify-between mb-4 ${!isExpanded ? 'hidden' : ''}`}>
          <select
            value={driveMode}
            onChange={(e) => setDriveMode(e.target.value as any)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-[#FF3B30] uppercase tracking-wider"
          >
            <option value="Casual Cruise">Casual Cruise</option>
            <option value="Telemetry Track">Telemetry Track</option>
            <option value="Convoy Run">Convoy Run</option>
          </select>

          <button
            onClick={() => setViewMode(viewMode === 'digital' ? 'analog' : 'digital')}
            className="p-2 bg-white/5 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-colors"
          >
            {viewMode === 'digital' ? <Gauge className="w-4 h-4" /> : <Settings2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Speed Limit Badge */}
        <div className={`absolute top-4 right-1/2 translate-x-1/2 flex items-center gap-2 ${!isExpanded ? 'scale-75 origin-top' : ''}`}>
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

        <div className={`flex flex-col items-center justify-center w-full ${isExpanded ? 'space-y-6 mt-4' : 'mt-2'}`}>
          {/* Speedometer Area */}
          <div
            className="relative flex flex-col items-center justify-center cursor-pointer select-none"
            onClick={() => setIsImperial(!isImperial)}
          >
            {viewMode === 'analog' && isExpanded ? (
              <div className="relative w-48 h-48 rounded-full border-4 border-white/10 bg-black/50 shadow-inner overflow-hidden">
                <div className="absolute inset-0 rounded-full border-[10px] border-transparent border-t-[#FF3B30]/30 border-r-[#FF3B30]/30 transform rotate-45"></div>
                <motion.div
                  className="absolute bottom-1/2 left-1/2 w-1 h-20 bg-[#FF3B30] origin-bottom shadow-[0_0_10px_rgba(255,59,48,0.8)]"
                  style={{ transform: `translateX(-50%) rotate(${rotationDegrees}deg)` }}
                />
                <div className="absolute bottom-8 left-0 right-0 text-center">
                  <span className="text-3xl font-bold text-white">{currentSpeed}</span>
                  <span className="text-[10px] block font-bold text-gray-400 uppercase">{speedUnit}</span>
                </div>
              </div>
            ) : (
              <div className={`flex items-end gap-2 ${!isExpanded ? 'scale-75' : ''}`}>
                <span className={`text-[5rem] leading-none font-bold tracking-tighter transition-colors ${isSpeeding ? 'text-red-500' : 'text-white'}`}>
                  {currentSpeed}
                </span>
                <span className="text-sm font-bold text-[#FF3B30] tracking-widest uppercase mb-2">
                  {speedUnit}
                </span>
              </div>
            )}
          </div>

          <div className={`w-full transition-all duration-300 ${!isExpanded ? 'opacity-0 h-0 overflow-hidden mt-0' : 'opacity-100 h-auto'}`}>
            {/* Telemetry Grid */}
            <div className="grid grid-cols-4 w-full gap-4 pt-4 border-t border-white/5">
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Top</span>
              <span className="text-lg font-semibold text-gray-200">{topSpeed}</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Avg</span>
              <span className="text-lg font-semibold text-gray-200">{avgSpeed}</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Dist</span>
              <span className="text-lg font-semibold text-gray-200">{distance}</span>
              <span className="text-[9px] text-gray-600 mt-0.5">{distUnit}</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Time</span>
              <span className="text-lg font-semibold text-gray-200 tracking-wider">
                {formatDuration(telemetry.durationSeconds)}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              triggerHaptic([20, 30, 20]);
              setShowSummaryModal(true);
            }}
            className="w-full h-14 bg-white/5 hover:bg-white/10 active:scale-[0.98] transition-all rounded-2xl flex items-center justify-center gap-3 border border-white/10 mt-6"
          >
            <StopCircle className="w-5 h-5 text-[#FF3B30]" />
            <span className="text-sm font-bold text-[#FF3B30] tracking-widest uppercase">
              Finish Drive
            </span>
          </button>
          </div>
        </div>
      </motion.div>

      {showSummaryModal && (
        <PostDriveSummaryModal onClose={() => setShowSummaryModal(false)} />
      )}
    </>
  );
}
