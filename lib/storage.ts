import {
  DriveRecord,
  INITIAL_DRIVES,
  INITIAL_MESSAGES,
  INITIAL_PROFILE,
  INITIAL_SQUADS,
  INITIAL_VEHICLES,
  Squad,
  SquadMessage,
  UserProfile,
  Vehicle,
} from './mockData';

const STORAGE_KEYS = {
  PROFILE: 'drive_social_profile',
  DRIVES: 'drive_social_drives',
  VEHICLES: 'drive_social_vehicles',
  SQUADS: 'drive_social_squads',
  MESSAGES: 'drive_social_messages',
  PREFERENCES: 'drive_social_preferences',
};

// Helpers for safe SSR execution
function isClient() {
  return typeof window !== 'undefined';
}

export function getStoredProfile(): UserProfile {
  if (!isClient()) return INITIAL_PROFILE;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return data ? JSON.parse(data) : INITIAL_PROFILE;
  } catch (e) {
    console.error('Error reading profile from localStorage:', e);
    return INITIAL_PROFILE;
  }
}

export function saveProfile(profile: UserProfile): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile:', e);
  }
}

export function getStoredDrives(): DriveRecord[] {
  if (!isClient()) return INITIAL_DRIVES;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.DRIVES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.DRIVES, JSON.stringify(INITIAL_DRIVES));
      return INITIAL_DRIVES;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading drives:', e);
    return INITIAL_DRIVES;
  }
}

export function addDriveRecord(drive: Omit<DriveRecord, 'id' | 'created_at' | 'user_id' | 'user_name' | 'user_handle' | 'user_avatar'>): DriveRecord {
  const profile = getStoredProfile();
  const currentVehicles = getStoredVehicles();
  const primaryVehicle = currentVehicles.find((v) => v.is_primary) || currentVehicles[0];

  const newDrive: DriveRecord = {
    ...drive,
    id: `drive_${Date.now()}`,
    user_id: profile.id,
    user_name: profile.display_name,
    user_handle: profile.handle,
    user_avatar: profile.avatar_url,
    created_at: new Date().toISOString(),
    likes_count: 0,
    is_liked: false,
    comments_count: 0,
    vehicle_info: primaryVehicle ? `${primaryVehicle.year} ${primaryVehicle.make} ${primaryVehicle.model}` : 'Performance Vehicle',
  };

  const currentDrives = getStoredDrives();
  const updatedDrives = [newDrive, ...currentDrives];

  if (isClient()) {
    try {
      localStorage.setItem(STORAGE_KEYS.DRIVES, JSON.stringify(updatedDrives));
    } catch (e) {
      console.error('Error adding drive record:', e);
    }
  }

  return newDrive;
}

export function toggleLikeDrive(driveId: string): DriveRecord[] {
  const drives = getStoredDrives();
  const updated = drives.map((d) => {
    if (d.id === driveId) {
      const isLiked = !d.is_liked;
      return {
        ...d,
        is_liked: isLiked,
        likes_count: isLiked ? d.likes_count + 1 : Math.max(0, d.likes_count - 1),
      };
    }
    return d;
  });

  if (isClient()) {
    try {
      localStorage.setItem(STORAGE_KEYS.DRIVES, JSON.stringify(updated));
    } catch (e) {
      console.error('Error toggling like:', e);
    }
  }

  return updated;
}

export function getStoredVehicles(): Vehicle[] {
  if (!isClient()) return INITIAL_VEHICLES;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(INITIAL_VEHICLES));
      return INITIAL_VEHICLES;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading vehicles:', e);
    return INITIAL_VEHICLES;
  }
}

export function addVehicle(vehicle: Omit<Vehicle, 'id' | 'user_id'>): Vehicle[] {
  const profile = getStoredProfile();
  const vehicles = getStoredVehicles();

  // If new vehicle is primary, unmark others
  const updatedVehiclesList = vehicle.is_primary
    ? vehicles.map((v) => ({ ...v, is_primary: false }))
    : vehicles;

  const newVeh: Vehicle = {
    ...vehicle,
    id: `veh_${Date.now()}`,
    user_id: profile.id,
  };

  const result = [newVeh, ...updatedVehiclesList];

  if (isClient()) {
    try {
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(result));
    } catch (e) {
      console.error('Error adding vehicle:', e);
    }
  }

  return result;
}

export function getStoredSquads(): Squad[] {
  if (!isClient()) return INITIAL_SQUADS;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SQUADS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.SQUADS, JSON.stringify(INITIAL_SQUADS));
      return INITIAL_SQUADS;
    }
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading squads:', e);
    return INITIAL_SQUADS;
  }
}

export function addSquad(squadName: string): Squad {
  const squads = getStoredSquads();
  
  // Generate 6 character alphanumeric code
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let inviteCode = '';
  for (let i = 0; i < 6; i++) {
    inviteCode += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  const newSquad: Squad = {
    id: `squad_${Date.now()}`,
    name: squadName,
    invite_code: inviteCode,
    avatar_url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=200&auto=format&fit=crop&q=80',
    member_count: 1,
    created_at: new Date().toISOString(),
  };

  const updated = [...squads, newSquad];
  if (isClient()) {
    try {
      localStorage.setItem(STORAGE_KEYS.SQUADS, JSON.stringify(updated));
    } catch (e) {
      console.error('Error adding squad:', e);
    }
  }

  return newSquad;
}

export function getStoredMessages(squadId?: string): SquadMessage[] {
  if (!isClient()) return squadId ? INITIAL_MESSAGES.filter((m) => m.squad_id === squadId) : INITIAL_MESSAGES;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
      return squadId ? INITIAL_MESSAGES.filter((m) => m.squad_id === squadId) : INITIAL_MESSAGES;
    }
    const allMessages: SquadMessage[] = JSON.parse(data);
    return squadId ? allMessages.filter((m) => m.squad_id === squadId) : allMessages;
  } catch (e) {
    console.error('Error reading messages:', e);
    return squadId ? INITIAL_MESSAGES.filter((m) => m.squad_id === squadId) : INITIAL_MESSAGES;
  }
}

export function sendSquadMessage(squadId: string, messageText: string): SquadMessage {
  const profile = getStoredProfile();
  const newMessage: SquadMessage = {
    id: `msg_${Date.now()}`,
    squad_id: squadId,
    user_id: profile.id,
    user_name: profile.display_name,
    user_avatar: profile.avatar_url,
    message: messageText,
    created_at: new Date().toISOString(),
  };

  if (isClient()) {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
      const allMessages: SquadMessage[] = data ? JSON.parse(data) : INITIAL_MESSAGES;
      allMessages.push(newMessage);
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(allMessages));
    } catch (e) {
      console.error('Error sending squad message:', e);
    }
  }

  return newMessage;
}

export function getPreferences() {
  const defaultPrefs = { 
    unit: 'metric', 
    highAccuracyGps: true, 
    pttKey: 'Space',
    mapNightMode: true,
    gpsFrequency: '1',
    speedTrapAlerts: true,
    overSpeedWarnings: false,
    convoyVoiceAudio: true,
    masterVolume: 80,
  };
  if (!isClient()) return defaultPrefs;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return data ? { ...defaultPrefs, ...JSON.parse(data) } : defaultPrefs;
  } catch (e) {
    return defaultPrefs;
  }
}

export function savePreferences(prefs: any) {
  if (!isClient()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
  } catch (e) {
    console.error('Error saving preferences:', e);
  }
}
