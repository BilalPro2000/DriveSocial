import { motion, AnimatePresence } from 'motion/react';
import { Plus, Camera, MicOff, Fuel, Maximize, Mic } from 'lucide-react';
import { useState } from 'react';
import { triggerHaptic } from '@/lib/haptics';
import { useToastStore } from '@/store/useToastStore';

interface QuickActionsFABProps {
  onToggleHUD: () => void;
  isHUDExpanded: boolean;
}

export function QuickActionsFAB({ onToggleHUD, isHUDExpanded }: QuickActionsFABProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  const toggleOpen = () => {
    triggerHaptic(10);
    setIsOpen(!isOpen);
  };

  const handleAction = (action: string) => {
    triggerHaptic(20);
    setIsOpen(false);
    
    switch(action) {
      case 'photo':
        addToast('Snapshot taken!', 'success');
        break;
      case 'mute':
        setIsMuted(!isMuted);
        addToast(isMuted ? 'Convoy mic unmuted' : 'Convoy mic muted', 'info');
        break;
      case 'gas':
        addToast('Gas station marked on map', 'success');
        break;
      case 'hud':
        onToggleHUD();
        addToast(isHUDExpanded ? 'HUD minimized' : 'HUD expanded', 'info');
        break;
    }
  };

  const actions = [
    { id: 'hud', icon: Maximize, label: 'Toggle HUD', color: 'bg-indigo-500' },
    { id: 'gas', icon: Fuel, label: 'Mark Gas', color: 'bg-emerald-500' },
    { id: 'mute', icon: isMuted ? MicOff : Mic, label: 'Mute Mic', color: isMuted ? 'bg-red-500' : 'bg-gray-600' },
    { id: 'photo', icon: Camera, label: 'Snapshot', color: 'bg-blue-500' },
  ];

  return (
    <div className="absolute right-4 bottom-32 md:bottom-24 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="flex flex-col gap-3"
          >
            {actions.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleAction(action.id)}
                  className="flex items-center gap-3 group"
                >
                  <span className="bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                    {action.label}
                  </span>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg shadow-black/30 ${action.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={toggleOpen}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl shadow-black/40 transition-all z-50 ${
          isOpen ? 'bg-white text-black rotate-45' : 'bg-[#121824] border border-white/10 text-white hover:bg-white/10'
        }`}
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
