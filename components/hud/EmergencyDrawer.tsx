import { motion } from 'motion/react';
import { AlertTriangle, Phone, Wrench, Shield, X, MapPin } from 'lucide-react';
import { useDriveStore } from '@/store/useDriveStore';
import { triggerHaptic } from '@/lib/haptics';
import { useState } from 'react';
import { useToastStore } from '@/store/useToastStore';

interface EmergencyDrawerProps {
  onClose: () => void;
}

export function EmergencyDrawer({ onClose }: EmergencyDrawerProps) {
  const telemetry = useDriveStore((state) => state.telemetry);
  const [hazardsOn, setHazardsOn] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  const coords = telemetry.routeCoords.length > 0
    ? telemetry.routeCoords[telemetry.routeCoords.length - 1]
    : [0, 0];

  const handleHazards = () => {
    triggerHaptic([20, 20]);
    setHazardsOn(!hazardsOn);
    addToast(hazardsOn ? 'Hazard flashers disabled' : 'Hazard flashers enabled', hazardsOn ? 'info' : 'warning');
  };

  const handleCall = (service: string) => {
    triggerHaptic(20);
    addToast(`Calling ${service}...`, 'success');
  };

  return (
    <div onClick={onClose} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-end justify-center pointer-events-auto">
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-xl bg-[#121824]/95 backdrop-blur-2xl rounded-t-3xl border-t border-red-500/30 shadow-[0_-10px_40px_rgba(255,59,48,0.2)] overflow-hidden pb-10"
      >
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto my-3" />
        
        <div className="px-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" /> SOS / Roadside
            </h2>
            <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white active:scale-95 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Your Location</p>
              <p className="text-lg font-mono font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-500" />
                {coords[1].toFixed(5)}, {coords[0].toFixed(5)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleCall('911')} className="bg-red-500 hover:bg-red-600 active:scale-[0.98] transition-all rounded-2xl p-4 flex flex-col items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,59,48,0.4)] cursor-pointer">
              <Phone className="w-8 h-8 text-white" />
              <span className="font-bold text-white uppercase tracking-wider">Call 911</span>
            </button>
            
            <button onClick={() => handleCall('Roadside Assistance')} className="bg-white/10 hover:bg-white/20 active:scale-[0.98] transition-all rounded-2xl p-4 flex flex-col items-center justify-center gap-2 border border-white/10 cursor-pointer">
              <Wrench className="w-8 h-8 text-white" />
              <span className="font-bold text-white uppercase tracking-wider">Tow Truck</span>
            </button>

            <button onClick={handleHazards} className={`col-span-2 active:scale-[0.98] transition-all rounded-2xl p-4 flex items-center justify-center gap-3 border cursor-pointer ${hazardsOn ? 'bg-amber-500 text-white border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] animate-pulse' : 'bg-white/10 text-white border-white/10'}`}>
              <Shield className="w-6 h-6" />
              <span className="font-bold uppercase tracking-wider">{hazardsOn ? 'Hazards Active' : 'Toggle Hazards'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
