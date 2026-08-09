'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { getStoredProfile, saveProfile, getPreferences, savePreferences, getStoredVehicles, getStoredDrives } from '@/lib/storage';
import { UserProfile, Vehicle, DriveRecord } from '@/lib/mockData';
import { useToastStore } from '@/store/useToastStore';
import {
  User,
  Settings,
  Gauge,
  Navigation,
  Mic,
  Database,
  CheckCircle2,
  Sparkles,
  Camera,
  Shield,
  HelpCircle,
  ExternalLink,
  Car,
  Bell,
  Volume2,
  Download,
  Trophy,
  Moon,
  Zap,
  Activity,
  Users
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>(getStoredProfile());
  const [prefs, setPrefs] = useState(getPreferences());
  const [primaryVehicle, setPrimaryVehicle] = useState<Vehicle | null>(null);
  const [drives, setDrives] = useState<DriveRecord[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  useEffect(() => {
    setTimeout(() => {
      setProfile(getStoredProfile());
      setPrefs(getPreferences());
      const vehicles = getStoredVehicles();
      const primary = vehicles.find(v => v.is_primary) || vehicles[0];
      if (primary) setPrimaryVehicle(primary);
      setDrives(getStoredDrives());
    }, 0);
  }, []);

  // Calculate Driver XP and Stats
  const { totalDistance, totalDrives, topSpeed, xp, level } = useMemo(() => {
    const dist = drives.reduce((sum, d) => sum + d.distance_km, 0);
    const count = drives.length;
    const maxSpeed = Math.max(0, ...drives.map(d => d.top_speed_kmh));
    
    // Simple XP formula: 100 XP per drive + 10 XP per km
    const calcXp = Math.floor(count * 100 + dist * 10);
    const calcLevel = Math.floor(Math.sqrt(calcXp / 100)) + 1;
    
    return {
      totalDistance: Math.floor(dist),
      totalDrives: count,
      topSpeed: Math.floor(maxSpeed),
      xp: calcXp,
      level: calcLevel
    };
  }, [drives]);

  const achievements = useMemo(() => {
    return [
      { id: 'speedmaster', name: 'Speedmaster', description: 'Hit 200+ KM/H on track', icon: Zap, unlocked: topSpeed >= 200 },
      { id: 'nightrider', name: 'Night Rider', description: 'Complete a drive between 10PM and 4AM', icon: Moon, unlocked: drives.some(d => {
        const hour = new Date(d.start_time).getHours();
        return hour >= 22 || hour <= 4;
      }) },
      { id: 'telemetry', name: 'Data Junkie', description: 'Log over 100km total distance', icon: Activity, unlocked: totalDistance > 100 },
      { id: 'convoy', name: 'Convoy Leader', description: 'Complete 3+ squad drives', icon: Users, unlocked: drives.filter(d => d.squad_name).length >= 3 },
    ];
  }, [topSpeed, drives, totalDistance]);

  const handleSaveAll = () => {
    triggerHaptic([20, 30, 20]);
    saveProfile(profile);
    savePreferences(prefs);
    setIsSaved(true);
    addToast('Preferences saved successfully', 'success');
    setTimeout(() => setIsSaved(false), 2000);
  };

  const clearLocalStorageCache = () => {
    triggerHaptic(20);
    if (confirm('Are you sure you want to reset all local telemetry, drives, and preferences?')) {
      localStorage.clear();
      addToast('History cleared', 'warning');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleExportData = () => {
    triggerHaptic(15);
    const data = {
      profile: getStoredProfile(),
      preferences: getPreferences(),
      vehicles: getStoredVehicles(),
      drives: localStorage.getItem('drive_social_drives'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drive_social_export_${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Data exported successfully', 'success');
  };

  return (
    <div className="min-h-full text-white p-4 pb-24 max-w-xl mx-auto space-y-6 pointer-events-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#FF3B30]" /> Settings & Profile
        </h1>
        {isSaved && (
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 animate-pulse">
            <CheckCircle2 className="w-4 h-4" /> Saved!
          </span>
        )}
      </div>

      {/* DRIVER STATS & LEVEL */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profile.avatar_url}
              alt={profile.display_name}
              className="w-16 h-16 rounded-full object-cover border-2 border-[#FF3B30]"
            />
            <button
              onClick={() => {
                triggerHaptic(10);
                const newAvatar = prompt('Enter image URL for avatar:', profile.avatar_url);
                if (newAvatar) setProfile({ ...profile, avatar_url: newAvatar });
              }}
              className="absolute bottom-0 right-0 p-1.5 bg-[#FF3B30] rounded-full text-white shadow-md hover:bg-[#ff5247]"
              title="Change Avatar"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{profile.display_name}</h3>
            <p className="text-xs text-[#FF3B30] font-bold tracking-wider mb-1">LEVEL {level} DRIVER</p>
            <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-[#FF3B30] h-full" 
                style={{ width: `${(xp % 1000) / 10}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-1 text-right">{xp} XP</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/10">
          <div className="text-center">
            <span className="block text-lg font-bold text-white">{totalDrives}</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Runs</span>
          </div>
          <div className="text-center border-x border-white/10">
            <span className="block text-lg font-bold text-white">{totalDistance}<span className="text-[10px] text-gray-500 ml-1">km</span></span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Distance</span>
          </div>
          <div className="text-center">
            <span className="block text-lg font-bold text-white">{topSpeed}<span className="text-[10px] text-gray-500 ml-1">km/h</span></span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Top Speed</span>
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-400" /> Badges & Achievements
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {achievements.map((ach) => {
              const Icon = ach.icon;
              return (
                <div 
                  key={ach.id} 
                  title={`${ach.name}: ${ach.description}`}
                  className={`aspect-square rounded-2xl border flex flex-col items-center justify-center p-2 transition-all ${
                    ach.unlocked 
                      ? 'bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                      : 'bg-black/40 border-white/5 opacity-50 grayscale'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1 ${ach.unlocked ? 'text-amber-400' : 'text-gray-500'}`} />
                  <span className={`text-[8px] font-bold text-center leading-tight ${ach.unlocked ? 'text-amber-400/90' : 'text-gray-500'}`}>
                    {ach.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* PROFILE EDITOR */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl space-y-4">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <User className="w-4 h-4 text-[#FF3B30]" /> Edit Details
        </h2>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Display Name</label>
            <input
              type="text"
              value={profile.display_name}
              onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
              className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-[#FF3B30]"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Handle</label>
            <input
              type="text"
              value={profile.handle}
              onChange={(e) => setProfile({ ...profile, handle: e.target.value })}
              className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-[#FF3B30]"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Driver Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            rows={2}
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FF3B30]"
          />
        </div>
        
        <div className="grid grid-cols-1 gap-3 pt-2">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1 flex items-center gap-1">
              <Shield className="w-3 h-3 text-[#FF3B30]" /> Emergency Contact
            </label>
            <input
              type="text"
              value={profile.emergency_contact || ''}
              onChange={(e) => setProfile({ ...profile, emergency_contact: e.target.value })}
              placeholder="e.g. +1 555-0199 (ICE)"
              className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-[#FF3B30]"
            />
          </div>
          
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1 flex items-center gap-1">
              <Car className="w-3 h-3 text-[#FF3B30]" /> Primary Vehicle Tag
            </label>
            <div className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-3 text-xs text-gray-400 flex items-center">
              {primaryVehicle ? `${primaryVehicle.year} ${primaryVehicle.make} ${primaryVehicle.model}` : 'No vehicle selected'}
            </div>
            <p className="text-[10px] text-gray-500 mt-1">Change this in your Garage.</p>
          </div>
        </div>
      </div>

      {/* APP PREFERENCES */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl space-y-4">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Navigation className="w-4 h-4 text-[#FF3B30]" /> Units & Display
        </h2>

        {/* Units Selector */}
        <div className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">Measurement System</span>
            <span className="text-[10px] text-gray-400">Metric (KM/H) or Imperial (MPH)</span>
          </div>
          <select
            value={prefs.unit}
            onChange={(e) => {
              triggerHaptic(10);
              setPrefs({ ...prefs, unit: e.target.value });
            }}
            className="bg-[#121824] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF3B30]"
          >
            <option value="metric">Metric</option>
            <option value="imperial">Imperial</option>
          </select>
        </div>
        
        {/* Map Night Mode Toggle */}
        <div className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">Auto Night Mode Map</span>
            <span className="text-[10px] text-gray-400">Sync with system theme</span>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              setPrefs({ ...prefs, mapNightMode: !prefs.mapNightMode });
            }}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              prefs.mapNightMode ? 'bg-[#FF3B30]' : 'bg-gray-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                prefs.mapNightMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* High Precision GPS Toggle */}
        <div className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">High Accuracy GPS</span>
            <span className="text-[10px] text-gray-400">Battery intensive tracking</span>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              setPrefs({ ...prefs, highAccuracyGps: !prefs.highAccuracyGps });
            }}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              prefs.highAccuracyGps ? 'bg-[#FF3B30]' : 'bg-gray-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                prefs.highAccuracyGps ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        
        {/* GPS Frequency */}
        <div className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">Update Frequency</span>
            <span className="text-[10px] text-gray-400">Polling rate interval</span>
          </div>
          <select
            value={prefs.gpsFrequency || '1'}
            onChange={(e) => {
              triggerHaptic(10);
              setPrefs({ ...prefs, gpsFrequency: e.target.value });
            }}
            className="bg-[#121824] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF3B30]"
          >
            <option value="1">1 Hz (Normal)</option>
            <option value="5">5 Hz (Fast)</option>
            <option value="10">10 Hz (Track)</option>
          </select>
        </div>
      </div>
      
      {/* AUDIO & ALERTS */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl space-y-4">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#FF3B30]" /> Audio & Alerts
        </h2>
        
        <div className="space-y-2 p-3 bg-black/40 border border-white/5 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Volume2 className="w-3 h-3 text-gray-400" /> Master Volume
            </span>
            <span className="text-xs text-[#FF3B30] font-mono">{prefs.masterVolume || 80}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={prefs.masterVolume || 80}
            onChange={(e) => setPrefs({ ...prefs, masterVolume: parseInt(e.target.value) })}
            className="w-full accent-[#FF3B30]"
          />
        </div>
        
        <div className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">Speed Trap Alerts</span>
            <span className="text-[10px] text-gray-400">Audible warning for cameras</span>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              setPrefs({ ...prefs, speedTrapAlerts: !prefs.speedTrapAlerts });
            }}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              prefs.speedTrapAlerts ? 'bg-[#FF3B30]' : 'bg-gray-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                prefs.speedTrapAlerts ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">Over-Speed Warnings</span>
            <span className="text-[10px] text-gray-400">Ping when exceeding limit</span>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              setPrefs({ ...prefs, overSpeedWarnings: !prefs.overSpeedWarnings });
            }}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              prefs.overSpeedWarnings ? 'bg-[#FF3B30]' : 'bg-gray-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                prefs.overSpeedWarnings ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-black/40 border border-white/5 rounded-xl">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-white">Convoy Voice Audio</span>
            <span className="text-[10px] text-gray-400">Allow incoming squad voice</span>
          </div>
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              setPrefs({ ...prefs, convoyVoiceAudio: !prefs.convoyVoiceAudio });
            }}
            className={`w-12 h-7 rounded-full p-1 transition-colors ${
              prefs.convoyVoiceAudio ? 'bg-[#FF3B30]' : 'bg-gray-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                prefs.convoyVoiceAudio ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* STORAGE & DATABASE DATA */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl space-y-3">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-[#FF3B30]" /> Data Management
        </h2>

        <p className="text-[10px] text-gray-400 leading-relaxed">
          Telemetry coordinates are cached locally in IndexedDB / LocalStorage to prevent data loss in low-reception canyon passes. Export your data before clearing history.
        </p>
        
        <div className="grid grid-cols-2 gap-3 mt-2">
          <button
            onClick={handleExportData}
            className="w-full h-11 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] font-bold text-white transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-3.5 h-3.5" /> Export Data
          </button>
          
          <button
            onClick={clearLocalStorageCache}
            className="w-full h-11 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-[11px] font-bold text-red-400 transition-colors"
          >
            Clear Local History
          </button>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <button
        onClick={handleSaveAll}
        className="w-full h-14 bg-[#FF3B30] hover:bg-[#ff5247] active:scale-[0.98] transition-all rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 shadow-[0_8px_32px_rgba(255,59,48,0.4)]"
      >
        <Sparkles className="w-5 h-5" /> Save All Preferences
      </button>
    </div>
  );
}
