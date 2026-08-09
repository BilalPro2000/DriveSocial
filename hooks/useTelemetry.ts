import { useEffect, useRef } from 'react';
import { useDriveStore } from '@/store/useDriveStore';
import { useToastStore } from '@/store/useToastStore';
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

export function useTelemetry() {
  const isActive = useDriveStore((state) => state.isActive);
  const updateTelemetry = useDriveStore((state) => state.updateTelemetry);
  const addRouteCoord = useDriveStore((state) => state.addRouteCoord);

  const watchId = useRef<number | null>(null);
  const simInterval = useRef<NodeJS.Timeout | null>(null);
  const simAngle = useRef<number>(0);
  const lastRealSpeed = useRef<number>(0);
  const lastSmoothedCoords = useRef<[number, number] | null>(null);
  const lastLowAccuracyToastTime = useRef<number>(0);

  useEffect(() => {
    // 1. Continuous High-Precision GPS Watch
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      const geoOptions: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      };

      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, speed, accuracy } = position.coords;
          const currentAccuracy = accuracy ? Math.round(accuracy) : 10;
          const isLowAcc = currentAccuracy > 50;

          // Check if low accuracy warning toast should be displayed
          const now = Date.now();
          if (isLowAcc && now - lastLowAccuracyToastTime.current > 30000) {
            lastLowAccuracyToastTime.current = now;
            useToastStore.getState().addToast(
              'Low GPS accuracy — enable Precise Location in device settings.',
              'warning'
            );
          }

          // Position Smoothing & Jitter Filter Algorithm
          let smoothedLon = longitude;
          let smoothedLat = latitude;

          if (lastSmoothedCoords.current) {
            const [prevLon, prevLat] = lastSmoothedCoords.current;
            const distMeters = calculateDistance(prevLat, prevLon, latitude, longitude) * 1000;

            // Stationary Threshold Check (< 2.5 meters & low speed)
            if (distMeters < 2.5 && (!speed || speed < 0.5)) {
              // Suppress stationary GPS jitter - anchor position
              smoothedLon = prevLon;
              smoothedLat = prevLat;
            } else if (distMeters < 15) {
              // Exponential Moving Average filter for smooth trajectory
              const alpha = 0.45;
              smoothedLon = prevLon + alpha * (longitude - prevLon);
              smoothedLat = prevLat + alpha * (latitude - prevLat);
            }
          }

          lastSmoothedCoords.current = [smoothedLon, smoothedLat];

          // Update store telemetry with current smoothed position & accuracy
          const state = useDriveStore.getState();
          const isDriveActive = state.isActive;

          if (speed !== null && speed > 0.5) {
            const speedKmh = speed * 3.6;
            lastRealSpeed.current = speedKmh;

            if (isDriveActive) {
              const newTop = Math.max(state.telemetry.topSpeedKmh, speedKmh);
              const durationSec = Math.max(1, state.telemetry.durationSeconds);

              addRouteCoord([smoothedLon, smoothedLat]);

              const coords = state.telemetry.routeCoords;
              let addedDist = 0;
              if (coords.length > 1) {
                const prev = coords[coords.length - 2];
                addedDist = calculateDistance(prev[1], prev[0], smoothedLat, smoothedLon);
              }

              const newDist = state.telemetry.distanceKm + addedDist;
              const avgSpeed = newDist / (durationSec / 3600);

              updateTelemetry({
                speedKmh: Math.round(speedKmh),
                topSpeedKmh: Math.round(newTop),
                distanceKm: Number(newDist.toFixed(2)),
                avgSpeedKmh: Math.round(avgSpeed),
                accuracy: currentAccuracy,
                isLowAccuracy: isLowAcc,
                currentPosition: [smoothedLon, smoothedLat],
              });
              return;
            }
          }

          updateTelemetry({
            accuracy: currentAccuracy,
            isLowAccuracy: isLowAcc,
            currentPosition: [smoothedLon, smoothedLat],
          });
        },
        (err) => {
          console.log('GPS watch error/fallback:', err.message);
        },
        geoOptions
      );
    }

    return () => {
      if (watchId.current !== null && typeof navigator !== 'undefined') {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, [addRouteCoord, updateTelemetry]);

  useEffect(() => {
    let durationTimer: NodeJS.Timeout;

    if (isActive) {
      // 2. Drive Duration Counter (1s tick)
      durationTimer = setInterval(() => {
        const state = useDriveStore.getState();
        updateTelemetry({
          durationSeconds: state.telemetry.durationSeconds + 1,
        });
      }, 1000);

      // 3. Fallback Drive Simulator (if real movement speed <= 0.5)
      simInterval.current = setInterval(() => {
        if (lastRealSpeed.current > 0.5) {
          return;
        }

        const state = useDriveStore.getState();
        const curCoords = state.telemetry.routeCoords;
        let lastPoint: [number, number] = curCoords.length > 0 
          ? curCoords[curCoords.length - 1] 
          : state.telemetry.currentPosition || [state.mapViewState.longitude, state.mapViewState.latitude];

        simAngle.current += 0.1;
        const baseSpeed = 75 + Math.sin(simAngle.current) * 35 + (Math.random() * 6 - 3);
        const simSpeed = Math.max(25, Math.min(145, Math.round(baseSpeed)));

        const kmPerSec = simSpeed / 3600;
        const latOffset = (kmPerSec / 111) * Math.cos(simAngle.current * 0.5);
        const lngOffset = (kmPerSec / (111 * Math.cos(lastPoint[1] * (Math.PI / 180)))) * Math.sin(simAngle.current * 0.5);

        const newLng = lastPoint[0] + lngOffset;
        const newLat = lastPoint[1] + latOffset;
        const newPoint: [number, number] = [newLng, newLat];

        const stepDist = calculateDistance(lastPoint[1], lastPoint[0], newLat, newLng);
        const newDist = state.telemetry.distanceKm + stepDist;
        const newTop = Math.max(state.telemetry.topSpeedKmh, simSpeed);
        const durationSec = Math.max(1, state.telemetry.durationSeconds);
        const avgSpeed = newDist / (durationSec / 3600);

        addRouteCoord(newPoint);

        updateTelemetry({
          speedKmh: simSpeed,
          topSpeedKmh: Math.round(newTop),
          distanceKm: Number(newDist.toFixed(2)),
          avgSpeedKmh: Math.round(avgSpeed),
          currentPosition: newPoint,
          accuracy: state.telemetry.accuracy || 8, // Realistic fallback accuracy during drive simulation
        });

        localforage
          .setItem('offline_telemetry', useDriveStore.getState().telemetry)
          .catch(() => {});
      }, 1000);
    } else {
      lastRealSpeed.current = 0;
      if (simInterval.current) {
        clearInterval(simInterval.current);
        simInterval.current = null;
      }
    }

    return () => {
      clearInterval(durationTimer);
      if (simInterval.current) {
        clearInterval(simInterval.current);
      }
    };
  }, [isActive, updateTelemetry, addRouteCoord]);
}
