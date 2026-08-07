'use client';

import { useDriveStore } from '@/store/useDriveStore';
import { motion, AnimatePresence } from 'motion/react';
import { X, Layers, Map as MapIcon, Compass, Navigation, Eye, EyeOff } from 'lucide-react';

interface MapSettingsDrawerProps {
  onClose: () => void;
}

export function MapSettingsDrawer({ onClose }: MapSettingsDrawerProps) {
  const mapSettings = useDriveStore((state) => state.mapSettings);
  const updateMapSettings = useDriveStore((state) => state.updateMapSettings);

  return (
    <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        className="w-80 h-full bg-[#0B0F17] border-l border-white/10 p-5 shadow-2xl overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#FF3B30]" /> Map Layers
          </h2>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Base Style */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Base Map Style</h3>
            <div className="grid gap-2">
              {[
                { id: 'dark', label: 'Dark Matter (Night)', icon: MapIcon },
                { id: 'satellite', label: 'Satellite (Aerial)', icon: Eye },
                { id: 'cockpit', label: 'High-Contrast Cockpit', icon: Navigation },
              ].map((style) => {
                const Icon = style.icon;
                const isActive = mapSettings.baseStyle === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => updateMapSettings({ baseStyle: style.id as any })}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-[#FF3B30]/10 border-[#FF3B30] text-[#FF3B30]'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-semibold">{style.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Overlays */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Live Overlays</h3>
            <div className="space-y-2">
              {[
                { id: 'traffic', label: 'Real-time Traffic' },
                { id: 'cameras', label: 'Speed Cameras / Traps' },
                { id: 'favorites', label: 'Favorite Places' },
                { id: 'buildings3d', label: '3D Buildings & Terrain' },
                { id: 'heatmap', label: 'Route Exploration Heatmap' },
              ].map((layer) => {
                const isActive = mapSettings[layer.id as keyof typeof mapSettings];
                return (
                  <div key={layer.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                    <span className="text-sm font-semibold text-gray-200">{layer.label}</span>
                    <button
                      onClick={() => updateMapSettings({ [layer.id]: !isActive })}
                      className={`w-10 h-6 rounded-full p-1 transition-colors ${
                        isActive ? 'bg-[#FF3B30]' : 'bg-gray-700'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          isActive ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Orientation */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Display Options</h3>
            <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
              <button
                onClick={() => updateMapSettings({ orientation: 'north' })}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  mapSettings.orientation === 'north' ? 'bg-white/15 text-white' : 'text-gray-400'
                }`}
              >
                <Compass className="w-3.5 h-3.5" /> North Up
              </button>
              <button
                onClick={() => updateMapSettings({ orientation: 'heading' })}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  mapSettings.orientation === 'heading' ? 'bg-white/15 text-white' : 'text-gray-400'
                }`}
              >
                <Navigation className="w-3.5 h-3.5" /> Heading Up
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
              <span className="text-sm font-semibold text-gray-200">Auto Night/Day Mode</span>
              <button
                onClick={() => updateMapSettings({ autoNightDay: !mapSettings.autoNightDay })}
                className={`w-10 h-6 rounded-full p-1 transition-colors ${
                  mapSettings.autoNightDay ? 'bg-[#FF3B30]' : 'bg-gray-700'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    mapSettings.autoNightDay ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
