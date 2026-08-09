'use client';

import { useRef, useEffect, useMemo } from 'react';
import Map, { Source, Layer, MapRef, Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useDriveStore } from '@/store/useDriveStore';
import { AlertTriangle, Fuel, Users, Navigation } from 'lucide-react';
import { usePathname } from 'next/navigation';

const RASTER_STYLES = {
  dark: {
    version: 8,
    sources: {
      'carto-dark': {
        type: 'raster',
        tiles: [
          'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
          'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
          'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
          'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        ],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap &copy; CARTO',
      },
    },
    layers: [
      {
        id: 'carto-dark-layer',
        type: 'raster',
        source: 'carto-dark',
        minzoom: 0,
        maxzoom: 20,
      },
    ],
  },
  satellite: {
    version: 8,
    sources: {
      'carto-voyager': {
        type: 'raster',
        tiles: [
          'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
          'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
          'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
          'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
        ],
        tileSize: 256,
        attribution: '&copy; OpenStreetMap &copy; CARTO',
      },
    },
    layers: [
      {
        id: 'carto-voyager-layer',
        type: 'raster',
        source: 'carto-voyager',
        minzoom: 0,
        maxzoom: 20,
      },
    ],
  },
  cockpit: {
    version: 8,
    sources: {
      'carto-dark-cockpit': {
        type: 'raster',
        tiles: [
          'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
          'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
          'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
          'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        ],
        tileSize: 256,
      },
    },
    layers: [
      {
        id: 'carto-dark-cockpit-layer',
        type: 'raster',
        source: 'carto-dark-cockpit',
        minzoom: 0,
        maxzoom: 20,
      },
    ],
  },
};

// Generates a circular polygon GeoJSON feature given center [lng, lat] and radius in meters
function createGeoJSONCircle(center: [number, number], radiusInMeters: number, points = 64) {
  const coords = {
    latitude: center[1],
    longitude: center[0],
  };
  const km = radiusInMeters / 1000;
  const ret: [number, number][] = [];
  const distanceX = km / (111.32 * Math.cos((coords.latitude * Math.PI) / 180));
  const distanceY = km / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    ret.push([coords.longitude + x, coords.latitude + y]);
  }
  ret.push(ret[0]);

  return {
    type: 'Feature' as const,
    geometry: {
      type: 'Polygon' as const,
      coordinates: [ret],
    },
    properties: {},
  };
}

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
    // Resize map canvas on window resize / orientation change
    const handleResize = () => {
      mapRef.current?.resize();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine current active user position
  const userPos: [number, number] = useMemo(() => {
    if (telemetry.currentPosition) return telemetry.currentPosition;
    if (telemetry.routeCoords.length > 0) return telemetry.routeCoords[telemetry.routeCoords.length - 1];
    return [mapViewState.longitude, mapViewState.latitude];
  }, [telemetry.currentPosition, telemetry.routeCoords, mapViewState.longitude, mapViewState.latitude]);

  useEffect(() => {
    if (isActive && userPos && mapRef.current) {
      let bearing = mapViewState.bearing;
      if (mapSettings.orientation === 'heading' && telemetry.routeCoords.length > 1) {
        const latest = userPos;
        const prev = telemetry.routeCoords[telemetry.routeCoords.length - 2];
        bearing = (Math.atan2(latest[0] - prev[0], latest[1] - prev[1]) * 180) / Math.PI;
      }

      mapRef.current.flyTo({
        center: [userPos[0], userPos[1]],
        bearing: mapSettings.orientation === 'heading' ? bearing : 0,
        duration: 800,
      });
    }
  }, [userPos, isActive, mapSettings.orientation, mapViewState.bearing, telemetry.routeCoords]);

  const routeGeoJson = useMemo(() => {
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: telemetry.routeCoords,
      },
    };
  }, [telemetry.routeCoords]);

  // Generate GeoJSON Polygon for Accuracy Radius Ring on Map
  const accuracyCircleGeoJson = useMemo(() => {
    if (!userPos || !telemetry.accuracy) return null;
    return createGeoJSONCircle(userPos, telemetry.accuracy);
  }, [userPos, telemetry.accuracy]);

  // If we are not on the home page, render a frosted glass overlay
  const isHome = pathname === '/';
  const currentMapStyle = RASTER_STYLES[mapSettings.baseStyle as keyof typeof RASTER_STYLES] || RASTER_STYLES.dark;

  return (
    <div className="fixed inset-0 w-full h-[100dvh] overflow-hidden bg-[#0B0F17] z-0 pointer-events-none">
      <div className="pointer-events-auto w-full h-full relative">
        <Map
          ref={mapRef}
          {...mapViewState}
          onMove={(evt) => setMapViewState(evt.viewState)}
          onLoad={() => mapRef.current?.resize()}
          style={{ width: '100%', height: '100%' }}
          mapStyle={currentMapStyle as any}
          attributionControl={false}
        >
          {/* Accuracy Radius Layer (Semi-transparent Blue Pulse Ring Area) */}
          {accuracyCircleGeoJson && (
            <Source id="accuracy-ring-source" type="geojson" data={accuracyCircleGeoJson as any}>
              <Layer
                id="accuracy-ring-fill"
                type="fill"
                paint={{
                  'fill-color': telemetry.isLowAccuracy ? '#EF4444' : '#3B82F6',
                  'fill-opacity': telemetry.isLowAccuracy ? 0.12 : 0.18,
                }}
              />
              <Layer
                id="accuracy-ring-outline"
                type="line"
                paint={{
                  'line-color': telemetry.isLowAccuracy ? '#EF4444' : '#60A5FA',
                  'line-width': 1.5,
                  'line-opacity': 0.7,
                  'line-dasharray': [3, 2],
                }}
              />
            </Source>
          )}

          {/* Active Drive Route Polyline */}
          {telemetry.routeCoords.length > 0 && (
            <Source id="route" type="geojson" data={routeGeoJson as any}>
              <Layer
                id="route-line"
                type="line"
                paint={{
                  'line-color': '#FF3B30',
                  'line-width': 5,
                  'line-opacity': 0.85,
                }}
              />
            </Source>
          )}

          {/* User Location Marker with Animated Blue Pulse Ring & Accuracy Badge */}
          {userPos && (
            <Marker longitude={userPos[0]} latitude={userPos[1]} anchor="center">
              <div className="relative flex items-center justify-center pointer-events-auto group">
                {/* Visual pulse aura representing continuous high-precision GPS lock */}
                <div
                  className={`absolute rounded-full animate-ping pointer-events-none ${
                    telemetry.isLowAccuracy ? 'bg-red-500/30' : 'bg-blue-500/35'
                  }`}
                  style={{
                    width: '3.5rem',
                    height: '3.5rem',
                  }}
                />

                <div
                  className={`absolute rounded-full border border-blue-400/50 pointer-events-none ${
                    telemetry.isLowAccuracy ? 'bg-red-500/10 border-red-400/50' : 'bg-blue-500/20'
                  }`}
                  style={{
                    width: '2.5rem',
                    height: '2.5rem',
                  }}
                />

                {/* Inner position indicator dot */}
                <div
                  className={`w-6 h-6 rounded-full border-2 border-white shadow-[0_0_20px_rgba(59,130,246,0.9)] relative z-10 flex items-center justify-center transition-transform ${
                    telemetry.isLowAccuracy ? 'bg-red-500 shadow-red-500/80' : 'bg-[#007AFF]'
                  }`}
                >
                  <Navigation className="w-3 h-3 text-white fill-white transform rotate-45" />
                </div>

                {/* Accuracy Indicator Badge */}
                {telemetry.accuracy !== null && (
                  <div className="absolute -top-7 bg-slate-900/90 text-white border border-white/20 text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded-full shadow-md whitespace-nowrap backdrop-blur-md opacity-80 group-hover:opacity-100 transition-opacity">
                    ±{telemetry.accuracy}m
                  </div>
                )}
              </div>
            </Marker>
          )}

          {/* Waypoints */}
          {waypoints.map((wp) => (
            <Marker key={wp.id} longitude={wp.lng} latitude={wp.lat} anchor="bottom">
              <div
                className={`p-2 rounded-full shadow-xl text-white ${
                  wp.type === 'hazard'
                    ? 'bg-red-500'
                    : wp.type === 'rest_stop'
                    ? 'bg-blue-500'
                    : 'bg-emerald-500'
                }`}
              >
                {wp.type === 'hazard' && <AlertTriangle className="w-4 h-4" />}
                {wp.type === 'rest_stop' && <Fuel className="w-4 h-4" />}
                {wp.type === 'custom' && <Users className="w-4 h-4" />}
              </div>
            </Marker>
          ))}
        </Map>
      </div>

      {/* Overlay for non-home pages */}
      {!isHome && <div className="absolute inset-0 backdrop-blur-xl bg-[#0B0F17]/80 z-10 pointer-events-none" />}
    </div>
  );
}
