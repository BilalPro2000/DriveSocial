'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  getStoredSquads,
  addSquad,
  getStoredMessages,
  sendSquadMessage,
  getStoredProfile
} from '@/lib/storage';
import { Squad, SquadMessage } from '@/lib/mockData';
import {
  Users,
  Plus,
  Radio,
  Mic,
  MicOff,
  AlertTriangle,
  Fuel,
  Send,
  Sparkles,
  MapPin,
  Volume2,
  X,
  Play,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

export default function ConvoysPage() {
  const [squads, setSquads] = useState<Squad[]>([]);
  const [selectedSquad, setSelectedSquad] = useState<Squad | null>(null);
  const [messages, setMessages] = useState<SquadMessage[]>([]);
  const [chatInput, setChatInput] = useState('');

  // Active Convoy Simulation State
  const [isConvoyActive, setIsConvoyActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPTTActive, setIsPTTActive] = useState(false);
  const [activePing, setActivePing] = useState<{ type: string; user: string; time: string } | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSquadName, setNewSquadName] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      const loadedSquads = getStoredSquads();
      setSquads(loadedSquads);
      if (loadedSquads.length > 0) {
        setSelectedSquad(loadedSquads[0]);
      }
    }, 0);
  }, []);

  useEffect(() => {
    if (selectedSquad) {
      setTimeout(() => {
        setMessages(getStoredMessages(selectedSquad.id));
      }, 0);
    }
  }, [selectedSquad]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!chatInput.trim() || !selectedSquad) return;
    const newMsg = sendSquadMessage(selectedSquad.id, chatInput);
    setMessages((prev) => [...prev, newMsg]);
    setChatInput('');
  };

  const handleCreateSquad = () => {
    if (!newSquadName.trim()) return;
    const created = addSquad(newSquadName);
    setSquads(getStoredSquads());
    setSelectedSquad(created);
    setNewSquadName('');
    setShowCreateModal(false);
  };

  const handleJoinSquad = () => {
    if (!joinCode.trim()) return;
    alert(`Joined squad with code: ${joinCode.toUpperCase()}`);
    setJoinCode('');
    setShowJoinModal(false);
  };

  const triggerQuickPing = (type: string) => {
    const profile = getStoredProfile();
    setActivePing({
      type,
      user: profile.display_name,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    // Audio chime synthesis via Web Audio API
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      console.log('Audio chime error:', e);
    }

    setTimeout(() => {
      setActivePing(null);
    }, 4000);
  };

  return (
    <div className="min-h-full bg-[#0B0F17] text-white p-4 pb-24 max-w-xl mx-auto flex flex-col gap-4">
      {/* Top Squad Selector Header */}
      <div className="flex items-center justify-between gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 backdrop-blur-xl">
        <select
          value={selectedSquad?.id || ''}
          onChange={(e) => {
            const sq = squads.find((s) => s.id === e.target.value);
            if (sq) setSelectedSquad(sq);
          }}
          className="flex-1 bg-[#121824] border border-white/10 rounded-xl px-3 py-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#FF3B30]"
        >
          {squads.map((s) => (
            <option key={s.id} value={s.id}>
              👥 {s.name} ({s.member_count} Members)
            </option>
          ))}
        </select>

        <button
          onClick={() => setShowCreateModal(true)}
          className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors"
          title="Create Squad"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          onClick={() => setShowJoinModal(true)}
          className="px-3 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold text-gray-200 transition-colors"
        >
          Join
        </button>
      </div>

      {/* Convoy Control Bar */}
      <div className="bg-gradient-to-r from-red-950/40 to-slate-900/60 border border-[#FF3B30]/30 rounded-2xl p-4 flex items-center justify-between backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2">
            <Radio className={`w-4 h-4 ${isConvoyActive ? 'text-[#FF3B30] animate-pulse' : 'text-gray-400'}`} />
            <span className="text-sm font-bold text-white uppercase tracking-wider">
              {isConvoyActive ? 'Active Convoy Drive' : 'Parked Squad Mode'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {isConvoyActive ? 'Live positions & WebRTC Voice Active' : 'Chat & plan your next group run'}
          </p>
        </div>

        <button
          onClick={() => setIsConvoyActive(!isConvoyActive)}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
            isConvoyActive
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_20px_rgba(255,59,48,0.5)]'
              : 'bg-[#FF3B30] hover:bg-[#ff5247] text-white'
          }`}
        >
          {isConvoyActive ? <X className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
          {isConvoyActive ? 'End Convoy' : 'Start Convoy'}
        </button>
      </div>

      {/* ACTIVE CONVOY MODE OVERLAY */}
      {isConvoyActive ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          {/* Relative Distance Radar & Convoy List */}
          <div className="w-full bg-[#080B12] border border-[#FF3B30]/30 rounded-2xl relative overflow-hidden flex flex-col p-3">
            <div className="absolute inset-0 bg-[radial-gradient(#ff3b30_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />

            {/* Active Driver Radar Markers */}
            <div className="relative z-10 flex justify-between items-center text-[10px] text-gray-400 mb-3 pb-2 border-b border-white/10">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-400" /> WebRTC Audio Connected</span>
              <span className="text-xs font-bold text-[#FF3B30]">3 Drivers Online</span>
            </div>

            {/* Radar List */}
            <div className="relative z-10 flex flex-col gap-2">
              {/* You */}
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-2 backdrop-blur-md">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" alt="You" className="w-10 h-10 rounded-full border-2 border-[#FF3B30]" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white flex items-center gap-2">You {isPTTActive && <Mic className="w-3 h-3 text-emerald-400" />}</span>
                    <span className="text-xs font-bold text-[#FF3B30]">84 KM/H</span>
                  </div>
                  <span className="text-[10px] text-gray-400">Current Position</span>
                </div>
              </div>
              
              {/* Other Driver 1 */}
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-2 backdrop-blur-md">
                <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150" alt="Elena" className="w-10 h-10 rounded-full border-2 border-emerald-400" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white flex items-center gap-2">Elena <Volume2 className="w-3 h-3 text-emerald-400 animate-pulse" /></span>
                    <span className="text-xs font-bold text-emerald-400">82 KM/H</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">0.5 km ahead</span>
                </div>
              </div>
              
              {/* Other Driver 2 */}
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-2 backdrop-blur-md opacity-80">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" alt="Marcus" className="w-10 h-10 rounded-full border-2 border-blue-400" />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-white">Marcus</span>
                    <span className="text-xs font-bold text-blue-400">88 KM/H</span>
                  </div>
                  <span className="text-[10px] text-blue-400">1.2 km behind</span>
                </div>
              </div>
            </div>

            {/* Active Quick Ping Alert Banner */}
            {activePing && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
                className="mt-3 bg-[#FF3B30] text-white rounded-xl p-2.5 flex items-center justify-between text-xs font-bold animate-pulse shadow-lg relative z-20"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{activePing.user} pinged: {activePing.type}!</span>
                </div>
                <span className="text-[10px] opacity-80">{activePing.time}</span>
              </motion.div>
            )}
          </div>

          {/* Quick Waypoint Ping Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => triggerQuickPing('⚠️ Traffic Ahead')}
              className="h-12 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 rounded-xl text-xs font-bold text-amber-400 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <AlertTriangle className="w-4 h-4" /> ⚠️ Traffic Ping
            </button>
            <button
              onClick={() => triggerQuickPing('⛽ Gas Stop Needed')}
              className="h-12 bg-blue-500/15 border border-blue-500/30 hover:bg-blue-500/25 rounded-xl text-xs font-bold text-blue-400 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Fuel className="w-4 h-4" /> ⛽ Gas Stop Ping
            </button>
          </div>

          {/* WebRTC PTT Voice Control Bar */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between backdrop-blur-xl">
            <button
              onClick={() => {
                triggerHaptic(10);
                setIsMuted(!isMuted);
              }}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                isMuted ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-white/10 text-white'
              }`}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* PTT Main Button */}
            <button
              onMouseDown={() => {
                triggerHaptic(20);
                setIsPTTActive(true);
              }}
              onMouseUp={() => setIsPTTActive(false)}
              onTouchStart={() => {
                triggerHaptic(20);
                setIsPTTActive(true);
              }}
              onTouchEnd={() => setIsPTTActive(false)}
              className={`flex-1 mx-3 h-12 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                isPTTActive
                  ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.6)] scale-98'
                  : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
              }`}
            >
              <Volume2 className={`w-4 h-4 ${isPTTActive ? 'animate-bounce' : ''}`} />
              {isPTTActive ? 'Transmitting Voice...' : 'Hold Push-To-Talk (PTT)'}
            </button>
          </div>
        </motion.div>
      ) : (
        /* PARKED SQUAD MODE - CHAT & LEADERBOARDS */
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl flex flex-col h-[60vh] justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#FF3B30]" /> Squad Chat Box
            </span>
            <span className="text-[10px] text-gray-400 font-mono">Code: {selectedSquad?.invite_code}</span>
          </div>

          {/* Messages Listing */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
            {messages.length === 0 ? (
              <p className="text-center text-xs text-gray-500 py-12">No messages in squad chat yet.</p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="flex gap-2.5 items-start">
                  <img src={m.user_avatar} alt={m.user_name} className="w-7 h-7 rounded-full object-cover border border-white/10" />
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 max-w-[80%]">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[11px] font-bold text-white">{m.user_name}</span>
                      <span className="text-[9px] text-gray-500">
                        {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-200">{m.message}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Send Input */}
          <div className="flex gap-2 pt-2 border-t border-white/10">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Send message to squad..."
              className="flex-1 h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#FF3B30]"
            />
            <button
              onClick={handleSendMessage}
              className="w-11 h-11 bg-[#FF3B30] hover:bg-[#ff5247] rounded-xl flex items-center justify-center text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* CREATE SQUAD MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0B0F17] border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Create New Squad</h3>
            <input
              type="text"
              value={newSquadName}
              onChange={(e) => setNewSquadName(e.target.value)}
              placeholder="Squad Name (e.g. Bay Area Apex)"
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-[#FF3B30]"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 h-11 bg-white/5 rounded-xl text-xs text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSquad}
                className="flex-1 h-11 bg-[#FF3B30] rounded-xl text-xs font-bold text-white"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JOIN SQUAD MODAL */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0B0F17] border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white">Join Squad via Invite Code</h3>
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Enter Invite Code (e.g. APEX99)"
              className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-xs uppercase font-mono tracking-widest text-white focus:outline-none focus:border-[#FF3B30]"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 h-11 bg-white/5 rounded-xl text-xs text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinSquad}
                className="flex-1 h-11 bg-[#FF3B30] rounded-xl text-xs font-bold text-white"
              >
                Join Squad
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
