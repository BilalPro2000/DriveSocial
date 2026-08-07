'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Map, { Source, Layer, MapRef, Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useDriveStore } from '@/store/useDriveStore';
import { useTelemetry } from '@/hooks/useTelemetry';
import { useWakeLock } from '@/hooks/useWakeLock';
import { Bell, Map as MapIcon, Crosshair, Play, AlertTriangle, Fuel, Users } from 'lucide-react';
import { SpeedometerHUD } from '@/components/hud/SpeedometerHUD';
import { motion, AnimatePresence } from 'motion/react';
import { MapSettingsDrawer } from './MapSettingsDrawer';
import { MapCanvasTools } from './MapCanvasTools';
import { triggerHaptic } from '@/lib/haptics';
import { EmergencyDrawer } from '@/components/hud/EmergencyDrawer';
import { MediaPlayerWidget } from '@/components/hud/MediaPlayerWidget';
import { QuickActionsFAB } from '@/components/hud/QuickActionsFAB';

const STYLES = {
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  satellite: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json', // Mock satellite with dark matter
  cockpit: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json', // Mock cockpit
};

export function HomeMap() {
  useTelemetry();
  useWakeLock();
  
  const mapRef = useRef<MapRef>(null);
  const isActive = useDriveStore((state) => state.isActive);
  const startDrive = useDriveStore((state) => state.startDrive);
  const telemetry = useDriveStore((state) => state.telemetry);
  const mapSettings = useDriveStore((state) => state.mapSettings);
  const waypoints = useDriveStore((state) => state.waypoints);
  
  const [viewState, setViewState] = useState({
    longitude: -122.4194,
    latitude: 37.7749,
    zoom: 14,
    pitch: 0,
    bearing: 0,
  });

  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [showEmergencyDrawer, setShowEmergencyDrawer] = useState(false);
  const [hudExpanded, setHudExpanded] = useState(true);

  useEffect(() => {
    if (telemetry.routeCoords.length > 0) {
      const latest = telemetry.routeCoords[telemetry.routeCoords.length - 1];
      
      let bearing = viewState.bearing;
      if (mapSettings.orientation === 'heading' && telemetry.routeCoords.length > 1) {
         const prev = telemetry.routeCoords[telemetry.routeCoords.length - 2];
         bearing = Math.atan2(latest[0] - prev[0], latest[1] - prev[1]) * 180 / Math.PI;
      }

      if (isActive && mapRef.current) {
         mapRef.current.flyTo({
           center: [latest[0], latest[1]],
           bearing: mapSettings.orientation === 'heading' ? bearing : 0,
           duration: 1000,
         });
      }
    }
  }, [telemetry.routeCoords, isActive, mapSettings.orientation, viewState.bearing]);

  const geoJson = useMemo(() => {
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: telemetry.routeCoords,
      },
    };
  }, [telemetry.routeCoords]);

  const handleRecenter = () => {
    triggerHaptic(15);
    if (telemetry.routeCoords.length > 0) {
      const latest = telemetry.routeCoords[telemetry.routeCoords.length - 1];
      mapRef.current?.flyTo({ center: [latest[0], latest[1]], zoom: 16 });
    }
  };

  const handleStartDrive = () => {
    triggerHaptic([20, 40, 20]);
    startDrive();
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-[#0B0F17]">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle={STYLES[mapSettings.baseStyle as keyof typeof STYLES]}
        attributionControl={false}
      >
        {telemetry.routeCoords.length > 0 && (
          <Source id="route" type="geojson" data={geoJson as any}>
            <Layer
              id="route-line"
              type="line"
              paint={{
                'line-color': '#FF3B30',
                'line-width': 4,
                'line-opacity': 0.8,
              }}
            />
          </Source>
        )}
        
        {telemetry.routeCoords.length > 0 && (
          <Marker
            longitude={telemetry.routeCoords[telemetry.routeCoords.length - 1][0]}
            latitude={telemetry.routeCoords[telemetry.routeCoords.length - 1][1]}
            anchor="center"
          >
            <div
              className="relative flex items-center justify-center transition-transform duration-300 ease-out will-change-transform"
              style={{
                transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
                willChange: 'transform',
              }}
            >
              <div className="w-6 h-6 bg-[#FF3B30] rounded-full border-2 border-white shadow-[0_0_20px_rgba(255,59,48,0.8)] relative z-10" />
              <div className="absolute w-10 h-10 bg-[#FF3B30]/30 rounded-full animate-ping" />
            </div>
          </Marker>
        )}

        {waypoints.map((wp) => (
          <Marker key={wp.id} longitude={wp.lng} latitude={wp.lat} anchor="bottom">
            <div className={`p-2 rounded-full shadow-xl text-white ${
              wp.type === 'hazard' ? 'bg-red-500' :
              wp.type === 'rest_stop' ? 'bg-blue-500' : 'bg-emerald-500'
            }`}>
              {wp.type === 'hazard' && <AlertTriangle className="w-4 h-4" />}
              {wp.type === 'rest_stop' && <Fuel className="w-4 h-4" />}
              {wp.type === 'custom' && <Users className="w-4 h-4" />}
            </div>
          </Marker>
        ))}
      </Map>

      <AnimatePresence>
        {!isActive && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-0 left-0 w-full p-4 z-10"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 h-12 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 px-4 flex items-center text-gray-400">
                <span className="text-sm font-medium">Where to drive?</span>
              </div>
              <button className="w-12 h-12 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center justify-center relative shadow-lg">
                <Bell className="w-5 h-5 text-white" />
                <span className="absolute top-3 right-3 w-2 h-2 bg-[#FF3B30] rounded-full shadow-[0_0_8px_#FF3B30]"></span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MapCanvasTools onRecenter={handleRecenter} onOpenSettings={() => setShowSettingsDrawer(true)} />

      <AnimatePresence>
        {showSettingsDrawer && <MapSettingsDrawer onClose={() => setShowSettingsDrawer(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showEmergencyDrawer && <EmergencyDrawer onClose={() => setShowEmergencyDrawer(false)} />}
      </AnimatePresence>

      {isActive && (
        <>
          <div className="absolute top-4 left-4 z-40">
            <MediaPlayerWidget />
          </div>
          <QuickActionsFAB onToggleHUD={() => setHudExpanded(!hudExpanded)} isHUDExpanded={hudExpanded} />
          
          <button
            onClick={() => setShowEmergencyDrawer(true)}
            className="absolute top-4 right-4 z-40 w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,59,48,0.4)] transition-all active:scale-95"
          >
            <AlertTriangle className="w-6 h-6" />
          </button>
        </>
      )}

      <div className="absolute bottom-0 left-0 w-full z-20">
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
                className="w-full h-16 bg-[#FF3B30] hover:bg-[#ff5247] active:scale-[0.98] transition-all rounded-2xl flex items-center justify-center gap-3 shadow-[0_8px_32px_rgba(255,59,48,0.4)]"
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
