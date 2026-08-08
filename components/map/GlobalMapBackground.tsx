'use client';

import { useRef, useEffect, useMemo } from 'react';
import Map, { Source, Layer, MapRef, Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useDriveStore } from '@/store/useDriveStore';
import { AlertTriangle, Fuel, Users } from 'lucide-react';
import { usePathname } from 'next/navigation';

const STYLES = {
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  satellite: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json', // Mock satellite with dark matter
  cockpit: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json', // Mock cockpit
};

export function GlobalMapBackground() {
  const mapRef = useRef<MapRef>(null);
  const isActive = useDriveStore((state) => state.isActive);
  const telemetry = useDriveStore((state) => state.telemetry);
  const mapSettings = useDriveStore((state) => state.mapSettings);
  const waypoints = useDriveStore((state) => state.waypoints);
  const mapViewState = useDriveStore((state) => state.mapViewState);
  const setMapViewState = useDriveStore((state) => state.setMapViewState);
  const pathname = usePathname();

  useEffect(() => {
    if (telemetry.routeCoords.length > 0) {
      const latest = telemetry.routeCoords[telemetry.routeCoords.length - 1];
      
      let bearing = mapViewState.bearing;
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
  }, [telemetry.routeCoords, isActive, mapSettings.orientation, mapViewState.bearing]);

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

  // If we are not on the home page, render a frosted glass overlay
  const isHome = pathname === '/';

  return (
    <div className="fixed inset-0 w-full h-[100dvh] overflow-hidden bg-[#0B0F17] z-0 pointer-events-none">
      <div className="pointer-events-auto w-full h-full">
        <Map
          ref={mapRef}
          {...mapViewState}
          onMove={evt => setMapViewState(evt.viewState)}
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
      </div>
      
      {/* Overlay for non-home pages */}
      {!isHome && (
        <div className="absolute inset-0 backdrop-blur-xl bg-[#0B0F17]/80 z-10 pointer-events-none" />
      )}
    </div>
  );
}
