'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Share, PlusSquare, Car, Sparkles } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if running in standalone PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;

    if (isStandalone) {
      return;
    }

    // Check if user dismissed prompt in this session
    const isDismissed = sessionStorage.getItem('pwa_prompt_dismissed');
    if (isDismissed) {
      return;
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    if (iosDevice) {
      setTimeout(() => {
        setIsIOS(true);
        setShowPrompt(true);
      }, 0);
      return;
    }

    // Android / Chrome handler
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    triggerHaptic(20);
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    triggerHaptic(10);
    setShowPrompt(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-3 left-3 right-3 z-50 max-w-md mx-auto"
        >
          <div className="bg-[#121824]/95 backdrop-blur-2xl border border-white/20 rounded-2xl p-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF3B30] to-orange-600 flex items-center justify-center text-white shadow-md flex-shrink-0">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1">
                  Install Drive Social <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />
                </h4>
                <p className="text-[10px] text-gray-400 font-medium">
                  {isIOS ? 'Add to Home Screen for full cockpit view' : 'Install PWA for standalone GPS performance'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={handleInstallClick}
                className="px-3 py-2 bg-[#FF3B30] hover:bg-[#ff5247] text-white text-[11px] font-bold rounded-xl flex items-center gap-1 shadow-md transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isIOS ? 'Install' : 'Get App'}</span>
              </button>
              <button
                onClick={handleDismiss}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* iOS Safari Instructions Modal */}
      <AnimatePresence>
        {showIOSGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowIOSGuide(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-[#121824] border border-white/20 rounded-3xl p-6 space-y-4 shadow-2xl text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FF3B30]/20 border border-[#FF3B30]/40 flex items-center justify-center mx-auto text-[#FF3B30]">
                <Car className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">Install Drive Social on iOS</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Follow these 2 quick steps in Safari to add the app to your home screen:
                </p>
              </div>

              <div className="space-y-3 bg-white/5 border border-white/10 rounded-2xl p-4 text-left text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                    1
                  </div>
                  <div className="flex-1">
                    <span className="text-white font-semibold">Tap the Share button</span>
                    <span className="text-gray-400 block text-[11px]">In Safari bottom toolbar (<Share className="w-3 h-3 inline text-blue-400" />)</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 border-t border-white/10 pt-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    2
                  </div>
                  <div className="flex-1">
                    <span className="text-white font-semibold">Select &quot;Add to Home Screen&quot;</span>
                    <span className="text-gray-400 block text-[11px]">Scroll down &amp; tap <PlusSquare className="w-3 h-3 inline text-emerald-400" /></span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full h-12 bg-white/10 hover:bg-white/15 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all"
              >
                Got It
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
