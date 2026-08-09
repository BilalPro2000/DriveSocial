'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DriveRecord } from '@/lib/mockData';
import { getStoredDrives, toggleLikeDrive } from '@/lib/storage';
import {
  Heart,
  MessageSquare,
  Share2,
  Trophy,
  Gauge,
  Navigation,
  Timer,
  Car,
  Flame,
  Award,
  Users,
  Globe,
  Send,
  X
} from 'lucide-react';

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState<'feed' | 'leaderboards'>('feed');
  const [isLoading, setIsLoading] = useState(false);
  const [drives, setDrives] = useState<DriveRecord[]>([]);

  const handleTabChange = (tab: 'feed' | 'leaderboards') => {
    if (tab === activeTab) return;
    setIsLoading(true);
    setActiveTab(tab);
    setTimeout(() => {
      setIsLoading(false);
    }, 400); // simulate network/db load
  };
  const [feedFilter, setFeedFilter] = useState<'all' | 'longest' | 'fastest' | 'convoy'>('all');
  const [selectedDriveForComments, setSelectedDriveForComments] = useState<DriveRecord | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [commentsMap, setCommentsMap] = useState<Record<string, Array<{ id: string; user: string; avatar: string; text: string; time: string }>>>({
    drive_101: [
      { id: 'c1', user: 'Marcus Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', text: 'Insane top speed on Stunt Road! 🔥', time: '2h ago' },
      { id: 'c2', user: 'Alex Vance', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', text: 'Clean lines on those apexes.', time: '1h ago' }
    ]
  });

  // Leaderboard filters
  const [lbScope, setLbScope] = useState<'world' | 'friends'>('world');
  const [lbMetric, setLbMetric] = useState<'top_speed' | 'distance' | 'duration'>('top_speed');

  useEffect(() => {
    setTimeout(() => {
      setDrives(getStoredDrives());
    }, 0);
  }, []);

  const handleToggleLike = (driveId: string) => {
    const updated = toggleLikeDrive(driveId);
    setDrives(updated);
  };

  const handleAddComment = () => {
    if (!commentInput.trim() || !selectedDriveForComments) return;
    const driveId = selectedDriveForComments.id;
    const newC = {
      id: `c_${Date.now()}`,
      user: 'You (Alex Vance)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      text: commentInput,
      time: 'Just now'
    };

    setCommentsMap(prev => ({
      ...prev,
      [driveId]: [...(prev[driveId] || []), newC]
    }));

    // Update comment count on drives list
    setDrives(prev =>
      prev.map(d => (d.id === driveId ? { ...d, comments_count: d.comments_count + 1 } : d))
    );

    setCommentInput('');
  };

  // Compute feed display
  const filteredFeed = [...drives].filter((d) => {
    if (feedFilter === 'convoy') return !!d.squad_name;
    return true;
  }).sort((a, b) => {
    if (feedFilter === 'longest') return b.distance_km - a.distance_km;
    if (feedFilter === 'fastest') return b.top_speed_kmh - a.top_speed_kmh;
    // Default 'all' - sort by date
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Compute leaderboards from drives
  const sortedLeaderboards = [...drives].sort((a, b) => {
    if (lbMetric === 'top_speed') return b.top_speed_kmh - a.top_speed_kmh;
    if (lbMetric === 'distance') return b.distance_km - a.distance_km;
    return b.duration_seconds - a.duration_seconds;
  });

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="min-h-full text-white p-4 pb-24 max-w-xl mx-auto pointer-events-auto">
      {/* Top Tab Selector */}
      <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1 mb-6 backdrop-blur-xl">
        <button
          onClick={() => handleTabChange('feed')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'feed'
              ? 'bg-[#FF3B30] text-white shadow-[0_4px_16px_rgba(255,59,48,0.3)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Flame className="w-4 h-4" /> Activity Feed
        </button>
        <button
          onClick={() => handleTabChange('leaderboards')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'leaderboards'
              ? 'bg-[#FF3B30] text-white shadow-[0_4px_16px_rgba(255,59,48,0.3)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4" /> Leaderboards
        </button>
      </div>

      {/* SKELETON LOADER */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-white/10 rounded w-1/3" />
                  <div className="h-2 bg-white/10 rounded w-1/4" />
                </div>
              </div>
              <div className="h-4 bg-white/10 rounded w-2/3" />
              <div className="w-full h-32 bg-white/5 rounded-xl" />
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(j => <div key={j} className="h-12 bg-white/10 rounded-xl" />)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {/* FEED TAB */}
          {activeTab === 'feed' && (
            <motion.div
              key="feed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="space-y-4"
            >
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {[
              { id: 'all', label: 'All Runs' },
              { id: 'longest', label: 'Longest' },
              { id: 'fastest', label: 'Highest Speed' },
              { id: 'convoy', label: 'Convoys' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFeedFilter(f.id as any)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  feedFilter === f.id
                    ? 'bg-[#FF3B30]/20 text-[#FF3B30] border-[#FF3B30]/50'
                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filteredFeed.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Car className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No drives found matching criteria.</p>
            </div>
          ) : (
            filteredFeed.map((drive) => (
              <motion.div
                key={drive.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4 backdrop-blur-xl hover:border-white/20 transition-all"
              >
                {/* User Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={drive.user_avatar}
                      alt={drive.user_name}
                      className="w-10 h-10 rounded-full object-cover border border-white/20"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{drive.user_name}</span>
                        <span className="text-xs text-gray-400">{drive.user_handle}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        {drive.vehicle_info && (
                          <span className="text-[#FF3B30] font-medium flex items-center gap-1">
                            <Car className="w-3 h-3" /> {drive.vehicle_info}
                          </span>
                        )}
                        {drive.squad_name && (
                          <>
                            <span>•</span>
                            <span className="text-amber-400 font-medium">{drive.squad_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-500">
                    {new Date(drive.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Drive Title */}
                <h3 className="text-base font-bold text-white tracking-wide">{drive.title}</h3>

                {/* Route Visualizer Simulation */}
                <div className="w-full h-32 bg-[#080B12] rounded-xl border border-white/10 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px] opacity-30" />
                  {/* Decorative Simulated SVG Route Line */}
                  <svg className="w-full h-full p-4 stroke-[#FF3B30] fill-none stroke-[3]" viewBox="0 0 100 50">
                    <path d="M 10 40 Q 30 10 50 30 T 90 20" strokeLinecap="round" />
                  </svg>
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-[10px] text-gray-300 px-2 py-0.5 rounded-md border border-white/10 flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-[#FF3B30]" /> {drive.route_coords?.length || 0} GPS Pings
                  </div>
                </div>

                {/* Telemetry Grid */}
                <div className="grid grid-cols-4 gap-2 bg-black/40 border border-white/5 rounded-xl p-3">
                  <div className="text-center">
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Top Speed</span>
                    <span className="text-sm font-bold text-white">{drive.top_speed_kmh} <span className="text-[9px] text-gray-500">KM/H</span></span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Avg Speed</span>
                    <span className="text-sm font-bold text-white">{drive.avg_speed_kmh} <span className="text-[9px] text-gray-500">KM/H</span></span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Distance</span>
                    <span className="text-sm font-bold text-white">{drive.distance_km} <span className="text-[9px] text-gray-500">KM</span></span>
                  </div>
                  <div className="text-center">
                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Time</span>
                    <span className="text-sm font-bold text-white">{formatDuration(drive.duration_seconds)}</span>
                  </div>
                </div>

                {/* Engagement Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-gray-400">
                  <button
                    onClick={() => handleToggleLike(drive.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                      drive.is_liked
                        ? 'bg-[#FF3B30]/10 border-[#FF3B30]/30 text-[#FF3B30]'
                        : 'bg-white/5 border-white/5 hover:bg-white/10 text-gray-400'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${drive.is_liked ? 'fill-[#FF3B30]' : ''}`} />
                    <span className="font-semibold">{drive.likes_count}</span>
                  </button>

                  <button
                    onClick={() => setSelectedDriveForComments(drive)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-gray-400 transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-semibold">{drive.comments_count}</span>
                  </button>

                  <button
                    onClick={() => alert(`Drive link copied: https://drivesocial.app/drive/${drive.id}`)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 text-gray-400 transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {/* LEADERBOARDS TAB */}
      {activeTab === 'leaderboards' && (
        <motion.div
          key="leaderboards"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="space-y-4"
        >
          {/* Scope Selector */}
          <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl p-2">
            <div className="flex gap-1">
              <button
                onClick={() => setLbScope('world')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                  lbScope === 'world' ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" /> World
              </button>
              <button
                onClick={() => setLbScope('friends')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
                  lbScope === 'friends' ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Friends
              </button>
            </div>

            {/* Metric Selector */}
            <select
              value={lbMetric}
              onChange={(e) => setLbMetric(e.target.value as any)}
              className="bg-[#121824] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF3B30]"
            >
              <option value="top_speed">⚡ Top Speed</option>
              <option value="distance">🛣️ Total Distance</option>
              <option value="duration">⏱️ Longest Drive</option>
            </select>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl divide-y divide-white/5">
            {sortedLeaderboards.map((drive, idx) => {
              const rank = idx + 1;
              let badgeColor = 'text-gray-400';
              if (rank === 1) badgeColor = 'text-amber-400';
              if (rank === 2) badgeColor = 'text-slate-300';
              if (rank === 3) badgeColor = 'text-amber-700';

              return (
                <div key={drive.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 text-center text-base font-black ${badgeColor}`}>
                      {rank <= 3 ? <Award className={`w-5 h-5 mx-auto ${badgeColor}`} /> : `#${rank}`}
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={drive.user_avatar}
                      alt={drive.user_name}
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />
                    <div>
                      <div className="text-sm font-bold text-white">{drive.user_name}</div>
                      <div className="text-[11px] text-gray-400">{drive.vehicle_info || drive.title}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-bold text-[#FF3B30]">
                      {lbMetric === 'top_speed' && `${drive.top_speed_kmh} KM/H`}
                      {lbMetric === 'distance' && `${drive.distance_km} KM`}
                      {lbMetric === 'duration' && formatDuration(drive.duration_seconds)}
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase font-semibold">
                      {lbMetric.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
      </AnimatePresence>
      )}

      {/* COMMENTS DRAWER MODAL */}
      <AnimatePresence>
        {selectedDriveForComments && (
          <div 
            onClick={() => setSelectedDriveForComments(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end justify-center cursor-pointer"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 200, opacity: 0 }}
              className="w-full max-w-xl bg-[#0B0F17] border-t border-white/10 rounded-t-3xl p-6 h-[70vh] flex flex-col justify-between cursor-default"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-[#FF3B30]" /> Comments ({commentsMap[selectedDriveForComments.id]?.length || 0})
                  </h3>
                  <button
                    onClick={() => setSelectedDriveForComments(null)}
                    className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 py-4 overflow-y-auto max-h-[45vh]">
                  {(commentsMap[selectedDriveForComments.id] || []).length === 0 ? (
                    <p className="text-center text-xs text-gray-500 py-8">No comments yet. Be the first!</p>
                  ) : (
                    (commentsMap[selectedDriveForComments.id] || []).map((c) => (
                      <div key={c.id} className="flex gap-3 items-start">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={c.avatar} alt={c.user} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-white">{c.user}</span>
                            <span className="text-[10px] text-gray-500">{c.time}</span>
                          </div>
                          <p className="text-xs text-gray-300">{c.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Comment Input */}
              <div className="flex gap-2 pt-2 border-t border-white/10">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#FF3B30]"
                />
                <button
                  onClick={handleAddComment}
                  className="w-12 h-12 bg-[#FF3B30] hover:bg-[#ff5247] rounded-xl flex items-center justify-center text-white"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
