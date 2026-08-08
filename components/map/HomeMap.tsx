'use client';

import { useState } from 'react';
import { useDriveStore } from '@/store/useDriveStore';
import { useTelemetry } from '@/hooks/useTelemetry';
import { useWakeLock } from '@/hooks/useWakeLock';
import { Bell, Play, AlertTriangle, Music } from 'lucide-react';
import { SpeedometerHUD } from '@/components/hud/SpeedometerHUD';
import { motion, AnimatePresence } from 'motion/react';
import { MapSettingsDrawer } from './MapSettingsDrawer';
import { MapCanvasTools } from './MapCanvasTools';
import { triggerHaptic } from '@/lib/haptics';
import { EmergencyDrawer } from '@/components/hud/EmergencyDrawer';
import { MediaPlayerWidget } from '@/components/hud/MediaPlayerWidget';
import { QuickActionsFAB } from '@/components/hud/QuickActionsFAB';

export function HomeMap() {
  useTelemetry();
  useWakeLock();
  
  const isActive = useDriveStore((state) => state.isActive);
  const startDrive = useDriveStore((state) => state.startDrive);
  const setMapViewState = useDriveStore((state) => state.setMapViewState);
  const telemetry = useDriveStore((state) => state.telemetry);

  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [showEmergencyDrawer, setShowEmergencyDrawer] = useState(false);
  const [hudExpanded, setHudExpanded] = useState(true);
  const [showParkedMediaPlayer, setShowParkedMediaPlayer] = useState(false);

  const handleRecenter = () => {
    triggerHaptic(15);
    if (telemetry.routeCoords.length > 0) {
      const latest = telemetry.routeCoords[telemetry.routeCoords.length - 1];
      setMapViewState({
        longitude: latest[0],
        latitude: latest[1],
        zoom: 16
      });
    }
  };

  const handleStartDrive = () => {
    triggerHaptic([20, 40, 20]);
    startDrive();
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden pointer-events-none">
      {/* Top Bar Navigation Header */}
      <AnimatePresence>
        {!isActive && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-0 left-0 w-full p-4 z-10 flex flex-col gap-3 pointer-events-auto"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 h-12 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/10 px-4 flex items-center text-gray-300 shadow-lg">
                <span className="text-sm font-medium">Where to drive?</span>
              </div>
              <button
                onClick={() => {
                  triggerHaptic(10);
                  setShowParkedMediaPlayer(!showParkedMediaPlayer);
                }}
                className={`w-12 h-12 rounded-2xl border flex items-center justify-center relative shadow-lg transition-all ${
                  showParkedMediaPlayer
                    ? 'bg-blue-600/80 backdrop-blur-md border-blue-500 text-white'
                    : 'bg-slate-900/40 backdrop-blur-md border-white/10 text-white hover:bg-white/10'
                }`}
                title="Toggle Media Player"
              >
                <Music className="w-5 h-5" />
              </button>
              <button className="w-12 h-12 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/10 flex items-center justify-center relative shadow-lg">
                <Bell className="w-5 h-5 text-white" />
                <span className="absolute top-3 right-3 w-2 h-2 bg-[#FF3B30] rounded-full shadow-[0_0_8px_#FF3B30]"></span>
              </button>
            </div>

            {showParkedMediaPlayer && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="z-40 self-start"
              >
                <MediaPlayerWidget />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-auto">
        <MapCanvasTools onRecenter={handleRecenter} onOpenSettings={() => setShowSettingsDrawer(true)} />
      </div>

      <AnimatePresence>
        {showSettingsDrawer && (
          <div className="pointer-events-auto">
            <MapSettingsDrawer onClose={() => setShowSettingsDrawer(false)} />
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEmergencyDrawer && (
          <div className="pointer-events-auto">
            <EmergencyDrawer onClose={() => setShowEmergencyDrawer(false)} />
          </div>
        )}
      </AnimatePresence>

      {/* Active Drive Mode Controls */}
      {isActive && (
        <>
          <div className="absolute top-4 left-4 z-40 pointer-events-auto">
            <MediaPlayerWidget />
          </div>
          <div className="pointer-events-auto">
            <QuickActionsFAB onToggleHUD={() => setHudExpanded(!hudExpanded)} isHUDExpanded={hudExpanded} />
          </div>
          
          <button
            onClick={() => setShowEmergencyDrawer(true)}
            className="absolute top-4 right-4 z-40 w-12 h-12 bg-red-500/80 backdrop-blur-md border border-red-400 hover:bg-red-600/90 text-white rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 pointer-events-auto"
          >
            <AlertTriangle className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Bottom Speedometer HUD or Start Drive Bar */}
      <div className="absolute bottom-0 left-0 w-full z-20 pointer-events-auto">
        <AnimatePresence mode="wait">
          {!isActive ? (
            <motion.div
              key="start-btn"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="p-4 pb-20"
            >
              <button
                onClick={handleStartDrive}
                className="w-full h-16 bg-blue-600/90 backdrop-blur-md border border-blue-500 hover:bg-blue-500 active:scale-[0.98] transition-all rounded-2xl flex items-center justify-center gap-3 shadow-lg"
              >
                <Play className="w-6 h-6 text-white fill-white" />
                <span className="text-lg font-bold text-white tracking-wide">START DRIVE</span>
              </button>
            </motion.div>
          ) : (
            <SpeedometerHUD key="hud" isExpanded={hudExpanded} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
