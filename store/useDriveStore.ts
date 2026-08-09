import { create } from 'zustand';

interface TelemetryData {
  speedKmh: number;
  topSpeedKmh: number;
  avgSpeedKmh: number;
  distanceKm: number;
  durationSeconds: number;
  routeCoords: [number, number][]; // [longitude, latitude]
  accuracy: number | null; // accuracy in meters
  currentPosition: [number, number] | null; // [longitude, latitude]
  isLowAccuracy: boolean;
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
  mapViewState: {
    longitude: number;
    latitude: number;
    zoom: number;
    pitch: number;
    bearing: number;
  };
  startDrive: (mode?: DriveMode) => void;
  finishDrive: () => void;
  updateTelemetry: (data: Partial<TelemetryData>) => void;
  addRouteCoord: (coord: [number, number]) => void;
  updateMapSettings: (settings: Partial<MapSettings>) => void;
  setMapViewState: (viewState: Partial<{ longitude: number; latitude: number; zoom: number; pitch: number; bearing: number }>) => void;
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
    accuracy: null,
    currentPosition: null,
    isLowAccuracy: false,
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
  mapViewState: {
    longitude: -122.4194,
    latitude: 37.7749,
    zoom: 14,
    pitch: 0,
    bearing: 0,
  },
  startDrive: (mode) =>
    set((state) => ({
      isActive: true,
      driveMode: mode || 'Casual Cruise',
      telemetry: {
        ...state.telemetry,
        speedKmh: 0,
        topSpeedKmh: 0,
        avgSpeedKmh: 0,
        distanceKm: 0,
        durationSeconds: 0,
        routeCoords: state.telemetry.currentPosition ? [state.telemetry.currentPosition] : [],
      },
    })),
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
  setMapViewState: (viewState) =>
    set((state) => ({ mapViewState: { ...state.mapViewState, ...viewState } })),
  addWaypoint: (wp) =>
    set((state) => ({ waypoints: [...state.waypoints, wp] })),
  removeWaypoint: (id) =>
    set((state) => ({ waypoints: state.waypoints.filter((w) => w.id !== id) })),
  setDriveMode: (mode) => set({ driveMode: mode }),
}));
