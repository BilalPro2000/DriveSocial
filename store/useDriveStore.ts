import { create } from 'zustand';

interface TelemetryData {
  speedKmh: number;
  topSpeedKmh: number;
  avgSpeedKmh: number;
  distanceKm: number;
  durationSeconds: number;
  routeCoords: [number, number][]; // [longitude, latitude]
}

interface MapSettings {
  baseStyle: 'dark' | 'satellite' | 'cockpit';
  traffic: boolean;
  cameras: boolean;
  favorites: boolean;
  buildings3d: boolean;
  heatmap: boolean;
  autoNightDay: boolean;
  orientation: 'north' | 'heading';
}

interface Waypoint {
  id: string;
  lng: number;
  lat: number;
  type: 'rest_stop' | 'hazard' | 'custom';
  label: string;
}

type DriveMode = 'Casual Cruise' | 'Telemetry Track' | 'Convoy Run';

interface DriveState {
  isActive: boolean;
  driveMode: DriveMode;
  telemetry: TelemetryData;
  mapSettings: MapSettings;
  waypoints: Waypoint[];
  startDrive: (mode?: DriveMode) => void;
  finishDrive: () => void;
  updateTelemetry: (data: Partial<TelemetryData>) => void;
  addRouteCoord: (coord: [number, number]) => void;
  updateMapSettings: (settings: Partial<MapSettings>) => void;
  addWaypoint: (wp: Waypoint) => void;
  removeWaypoint: (id: string) => void;
  setDriveMode: (mode: DriveMode) => void;
}

export const useDriveStore = create<DriveState>((set) => ({
  isActive: false,
  driveMode: 'Casual Cruise',
  telemetry: {
    speedKmh: 0,
    topSpeedKmh: 0,
    avgSpeedKmh: 0,
    distanceKm: 0,
    durationSeconds: 0,
    routeCoords: [],
  },
  mapSettings: {
    baseStyle: 'dark',
    traffic: false,
    cameras: true,
    favorites: false,
    buildings3d: false,
    heatmap: false,
    autoNightDay: true,
    orientation: 'heading',
  },
  waypoints: [],
  startDrive: (mode) =>
    set({
      isActive: true,
      driveMode: mode || 'Casual Cruise',
      telemetry: {
        speedKmh: 0,
        topSpeedKmh: 0,
        avgSpeedKmh: 0,
        distanceKm: 0,
        durationSeconds: 0,
        routeCoords: [],
      },
    }),
  finishDrive: () => set({ isActive: false }),
  updateTelemetry: (data) =>
    set((state) => ({ telemetry: { ...state.telemetry, ...data } })),
  addRouteCoord: (coord) =>
    set((state) => ({
      telemetry: {
        ...state.telemetry,
        routeCoords: [...state.telemetry.routeCoords, coord],
      },
    })),
  updateMapSettings: (settings) =>
    set((state) => ({ mapSettings: { ...state.mapSettings, ...settings } })),
  addWaypoint: (wp) =>
    set((state) => ({ waypoints: [...state.waypoints, wp] })),
  removeWaypoint: (id) =>
    set((state) => ({ waypoints: state.waypoints.filter((w) => w.id !== id) })),
  setDriveMode: (mode) => set({ driveMode: mode }),
}));
