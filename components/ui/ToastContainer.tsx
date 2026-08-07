'use client';
import { useToastStore } from '@/store/useToastStore';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';

export function ToastContainer() {
  const { toasts } = useToastStore();

  return (
    <div className="fixed top-4 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none px-4">
      <AnimatePresence>
        {toasts.map((toast) => {
          let Icon = Info;
          let color = 'text-blue-400';
          let border = 'border-blue-500/30';
          let bg = 'bg-blue-500/10';
          
          if (toast.type === 'success') {
            Icon = CheckCircle2;
            color = 'text-emerald-400';
            border = 'border-emerald-500/30';
            bg = 'bg-emerald-500/10';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            color = 'text-amber-400';
            border = 'border-amber-500/30';
            bg = 'bg-amber-500/10';
          } else if (toast.type === 'error') {
            Icon = XCircle;
            color = 'text-[#FF3B30]';
            border = 'border-[#FF3B30]/30';
            bg = 'bg-[#FF3B30]/10';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-xl border ${border} ${bg} shadow-lg shadow-black/50 pointer-events-auto`}
            >
              <Icon className={`w-5 h-5 ${color}`} />
              <span className="text-sm font-bold text-white tracking-wide">{toast.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
