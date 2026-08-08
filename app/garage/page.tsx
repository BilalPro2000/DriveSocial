'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Vehicle, DriveRecord } from '@/lib/mockData';
import { getStoredVehicles, addVehicle, getStoredDrives } from '@/lib/storage';
import {
  Car,
  Wrench,
  Plus,
  Gauge,
  Navigation,
  Timer,
  Download,
  Play,
  CheckCircle,
  X,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Zap
} from 'lucide-react';

// Mod horsepower mapping based on category for simulation
const getModGains = (category: string) => {
  switch (category) {
    case 'Engine': return { hp: 45, tq: 50 };
    case 'Exhaust': return { hp: 12, tq: 15 };
    case 'Intake': return { hp: 8, tq: 10 };
    default: return { hp: 0, tq: 0 };
  }
};

export default function GaragePage() {
  const [activeTab, setActiveTab] = useState<'garage' | 'history' | 'compare'>('garage');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [compareV1, setCompareV1] = useState<Vehicle | null>(null);
  const [compareV2, setCompareV2] = useState<Vehicle | null>(null);
  const [drives, setDrives] = useState<DriveRecord[]>([]);

  // Add Vehicle Modal State
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('2024');
  const [trim, setTrim] = useState('');
  const [engine, setEngine] = useState('');
  const [transmission, setTransmission] = useState('');
  const [modName, setModName] = useState('');
  const [modCategory, setModCategory] = useState('Engine');
  const [modsList, setModsList] = useState<Array<{ name: string; category: string }>>([]);

  // Animated Replay Simulation
  const [replayingDriveId, setReplayingDriveId] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => {
      const loadedVehicles = getStoredVehicles();
      setVehicles(loadedVehicles);
      if (loadedVehicles.length > 0) {
        setSelectedVehicle(loadedVehicles[0]);
        setCompareV1(loadedVehicles[0]);
        if (loadedVehicles.length > 1) {
          setCompareV2(loadedVehicles[1]);
        }
      }
      setDrives(getStoredDrives());
    }, 0);
  }, []);

  const handleAddMod = () => {
    if (!modName.trim()) return;
    setModsList((prev) => [...prev, { name: modName, category: modCategory }]);
    setModName('');
  };

  const handleSaveVehicle = () => {
    if (!make.trim() || !model.trim()) return;
    const updated = addVehicle({
      make,
      model,
      year: parseInt(year) || 2024,
      trim,
      engine,
      transmission,
      photos: [
        'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800&auto=format&fit=crop&q=80',
      ],
      modifications: modsList,
      is_primary: vehicles.length === 0,
    });
    setVehicles(updated);
    setSelectedVehicle(updated[0]);
    setShowAddVehicleModal(false);
    // Reset
    setMake('');
    setModel('');
    setModsList([]);
  };

  const exportGPX = (drive: DriveRecord) => {
    let gpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Drive Social PWA">
  <trk>
    <name>${drive.title}</name>
    <trkseg>
`;

    drive.route_coords?.forEach((coord) => {
      gpxContent += `      <trkpt lon="${coord[0]}" lat="${coord[1]}"></trkpt>\n`;
    });

    gpxContent += `    </trkseg>
  </trk>
</gpx>`;

    const blob = new Blob([gpxContent], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${drive.title.replace(/\s+/g, '_')}.gpx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const calculateTotalPower = (v: Vehicle) => {
    let totalHp = parseInt(v.engine?.match(/(\d+)\s*HP/i)?.[1] || '0') || 0;
    if (totalHp === 0) return 'N/A'; // fallback if no HP in string
    
    let addedHp = 0;
    v.modifications?.forEach((mod) => {
      addedHp += getModGains(mod.category).hp;
    });

    return { base: totalHp, added: addedHp, total: totalHp + addedHp };
  };

  return (
    <div className="min-h-full text-white p-4 pb-24 max-w-xl mx-auto space-y-4 pointer-events-auto">
      {/* Top Selector */}
      <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 backdrop-blur-xl">
        <button
          onClick={() => setActiveTab('garage')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 ${
            activeTab === 'garage'
              ? 'bg-[#FF3B30] text-white shadow-[0_4px_16px_rgba(255,59,48,0.3)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Car className="w-4 h-4" /> Garage
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 ${
            activeTab === 'history'
              ? 'bg-[#FF3B30] text-white shadow-[0_4px_16px_rgba(255,59,48,0.3)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Timer className="w-4 h-4" /> History
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 ${
            activeTab === 'compare'
              ? 'bg-[#FF3B30] text-white shadow-[0_4px_16px_rgba(255,59,48,0.3)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Compare
        </button>
      </div>

      {/* TAB CONTENT */}
      <AnimatePresence mode="wait">
        {/* MY GARAGE TAB */}
        {activeTab === 'garage' && (
          <motion.div
            key="garage"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="space-y-4"
          >
            {/* Swipable Vehicle Pills Header */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {vehicles.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVehicle(v)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${
                  selectedVehicle?.id === v.id
                    ? 'bg-[#FF3B30] border-[#FF3B30] text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                {v.year} {v.make} {v.model}
              </button>
            ))}

            <button
              onClick={() => setShowAddVehicleModal(true)}
              className="px-3 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" /> Add Car
            </button>
          </div>

          {selectedVehicle && (
            <motion.div
              key={selectedVehicle.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Digital Car Card */}
              <div className="w-full rounded-2xl overflow-hidden border border-white/20 shadow-[0_0_30px_rgba(255,255,255,0.05)] relative group bg-gradient-to-br from-gray-900 to-black">
                <div className="h-56 relative overflow-hidden">
                  <img
                    src={selectedVehicle.photos[0] || 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800'}
                    alt={selectedVehicle.model}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white border border-white/20 uppercase tracking-widest">
                        {selectedVehicle.trim || 'Standard Trim'}
                      </span>
                      {selectedVehicle.is_primary && (
                        <span className="bg-[#FF3B30] px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-md flex items-center gap-1 uppercase tracking-widest">
                          <CheckCircle className="w-3 h-3" /> Primary
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5 relative">
                  <div className="absolute top-0 right-5 -translate-y-1/2 w-14 h-14 bg-black border-4 border-gray-900 rounded-full flex items-center justify-center">
                    <Car className="w-6 h-6 text-gray-500" />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight leading-none mb-1">
                    {selectedVehicle.year} {selectedVehicle.make}
                  </h2>
                  <h3 className="text-xl font-bold text-[#FF3B30] tracking-tighter mb-4">
                    {selectedVehicle.model}
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Engine</span>
                      <span className="text-xs font-semibold text-white">{selectedVehicle.engine || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-0.5">Transmission</span>
                      <span className="text-xs font-semibold text-white">{selectedVehicle.transmission || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Power Gains Section */}
              {(() => {
                const power = calculateTotalPower(selectedVehicle);
                if (power === 'N/A') return null;
                return (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                        <Zap className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Estimated Power</span>
                        <div className="text-[10px] text-gray-400 font-semibold">
                          Base: {power.base} HP {power.added > 0 && <span className="text-emerald-400">+{power.added} HP (Mods)</span>}
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl font-black text-white">
                      {power.total} <span className="text-sm text-gray-500">HP</span>
                    </div>
                  </div>
                );
              })()}

              {/* Categorized Modifications List */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-white/10">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-[#FF3B30]" /> Custom Modifications ({selectedVehicle.modifications?.length || 0})
                  </h3>
                </div>

                {(!selectedVehicle.modifications || selectedVehicle.modifications.length === 0) ? (
                  <p className="text-xs text-gray-500 py-2">Stock vehicle. No modifications added yet.</p>
                ) : (
                  <div className="space-y-2">
                    {selectedVehicle.modifications.map((mod, i) => {
                      const gains = getModGains(mod.category);
                      return (
                        <div key={i} className="flex justify-between items-center p-3 bg-black/40 border border-white/5 rounded-xl">
                          <div>
                            <span className="text-xs font-bold text-white block">{mod.name}</span>
                            <span className="text-[10px] text-gray-400 font-semibold uppercase">{mod.category}</span>
                          </div>
                          {gains.hp > 0 && (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20">
                              +{gains.hp} HP
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* DRIVE HISTORY TAB */}
      {activeTab === 'history' && (
        <motion.div
          key="history"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="space-y-4"
        >
          {drives.map((drive) => {
            const isReplaying = replayingDriveId === drive.id;
            return (
              <div key={drive.id} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-white">{drive.title}</h3>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase">
                      {new Date(drive.start_time).toLocaleDateString()} • {new Date(drive.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <button
                    onClick={() => exportGPX(drive)}
                    className="p-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs text-white flex items-center gap-1 transition-colors"
                    title="Export GPX File"
                  >
                    <Download className="w-3.5 h-3.5" /> <span className="text-[10px] font-bold">GPX</span>
                  </button>
                </div>

                {/* Animated Color-Coded Map Replay Visualizer */}
                <div className="w-full h-32 bg-[#080B12] rounded-xl border border-white/10 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] opacity-30" />
                  
                  {/* Simulate color-coded speeds: Green (slow), Yellow (med), Red (fast) */}
                  <svg className={`w-full h-full p-4 fill-none stroke-[4] ${isReplaying ? 'animate-pulse' : ''}`} viewBox="0 0 100 50">
                    <defs>
                      <linearGradient id={`grad-${drive.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="50%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#ef4444" />
                      </linearGradient>
                    </defs>
                    <path d="M 10 40 Q 30 10 50 30 T 90 20" stroke={`url(#grad-${drive.id})`} strokeLinecap="round" />
                  </svg>
                  
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Cruising"></span>
                    <span className="w-2 h-2 rounded-full bg-amber-500" title="Accelerating"></span>
                    <span className="w-2 h-2 rounded-full bg-red-500" title="Peak Speed"></span>
                  </div>

                  <button
                    onClick={() => setReplayingDriveId(isReplaying ? null : drive.id)}
                    className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-[10px] font-bold text-white flex items-center gap-1.5 hover:bg-black transition-colors"
                  >
                    {isReplaying ? <X className="w-3 h-3 text-white" /> : <Play className="w-3 h-3 text-[#FF3B30] fill-[#FF3B30]" />}
                    {isReplaying ? 'Stop Replay' : 'Replay Route'}
                  </button>
                </div>

                {/* Telemetry Stats */}
                <div className="grid grid-cols-4 gap-2 bg-black/40 border border-white/5 rounded-xl p-2.5">
                  <div className="text-center">
                    <span className="text-[9px] text-gray-500 font-bold uppercase block">Top</span>
                    <span className="text-xs font-bold text-white">{drive.top_speed_kmh} <span className="text-[8px] text-gray-500">KM/H</span></span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] text-gray-500 font-bold uppercase block">Avg</span>
                    <span className="text-xs font-bold text-white">{drive.avg_speed_kmh} <span className="text-[8px] text-gray-500">KM/H</span></span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] text-gray-500 font-bold uppercase block">Dist</span>
                    <span className="text-xs font-bold text-white">{drive.distance_km} <span className="text-[8px] text-gray-500">KM</span></span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] text-gray-500 font-bold uppercase block">Time</span>
                    <span className="text-xs font-bold text-white">{Math.floor(drive.duration_seconds / 60)}m</span>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* COMPARE TAB */}
      {activeTab === 'compare' && (
        <motion.div
          key="compare"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="space-y-4"
        >
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FF3B30]" /> Vehicle Comparison
            </h3>
            
            {vehicles.length < 2 ? (
              <div className="text-center py-8">
                <Car className="w-8 h-8 mx-auto text-gray-500 mb-2 opacity-50" />
                <p className="text-xs text-gray-400">Add at least two vehicles to your garage to compare.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Vehicle 1</label>
                    <select
                      value={compareV1?.id || ''}
                      onChange={(e) => setCompareV1(vehicles.find(v => v.id === e.target.value) || null)}
                      className="w-full bg-[#121824] border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-[#FF3B30]"
                    >
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.make} {v.model}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Vehicle 2</label>
                    <select
                      value={compareV2?.id || ''}
                      onChange={(e) => setCompareV2(vehicles.find(v => v.id === e.target.value) || null)}
                      className="w-full bg-[#121824] border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-[#FF3B30]"
                    >
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.make} {v.model}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {compareV1 && compareV2 && (
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                    {/* Photos */}
                    <div className="h-24 rounded-xl overflow-hidden border border-white/10 relative">
                      <img src={compareV1.photos[0]} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                        <span className="text-xs font-bold text-white leading-tight">{compareV1.make}<br/>{compareV1.model}</span>
                      </div>
                    </div>
                    <div className="h-24 rounded-xl overflow-hidden border border-white/10 relative">
                      <img src={compareV2.photos[0]} className="w-full h-full object-cover" alt="" />
                      <div className="absolute inset-0 bg-black/40 flex items-end p-2">
                        <span className="text-xs font-bold text-white leading-tight">{compareV2.make}<br/>{compareV2.model}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    {(() => {
                      const p1 = calculateTotalPower(compareV1);
                      const p2 = calculateTotalPower(compareV2);
                      const hp1 = p1 !== 'N/A' ? p1.total : 0;
                      const hp2 = p2 !== 'N/A' ? p2.total : 0;

                      return (
                        <>
                          <div className={`p-3 rounded-xl border ${hp1 > hp2 ? 'bg-[#FF3B30]/10 border-[#FF3B30]/30' : 'bg-black/40 border-white/5'}`}>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Total HP</span>
                            <span className={`text-xl font-black ${hp1 > hp2 ? 'text-[#FF3B30]' : 'text-white'}`}>{hp1 || 'N/A'}</span>
                          </div>
                          <div className={`p-3 rounded-xl border ${hp2 > hp1 ? 'bg-[#FF3B30]/10 border-[#FF3B30]/30' : 'bg-black/40 border-white/5'}`}>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Total HP</span>
                            <span className={`text-xl font-black ${hp2 > hp1 ? 'text-[#FF3B30]' : 'text-white'}`}>{hp2 || 'N/A'}</span>
                          </div>

                          <div className={`p-3 rounded-xl border ${(compareV1.modifications?.length || 0) > (compareV2.modifications?.length || 0) ? 'bg-[#FF3B30]/10 border-[#FF3B30]/30' : 'bg-black/40 border-white/5'}`}>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Mods</span>
                            <span className="text-lg font-bold text-white">{compareV1.modifications?.length || 0}</span>
                          </div>
                          <div className={`p-3 rounded-xl border ${(compareV2.modifications?.length || 0) > (compareV1.modifications?.length || 0) ? 'bg-[#FF3B30]/10 border-[#FF3B30]/30' : 'bg-black/40 border-white/5'}`}>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Mods</span>
                            <span className="text-lg font-bold text-white">{compareV2.modifications?.length || 0}</span>
                          </div>

                          <div className="col-span-2 p-3 bg-black/40 border border-white/5 rounded-xl">
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-2 text-center">Engine Matchup</span>
                            <div className="flex justify-between items-center text-xs">
                              <span className="w-2/5 text-right font-semibold text-gray-300 line-clamp-2">{compareV1.engine || 'N/A'}</span>
                              <span className="w-1/5 text-center text-[#FF3B30] font-black">VS</span>
                              <span className="w-2/5 text-left font-semibold text-gray-300 line-clamp-2">{compareV2.engine || 'N/A'}</span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* ADD VEHICLE MODAL */}
      {showAddVehicleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0B0F17] border border-white/10 rounded-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="text-base font-bold text-white">Add Vehicle to Garage</h3>
              <button onClick={() => setShowAddVehicleModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Make</label>
                <input
                  type="text"
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  placeholder="Porsche"
                  className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-[#FF3B30]"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Model</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="911 GT3 RS"
                  className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-[#FF3B30]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-[#FF3B30]"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Trim</label>
                <input
                  type="text"
                  value={trim}
                  onChange={(e) => setTrim(e.target.value)}
                  placeholder="Weissach Package"
                  className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-[#FF3B30]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Engine</label>
                <input
                  type="text"
                  value={engine}
                  onChange={(e) => setEngine(e.target.value)}
                  placeholder="4.0L Flat-6 NA (518 HP)"
                  className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-[#FF3B30]"
                />
              </div>
              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Transmission</label>
                <input
                  type="text"
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  placeholder="7-Speed PDK"
                  className="w-full h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-[#FF3B30]"
                />
              </div>
            </div>

            {/* Custom Mod Adding */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <label className="text-[10px] text-gray-400 font-bold uppercase block">Add Modification</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={modName}
                  onChange={(e) => setModName(e.target.value)}
                  placeholder="e.g. Akrapovic Exhaust"
                  className="flex-1 h-10 bg-white/5 border border-white/10 rounded-xl px-3 text-xs text-white focus:outline-none focus:border-[#FF3B30]"
                />
                <select
                  value={modCategory}
                  onChange={(e) => setModCategory(e.target.value)}
                  className="bg-[#121824] border border-white/10 rounded-xl px-2 text-xs text-white font-semibold"
                >
                  <option value="Engine">Engine</option>
                  <option value="Exhaust">Exhaust</option>
                  <option value="Intake">Intake</option>
                  <option value="Suspension">Suspension</option>
                  <option value="Wheels">Wheels</option>
                  <option value="Visuals">Visuals</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddMod}
                  className="px-3 h-10 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white transition-colors"
                >
                  Add
                </button>
              </div>

              {modsList.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {modsList.map((m, idx) => (
                    <span key={idx} className="text-[10px] bg-white/10 text-gray-200 px-2 py-1.5 rounded-md border border-white/10 font-semibold flex items-center gap-1">
                      {m.name} <span className="opacity-50">({m.category})</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={() => setShowAddVehicleModal(false)}
                className="flex-1 h-12 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVehicle}
                className="flex-1 h-12 bg-[#FF3B30] hover:bg-[#ff5247] rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 shadow-[0_4px_20px_rgba(255,59,48,0.4)] transition-all"
              >
                <Sparkles className="w-4 h-4" /> Save Vehicle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
