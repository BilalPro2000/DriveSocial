import { createClient } from '@supabase/supabase-js';
import * as localStorageLib from './storage';
import { UserProfile, Vehicle, DriveRecord, Squad, SquadMessage } from './mockData';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a single supabase client for interacting with your database
export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null as any;

/**
 * Checks if the app is currently running in local mock mode.
 * Set NEXT_PUBLIC_USE_MOCK_DATA="false" in environment variables to switch to live Supabase queries.
 */
export function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false' || !supabaseUrl || !supabaseKey;
}

// Authentication Check Helper
async function checkAuth() {
  if (isMockMode()) return true;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Unauthorized');
  return true;
}

// ==========================================
// UNIFIED DATA API (AUTOMATIC SWITCHING)
// ==========================================

export async function fetchProfileApi(): Promise<UserProfile> {
  if (isMockMode()) {
    return localStorageLib.getStoredProfile();
  }
  try {
    const { data, error } = await supabase.from('profiles').select('*').limit(1).single();
    if (error || !data) return localStorageLib.getStoredProfile();
    return data as UserProfile;
  } catch {
    return localStorageLib.getStoredProfile();
  }
}

export async function saveProfileApi(profile: UserProfile): Promise<void> {
  localStorageLib.saveProfile(profile);
  if (!isMockMode()) {
    try {
      await supabase.from('profiles').upsert([profile]);
    } catch (e) {
      console.error('Supabase saveProfile error:', e);
    }
  }
}

export async function fetchVehiclesApi(): Promise<Vehicle[]> {
  if (isMockMode()) {
    return localStorageLib.getStoredVehicles();
  }
  try {
    const { data, error } = await supabase.from('vehicles').select('*');
    if (error || !data || data.length === 0) return localStorageLib.getStoredVehicles();
    return data as Vehicle[];
  } catch {
    return localStorageLib.getStoredVehicles();
  }
}

export async function saveVehicleApi(vehicle: Omit<Vehicle, 'id' | 'user_id'>): Promise<Vehicle> {
  const localVehicles = localStorageLib.addVehicle(vehicle);
  const newVehicle = localVehicles[0]; // addVehicle adds to the front

  if (!isMockMode()) {
    try {
      const { data } = await supabase.from('vehicles').insert([newVehicle]).select().single();
      if (data) return data as Vehicle;
    } catch (e) {
      console.error('Supabase saveVehicle error:', e);
    }
  }
  return newVehicle;
}

export async function fetchDrivesApi(): Promise<DriveRecord[]> {
  if (isMockMode()) {
    return localStorageLib.getStoredDrives();
  }
  try {
    const { data, error } = await supabase.from('drives').select('*').order('date', { ascending: false });
    if (error || !data || data.length === 0) return localStorageLib.getStoredDrives();
    return data as DriveRecord[];
  } catch {
    return localStorageLib.getStoredDrives();
  }
}

export async function saveDriveApi(drive: Omit<DriveRecord, 'id' | 'created_at'>): Promise<DriveRecord> {
  const localVal = localStorageLib.addDriveRecord(drive);
  if (!isMockMode()) {
    try {
      const { data } = await supabase.from('drives').insert([drive]).select().single();
      if (data) return data as DriveRecord;
    } catch (e) {
      console.error('Supabase saveDrive error:', e);
    }
  }
  return localVal;
}

export async function fetchSquadsApi(): Promise<Squad[]> {
  if (isMockMode()) {
    return localStorageLib.getStoredSquads();
  }
  try {
    const { data, error } = await supabase.from('squads').select('*');
    if (error || !data || data.length === 0) return localStorageLib.getStoredSquads();
    return data as Squad[];
  } catch {
    return localStorageLib.getStoredSquads();
  }
}

export async function fetchConvoyMessagesApi(squadId?: string): Promise<SquadMessage[]> {
  if (isMockMode()) {
    return localStorageLib.getStoredMessages(squadId);
  }
  try {
    let query = supabase.from('convoy_messages').select('*').order('timestamp', { ascending: true });
    if (squadId) query = query.eq('squad_id', squadId);
    const { data, error } = await query;
    if (error || !data) return localStorageLib.getStoredMessages(squadId);
    return data as SquadMessage[];
  } catch {
    return localStorageLib.getStoredMessages(squadId);
  }
}

