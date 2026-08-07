import { useEffect, useRef } from 'react';
import { useDriveStore } from '@/store/useDriveStore';

export function useWakeLock() {
  const isActive = useDriveStore((state) => state.isActive);
  const wakeLock = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock.current = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.error('WakeLock Error:', err);
      }
    };

    const handleVisibilityChange = () => {
      if (
        wakeLock.current !== null &&
        document.visibilityState === 'visible' &&
        isActive
      ) {
        requestWakeLock();
      }
    };

    if (isActive) {
      requestWakeLock();
      document.addEventListener('visibilitychange', handleVisibilityChange);
    } else {
      if (wakeLock.current) {
        wakeLock.current.release().then(() => {
          wakeLock.current = null;
        });
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock.current) {
        wakeLock.current.release().catch(console.error);
      }
    };
  }, [isActive]);
}
