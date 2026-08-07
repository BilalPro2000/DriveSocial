'use client';

import { useState, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { useDriveStore } from '@/store/useDriveStore';
import { addDriveRecord, getStoredSquads } from '@/lib/storage';
import { Trophy, Gauge, Timer, Navigation, CheckCircle2, Share2, Sparkles, X, Activity, Mountain } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { triggerHaptic } from '@/lib/haptics';

interface PostDriveSummaryModalProps {
  onClose: () => void;
}

export function PostDriveSummaryModal({ onClose }: PostDriveSummaryModalProps) {
  const telemetry = useDriveStore((state) => state.telemetry);
  const finishDrive = useDriveStore((state) => state.finishDrive);

  const [title, setTitle] = useState('Weekend Canyon Attack');
  const squads = getStoredSquads();
  const [selectedSquad, setSelectedSquad] = useState<string>(squads[0]?.name || '');
  const [isPublic, setIsPublic] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const durationMin = Math.floor(telemetry.durationSeconds / 60);
  const durationSec = telemetry.durationSeconds % 60;

  // Mock chart data for speed over time based on duration
  const chartData = useMemo(() => {
    const data = [];
    const points = Math.max(10, Math.min(30, Math.floor(telemetry.durationSeconds / 2)));
    let currentSpeed = 0;
    for (let i = 0; i <= points; i++) {
      // Simulate realistic speed curve hitting near max speed in middle
      const progress = i / points;
      const baseSpeed = Math.sin(progress * Math.PI) * telemetry.topSpeedKmh;
      const pseudoNoise = Math.sin(i * 1.5) * 7.5;
      currentSpeed = Math.max(0, Math.min(telemetry.topSpeedKmh, baseSpeed + pseudoNoise));
      if (i === 0 || i === points) currentSpeed = 0; // start and end at 0
      data.push({
        time: `${Math.floor((i / points) * durationMin)}m`,
        speed: Math.round(currentSpeed)
      });
    }
    return data;
  }, [telemetry.topSpeedKmh, telemetry.durationSeconds, durationMin]);

  // Simulated extra stats
  const elevationDelta = Math.round(telemetry.distanceKm * 15); // mock elevation
  const hardEvents = useMemo(() => {
    return telemetry.topSpeedKmh > 100 ? Math.floor((telemetry.topSpeedKmh % 5) + 2) : 0;
  }, [telemetry.topSpeedKmh]);

  const handleSave = () => {
    triggerHaptic([20, 40, 20]);
    addDriveRecord({
      title: title || 'Untitled Drive',
      squad_name: selectedSquad || undefined,
      start_time: new Date(Date.now() - telemetry.durationSeconds * 1000).toISOString(),
      top_speed_kmh: Math.round(telemetry.topSpeedKmh),
      avg_speed_kmh: Math.round(telemetry.avgSpeedKmh),
      distance_km: Number(telemetry.distanceKm.toFixed(2)),
      duration_seconds: telemetry.durationSeconds,
      route_coords: telemetry.routeCoords,
      is_public: isPublic,
      likes_count: 0,
      comments_count: 0,
    });

    setIsSaved(true);
    setTimeout(() => {
      finishDrive();
      onClose();
    }, 1500);
  };
  
  const handleShare = () => {
    triggerHaptic(15);
    alert('Drive Card shared to Clipboard/Socials! (Web Share API fallback)');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="w-full max-w-lg bg-[#0B0F17] border border-white/10 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl flex flex-col gap-5 max-h-[95vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-[#FF3B30]">
            <Trophy className="w-6 h-6" />
            <h2 className="text-xl font-bold tracking-tight text-white">Drive Summary</h2>
          </div>
          <button
            onClick={() => {
              triggerHaptic(10);
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSaved ? (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
            <CheckCircle2 className="w-20 h-20 text-[#FF3B30] animate-bounce" />
            <div>
              <h3 className="text-2xl font-bold text-white">Drive Saved to Feed & History!</h3>
              <p className="text-sm text-gray-400 mt-1">Stored safely in your local telemetry database.</p>
            </div>
            
            <button
              onClick={handleShare}
              className="mt-6 h-12 px-6 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Share2 className="w-4 h-4" /> Share Drive Card
            </button>
          </div>
        ) : (
          <div ref={cardRef} className="space-y-5">
            {/* Quick Stat Highlights */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-3 grid grid-cols-4 gap-3 bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-[#FF3B30]" /> Peak
                  </span>
                  <span className="text-xl font-bold text-white">{Math.round(telemetry.topSpeedKmh)}</span>
                  <span className="text-[9px] text-gray-500">KM/H</span>
                </div>

                <div className="flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Gauge className="w-3 h-3 text-amber-500" /> Avg
                  </span>
                  <span className="text-xl font-bold text-white">{Math.round(telemetry.avgSpeedKmh)}</span>
                  <span className="text-[9px] text-gray-500">KM/H</span>
                </div>

                <div className="flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-blue-500" /> Dist
                  </span>
                  <span className="text-xl font-bold text-white">{telemetry.distanceKm.toFixed(1)}</span>
                  <span className="text-[9px] text-gray-500">KM</span>
                </div>

                <div className="flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Timer className="w-3 h-3 text-emerald-500" /> Time
                  </span>
                  <span className="text-xl font-bold text-white">{durationMin}m</span>
                  <span className="text-[9px] text-gray-500">{durationSec}s</span>
                </div>
              </div>
              
              <div className="col-span-3 grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Mountain className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Elevation Delta</span>
                    <span className="text-base font-bold text-white">+{elevationDelta} m</span>
                  </div>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">G-Force Events</span>
                    <span className="text-base font-bold text-white">{hardEvents} <span className="text-[10px] text-gray-500">Hard Accel/Brake</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Speed vs Time Telemetry Chart */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#FF3B30]" /> Speed Telemetry
              </h3>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="speedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#FF3B30" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#4B5563" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#121824', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#FF3B30', fontWeight: 'bold' }}
                      labelStyle={{ color: '#9CA3AF', fontSize: '10px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="speed" 
                      stroke="#FF3B30" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#speedGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Title Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Drive Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your drive a legendary title..."
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FF3B30] text-sm"
              />
            </div>

            {/* Squad Tagging & Privacy */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Tag Squad</label>
                <select
                  value={selectedSquad}
                  onChange={(e) => setSelectedSquad(e.target.value)}
                  className="w-full h-12 bg-[#121824] border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-[#FF3B30] text-[11px]"
                >
                  <option value="">None (Solo)</option>
                  {squads.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Visibility</label>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setIsPublic(!isPublic);
                  }}
                  className={`w-full h-12 rounded-xl text-[11px] font-bold tracking-wider transition-colors border ${
                    isPublic 
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' 
                      : 'bg-white/5 text-gray-400 border-white/10'
                  }`}
                >
                  {isPublic ? '🌐 PUBLIC FEED' : '🔒 PRIVATE'}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-3">
              <button
                onClick={() => {
                  triggerHaptic(10);
                  onClose();
                }}
                className="flex-1 h-14 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-semibold text-gray-300 border border-white/10"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                className="flex-1 h-14 bg-[#FF3B30] hover:bg-[#ff5247] active:scale-[0.98] rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(255,59,48,0.4)]"
              >
                <Sparkles className="w-4 h-4" /> Save Drive
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
