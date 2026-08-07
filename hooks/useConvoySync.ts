import { useEffect } from 'react';
import { useDriveStore } from '@/store/useDriveStore';
import { supabase } from '@/lib/supabase';

export function useConvoySync(squadId?: string, userId?: string) {
  const isActive = useDriveStore((state) => state.isActive);
  const telemetry = useDriveStore((state) => state.telemetry);

  useEffect(() => {
    if (!isActive || !squadId || !userId) return;

    const channel = supabase.channel(`squad_${squadId}`);

    // Subscribe to presence
    channel
      .on('presence', { event: 'sync' }, () => {
        // const newState = channel.presenceState();
        // Update local state with other members' locations
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track initial presence
        }
      });

    // Broadcast location periodically
    const interval = setInterval(async () => {
      const latestCoords = telemetry.routeCoords[telemetry.routeCoords.length - 1];
      if (latestCoords) {
        await channel.track({
          user_id: userId,
          location: latestCoords,
          speed: telemetry.speedKmh,
          updated_at: new Date().toISOString(),
        });
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [
    isActive,
    squadId,
    userId,
    telemetry.routeCoords,
    telemetry.speedKmh,
  ]);
}
