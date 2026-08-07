import { useEffect, useRef } from 'react';
import { useDriveStore } from '@/store/useDriveStore';
import localforage from 'localforage';

// Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Low-pass filter parameters
const COORD_ALPHA = 0.45; // Coordinate smoothing factor
const SPEED_ALPHA = 0.3; // Speed EMA smoothing factor
const MIN_JITTER_DIST_KM = 0.003; // ~3 meters threshold
const MIN_JITTER_SPEED_KMH = 1.8; // ~1.8 km/h threshold

export function useTelemetry() {
  const isActive = useDriveStore((state) => state.isActive);
  const updateTelemetry = useDriveStore((state) => state.updateTelemetry);
  const addRouteCoord = useDriveStore((state) => state.addRouteCoord);

  const watchId = useRef<number | null>(null);
  const lastRawLocation = useRef<{ lat: number; lon: number; time: number } | null>(null);
  const lastFilteredLocation = useRef<{ lat: number; lon: number; time: number } | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      // Start duration timer
      interval = setInterval(() => {
        updateTelemetry({
          durationSeconds: useDriveStore.getState().telemetry.durationSeconds + 1,
        });
      }, 1000);

      // Start GPS watch
      if (navigator.geolocation) {
        watchId.current = navigator.geolocation.watchPosition(
          (position) => {
            const { latitude: rawLat, longitude: rawLon, speed: rawSpeed } = position.coords;
            const now = Date.now();

            let speedKmh = 0;
            if (rawSpeed !== null && rawSpeed >= 0) {
              speedKmh = rawSpeed * 3.6; // m/s to km/h
            } else if (lastRawLocation.current) {
              const timeDiff = (now - lastRawLocation.current.time) / 1000;
              if (timeDiff > 0) {
                const dist = calculateDistance(
                  lastRawLocation.current.lat,
                  lastRawLocation.current.lon,
                  rawLat,
                  rawLon
                );
                speedKmh = dist / (timeDiff / 3600);
              }
            }

            // Calculate raw distance change from last filtered position
            let rawDistanceIncrement = 0;
            if (lastFilteredLocation.current) {
              rawDistanceIncrement = calculateDistance(
                lastFilteredLocation.current.lat,
                lastFilteredLocation.current.lon,
                rawLat,
                rawLon
              );
            }

            // GPS Jitter filter: Ignore tiny position changes when standing still or low speed
            const isStationaryJitter =
              lastFilteredLocation.current &&
              rawDistanceIncrement < MIN_JITTER_DIST_KM &&
              speedKmh < MIN_JITTER_SPEED_KMH;

            if (isStationaryJitter) {
              // Stationary: snap speed to 0, avoid distance accumulation & duplicate route coords
              updateTelemetry({
                speedKmh: 0,
              });
              lastRawLocation.current = { lat: rawLat, lon: rawLon, time: now };
              return;
            }

            // Apply low-pass exponential filter to coordinates
            let filteredLat = rawLat;
            let filteredLon = rawLon;

            if (lastFilteredLocation.current) {
              filteredLat =
                lastFilteredLocation.current.lat +
                COORD_ALPHA * (rawLat - lastFilteredLocation.current.lat);
              filteredLon =
                lastFilteredLocation.current.lon +
                COORD_ALPHA * (rawLon - lastFilteredLocation.current.lon);
            }

            // Smooth speed with EMA filter
            const currentSpeedKmh = useDriveStore.getState().telemetry.speedKmh;
            const smoothedSpeed =
              currentSpeedKmh + SPEED_ALPHA * (speedKmh - currentSpeedKmh);

            const actualDistanceIncrement = lastFilteredLocation.current
              ? calculateDistance(
                  lastFilteredLocation.current.lat,
                  lastFilteredLocation.current.lon,
                  filteredLat,
                  filteredLon
                )
              : 0;

            const newDistanceKm =
              useDriveStore.getState().telemetry.distanceKm + actualDistanceIncrement;
            const newTopSpeedKmh = Math.max(
              useDriveStore.getState().telemetry.topSpeedKmh,
              smoothedSpeed
            );
            const duration = useDriveStore.getState().telemetry.durationSeconds;
            const avgSpeedKmh =
              duration > 0 ? newDistanceKm / (duration / 3600) : 0;

            updateTelemetry({
              speedKmh: Math.max(0, smoothedSpeed),
              topSpeedKmh: newTopSpeedKmh,
              distanceKm: newDistanceKm,
              avgSpeedKmh,
            });

            addRouteCoord([filteredLon, filteredLat]);

            lastRawLocation.current = { lat: rawLat, lon: rawLon, time: now };
            lastFilteredLocation.current = { lat: filteredLat, lon: filteredLon, time: now };

            // Cache to IndexedDB
            localforage
              .setItem('offline_telemetry', useDriveStore.getState().telemetry)
              .catch(console.error);
          },
          (error) => {
            console.error('GPS Error:', error);
          },
          { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );
      }
    } else {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      lastRawLocation.current = null;
      lastFilteredLocation.current = null;
    }

    return () => {
      clearInterval(interval);
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [isActive, updateTelemetry, addRouteCoord]);
}
